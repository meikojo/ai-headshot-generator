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
  const maskFile = formData.get('mask');

  if (!imageFile || !(imageFile instanceof File) || !maskFile || !(maskFile instanceof File)) {
    return NextResponse.json({ error: 'Missing or invalid image or mask file' }, { status: 400 });
  }

  if (imageFile.size >= 10 * 1024 * 1024 || maskFile.size >= 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 });
  }

  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(imageFile.type) || !allowedMimes.includes(maskFile.type)) {
    return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' }, { status: 400 });
  }

  let imageBuffer: Buffer;
  let maskBuffer: Buffer;
  try {
    imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    maskBuffer = Buffer.from(await maskFile.arrayBuffer());
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to read files' }, { status: 400 });
  }

  const settings = await getAppSettings();
  const width = parseInt(settings.width, 10) || 1024;
  const height = parseInt(settings.height, 10) || 1024;
  const num_inference_steps = parseInt(settings.inference_steps, 10) || 20;
  const guidance_scale = parseFloat(settings.cfg_scale) || 7.5;
  const negative_prompt = settings.negative_prompt || '';

  try {
    if (!settings.huggingface_api_key || !settings.model_cleanup) {
      throw new Error('Hugging Face API not configured');
    }

    const payload = {
      inputs: 'background',
      image: imageBuffer.toString('base64'),
      mask_image: maskBuffer.toString('base64'),
      parameters: {
        num_inference_steps,
        guidance_scale,
        negative_prompt,
        width,
        height,
      },
    };

    const res = await hfFetch(`https://api-inference.huggingface.co/models/${settings.model_cleanup}`, {
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
        'Content-Disposition': 'attachment; filename="cleanup.png"',
      },
    });
  } catch (err: any) {
    console.error('Cleanup API error:', err.message);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
