import { NextRequest, NextResponse } from 'next/server';
import { extractIP, checkRateLimit } from '@/lib/ratelimit';
import { getAppSettings } from '@/lib/settings';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const ip = extractIP(request);
    if (!(await checkRateLimit(ip))) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;

    if (!imageFile || !prompt) {
      return NextResponse.json({ error: 'Missing image or prompt' }, { status: 400 });
    }
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Must be an image.' }, { status: 400 });
    }

    const settings = await getAppSettings();
    if (!settings.huggingface_api_key) {
      return NextResponse.json({ error: 'Hugging Face API key not configured' }, { status: 500 });
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    // 1. Get mask from RMBG-1.4 (returns white=foreground, black=background)
    let fgBuffer: Buffer;
    try {
      const maskRes = await fetch('https://api-inference.huggingface.co/models/briaai/RMBG-1.4', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.huggingface_api_key}`,
        },
        body: imageBuffer,
      });

      if (!maskRes.ok) {
        throw new Error(await maskRes.text() || 'Failed to remove background');
      }
      const maskBuffer = Buffer.from(await maskRes.arrayBuffer());

      // Apply mask as alpha channel on the original image to get transparent foreground
      const { data, info } = await sharp(maskBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      fgBuffer = await sharp(imageBuffer)
        .resize(info.width, info.height)
        .joinChannel(data, { raw: { width: info.width, height: info.height, channels: 1 } })
        .png()
        .toBuffer();
    } catch (fgErr: any) {
      console.error('Foreground extraction failed:', fgErr.message);
      throw fgErr;
    }

    // 2. Generate a background image by calling the Hugging Face Inference API
    const numInferenceSteps = parseInt(settings.inference_steps, 10) || 20;
    const guidanceScale = parseFloat(settings.cfg_scale) || 7.5;
    const negativePrompt = settings.negative_prompt || 'blurry, ugly, low quality';
    const widthSetting = parseInt(settings.width, 10) || 1024;
    const heightSetting = parseInt(settings.height, 10) || 1024;

    const payload = {
      inputs: prompt,
      parameters: {
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale,
        negative_prompt: negativePrompt,
        width: widthSetting,
        height: heightSetting,
      }
    };

    let bgBuffer: Buffer;
    try {
      const model = settings.model_text_to_image || 'black-forest-labs/FLUX.1-schnell';
      const bgRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.huggingface_api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!bgRes.ok) {
        throw new Error(await bgRes.text() || 'Failed to generate background');
      }

      bgBuffer = Buffer.from(await bgRes.arrayBuffer());
    } catch (bgErr: any) {
      console.error('Background generation failed:', bgErr.message);
      throw bgErr;
    }

    // 3. Use sharp to resize the background to match foreground and composite them
    const fgSharp = sharp(fgBuffer);
    const fgMetadata = await fgSharp.metadata();
    const fgWidth = fgMetadata.width || 1024;
    const fgHeight = fgMetadata.height || 1024;

    const bgResized = await sharp(bgBuffer)
      .resize(fgWidth, fgHeight)
      .toBuffer();

    const combinedBuffer = await sharp(bgResized)
      .composite([{ input: fgBuffer, blend: 'over' }])
      .png()
      .toBuffer();

    return new NextResponse(new Uint8Array(combinedBuffer), {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
