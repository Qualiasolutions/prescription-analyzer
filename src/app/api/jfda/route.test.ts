import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

// Store original env
const originalEnv = process.env.OPENROUTER_API_KEY;

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/jfda', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/jfda', () => {
  describe('with API key', () => {
    beforeAll(() => {
      process.env.OPENROUTER_API_KEY = 'test-key';
      vi.resetModules();
    });

    afterAll(() => {
      process.env.OPENROUTER_API_KEY = originalEnv;
      vi.resetModules();
    });

    it('returns 400 for empty medicine name', async () => {
      const { POST } = await import('./route');
      const request = createRequest({ medicineName: '' });
      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid medicine name');
    });

    it('returns 400 for missing medicine name', async () => {
      const { POST } = await import('./route');
      const request = createRequest({});
      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('without API key', () => {
    beforeAll(() => {
      process.env.OPENROUTER_API_KEY = '';
      vi.resetModules();
    });

    afterAll(() => {
      process.env.OPENROUTER_API_KEY = originalEnv;
      vi.resetModules();
    });

    it('returns 503 when API key is missing', async () => {
      const { POST } = await import('./route');
      const request = createRequest({ medicineName: 'Panadol' });
      const response = await POST(request);
      expect(response.status).toBe(503);
    });
  });
});
