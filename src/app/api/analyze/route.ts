import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Gemini 3 Pro Preview for both text and vision
const MODEL = 'google/gemini-3-pro-preview';

const SYSTEM_PROMPT = `You are an expert pharmacist AI assistant specializing in prescription analysis. Your role is to:

1. Extract ALL medicine names from prescriptions (images or text)
2. Provide accurate Arabic and English names for each medicine
3. Give detailed dosage instructions and timing
4. Identify potential drug interactions and warnings
5. Reference SFDA (Saudi Food & Drug Authority) guidelines when relevant
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
      "interactions": ["Avoid taking with antacids", "May interact with blood thinners"],
      "category": "Antibiotic",
      "storage": "Store at room temperature",
      "sfda_notes": "SFDA approved, registration number: XXX"
    }
  ],
  "general_notes": "General prescription notes",
  "general_notes_ar": "ملاحظات عامة عن الوصفة",
  "patient_advice": "Overall advice for the patient",
  "patient_advice_ar": "نصيحة عامة للمريض"
}`;

export async function POST(request: NextRequest) {
  try {
    const { image, text, mimeType } = await request.json();

    if (!image && !text) {
      return NextResponse.json(
        { error: 'Please provide either an image or text to analyze' },
        { status: 400 }
      );
    }

    const messages: { role: string; content: unknown }[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
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
      messages.push({
        role: 'user',
        content: `Please analyze this prescription text and extract all medicine information. Provide detailed instructions for each medication, potential interactions, and any warnings. Include both Arabic and English translations.\n\nPrescription text:\n${text}`,
      });
    }

    const startTime = Date.now();

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
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to analyze prescription', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No analysis result received' },
        { status: 500 }
      );
    }

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
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
