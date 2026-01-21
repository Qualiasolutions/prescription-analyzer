import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-3-pro-preview';
const REQUEST_TIMEOUT_MS = 30000;

// Strip markdown formatting from response
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** -> bold
    .replace(/\*([^*]+)\*/g, '$1')       // *italic* -> italic
    .replace(/__([^_]+)__/g, '$1')       // __bold__ -> bold
    .replace(/_([^_]+)_/g, '$1')         // _italic_ -> italic
    .replace(/^#{1,6}\s+/gm, '')         // # headers -> plain text
    .replace(/`([^`]+)`/g, '$1')         // `code` -> code
    .replace(/```[\s\S]*?```/g, '')      // code blocks -> remove
    .trim();
}

const whatsappRequestSchema = z.object({
  message: z.string().min(1).max(1000).transform(val =>
    val.replace(/[<>{}[\]]/g, '').trim()
  ),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
});

const SYSTEM_PROMPT = `You are Qualia Pharmacy's AI Assistant - a professional pharmacist available 24/7.
أنت مساعد صيدلية كواليا - صيدلي محترف متاح على مدار الساعة.

PHARMACY INFO:
- Name: Qualia Pharmacy | صيدلية كواليا
- Location: Amman, Jordan
- Services: Medications, consultations, delivery

CORE RESPONSIBILITIES:

1. MEDICATION INQUIRIES
   - Prices in JOD (Jordanian Dinar)
   - Availability and alternatives
   - Dosage and usage instructions
   - Warnings and interactions

2. JFDA INFORMATION
   - Registered drug prices
   - Prescription requirements
   - Manufacturer and distributor
   - Registration numbers when available

3. SAFETY ALERTS
   - Drug interactions
   - Side effects
   - Contraindications
   - Pregnancy and breastfeeding warnings

4. CUSTOMER SERVICE
   - Medication reservations
   - Delivery inquiries
   - Referral to pharmacist for complex questions

STRICT RULES:
- Respond in BOTH Arabic and English (bilingual)
- NO emojis - keep responses professional and clean
- NO markdown formatting - no asterisks, no bold, no headers, just plain text
- Be helpful but professional
- For serious medical conditions, advise seeing a doctor
- Do not diagnose - only provide medication information
- Prices are approximate and may vary
- Always complete your response - never cut off mid-sentence

RESPONSE FORMAT:
- Keep responses concise but COMPLETE
- Use line breaks and dashes (-) for lists
- Always include price in JOD when mentioning any medication
- End with a follow-up question or offer to help
- Plain text only - no special formatting

EXAMPLE RESPONSE:
"نعم، باندول متوفر.
Yes, Panadol is available.

- Panadol 500mg (24 tablets): 1.50 JOD
- Panadol Extra (24 tablets): 2.20 JOD

تحذير: لا تتجاوز 8 حبات يومياً
Warning: Do not exceed 8 tablets daily

هل تريد حجز؟
Would you like to reserve?"`;

export async function POST(request: NextRequest) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    const parseResult = whatsappRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { message, history } = parseResult.data;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-8).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://prescription-analyzer.vercel.app',
          'X-Title': 'Qualia Pharmacy WhatsApp Agent',
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          max_tokens: 2048,
          temperature: 0.6,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        return NextResponse.json(
          { error: `AI service error: ${response.status}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content;

      if (!rawContent) {
        return NextResponse.json(
          { error: 'No response generated' },
          { status: 500 }
        );
      }

      // Clean the response - strip any markdown formatting
      const content = stripMarkdown(rawContent);

      return NextResponse.json({
        success: true,
        response: content,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
