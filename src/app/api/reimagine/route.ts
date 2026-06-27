import { NextRequest, NextResponse } from 'next/server';
import { extractIP, checkRateLimit } from '@/lib/ratelimit';
import { getAppSettings } from '@/lib/settings';
import { hfFetch } from '@/lib/hf';

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

  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(imageFile.type)) {
    return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' }, { status: 400 });
  }

  let imageBuffer: Buffer;
  try {
    imageBuffer = Buffer.from(await imageFile.arrayBuffer());
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to read image' }, { status: 400 });
  }

  const settings = await getAppSettings();
  const width = parseInt(settings.width, 10) || 1024;
  const height = parseInt(settings.height, 10) || 1024;
  const num_inference_steps = parseInt(settings.inference_steps, 10) || 20;
  const guidance_scale = parseFloat(settings.cfg_scale) || 7.5;
  const negative_prompt = settings.negative_prompt || '';

  try {
    if (!settings.huggingface_api_key || !settings.model_reimagine) {
      throw new Error('Hugging Face API not configured');
    }

    const payload = {
      inputs: imageBuffer.toString('base64'),
      parameters: {
        num_inference_steps,
        guidance_scale,
        negative_prompt,
        width,
        height,
      },
    };

    const res = await hfFetch(`https://api-inference.huggingface.co/models/${settings.model_reimagine}`, {
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
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'attachment; filename="reimagined.jpg"',
      },
    });
  } catch (err: any) {
    console.error('Reimagine API error:', err.message);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
