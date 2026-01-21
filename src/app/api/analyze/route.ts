import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-3-flash-preview';
const REQUEST_TIMEOUT_MS = 60000; // 60 seconds
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Request validation schema
const analyzeRequestSchema = z.object({
  image: z.string().max(MAX_IMAGE_SIZE_BYTES).optional(),
  text: z.string().max(10000).optional(),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']).optional(),
}).refine(data => data.image || data.text, {
  message: 'Either image or text must be provided',
});

const SYSTEM_PROMPT = `You are an expert pharmacist AI assistant specializing in prescription analysis. Your role is to:

1. Extract ALL medicine names from prescriptions (images or text)
2. Provide accurate Arabic and English names for each medicine
3. Give detailed dosage instructions and timing
4. Identify potential drug interactions and warnings
5. Reference JFDA (Jordan Food and Drug Administration) guidelines when relevant
6. Provide patient-friendly explanations in both Arabic and English

IMPORTANT GUIDELINES:
- Be precise with medicine names - check for similar-sounding medications
- Always mention the active ingredient when possible
- Include storage requirements if relevant
- Highlight any allergies or contraindications
- Note if the medication requires special handling (refrigeration, etc.)
- Mention if the medicine should be taken with food or on empty stomach
- Include common side effects patients should watch for

Respond in JSON format with this structure:
{
  "medicines": [
    {
      "name_en": "Medicine name in English",
      "name_ar": "اسم الدواء بالعربية",
      "active_ingredient": "Active ingredient name",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "quantity": 14,
      "instructions": "Take with food after breakfast and dinner",
      "instructions_ar": "تناوله مع الطعام بعد الإفطار والعشاء",
      "warnings": ["Do not take with alcohol", "May cause drowsiness"],
      "warnings_ar": ["لا تتناوله مع الكحول", "قد يسبب النعاس"],
      "interactions": ["Avoid taking with antacids"],
      "category": "Antibiotic",
      "storage": "Store at room temperature"
    }
  ],
  "general_notes": "General prescription notes",
  "general_notes_ar": "ملاحظات عامة عن الوصفة",
  "patient_advice": "Overall advice for the patient",
  "patient_advice_ar": "نصيحة عامة للمريض"
}`;

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
    const parseResult = analyzeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.issues.map(i => i.message) },
        { status: 400 }
      );
    }

    const { image, text, mimeType } = parseResult.data;

    const messages: { role: string; content: unknown }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (image) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please analyze this prescription image and extract all medicine information. Provide detailed instructions for each medication, potential interactions, and any warnings. Include both Arabic and English translations.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType || 'image/jpeg'};base64,${image}`,
            },
          },
        ],
      });
    } else {
      // Sanitize text input to prevent prompt injection
      const sanitizedText = text!.replace(/[<>{}]/g, '');
      messages.push({
        role: 'user',
        content: `Please analyze this prescription text and extract all medicine information. Provide detailed instructions for each medication, potential interactions, and any warnings. Include both Arabic and English translations.\n\nPrescription text:\n${sanitizedText}`,
      });
    }

    const startTime = Date.now();

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
          'X-Title': 'Prescription Analyzer',
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          max_tokens: 4096,
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to analyze prescription' },
          { status: response.status === 401 ? 503 : 500 }
        );
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;

      if (!content) {
        return NextResponse.json(
          { error: 'No analysis result received' },
          { status: 500 }
        );
      }

      // Strip markdown code blocks if present
      content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

      let analysis;
      try {
        analysis = JSON.parse(content);
      } catch {
        analysis = {
          medicines: [],
          general_notes: content,
          raw_response: content,
        };
      }

      return NextResponse.json({
        success: true,
        analysis,
        metadata: {
          model: data.model,
          tokens: data.usage?.total_tokens,
          response_time_ms: responseTime,
        },
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
  } catch (error) {
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
