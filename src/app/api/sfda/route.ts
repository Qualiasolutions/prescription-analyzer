import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { medicineName } = await request.json();

    if (!medicineName) {
      return NextResponse.json(
        { error: 'Medicine name is required' },
        { status: 400 }
      );
    }

    // Use AI to search for SFDA information and provide context
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://prescription-analyzer.vercel.app',
        'X-Title': 'Prescription Analyzer - SFDA Lookup',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'system',
            content: `You are a pharmaceutical expert with knowledge of SFDA (Saudi Food & Drug Authority) regulations and medicine information.

When given a medicine name, provide:
1. SFDA registration status (if known)
2. Approved indications in Saudi Arabia
3. Any specific warnings or contraindications
4. Storage and handling requirements
5. Generic alternatives available in Saudi Arabia
6. Price range if available
7. Whether it requires a prescription in Saudi Arabia

Always provide information in both English and Arabic.
Respond in JSON format:
{
  "medicine_name": "Name",
  "medicine_name_ar": "الاسم",
  "sfda_status": "Registered/Pending/Not Registered",
  "registration_number": "If available",
  "indications": ["List of approved uses"],
  "indications_ar": ["قائمة الاستخدامات"],
  "contraindications": ["List of contraindications"],
  "contraindications_ar": ["موانع الاستعمال"],
  "warnings": ["Important warnings"],
  "warnings_ar": ["تحذيرات مهمة"],
  "storage": "Storage requirements",
  "prescription_required": true/false,
  "generic_alternatives": ["List of alternatives"],
  "price_range_sar": "Price range in SAR",
  "manufacturer": "Manufacturer name",
  "additional_notes": "Any additional information",
  "additional_notes_ar": "معلومات إضافية"
}`
          },
          {
            role: 'user',
            content: `Please provide SFDA and pharmaceutical information for: ${medicineName}`
          }
        ],
        max_tokens: 2048,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch SFDA information', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let sfdaInfo;
    try {
      sfdaInfo = JSON.parse(content);
    } catch {
      sfdaInfo = { raw_response: content };
    }

    return NextResponse.json({
      success: true,
      sfda_info: sfdaInfo,
    });
  } catch (error) {
    console.error('SFDA lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
