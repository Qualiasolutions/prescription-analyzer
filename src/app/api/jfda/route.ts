import { NextRequest, NextResponse } from 'next/server';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-3-pro-preview';

interface FirecrawlAgentResponse {
  success: boolean;
  status: string;
  data?: {
    trade_name?: string;
    trade_name_ar?: string;
    scientific_name?: string;
    manufacturer?: string;
    manufacturer_country?: string;
    price_jod?: string;
    public_price_jod?: string;
    pharmacy_price_jod?: string;
    hospital_price_jod?: string;
    registration_status?: string;
    registration_number?: string;
    concentration?: string;
    package_size?: string;
    atc_code?: string;
    distributor?: string;
    prescription_required?: boolean;
    source_url?: string;
  };
  expiresAt?: string;
}

async function fetchWithFirecrawl(medicineName: string) {
  if (!FIRECRAWL_API_KEY) {
    throw new Error('Firecrawl API key not configured');
  }

  const response = await fetch('https://api.firecrawl.dev/v1/agent', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `Find Jordan JFDA registered drug information for "${medicineName}". Search the JFDA Jordan website (jfda.jo, drugapplication.jfda.jo) and Jordanian pharmacy databases. I need: trade name (English and Arabic), scientific/generic name, manufacturer, manufacturer country, all prices in JOD (public, pharmacy, hospital), JFDA registration status, registration number, concentration/strength, package size, ATC code, distributor in Jordan, whether prescription is required.`,
      schema: {
        type: 'object',
        properties: {
          trade_name: { type: 'string', description: 'Trade name in English' },
          trade_name_ar: { type: 'string', description: 'Trade name in Arabic' },
          scientific_name: { type: 'string', description: 'Generic/Scientific name' },
          manufacturer: { type: 'string', description: 'Manufacturing company' },
          manufacturer_country: { type: 'string', description: 'Country of manufacture' },
          public_price_jod: { type: 'string', description: 'Public price in JOD' },
          pharmacy_price_jod: { type: 'string', description: 'Pharmacy price in JOD' },
          hospital_price_jod: { type: 'string', description: 'Hospital price in JOD' },
          registration_status: { type: 'string', description: 'JFDA registration status' },
          registration_number: { type: 'string', description: 'JFDA registration number' },
          concentration: { type: 'string', description: 'Drug strength/concentration' },
          package_size: { type: 'string', description: 'Package size (tablets/units)' },
          atc_code: { type: 'string', description: 'ATC classification code' },
          distributor: { type: 'string', description: 'Distributor/Agent in Jordan' },
          prescription_required: { type: 'boolean', description: 'Whether prescription is needed' },
          source_url: { type: 'string', description: 'Source URL for the data' },
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firecrawl API error: ${error}`);
  }

  return response.json() as Promise<FirecrawlAgentResponse>;
}

async function fetchWithGemini(medicineName: string) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
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
          content: `You are a pharmaceutical expert with comprehensive knowledge of the JFDA (Jordan Food and Drug Administration) drug database.

Provide Jordan-specific pharmaceutical data in JSON format:
{
  "trade_name": "Trade name in English",
  "trade_name_ar": "الاسم التجاري",
  "scientific_name": "Generic/Scientific name",
  "concentration": "e.g., 500 mg",
  "jfda_status": "Registered/Not Registered",
  "registration_number": "JFDA registration number if known",
  "atc_code": "ATC classification code",
  "public_price_jod": "Approximate price in JOD",
  "pharmacy_price_jod": "Pharmacy price in JOD",
  "hospital_price_jod": "Hospital price in JOD",
  "package_size": "Number of tablets/units",
  "manufacturer": "Manufacturing company",
  "manufacturer_country": "Country of manufacture",
  "distributor": "Agent/Distributor in Jordan",
  "prescription_required": true/false,
  "indications": ["Approved uses"],
  "contraindications": ["Contraindications"],
  "warnings": ["Warnings and precautions"],
  "storage": "Storage conditions",
  "generic_alternatives": ["Alternative products available in Jordan"],
  "additional_notes": "Additional information"
}`
        },
        {
          role: 'user',
          content: `Provide JFDA pharmaceutical information for: ${medicineName}`
        }
      ],
      max_tokens: 2048,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenRouter API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content || '{}');
}

export async function POST(request: NextRequest) {
  try {
    const { medicineName } = await request.json();

    if (!medicineName) {
      return NextResponse.json(
        { error: 'Medicine name is required' },
        { status: 400 }
      );
    }

    let jfdaInfo;
    let dataSource = 'ai';

    // Try Firecrawl first for real JFDA data
    if (FIRECRAWL_API_KEY) {
      try {
        console.log(`Fetching JFDA data for "${medicineName}" via Firecrawl...`);
        const firecrawlResult = await fetchWithFirecrawl(medicineName);

        if (firecrawlResult.success && firecrawlResult.data) {
          dataSource = 'jfda_live';
          jfdaInfo = {
            trade_name: firecrawlResult.data.trade_name,
            trade_name_ar: firecrawlResult.data.trade_name_ar,
            scientific_name: firecrawlResult.data.scientific_name,
            concentration: firecrawlResult.data.concentration,
            jfda_status: firecrawlResult.data.registration_status || 'Unknown',
            registration_number: firecrawlResult.data.registration_number,
            atc_code: firecrawlResult.data.atc_code,
            public_price_jod: firecrawlResult.data.public_price_jod || firecrawlResult.data.price_jod,
            pharmacy_price_jod: firecrawlResult.data.pharmacy_price_jod,
            hospital_price_jod: firecrawlResult.data.hospital_price_jod,
            package_size: firecrawlResult.data.package_size,
            manufacturer: firecrawlResult.data.manufacturer,
            manufacturer_country: firecrawlResult.data.manufacturer_country,
            distributor: firecrawlResult.data.distributor,
            prescription_required: firecrawlResult.data.prescription_required,
            source_url: firecrawlResult.data.source_url,
          };
        }
      } catch (firecrawlError) {
        console.error('Firecrawl fetch failed, falling back to AI:', firecrawlError);
      }
    }

    // Fall back to Gemini AI if Firecrawl didn't work
    if (!jfdaInfo) {
      console.log(`Fetching JFDA data for "${medicineName}" via Gemini AI...`);
      jfdaInfo = await fetchWithGemini(medicineName);
      dataSource = 'ai';
    }

    return NextResponse.json({
      success: true,
      jfda_info: jfdaInfo,
      data_source: dataSource,
    });
  } catch (error) {
    console.error('JFDA lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
