'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const IconSend = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const IconMic = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const IconBack = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const IconPhone = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const IconVideo = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const IconDots = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const IconLoader = () => (
  <div className="flex gap-1 p-2">
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

const QUICK_MESSAGES = [
  { ar: 'عندكم باندول؟', en: 'Do you have Panadol?' },
  { ar: 'شو سعر أوجمنتين؟', en: 'What\'s the price of Augmentin?' },
  { ar: 'في تعارض بين هالدوائين؟', en: 'Any interaction between these medicines?' },
  { ar: 'بدي دواء للرشح', en: 'I need cold medicine' },
];

const WELCOME_MESSAGE = 'أهلاً بك في صيدلية كواليا.\nWelcome to Qualia Pharmacy.\n\nكيف يمكنني مساعدتك؟\nHow can I help you?\n\n- استفسارات عن الأدوية والأسعار\n- معلومات JFDA\n- التحقق من التعارضات الدوائية\n\n- Medication and pricing inquiries\n- JFDA information\n- Drug interaction checks';

export default function WhatsAppAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setMessages([{
      id: '1',
      role: 'assistant',
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    }]);
  }, []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        toast.error('فشل في الرد - Failed to respond');
      }
    } catch {
      toast.error('حدث خطأ - An error occurred');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="min-h-screen bg-[#111b21] flex flex-col">
      {/* WhatsApp Header */}
      <header className="bg-[#202c33] px-4 py-2 flex items-center gap-3 sticky top-0 z-50">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <IconBack />
        </Link>

        <div className="relative">
          <Image
            src="https://images.squarespace-cdn.com/content/v1/65bf52f873aac538961445c5/19d16cc5-aa83-437c-9c2a-61de5268d5bf/Untitled+design+-+2025-01-19T070746.544.png"
            alt="Qualia Pharmacy"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#202c33]" />
        </div>

        <div className="flex-1">
          <h1 className="text-white font-medium">صيدلية كواليا | Qualia Pharmacy</h1>
          <p className="text-emerald-400 text-xs">متصل الآن • Online</p>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
          <button className="hover:text-white transition-colors">
            <IconVideo />
          </button>
          <button className="hover:text-white transition-colors">
            <IconPhone />
          </button>
          <button className="hover:text-white transition-colors">
            <IconDots />
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundColor: '#0b141a',
        }}
      >
        {/* Date Chip */}
        <div className="flex justify-center mb-4">
          <span className="bg-[#182229] text-gray-400 text-xs px-3 py-1 rounded-lg">
            Today
          </span>
        </div>

        {!isHydrated && (
          <div className="flex justify-start">
            <div className="bg-[#202c33] rounded-lg rounded-tl-none px-2">
              <IconLoader />
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                message.role === 'user'
                  ? 'bg-[#005c4b] text-white rounded-tr-none'
                  : 'bg-[#202c33] text-white rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              <p className={`text-[10px] mt-1 text-right ${
                message.role === 'user' ? 'text-emerald-200' : 'text-gray-400'
              }`}>
                {formatTime(message.timestamp)}
                {message.role === 'user' && ' ✓✓'}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#202c33] rounded-lg rounded-tl-none px-2">
              <IconLoader />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Messages */}
      <div className="px-4 py-2 bg-[#111b21] border-t border-[#202c33]">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {QUICK_MESSAGES.map((msg, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(msg.ar)}
              disabled={isLoading}
              className="flex-shrink-0 px-3 py-1.5 bg-[#202c33] text-gray-300 text-sm rounded-full hover:bg-[#2a3942] transition-colors disabled:opacity-50"
            >
              {msg.ar}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="bg-[#202c33] px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <IconMic />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب رسالتك... | Type a message..."
          className="flex-1 bg-[#2a3942] text-white placeholder-gray-400 px-4 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
          disabled={isLoading}
          dir="auto"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            input.trim() && !isLoading
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'bg-[#2a3942] text-gray-500'
          }`}
        >
          <IconSend />
        </button>
      </form>

      {/* Bottom Navigation */}
      <nav className="bg-[#202c33] border-t border-[#111b21] px-4 py-2">
        <div className="flex justify-center gap-8">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs">تحليل الوصفات</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-emerald-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-xs">واتساب</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
