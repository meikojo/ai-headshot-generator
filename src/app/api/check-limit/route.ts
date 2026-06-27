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
    return NextResponse.json({ error: 'Missing fingerprint or toolName' }, { status: 400 });
  }

  if (isPlaceholderSupabase) {
    const key = `${ip}-${fingerprint}-${toolName}`;
    const data = mockUsageStore.get(key) || { uses_count: 0, is_paid: false };

    if (data.is_paid) {
      return NextResponse.json({ allowed: true, isPaid: true, remaining: 999 });
    }

    const usesCount = data.uses_count;
    const FREE_LIMIT = 3;

    if (usesCount >= FREE_LIMIT) {
      return NextResponse.json({ allowed: false, remaining: 0, isPaid: false });
    }

    return NextResponse.json({
      allowed: true,
      remaining: FREE_LIMIT - usesCount,
      isPaid: false,
    });
  }

  try {
    const db = getServiceSupabase();
    const { data, error } = await db
      .from('usage_tracking')
      .select('uses_count, is_paid')
      .eq('ip_address', ip)
      .eq('fingerprint', fingerprint)
      .eq('tool_name', toolName)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found which is fine
      throw error;
    }

    if (data?.is_paid) {
      return NextResponse.json({ allowed: true, isPaid: true, remaining: 999 });
    }

    const usesCount = data?.uses_count ?? 0;
    const FREE_LIMIT = 3;

    if (usesCount >= FREE_LIMIT) {
      return NextResponse.json({ allowed: false, remaining: 0, isPaid: false });
    }

    return NextResponse.json({
      allowed: true,
      remaining: FREE_LIMIT - usesCount,
      isPaid: false,
    });
  } catch (err) {
    console.error('check-limit error:', err);
    return NextResponse.json({ allowed: true, remaining: 3, isPaid: false });
  }
}
