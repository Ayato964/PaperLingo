import React, { useState, useEffect } from 'react';
import { Book, Trash2, Sparkles, AlertCircle, FileText, Settings, Moon, Sun } from 'lucide-react';
import { PdfUploader } from './components/PdfUploader';
import { GlossaryCard } from './components/GlossaryCard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { extractTextFromPdf } from './services/pdfService';
import { generateGlossary } from './services/geminiService';
import { AppStatus, GlossaryItem, Language } from './types';
import { i18n } from './i18n';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [glossary, setGlossary] = useState<GlossaryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // App Settings
  const [language, setLanguage] = useState<Language>('Japanese');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const t = i18n[language];

  // API Key Management
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowApiKeyModal(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowApiKeyModal(false);
    setError(null);
  };

  const handleOpenSettings = () => {
    setShowApiKeyModal(true);
  };

  const handleFileSelect = async (file: File) => {
    setStatus(AppStatus.PARSING_PDF);
    setError(null);
    setFileName(file.name);
    setGlossary([]);

    try {
      const text = await extractTextFromPdf(file);
      setPdfText(text);
      setStatus(AppStatus.READY);
    } catch (err) {
      console.error(err);
      setError("Failed to read PDF. Please try a different file.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGenerateGlossary = async () => {
    if (!pdfText) return;
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setStatus(AppStatus.ANALYZING);
    setError(null);

    try {
      const data = await generateGlossary(pdfText, apiKey, language);
      setGlossary(data.glossary);
      setStatus(AppStatus.READY);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "AI analysis failed.";

      if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('403')) {
        setError("Invalid API Key. Please check your settings.");
        setShowApiKeyModal(true);
      } else {
        setError("AI analysis failed. Please try again.");
      }
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setPdfText(null);
    setFileName(null);
    setGlossary([]);
    setStatus(AppStatus.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col">

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onSave={handleSaveApiKey}
        language={language}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-sky-600 dark:bg-sky-500 p-1.5 rounded-lg text-white">
              <Book className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-800 dark:text-white">PaperLingo</span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm rounded-lg px-3 py-1.5 border-none focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
            >
              <option value="Japanese">日本語</option>
              <option value="English">English</option>
            </select>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t.toggleDarkMode}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={handleOpenSettings}
              className="text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t.apiKeySettingsTitle}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {!pdfText ? (
          // Empty State / Upload Area
          <div className="max-w-xl mx-auto mt-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">{t.appTitle}</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg transition-colors">
                {t.appDescription}
              </p>
            </div>

            <PdfUploader
              onFileSelect={handleFileSelect}
              isLoading={status === AppStatus.PARSING_PDF}
              language={language}
            />

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        ) : (
          // Split View
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">

            {/* Left: Document Viewer */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden shadow-sm transition-colors">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{fileName}</span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title={t.closeFileTitle}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-900 font-serif text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                {pdfText}
              </div>
            </div>

            {/* Right: AI Assistant Panel */}
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden shadow-inner transition-colors">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  {t.aiAssistantTitle}
                </h2>
                {glossary.length > 0 && (
                  <span className="text-xs bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400 px-2 py-1 rounded-full font-medium">
                    {glossary.length} {t.termsFound}
                  </span>
                )}
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {status === AppStatus.ANALYZING ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-sky-500 dark:border-t-sky-400 rounded-full animate-spin"></div>
                      <Sparkles className="w-5 h-5 text-sky-500 dark:text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="animate-pulse">{t.analyzingTerms}</p>
                  </div>
                ) : glossary.length > 0 ? (
                  glossary.map((item, idx) => (
                    <GlossaryCard key={idx} item={item} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-center p-6">
                    <Book className="w-12 h-12 mb-3 opacity-20" />
                    <p className="mb-4 max-w-xs mx-auto">
                      {t.readyToAnalyze}
                    </p>
                    <button
                      onClick={handleGenerateGlossary}
                      className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-sky-900/20 dark:shadow-sky-900/40 transition-all hover:scale-105 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t.generateGlossaryBtn}
                    </button>
                    {error && (
                      <p className="mt-4 text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;