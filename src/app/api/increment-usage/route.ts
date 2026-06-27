import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { extractIP, checkRateLimit } from '@/lib/ratelimit';

// In-memory mock store for offline/local environment
const globalForMock = globalThis as unknown as {
  mockUsageStore?: Map<string, { uses_count: number; is_paid: boolean }>;
};
const mockUsageStore = globalForMock.mockUsageStore ?? new Map<string, { uses_count: number; is_paid: boolean }>();
if (process.env.NODE_ENV !== 'production') {
  globalForMock.mockUsageStore = mockUsageStore;
}

const isPlaceholderSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_project') || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function POST(request: NextRequest) {
  const ip = extractIP(request);
  if (!(await checkRateLimit(ip))) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const body = await request.json();
  const { fingerprint, toolName } = body;

  if (!fingerprint || !toolName) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (isPlaceholderSupabase) {
    const key = `${ip}-${fingerprint}-${toolName}`;
    const current = mockUsageStore.get(key) || { uses_count: 0, is_paid: false };
    const nextCount = current.uses_count + 1;
    mockUsageStore.set(key, { ...current, uses_count: nextCount });
    return NextResponse.json({ uses_count: nextCount });
  }

  try {
    const db = getServiceSupabase();
    const { data: existing } = await db
      .from('usage_tracking')
      .select('id, uses_count')
      .eq('ip_address', ip)
      .eq('fingerprint', fingerprint)
      .eq('tool_name', toolName)
      .single();

    if (existing) {
      await db
        .from('usage_tracking')
        .update({ uses_count: existing.uses_count + 1, last_used_at: new Date().toISOString() })
        .eq('id', existing.id);
      return NextResponse.json({ uses_count: existing.uses_count + 1 });
    } else {
      await db.from('usage_tracking').insert({
        ip_address: ip,
        fingerprint,
        tool_name: toolName,
        uses_count: 1,
        first_used_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      });
      return NextResponse.json({ uses_count: 1 });
    }
  } catch (err) {
    console.error('increment-usage error:', err);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
