import React, { useState, useEffect } from 'react';
import { DEFAULT_RESUME_TEXT } from './constants';
import { parseResumeToSlides } from './services/geminiService';
import { generatePptx } from './services/pptxService';
import { generateCsv } from './services/csvService';
import { PresentationData } from './types';
import SlidePreview from './components/SlidePreview';
import { 
  FileText, 
  RefreshCw, 
  Download, 
  ChevronRight, 
  Presentation,
  Loader2,
  Edit3,
  FileSpreadsheet
} from 'lucide-react';

const App: React.FC = () => {
  const [resumeText, setResumeText] = useState(DEFAULT_RESUME_TEXT);
  const [isEditing, setIsEditing] = useState(false);
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parseResumeToSlides(resumeText);
      setPresentationData(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate slides. Please ensure your API Key is valid and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPptx = () => {
    if (presentationData) {
      generatePptx(presentationData);
    }
  };

  const handleDownloadCsv = () => {
    if (presentationData) {
      generateCsv(presentationData);
    }
  };

  // Initial generation on mount (optional, can be removed if we want user to click first)
  useEffect(() => {
    // Only auto-generate if we have the key, otherwise wait for user action (helps with debugging empty keys)
    if (process.env.API_KEY) {
        handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
                <Presentation className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Resume to Deck</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`flex items-center px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                loading 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {loading ? 'Thinking...' : 'Regenerate'}
            </button>
            
            <button
              onClick={handleDownloadCsv}
              disabled={!presentationData || loading}
              className={`flex items-center px-3 py-2 rounded-md font-medium text-sm shadow-sm transition-all ${
                !presentationData || loading
                  ? 'bg-slate-300 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
              }`}
              title="Download content as CSV for Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Sheets CSV
            </button>

            <button
              onClick={handleDownloadPptx}
              disabled={!presentationData || loading}
              className={`flex items-center px-3 py-2 rounded-md font-medium text-sm shadow-sm transition-all ${
                !presentationData || loading
                  ? 'bg-slate-300 text-white cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md'
              }`}
              title="Download compatible .pptx file for Google Slides"
            >
              <Download className="w-4 h-4 mr-2" />
              Slide Deck
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Input */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-8rem)] sticky top-24">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center text-slate-700 font-semibold">
                <FileText className="w-5 h-5 mr-2 text-slate-500" />
                Resume Source
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-blue-600 font-medium hover:text-blue-800 flex items-center"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                {isEditing ? 'Done' : 'Edit Text'}
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              {isEditing ? (
                <textarea
                  className="w-full h-full p-4 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 font-mono text-sm text-slate-600 bg-white"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume here..."
                />
              ) : (
                <div className="w-full h-full p-4 overflow-y-auto bg-slate-50 font-mono text-xs text-slate-500 whitespace-pre-wrap leading-relaxed">
                  {resumeText}
                </div>
              )}
            </div>
             <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 text-center">
                Parsed by Gemini 2.0 Flash
            </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                 Slide Preview
                 {presentationData && (
                    <span className="ml-3 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        {presentationData.slides.length} Slides Generated
                    </span>
                 )}
              </h2>
           </div>

           {error && (
             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
               {error}
             </div>
           )}

           {loading && !presentationData && (
             <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 border-dashed">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Analyzing resume and structuring deck...</p>
                <p className="text-slate-400 text-sm mt-2">This may take a few seconds</p>
             </div>
           )}
            
            {/* Slide List */}
           <div className="space-y-8 pb-20">
              {presentationData?.slides.map((slide, index) => (
                <SlidePreview key={index} slide={slide} index={index} />
              ))}
              
              {!loading && !presentationData && !error && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <Presentation className="w-16 h-16 mb-4 opacity-20" />
                      <p>Click "Regenerate" to create your slide deck</p>
                  </div>
              )}
              
              {/* Footer Helper */}
              {presentationData && (
                 <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-800 text-sm">
                    <strong>Note:</strong> Download the file (.pptx) and upload it to <a href="https://slides.google.com" target="_blank" className="underline hover:text-blue-900">Google Slides</a> to edit.
                 </div>
              )}
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;