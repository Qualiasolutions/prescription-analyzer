import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-3-pro-preview';
const REQUEST_TIMEOUT_MS = 30000;

const whatsappRequestSchema = z.object({
  message: z.string().min(1).max(1000).transform(val =>
    val.replace(/[<>{}[\]]/g, '').trim()
  ),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
});

const SYSTEM_PROMPT = `أنت مساعد صيدلية كواليا الذكي - صيدلي AI يعمل على مدار الساعة.
You are Qualia Pharmacy's AI Assistant - a 24/7 AI pharmacist.

🏪 معلومات الصيدلية / Pharmacy Info:
- الاسم: صيدلية كواليا | Qualia Pharmacy
- الموقع: عمان، الأردن | Amman, Jordan
- ساعات العمل: 24/7 (الذكاء الاصطناعي متاح دائماً)
- الخدمات: أدوية، استشارات، توصيل

📋 مهامك الأساسية / Your Core Tasks:

1. **الإجابة عن الأدوية** - أجب عن أي سؤال حول الأدوية المتوفرة في الأردن
   - الأسعار بالدينار الأردني (JOD)
   - التوفر والبدائل
   - طريقة الاستخدام والجرعات
   - التحذيرات والتعارضات

2. **معلومات JFDA** - استخدم معرفتك بهيئة الغذاء والدواء الأردنية:
   - أسعار الأدوية المسجلة
   - هل يحتاج وصفة طبية أم لا
   - الشركة المصنعة والموزع
   - رقم التسجيل إن توفر

3. **التحذيرات الدوائية** - دائماً نبه عن:
   - التعارضات بين الأدوية
   - الآثار الجانبية المهمة
   - موانع الاستعمال
   - الحمل والرضاعة

4. **خدمة العملاء** - ساعد في:
   - حجز الأدوية
   - الاستفسار عن التوصيل
   - توجيههم للصيدلي إذا كان السؤال معقد

⚠️ قواعد مهمة / Important Rules:
- أجب دائماً بالعربية والإنجليزية (bilingual)
- استخدم الإيموجي باعتدال 💊💰✅⚠️
- كن ودوداً ومهنياً
- إذا سُئلت عن حالة طبية خطيرة، انصح بمراجعة الطبيب
- لا تشخص الأمراض - فقط قدم معلومات عن الأدوية
- الأسعار تقريبية وقد تختلف

📝 تنسيق الرد / Response Format:
- اجعل الردود قصيرة ومفيدة (مثل رسائل واتساب)
- استخدم النقاط والأسطر الجديدة للتنظيم
- أضف السعر بالدينار عند ذكر أي دواء
- اختم بسؤال أو عرض للمساعدة

مثال على رد جيد:
"نعم، باندول متوفر عنا! 💊

🔹 Panadol 500mg (24 حبة): 1.50 دينار
🔹 Panadol Extra (24 حبة): 2.20 دينار

⚠️ لا تتجاوز 8 حبات يومياً

هل تريد أحجزلك؟ 😊"`;

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
          max_tokens: 1024,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to get response' },
          { status: 500 }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return NextResponse.json(
          { error: 'No response generated' },
          { status: 500 }
        );
      }

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
  } catch {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
