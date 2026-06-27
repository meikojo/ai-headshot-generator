'use client';
import { useState, useEffect } from 'react';
import { getFingerprint } from '@/lib/fingerprint';

interface UseLimitResult {
  allowed: boolean;
  remaining: number;
  isPaid: boolean;
  isLoading: boolean;
  refetch: () => void;
}

export function useUsageLimit(toolName: string): UseLimitResult {
  const [state, setState] = useState<UseLimitResult>({
    allowed: true,
    remaining: 3,
    isPaid: false,
    isLoading: true,
    refetch: () => {},
  });

  const checkLimit = async () => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      let fingerprint = sessionStorage.getItem('fp');
      if (!fingerprint) {
        fingerprint = await getFingerprint();
        sessionStorage.setItem('fp', fingerprint);
      }
      const res = await fetch('/api/check-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint, toolName }),
      });
      const data = await res.json();
      setState({
        allowed: data.allowed ?? true,
        remaining: data.remaining ?? 3,
        isPaid: data.isPaid ?? false,
        isLoading: false,
        refetch: checkLimit,
      });
    } catch {
      setState(s => ({ ...s, isLoading: false, refetch: checkLimit }));
    }
  };

  useEffect(() => { checkLimit(); }, [toolName]);

  return state;
}
