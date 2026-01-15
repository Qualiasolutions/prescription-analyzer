import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (resets on deployment)
// For production at scale, use Redis or Vercel KV
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS: Record<string, { requests: number; windowMs: number }> = {
  '/api/analyze': { requests: 10, windowMs: 60000 }, // 10 req/min
  '/api/jfda': { requests: 20, windowMs: 60000 },    // 20 req/min
};

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

function isRateLimited(key: string, limit: { requests: number; windowMs: number }): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + limit.windowMs });
    return { limited: false, remaining: limit.requests - 1, resetIn: limit.windowMs };
  }

  if (record.count >= limit.requests) {
    return { limited: true, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { limited: false, remaining: limit.requests - record.count, resetIn: record.resetTime - now };
}

// Clean up old entries periodically (every 100 requests)
let requestCount = 0;
function cleanupOldEntries() {
  requestCount++;
  if (requestCount % 100 === 0) {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only rate limit API routes
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Find matching rate limit config
  const limitConfig = Object.entries(RATE_LIMITS).find(([route]) => path.startsWith(route));

  if (!limitConfig) {
    return NextResponse.next();
  }

  const [, limit] = limitConfig;
  const clientIP = getClientIP(request);
  const rateLimitKey = `${clientIP}:${path}`;

  cleanupOldEntries();

  const { limited, remaining, resetIn } = isRateLimited(rateLimitKey, limit);

  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(resetIn / 1000)),
          'X-RateLimit-Limit': String(limit.requests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetIn / 1000)),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(limit.requests));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetIn / 1000)));

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
