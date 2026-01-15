import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-3-pro-preview';

export async function POST(request: NextRequest) {
  try {
    const { medicineName } = await request.json();

    if (!medicineName) {
      return NextResponse.json(
        { error: 'Medicine name is required' },
        { status: 400 }
      );
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

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
        max_tokens: 2048,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch JFDA information', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let jfdaInfo;
    try {
      jfdaInfo = JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response:', content);
      jfdaInfo = { error: 'Failed to parse response', raw: content };
    }

    return NextResponse.json({
      success: true,
      jfda_info: jfdaInfo,
      data_source: 'ai',
    });
  } catch (error) {
    console.error('JFDA lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
