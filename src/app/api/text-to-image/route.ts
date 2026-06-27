import { NextRequest, NextResponse } from 'next/server';
import { extractIP, checkRateLimit } from '@/lib/ratelimit';
import { getAppSettings } from '@/lib/settings';
import { hfFetch } from '@/lib/hf';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  const ip = extractIP(request);
  if (!(await checkRateLimit(ip))) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  
  let body: any;
  try {
    body = await request.json();
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { prompt } = body;
  if (!prompt || typeof prompt !== 'string') return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  if (prompt.length > 1000) return NextResponse.json({ error: 'Prompt too long' }, { status: 400 });

  const settings = await getAppSettings();
  const width = parseInt(settings.width, 10) || 1024;
  const height = parseInt(settings.height, 10) || 1024;
  const num_inference_steps = parseInt(settings.inference_steps, 10) || 20;
  const guidance_scale = parseFloat(settings.cfg_scale) || 7.5;
  const negative_prompt = settings.negative_prompt || '';

  try {
    if (!settings.huggingface_api_key || !settings.model_text_to_image) {
      throw new Error('Hugging Face API not configured');
    }

    const payload = {
      inputs: prompt,
      parameters: {
        num_inference_steps,
        guidance_scale,
        negative_prompt,
        width,
        height,
      },
    };

    const res = await hfFetch(`https://api-inference.huggingface.co/models/${settings.model_text_to_image}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.huggingface_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Hugging Face API returned status ${res.status}: ${errText}`, { cause: errText });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'attachment; filename="generated.jpg"',
      },
    });
  } catch (err: any) {
    console.error('Text-to-image API error:', err);
    return NextResponse.json({ 
      error: err.message || 'Internal Server Error',
      cause: err.cause?.message || String(err.cause)
    }, { status: 500 });
  }
}
