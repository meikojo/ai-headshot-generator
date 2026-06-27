import { NextRequest, NextResponse } from 'next/server';
import { extractIP, checkRateLimit } from '@/lib/ratelimit';
import { getAppSettings } from '@/lib/settings';
import { hfFetch } from '@/lib/hf';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  const ip = extractIP(request);
  if (!(await checkRateLimit(ip))) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const imageFile = formData.get('image');
  if (!imageFile || !(imageFile instanceof File)) {
    return NextResponse.json({ error: 'Missing or invalid image file' }, { status: 400 });
  }
  if (imageFile.size >= 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 });
  }

  let sanitizedWidth = 2048;
  const widthVal = formData.get('width');
  if (widthVal !== null && widthVal !== undefined && widthVal !== '') {
    const valStr = String(widthVal);
    if (!/^\d+$/.test(valStr)) {
      return NextResponse.json({ error: 'width must be an integer' }, { status: 400 });
    }
    const parsed = parseInt(valStr, 10);
    sanitizedWidth = Math.max(512, Math.min(4096, parsed));
  }

  let imageBuffer: Buffer;
  let computedHeight = sanitizedWidth;
  try {
    imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    try {
      const metadata = await sharp(imageBuffer).metadata();
      if (metadata.width && metadata.height) {
        computedHeight = Math.round((metadata.height / metadata.width) * sanitizedWidth);
      }
    } catch (e) {
      computedHeight = sanitizedWidth;
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to read image' }, { status: 400 });
  }

  const settings = await getAppSettings();
  const num_inference_steps = parseInt(settings.inference_steps, 10) || 20;
  const guidance_scale = parseFloat(settings.cfg_scale) || 7.5;
  const negative_prompt = settings.negative_prompt || '';

  try {
    if (!settings.huggingface_api_key || !settings.model_upscale) {
      throw new Error('Hugging Face API not configured');
    }

    const payload = {
      inputs: 'high resolution, high quality',
      image: imageBuffer.toString('base64'),
      parameters: {
        num_inference_steps,
        guidance_scale,
        negative_prompt,
        width: sanitizedWidth,
        height: computedHeight,
      },
    };

    const res = await hfFetch(`https://api-inference.huggingface.co/models/${settings.model_upscale}`, {
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
        'Content-Disposition': `attachment; filename="upscaled-${sanitizedWidth}.png"`,
      },
    });
  } catch (err: any) {
    console.error('Upscale API error:', err.message);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

