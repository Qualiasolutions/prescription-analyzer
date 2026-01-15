import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

// Store original env
const originalEnv = process.env.OPENROUTER_API_KEY;

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/analyze', () => {
  describe('with API key', () => {
    beforeAll(() => {
      process.env.OPENROUTER_API_KEY = 'test-key';
      vi.resetModules();
    });

    afterAll(() => {
      process.env.OPENROUTER_API_KEY = originalEnv;
      vi.resetModules();
    });

    it('returns 400 when neither image nor text provided', async () => {
      const { POST } = await import('./route');
      const request = createRequest({});
      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid request');
    });

    it('returns 400 for invalid mime type', async () => {
      const { POST } = await import('./route');
      const request = createRequest({
        image: 'base64data',
        mimeType: 'text/plain',
      });
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
      const request = createRequest({ text: 'test prescription' });
      const response = await POST(request);
      expect(response.status).toBe(503);
    });
  });
});
