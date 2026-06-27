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
    if (!imageFile) {
      return NextResponse.json({ error: 'Missing image' }, { status: 400 });
    }
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Must be an image.' }, { status: 400 });
    }

    const settings = await getAppSettings();
    if (!settings.huggingface_api_key) {
      return NextResponse.json({ error: 'Hugging Face API key not configured' }, { status: 500 });
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    let resultBuffer: Buffer;
    try {
      // Step 1: Get mask from RMBG-1.4 (returns white=foreground, black=background)
      const maskRes = await fetch('https://api-inference.huggingface.co/models/briaai/RMBG-1.4', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.huggingface_api_key}`,
        },
        body: imageBuffer,
      });

      if (!maskRes.ok) {
        throw new Error(await maskRes.text() || 'Failed to remove background from Hugging Face API');
      }

      const maskBuffer = Buffer.from(await maskRes.arrayBuffer());

      // Step 2: Apply mask as alpha channel to original image using sharp
      const { data, info } = await sharp(maskBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      resultBuffer = await sharp(imageBuffer)
        .resize(info.width, info.height)
        .joinChannel(data, { raw: { width: info.width, height: info.height, channels: 1 } })
        .png()
        .toBuffer();
    } catch (fetchErr: any) {
      console.error('Hugging Face API remove-background failed:', fetchErr.message);
      throw fetchErr;
    }

    return new NextResponse(new Uint8Array(resultBuffer), {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
