'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Medicine, AnalysisResult, SFDAInfo } from '@/types';

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
        toast.success('Prescription analyzed successfully!');
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
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">صيدلي AI</h1>
              <p className="text-white/70 text-sm">Prescription Analyzer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium">
              SFDA Connected
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {!result && (
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              تحليل الوصفات الطبية بالذكاء الاصطناعي
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Upload a prescription image or enter medicine names to get detailed information,
              dosage instructions, and drug interaction warnings.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="glass rounded-3xl p-6 card-hover">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setInputMode('image')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  inputMode === 'image'
                    ? 'bg-white text-purple-700'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                📷 Upload Image
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  inputMode === 'text'
                    ? 'bg-white text-purple-700'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                ✏️ Enter Text
              </button>
            </div>

            {inputMode === 'image' ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-white/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Prescription preview"
                      className="max-h-64 mx-auto rounded-xl shadow-lg"
                    />
                    <p className="text-white/70 text-sm">{file?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center pulse-ring">
                      <svg className="w-10 h-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium text-lg">
                        Drop your prescription here
                      </p>
                      <p className="text-white/60 text-sm mt-1">
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
                className="w-full h-64 p-4 rounded-2xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:outline-none resize-none"
              />
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={analyzeImage}
                disabled={isAnalyzing || (inputMode === 'image' ? !file : !textInput.trim())}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${
                  isAnalyzing || (inputMode === 'image' ? !file : !textInput.trim())
                    ? 'bg-white/20 text-white/50 cursor-not-allowed'
                    : 'bg-white text-purple-700 hover:bg-white/90 hover:shadow-lg'
                }`}
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  '🔬 Analyze Prescription'
                )}
              </button>
              {(file || textInput) && (
                <button
                  onClick={resetAnalysis}
                  className="px-6 py-4 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="glass rounded-3xl p-6">
            <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Analysis Results
            </h3>

            {!result && !isAnalyzing && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-white/60">
                  Upload a prescription to see the analysis results
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4 animate-pulse">
                  <svg className="w-12 h-12 text-white animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <p className="text-white font-medium">Analyzing prescription...</p>
                <p className="text-white/60 text-sm mt-2">Using AI to extract medicine information</p>
              </div>
            )}

            {result && result.medicines && (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {result.medicines.map((medicine, index) => (
                  <div
                    key={index}
                    onClick={() => fetchSFDAInfo(medicine)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedMedicine?.name_en === medicine.name_en
                        ? 'bg-white/30 ring-2 ring-white/50'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-semibold text-lg">{medicine.name_en}</h4>
                        {medicine.name_ar && (
                          <p className="text-white/70 text-arabic">{medicine.name_ar}</p>
                        )}
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-purple-500/30 text-purple-200 text-xs">
                        {medicine.category || 'Medicine'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {medicine.dosage && (
                        <div className="text-white/70">
                          <span className="text-white/50">Dosage:</span> {medicine.dosage}
                        </div>
                      )}
                      {medicine.frequency && (
                        <div className="text-white/70">
                          <span className="text-white/50">Frequency:</span> {medicine.frequency}
                        </div>
                      )}
                      {medicine.duration && (
                        <div className="text-white/70">
                          <span className="text-white/50">Duration:</span> {medicine.duration}
                        </div>
                      )}
                    </div>

                    {medicine.instructions && (
                      <p className="text-white/80 text-sm mt-2 p-2 bg-white/5 rounded-lg">
                        💊 {medicine.instructions}
                      </p>
                    )}

                    {medicine.warnings && medicine.warnings.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {medicine.warnings.slice(0, 2).map((warning, idx) => (
                          <p key={idx} className="text-yellow-300/80 text-xs flex items-center gap-1">
                            ⚠️ {warning}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {result.general_notes && (
                  <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <h4 className="text-white font-medium mb-2">📋 General Notes</h4>
                    <p className="text-white/80 text-sm">{result.general_notes}</p>
                    {result.general_notes_ar && (
                      <p className="text-white/70 text-sm mt-2 text-arabic">{result.general_notes_ar}</p>
                    )}
                  </div>
                )}

                {result.patient_advice && (
                  <div className="p-4 rounded-xl bg-green-500/20 border border-green-400/30">
                    <h4 className="text-white font-medium mb-2">💡 Patient Advice</h4>
                    <p className="text-white/80 text-sm">{result.patient_advice}</p>
                    {result.patient_advice_ar && (
                      <p className="text-white/70 text-sm mt-2 text-arabic">{result.patient_advice_ar}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SFDA Information Panel */}
        {(selectedMedicine || loadingSfda) && (
          <div className="mt-8 glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-xl flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                SFDA Information - {selectedMedicine?.name_en}
              </h3>
              <button
                onClick={() => { setSelectedMedicine(null); setSfdaInfo(null); }}
                className="text-white/60 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingSfda && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
                <p className="text-white/70">Fetching SFDA information...</p>
              </div>
            )}

            {sfdaInfo && !loadingSfda && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/10">
                  <h4 className="text-white/60 text-sm mb-1">SFDA Status</h4>
                  <p className="text-white font-medium flex items-center gap-2">
                    {sfdaInfo.sfda_status === 'Registered' ? (
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                    ) : (
                      <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                    )}
                    {sfdaInfo.sfda_status || 'Unknown'}
                  </p>
                  {sfdaInfo.registration_number && (
                    <p className="text-white/50 text-xs mt-1">Reg: {sfdaInfo.registration_number}</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-white/10">
                  <h4 className="text-white/60 text-sm mb-1">Prescription Required</h4>
                  <p className="text-white font-medium">
                    {sfdaInfo.prescription_required ? '✅ Yes' : '❌ No'}
                  </p>
                </div>

                {sfdaInfo.price_range_sar && (
                  <div className="p-4 rounded-xl bg-white/10">
                    <h4 className="text-white/60 text-sm mb-1">Price Range (SAR)</h4>
                    <p className="text-white font-medium">{sfdaInfo.price_range_sar}</p>
                  </div>
                )}

                {sfdaInfo.manufacturer && (
                  <div className="p-4 rounded-xl bg-white/10">
                    <h4 className="text-white/60 text-sm mb-1">Manufacturer</h4>
                    <p className="text-white font-medium">{sfdaInfo.manufacturer}</p>
                  </div>
                )}

                {sfdaInfo.storage && (
                  <div className="p-4 rounded-xl bg-white/10">
                    <h4 className="text-white/60 text-sm mb-1">Storage</h4>
                    <p className="text-white/80 text-sm">{sfdaInfo.storage}</p>
                  </div>
                )}

                {sfdaInfo.indications && sfdaInfo.indications.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/10 md:col-span-2">
                    <h4 className="text-white/60 text-sm mb-2">Approved Indications</h4>
                    <ul className="space-y-1">
                      {sfdaInfo.indications.map((indication, idx) => (
                        <li key={idx} className="text-white/80 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          {indication}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sfdaInfo.contraindications && sfdaInfo.contraindications.length > 0 && (
                  <div className="p-4 rounded-xl bg-red-500/20 border border-red-400/30 md:col-span-2">
                    <h4 className="text-red-300 text-sm mb-2">⚠️ Contraindications</h4>
                    <ul className="space-y-1">
                      {sfdaInfo.contraindications.map((item, idx) => (
                        <li key={idx} className="text-white/80 text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {sfdaInfo.warnings && sfdaInfo.warnings.length > 0 && (
                  <div className="p-4 rounded-xl bg-yellow-500/20 border border-yellow-400/30 md:col-span-2 lg:col-span-3">
                    <h4 className="text-yellow-300 text-sm mb-2">⚠️ Warnings</h4>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {sfdaInfo.warnings.map((warning, idx) => (
                        <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sfdaInfo.generic_alternatives && sfdaInfo.generic_alternatives.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/10 md:col-span-2 lg:col-span-3">
                    <h4 className="text-white/60 text-sm mb-2">Generic Alternatives</h4>
                    <div className="flex flex-wrap gap-2">
                      {sfdaInfo.generic_alternatives.map((alt, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {sfdaInfo.additional_notes && (
                  <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-400/30 md:col-span-2 lg:col-span-3">
                    <h4 className="text-blue-300 text-sm mb-2">📝 Additional Notes</h4>
                    <p className="text-white/80 text-sm">{sfdaInfo.additional_notes}</p>
                    {sfdaInfo.additional_notes_ar && (
                      <p className="text-white/70 text-sm mt-2 text-arabic">{sfdaInfo.additional_notes_ar}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass mt-16 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            Powered by AI • SFDA Guidelines Reference • For informational purposes only
          </p>
          <p className="text-white/40 text-xs mt-2">
            Always consult a healthcare professional before taking any medication
          </p>
        </div>
      </footer>
    </div>
  );
}
