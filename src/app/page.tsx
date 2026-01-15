'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Medicine, AnalysisResult, SFDAInfo } from '@/types';

// Icon Components
const IconUpload = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const IconText = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconAnalyze = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconPill = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const IconWarning = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconShield = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconClipboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const IconLightbulb = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const IconX = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconImage = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconLoader = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [sfdaInfo, setSfdaInfo] = useState<SFDAInfo | null>(null);
  const [loadingSfda, setLoadingSfda] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<'image' | 'text'>('image');

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
    setSfdaInfo(null);

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
        toast.success('Prescription analyzed successfully');
      } else {
        toast.error(data.error || 'Failed to analyze prescription');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchSFDAInfo = async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setLoadingSfda(true);
    setSfdaInfo(null);

    try {
      const response = await fetch('/api/sfda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineName: medicine.name_en }),
      });

      const data = await response.json();
      if (data.success) {
        setSfdaInfo(data.sfda_info);
      } else {
        toast.error('Failed to fetch SFDA information');
      }
    } catch (error) {
      console.error('SFDA fetch error:', error);
      toast.error('Error fetching SFDA data');
    } finally {
      setLoadingSfda(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setSelectedMedicine(null);
    setSfdaInfo(null);
    setTextInput('');
  };

  return (
    <div className="min-h-screen bg-pattern">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="https://images.squarespace-cdn.com/content/v1/65bf52f873aac538961445c5/19d16cc5-aa83-437c-9c2a-61de5268d5bf/Untitled+design+-+2025-01-19T070746.544.png"
                alt="Qualia Solutions"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-[#0a1628] font-semibold text-lg">Prescription Analyzer</h1>
                <p className="text-slate-500 text-sm">Powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge-teal flex items-center gap-1.5">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                SFDA Connected
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        {!result && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1628] mb-3">
              AI Prescription Analysis
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Upload a prescription image or enter medicine names to get detailed information, dosage instructions, and drug interaction warnings.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setInputMode('image')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  inputMode === 'image'
                    ? 'bg-[#0a1628] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <IconUpload />
                Upload Image
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  inputMode === 'text'
                    ? 'bg-[#0a1628] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <IconText />
                Enter Text
              </button>
            </div>

            {inputMode === 'image' ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`upload-zone p-8 text-center cursor-pointer ${preview ? 'active' : ''}`}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Prescription preview"
                      className="max-h-56 mx-auto rounded-xl shadow-md"
                    />
                    <p className="text-slate-500 text-sm">{file?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <IconImage />
                    </div>
                    <div>
                      <p className="text-[#0a1628] font-medium text-lg">
                        Drop your prescription here
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        or click to browse (JPG, PNG, PDF)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter prescription details or medicine names...&#10;&#10;Example:&#10;Panadol 500mg - twice daily&#10;Augmentin 625mg - three times daily for 7 days"
                className="w-full h-64 p-4 rounded-xl bg-slate-50 text-[#0a1628] placeholder-slate-400 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none resize-none transition-all"
              />
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={analyzeImage}
                disabled={isAnalyzing || (inputMode === 'image' ? !file : !textInput.trim())}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-base transition-all ${
                  isAnalyzing || (inputMode === 'image' ? !file : !textInput.trim())
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'btn-teal'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <IconLoader />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <IconAnalyze />
                    Analyze Prescription
                  </>
                )}
              </button>
              {(file || textInput) && (
                <button
                  onClick={resetAnalysis}
                  className="px-6 py-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="card p-6">
            <h3 className="text-[#0a1628] font-semibold text-lg mb-4 flex items-center gap-2">
              <IconClipboard />
              Analysis Results
            </h3>

            {!result && !isAnalyzing && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                  <IconPill />
                </div>
                <p className="text-slate-500">
                  Upload a prescription to see the analysis results
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                  <div className="animate-spin w-10 h-10 border-3 border-teal-200 border-t-teal-500 rounded-full"></div>
                </div>
                <p className="text-[#0a1628] font-medium">Analyzing prescription...</p>
                <p className="text-slate-500 text-sm mt-1">Using AI to extract medicine information</p>
              </div>
            )}

            {result && result.medicines && (
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
                {result.medicines.map((medicine, index) => (
                  <div
                    key={index}
                    onClick={() => fetchSFDAInfo(medicine)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedMedicine?.name_en === medicine.name_en
                        ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-[#0a1628] font-semibold">{medicine.name_en}</h4>
                        {medicine.name_ar && (
                          <p className="text-slate-500 text-sm text-arabic">{medicine.name_ar}</p>
                        )}
                      </div>
                      <span className="badge-teal">
                        {medicine.category || 'Medicine'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      {medicine.dosage && (
                        <div className="text-slate-600">
                          <span className="text-slate-400">Dosage:</span> {medicine.dosage}
                        </div>
                      )}
                      {medicine.frequency && (
                        <div className="text-slate-600">
                          <span className="text-slate-400">Frequency:</span> {medicine.frequency}
                        </div>
                      )}
                      {medicine.duration && (
                        <div className="text-slate-600">
                          <span className="text-slate-400">Duration:</span> {medicine.duration}
                        </div>
                      )}
                    </div>

                    {medicine.instructions && (
                      <p className="text-slate-600 text-sm mt-3 p-3 bg-slate-50 rounded-lg flex items-start gap-2">
                        <IconPill />
                        {medicine.instructions}
                      </p>
                    )}

                    {medicine.warnings && medicine.warnings.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {medicine.warnings.slice(0, 2).map((warning, idx) => (
                          <p key={idx} className="text-amber-600 text-xs flex items-center gap-1.5">
                            <IconWarning />
                            {warning}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {result.general_notes && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <h4 className="text-blue-800 font-medium mb-2 flex items-center gap-2">
                      <IconClipboard />
                      General Notes
                    </h4>
                    <p className="text-blue-700 text-sm">{result.general_notes}</p>
                    {result.general_notes_ar && (
                      <p className="text-blue-600 text-sm mt-2 text-arabic">{result.general_notes_ar}</p>
                    )}
                  </div>
                )}

                {result.patient_advice && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <h4 className="text-emerald-800 font-medium mb-2 flex items-center gap-2">
                      <IconLightbulb />
                      Patient Advice
                    </h4>
                    <p className="text-emerald-700 text-sm">{result.patient_advice}</p>
                    {result.patient_advice_ar && (
                      <p className="text-emerald-600 text-sm mt-2 text-arabic">{result.patient_advice_ar}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SFDA Information Panel */}
        {(selectedMedicine || loadingSfda) && (
          <div className="mt-8 card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#0a1628] font-semibold text-lg flex items-center gap-2">
                <IconShield />
                SFDA Information - {selectedMedicine?.name_en}
              </h3>
              <button
                onClick={() => { setSelectedMedicine(null); setSfdaInfo(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <IconX />
              </button>
            </div>

            {loadingSfda && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-slate-200 border-t-teal-500 rounded-full mx-auto mb-4" />
                <p className="text-slate-500">Fetching SFDA information...</p>
              </div>
            )}

            {sfdaInfo && !loadingSfda && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-slate-500 text-sm mb-1">SFDA Status</h4>
                  <p className="text-[#0a1628] font-medium flex items-center gap-2">
                    {sfdaInfo.sfda_status === 'Registered' ? (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    ) : (
                      <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    )}
                    {sfdaInfo.sfda_status || 'Unknown'}
                  </p>
                  {sfdaInfo.registration_number && (
                    <p className="text-slate-400 text-xs mt-1">Reg: {sfdaInfo.registration_number}</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-slate-500 text-sm mb-1">Prescription Required</h4>
                  <p className="text-[#0a1628] font-medium flex items-center gap-2">
                    {sfdaInfo.prescription_required ? (
                      <>
                        <IconCheck />
                        Yes
                      </>
                    ) : (
                      'No'
                    )}
                  </p>
                </div>

                {sfdaInfo.price_range_sar && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-slate-500 text-sm mb-1">Price Range (SAR)</h4>
                    <p className="text-[#0a1628] font-medium">{sfdaInfo.price_range_sar}</p>
                  </div>
                )}

                {sfdaInfo.manufacturer && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-slate-500 text-sm mb-1">Manufacturer</h4>
                    <p className="text-[#0a1628] font-medium">{sfdaInfo.manufacturer}</p>
                  </div>
                )}

                {sfdaInfo.storage && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-slate-500 text-sm mb-1">Storage</h4>
                    <p className="text-slate-600 text-sm">{sfdaInfo.storage}</p>
                  </div>
                )}

                {sfdaInfo.indications && sfdaInfo.indications.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 md:col-span-2">
                    <h4 className="text-slate-500 text-sm mb-2">Approved Indications</h4>
                    <ul className="space-y-1">
                      {sfdaInfo.indications.map((indication, idx) => (
                        <li key={idx} className="text-slate-600 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                          {indication}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sfdaInfo.contraindications && sfdaInfo.contraindications.length > 0 && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 md:col-span-2">
                    <h4 className="text-red-700 text-sm mb-2 flex items-center gap-1.5">
                      <IconWarning />
                      Contraindications
                    </h4>
                    <ul className="space-y-1">
                      {sfdaInfo.contraindications.map((item, idx) => (
                        <li key={idx} className="text-red-600 text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {sfdaInfo.warnings && sfdaInfo.warnings.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 md:col-span-2 lg:col-span-3">
                    <h4 className="text-amber-700 text-sm mb-2 flex items-center gap-1.5">
                      <IconWarning />
                      Warnings
                    </h4>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {sfdaInfo.warnings.map((warning, idx) => (
                        <li key={idx} className="text-amber-600 text-sm flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sfdaInfo.generic_alternatives && sfdaInfo.generic_alternatives.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 md:col-span-2 lg:col-span-3">
                    <h4 className="text-slate-500 text-sm mb-2">Generic Alternatives</h4>
                    <div className="flex flex-wrap gap-2">
                      {sfdaInfo.generic_alternatives.map((alt, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 text-sm">
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {sfdaInfo.additional_notes && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 md:col-span-2 lg:col-span-3">
                    <h4 className="text-blue-700 text-sm mb-2 flex items-center gap-1.5">
                      <IconClipboard />
                      Additional Notes
                    </h4>
                    <p className="text-blue-600 text-sm">{sfdaInfo.additional_notes}</p>
                    {sfdaInfo.additional_notes_ar && (
                      <p className="text-blue-500 text-sm mt-2 text-arabic">{sfdaInfo.additional_notes_ar}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16 py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="https://images.squarespace-cdn.com/content/v1/65bf52f873aac538961445c5/19d16cc5-aa83-437c-9c2a-61de5268d5bf/Untitled+design+-+2025-01-19T070746.544.png"
              alt="Qualia Solutions"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-slate-500 text-sm">Powered by Qualia Solutions</span>
          </div>
          <p className="text-slate-400 text-xs text-center">
            For informational purposes only. Always consult a healthcare professional.
          </p>
        </div>
      </footer>
    </div>
  );
}
