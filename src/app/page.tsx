'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { Medicine, AnalysisResult, JFDAInfo } from '@/types';

const ACCESS_CODE = '516278';

// Minimal Icon Components
const Icons = {
  upload: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  ),
  text: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  pill: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  warning: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  shield: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  x: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  image: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  check: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  arrowRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  refresh: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
};

function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return <div className={`spinner ${className}`} />;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [jfdaInfo, setJfdaInfo] = useState<JFDAInfo | null>(null);
  const [loadingJfda, setLoadingJfda] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<'image' | 'text'>('image');

  useEffect(() => {
    const savedAuth = localStorage.getItem('prescription_analyzer_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleCodeSubmit = () => {
    if (accessCode === ACCESS_CODE) {
      setIsAuthenticated(true);
      localStorage.setItem('prescription_analyzer_auth', 'true');
      toast.success('Access granted');
    } else {
      toast.error('Invalid access code');
      setAccessCode('');
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF file');
        return;
      }
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith('image/') && droppedFile.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF file');
        return;
      }
      setFile(droppedFile);
      if (droppedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(droppedFile);
      }
    }
  }, []);

  const analyzeImage = async () => {
    if (inputMode === 'image' && !file) {
      toast.error('Please upload a prescription image first');
      return;
    }
    if (inputMode === 'text' && !textInput.trim()) {
      toast.error('Please enter prescription text');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setJfdaInfo(null);
    setSelectedMedicine(null);

    try {
      let body: { image?: string; text?: string; mimeType?: string } = {};

      if (inputMode === 'image' && file) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.readAsDataURL(file);
        });
        body = { image: base64, mimeType: file.type };
      } else {
        body = { text: textInput };
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.analysis);
        toast.success('Analysis complete');
      } else {
        toast.error(data.error || 'Failed to analyze prescription');
      }
    } catch {
      toast.error('An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchJFDAInfo = async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setLoadingJfda(true);
    setJfdaInfo(null);

    try {
      const response = await fetch('/api/jfda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineName: medicine.name_en }),
      });

      const data = await response.json();
      if (data.success) {
        setJfdaInfo(data.jfda_info);
      } else {
        toast.error('Failed to fetch JFDA information');
      }
    } catch {
      toast.error('Error fetching JFDA data');
    } finally {
      setLoadingJfda(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setSelectedMedicine(null);
    setJfdaInfo(null);
    setTextInput('');
  };

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <Image
              src="https://images.squarespace-cdn.com/content/v1/65bf52f873aac538961445c5/19d16cc5-aa83-437c-9c2a-61de5268d5bf/Untitled+design+-+2025-01-19T070746.544.png"
              alt="Qualia Solutions"
              width={48}
              height={48}
              className="rounded-xl mx-auto mb-6"
            />
            <h1 className="text-xl font-semibold text-[#171717] mb-1">صيدلية كواليا | Qualia Pharmacy</h1>
            <p className="text-sm text-[#737373]">
              Built by{' '}
              <a
                href="https://qualiasolutions.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#171717] hover:underline"
              >
                Qualia Solutions
              </a>
            </p>
          </div>

          <div className="card p-6">
            <label className="block text-xs font-medium text-[#737373] uppercase tracking-wide mb-2">
              Access Code
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
              placeholder="Enter code"
              className="w-full px-4 py-3 rounded-lg bg-[#fafafa] text-[#171717] border border-[#e5e5e5] focus:border-[#171717] focus:outline-none transition-colors text-center text-lg tracking-[0.3em] font-mono"
              maxLength={6}
            />

            <button
              onClick={handleCodeSubmit}
              disabled={accessCode.length !== 6}
              className="w-full mt-4 py-3 rounded-lg btn-primary flex items-center justify-center gap-2"
            >
              Continue
              {Icons.arrowRight}
            </button>
          </div>

          <p className="text-center text-xs text-[#a3a3a3] mt-6">
            Contact us for access credentials
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#e5e5e5] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="https://images.squarespace-cdn.com/content/v1/65bf52f873aac538961445c5/19d16cc5-aa83-437c-9c2a-61de5268d5bf/Untitled+design+-+2025-01-19T070746.544.png"
              alt="Qualia Solutions"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-medium text-[#171717] hidden sm:inline">صيدلية كواليا | Qualia Pharmacy</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/whatsapp"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-[#20bd5a] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </Link>
            <div className="flex items-center gap-2 text-xs text-[#737373]">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="hidden sm:inline">JFDA</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Upload Section - Centered when no results */}
        {!result && !isAnalyzing && (
          <div className="max-w-xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#171717] mb-2">
                AI Prescription Analysis
              </h1>
              <p className="text-[#737373]">
                Upload a prescription or enter medicine names for detailed information and JFDA verification.
              </p>
            </div>

            <div className="card p-6">
              {/* Mode Toggle */}
              <div className="flex gap-1 p-1 bg-[#f5f5f5] rounded-lg mb-5 w-fit mx-auto">
                <button
                  onClick={() => setInputMode('image')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    inputMode === 'image'
                      ? 'bg-white text-[#171717] shadow-sm'
                      : 'text-[#737373] hover:text-[#171717]'
                  }`}
                >
                  {Icons.upload}
                  Image
                </button>
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    inputMode === 'text'
                      ? 'bg-white text-[#171717] shadow-sm'
                      : 'text-[#737373] hover:text-[#171717]'
                  }`}
                >
                  {Icons.text}
                  Text
                </button>
              </div>

              {inputMode === 'image' ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={`upload-zone p-10 text-center cursor-pointer ${preview ? 'active' : ''}`}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                  {preview ? (
                    <div className="space-y-3">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-[#737373]">{file?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-xl bg-[#f5f5f5] flex items-center justify-center text-[#a3a3a3]">
                        {Icons.image}
                      </div>
                      <div>
                        <p className="text-[#171717] font-medium">
                          Drop prescription here
                        </p>
                        <p className="text-sm text-[#a3a3a3] mt-0.5">
                          or click to browse
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter medicine names or prescription details..."
                  className="w-full h-[200px] p-4 rounded-lg bg-white text-[#171717] border border-[#e5e5e5] focus:border-[#171717] focus:outline-none resize-none text-sm"
                />
              )}

              <button
                onClick={analyzeImage}
                disabled={inputMode === 'image' ? !file : !textInput.trim()}
                className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 rounded-lg btn-primary"
              >
                {Icons.search}
                Analyze Prescription
              </button>
            </div>
          </div>
        )}

        {/* Analyzing State */}
        {isAnalyzing && (
          <div className="max-w-xl mx-auto text-center py-20 animate-fade-in">
            <Spinner className="w-10 h-10 mx-auto mb-4" />
            <p className="text-[#171717] font-medium">Analyzing prescription...</p>
            <p className="text-sm text-[#737373] mt-1">This may take a few seconds</p>
          </div>
        )}

        {/* Results */}
        {result && result.medicines && (
          <div className="animate-fade-in">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#171717]">Analysis Results</h2>
                <p className="text-sm text-[#737373] mt-0.5">
                  {result.medicines.length} medicine{result.medicines.length !== 1 ? 's' : ''} found • Click for JFDA details
                </p>
              </div>
              <button
                onClick={resetAnalysis}
                className="flex items-center gap-2 px-4 py-2 rounded-lg btn-secondary text-sm"
              >
                {Icons.refresh}
                New Analysis
              </button>
            </div>

            {/* Medicines Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {result.medicines.map((medicine, index) => (
                <div
                  key={index}
                  onClick={() => fetchJFDAInfo(medicine)}
                  className={`card p-5 cursor-pointer transition-all ${
                    selectedMedicine?.name_en === medicine.name_en
                      ? 'ring-2 ring-[#171717] ring-offset-2'
                      : 'hover:border-[#d4d4d4]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#171717] truncate">{medicine.name_en}</h3>
                      {medicine.name_ar && (
                        <p className="text-sm text-[#737373] text-arabic truncate">{medicine.name_ar}</p>
                      )}
                    </div>
                    {medicine.category && (
                      <span className="badge shrink-0 text-[10px]">{medicine.category}</span>
                    )}
                  </div>

                  {(medicine.dosage || medicine.frequency || medicine.duration) && (
                    <div className="space-y-1.5 text-xs text-[#737373] mb-3">
                      {medicine.dosage && (
                        <div className="flex justify-between">
                          <span className="text-[#a3a3a3]">Dosage</span>
                          <span className="font-medium text-[#171717]">{medicine.dosage}</span>
                        </div>
                      )}
                      {medicine.frequency && (
                        <div className="flex justify-between">
                          <span className="text-[#a3a3a3]">Frequency</span>
                          <span className="font-medium text-[#171717]">{medicine.frequency}</span>
                        </div>
                      )}
                      {medicine.duration && (
                        <div className="flex justify-between">
                          <span className="text-[#a3a3a3]">Duration</span>
                          <span className="font-medium text-[#171717]">{medicine.duration}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {medicine.instructions && (
                    <p className="text-xs text-[#737373] p-2.5 bg-[#f5f5f5] rounded-lg mb-3 line-clamp-2">
                      {medicine.instructions}
                    </p>
                  )}

                  {medicine.warnings && medicine.warnings.length > 0 && (
                    <div className="space-y-1">
                      {medicine.warnings.slice(0, 2).map((warning, idx) => (
                        <p key={idx} className="text-xs text-amber-600 flex items-start gap-1.5">
                          <span className="mt-0.5 shrink-0">{Icons.warning}</span>
                          <span className="line-clamp-1">{warning}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* General Notes & Advice */}
            {(result.general_notes || result.patient_advice) && (
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                {result.general_notes && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <h4 className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      {Icons.info}
                      General Notes
                    </h4>
                    <p className="text-sm text-blue-700">{result.general_notes}</p>
                    {result.general_notes_ar && (
                      <p className="text-sm text-blue-600 mt-2 text-arabic">{result.general_notes_ar}</p>
                    )}
                  </div>
                )}
                {result.patient_advice && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                    <h4 className="text-xs font-medium text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      {Icons.check}
                      Patient Advice
                    </h4>
                    <p className="text-sm text-green-700">{result.patient_advice}</p>
                    {result.patient_advice_ar && (
                      <p className="text-sm text-green-600 mt-2 text-arabic">{result.patient_advice_ar}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* JFDA Panel */}
        {(selectedMedicine || loadingJfda) && (
          <div className="mt-8 card p-6 animate-fade-in-scale">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-[#171717] flex items-center gap-2">
                {Icons.shield}
                JFDA Information
                {selectedMedicine && (
                  <span className="text-[#737373] font-normal">— {selectedMedicine.name_en}</span>
                )}
              </h2>
              <button
                onClick={() => { setSelectedMedicine(null); setJfdaInfo(null); }}
                className="text-[#a3a3a3] hover:text-[#737373] transition-colors p-1"
              >
                {Icons.x}
              </button>
            </div>

            {loadingJfda && (
              <div className="text-center py-10">
                <Spinner className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm text-[#737373]">Loading JFDA data...</p>
              </div>
            )}

            {jfdaInfo && !loadingJfda && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Trade Name */}
                <div className="lg:col-span-2 p-4 rounded-lg bg-[#f5f5f5]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-[#a3a3a3] uppercase tracking-wide mb-1">Trade Name</p>
                      <p className="font-medium text-[#171717]">{jfdaInfo.trade_name || selectedMedicine?.name_en}</p>
                      {jfdaInfo.trade_name_ar && <p className="text-sm text-[#737373] text-arabic">{jfdaInfo.trade_name_ar}</p>}
                    </div>
                    {jfdaInfo.concentration && (
                      <span className="badge">{jfdaInfo.concentration}</span>
                    )}
                  </div>
                  {jfdaInfo.scientific_name && (
                    <div className="mt-3 pt-3 border-t border-[#e5e5e5]">
                      <p className="text-xs text-[#a3a3a3] mb-0.5">Scientific Name</p>
                      <p className="text-sm text-[#737373]">{jfdaInfo.scientific_name}</p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="p-4 rounded-lg bg-[#f5f5f5]">
                  <p className="text-xs text-[#a3a3a3] uppercase tracking-wide mb-1">Status</p>
                  <p className="font-medium text-[#171717] flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${jfdaInfo.jfda_status === 'Registered' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    {jfdaInfo.jfda_status || 'Unknown'}
                  </p>
                  {jfdaInfo.registration_number && (
                    <p className="text-xs text-[#a3a3a3] mt-1">#{jfdaInfo.registration_number}</p>
                  )}
                </div>

                {/* Prescription */}
                <div className="p-4 rounded-lg bg-[#f5f5f5]">
                  <p className="text-xs text-[#a3a3a3] uppercase tracking-wide mb-1">Prescription</p>
                  <p className="font-medium text-[#171717] flex items-center gap-1.5">
                    {jfdaInfo.prescription_required ? (
                      <>
                        {Icons.check}
                        Required
                      </>
                    ) : (
                      'Not Required'
                    )}
                  </p>
                </div>

                {/* Pricing */}
                {(jfdaInfo.public_price_jod || jfdaInfo.pharmacy_price_jod) && (
                  <div className="lg:col-span-2 p-4 rounded-lg bg-green-50 border border-green-100">
                    <p className="text-xs text-green-700 uppercase tracking-wide mb-2">Pricing (JOD)</p>
                    <div className="grid grid-cols-3 gap-4">
                      {jfdaInfo.public_price_jod && (
                        <div>
                          <p className="text-xs text-green-600">Public</p>
                          <p className="font-semibold text-green-700">{jfdaInfo.public_price_jod}</p>
                        </div>
                      )}
                      {jfdaInfo.pharmacy_price_jod && (
                        <div>
                          <p className="text-xs text-green-600">Pharmacy</p>
                          <p className="font-semibold text-green-700">{jfdaInfo.pharmacy_price_jod}</p>
                        </div>
                      )}
                      {jfdaInfo.hospital_price_jod && (
                        <div>
                          <p className="text-xs text-green-600">Hospital</p>
                          <p className="font-semibold text-green-700">{jfdaInfo.hospital_price_jod}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Manufacturer */}
                {jfdaInfo.manufacturer && (
                  <div className="lg:col-span-2 p-4 rounded-lg bg-[#f5f5f5]">
                    <p className="text-xs text-[#a3a3a3] uppercase tracking-wide mb-1">Manufacturer</p>
                    <p className="font-medium text-[#171717]">{jfdaInfo.manufacturer}</p>
                    {jfdaInfo.manufacturer_country && (
                      <p className="text-sm text-[#737373]">{jfdaInfo.manufacturer_country}</p>
                    )}
                  </div>
                )}

                {/* Warnings */}
                {jfdaInfo.warnings && jfdaInfo.warnings.length > 0 && (
                  <div className="sm:col-span-2 lg:col-span-4 p-4 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                      {Icons.warning}
                      Warnings
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-1">
                      {jfdaInfo.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-amber-700 flex items-start gap-1.5">
                          <span className="text-amber-400 mt-1">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contraindications */}
                {jfdaInfo.contraindications && jfdaInfo.contraindications.length > 0 && (
                  <div className="sm:col-span-2 lg:col-span-4 p-4 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-xs text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                      {Icons.warning}
                      Contraindications
                    </p>
                    <ul className="space-y-1">
                      {jfdaInfo.contraindications.map((item, idx) => (
                        <li key={idx} className="text-sm text-red-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Generic Alternatives */}
                {jfdaInfo.generic_alternatives && jfdaInfo.generic_alternatives.length > 0 && (
                  <div className="sm:col-span-2 lg:col-span-4 p-4 rounded-lg bg-[#f5f5f5]">
                    <p className="text-xs text-[#a3a3a3] uppercase tracking-wide mb-2">Generic Alternatives</p>
                    <div className="flex flex-wrap gap-1.5">
                      {jfdaInfo.generic_alternatives.map((alt, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-white border border-[#e5e5e5] rounded text-sm text-[#737373]">
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                {jfdaInfo.additional_notes && (
                  <div className="sm:col-span-2 lg:col-span-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                      {Icons.info}
                      Notes
                    </p>
                    <p className="text-sm text-blue-700">{jfdaInfo.additional_notes}</p>
                    {jfdaInfo.additional_notes_ar && (
                      <p className="text-sm text-blue-600 mt-1 text-arabic">{jfdaInfo.additional_notes_ar}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] mt-16 py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#a3a3a3]">
          <div className="flex items-center gap-2">
            <Image
              src="https://images.squarespace-cdn.com/content/v1/65bf52f873aac538961445c5/19d16cc5-aa83-437c-9c2a-61de5268d5bf/Untitled+design+-+2025-01-19T070746.544.png"
              alt="Qualia Solutions"
              width={20}
              height={20}
              className="rounded"
            />
            <span>Qualia Solutions</span>
          </div>
          <p>For informational purposes only. Consult a healthcare professional.</p>
        </div>
      </footer>
    </div>
  );
}
