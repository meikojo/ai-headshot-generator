import { getAppSettings } from './settings';

// In-memory rate limiter: dynamic limit per IP
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(ip: string): Promise<boolean> {
  const settings = await getAppSettings();
  let limit = parseInt(settings.rate_limit_free, 10);
  if (isNaN(limit)) {
    limit = 10;
  }

  const now = Date.now();
  const entry = ipRequestMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return limit > 0;
  }
  if (entry.count >= limit) return false; // blocked
  entry.count++;
  return true;
}

export function extractIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? '127.0.0.1';
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed.' };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be under 10MB.' };
  }
  return { valid: true };
}
