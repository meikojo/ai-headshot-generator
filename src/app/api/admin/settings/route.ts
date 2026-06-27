import { NextRequest, NextResponse } from 'next/server';
import { getAppSettings, updateAppSetting, AppSettings } from '@/lib/settings';

// A simple admin password check
function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'admin123' : null);
  
  if (!expectedPassword) {
    // If no password is set in env, we deny access to be safe
    return false;
  }
  
  if (authHeader !== `Bearer ${expectedPassword}`) {
    return false;
  }
  
  return true;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getAppSettings(true);
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates = body as Partial<AppSettings>;
    
    let success = true;
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string') {
        const ok = await updateAppSetting(key as keyof AppSettings, value);
        if (!ok) success = false;
      }
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to update some settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
