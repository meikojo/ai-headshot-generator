import { NextRequest, NextResponse } from 'next/server';
import { extractIP, checkRateLimit } from '@/lib/ratelimit';
import { getAppSettings } from '@/lib/settings';

export async function POST(request: NextRequest) {
  const ip = extractIP(request);
  if (!(await checkRateLimit(ip))) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const formData = await request.formData();
  const imageFile = formData.get('image') as File;
  const maskFile = formData.get('mask') as File;

  if (!imageFile || !maskFile) return NextResponse.json({ error: 'Missing image or mask' }, { status: 400 });
  if (imageFile.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large' }, { status: 413 });

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

    const res = await fetch(`https://api-inference.huggingface.co/models/${settings.model_cleanup}`, {
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
