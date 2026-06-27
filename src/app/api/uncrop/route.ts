import { NextRequest, NextResponse } from 'next/server';
import { extractIP, checkRateLimit } from '@/lib/ratelimit';
import sharp from 'sharp';
import { getAppSettings } from '@/lib/settings';
import { hfFetch } from '@/lib/hf';

export async function POST(request: NextRequest) {
  const ip = extractIP(request);
  if (!(await checkRateLimit(ip))) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const formData = await request.formData();
  const imageFile = formData.get('image') as File;
  if (!imageFile) return NextResponse.json({ error: 'No image' }, { status: 400 });
  if (imageFile.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large' }, { status: 413 });

  const left = formData.get('left') as string || '256';
  const right = formData.get('right') as string || '256';
  const up = formData.get('up') as string || '128';
  const down = formData.get('down') as string || '128';

  let imageBuffer: Buffer;
  let extendedImageBuffer: Buffer;
  let maskBuffer: Buffer;

  try {
    imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    
    const topPad = parseInt(up, 10) || 0;
    const bottomPad = parseInt(down, 10) || 0;
    const leftPad = parseInt(left, 10) || 0;
    const rightPad = parseInt(right, 10) || 0;

    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const originalWidth = metadata.width || 1;
    const originalHeight = metadata.height || 1;

    const newWidth = originalWidth + leftPad + rightPad;
    const newHeight = originalHeight + topPad + bottomPad;

    extendedImageBuffer = await image
      .extend({
        top: topPad,
        bottom: bottomPad,
        left: leftPad,
        right: rightPad,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toBuffer();

    const originalBlack = await sharp({
      create: {
        width: originalWidth,
        height: originalHeight,
        channels: 3,
        background: { r: 0, g: 0, b: 0 }
      }
    }).png().toBuffer();

    maskBuffer = await sharp({
      create: {
        width: newWidth,
        height: newHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .composite([
      {
        input: originalBlack,
        top: topPad,
        left: leftPad,
      }
    ])
    .png()
    .toBuffer();
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to process image padding' }, { status: 500 });
  }

  const settings = await getAppSettings();
  const width = parseInt(settings.width, 10) || 1024;
  const height = parseInt(settings.height, 10) || 1024;
  const num_inference_steps = parseInt(settings.inference_steps, 10) || 20;
  const guidance_scale = parseFloat(settings.cfg_scale) || 7.5;
  const negative_prompt = settings.negative_prompt || '';

  try {
    if (!settings.huggingface_api_key || !settings.model_uncrop) {
      throw new Error('Hugging Face API not configured');
    }

    const payload = {
      inputs: 'background',
      image: extendedImageBuffer.toString('base64'),
      mask_image: maskBuffer.toString('base64'),
      parameters: {
        num_inference_steps,
        guidance_scale,
        negative_prompt,
        width,
        height,
      },
    };

    const res = await hfFetch(`https://api-inference.huggingface.co/models/${settings.model_uncrop}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.huggingface_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Hugging Face API returned status ${res.status}: ${await res.text()}`);
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="uncropped.png"',
      },
    });
  } catch (err: any) {
    console.error('Uncrop API error:', err.message);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
