import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-3-pro-preview';
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds

// Request validation schema
const jfdaRequestSchema = z.object({
  medicineName: z.string().min(1).max(200).transform(val =>
    // Sanitize to prevent prompt injection
    val.replace(/[<>{}[\]]/g, '').trim()
  ),
});

export async function POST(request: NextRequest) {
  // Check API key early
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    // Validate request
    const parseResult = jfdaRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid medicine name' },
        { status: 400 }
      );
    }

    const { medicineName } = parseResult.data;

    // Add timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://prescription-analyzer.vercel.app',
          'X-Title': 'Prescription Analyzer - JFDA Lookup',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: `You are a pharmaceutical database expert specializing in Jordan's JFDA (Jordan Food and Drug Administration) drug registry.

Your task is to provide accurate pharmaceutical information for drugs registered in Jordan. Use your knowledge of:
- JFDA drug pricing (سعر الجمهور، سعر الصيدلي، سعر المستشفى)
- Jordanian drug distributors (الوكيل)
- ATC codes and registration numbers
- Common medications available in Jordan

Respond ONLY with valid JSON in this exact format:
{
  "trade_name": "English trade name",
  "trade_name_ar": "الاسم التجاري بالعربي",
  "scientific_name": "Generic/active ingredient name",
  "concentration": "Strength (e.g., 500 mg)",
  "jfda_status": "Registered",
  "registration_number": "JFDA number if known",
  "atc_code": "ATC classification",
  "public_price_jod": "Price in JOD (e.g., 1.35)",
  "pharmacy_price_jod": "Pharmacy price in JOD",
  "hospital_price_jod": "Hospital price in JOD",
  "package_size": "Package contents (e.g., 24 tablets)",
  "manufacturer": "Manufacturing company",
  "manufacturer_country": "Country of origin",
  "distributor": "Jordanian distributor/agent",
  "prescription_required": false,
  "indications": ["List of approved uses"],
  "contraindications": ["List of contraindications"],
  "warnings": ["Important warnings"],
  "storage": "Storage conditions",
  "generic_alternatives": ["Available alternatives in Jordan"],
  "additional_notes": "Any additional relevant info",
  "additional_notes_ar": "ملاحظات إضافية بالعربي"
}

Be accurate with Jordanian drug prices and distributors. If unsure about exact prices, provide reasonable estimates based on typical Jordanian market prices.`
            },
            {
              role: 'user',
              content: `Provide complete JFDA pharmaceutical information for: ${medicineName}`
            }
          ],
          max_tokens: 4096,
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch JFDA information' },
          { status: response.status === 401 ? 503 : 500 }
        );
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;

      if (!content) {
        return NextResponse.json(
          { error: 'No response from AI service' },
          { status: 500 }
        );
      }

      // Strip markdown code blocks if present
      content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

      let jfdaInfo;
      try {
        jfdaInfo = JSON.parse(content);
      } catch {
        return NextResponse.json(
          { error: 'Failed to parse drug information' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        jfda_info: jfdaInfo,
        data_source: 'ai',
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - please try again' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
