import React, { useState, useEffect } from 'react';
import { Book, UploadCloud, BrainCircuit, CheckCircle2, Lock, ChevronRight, FileText, Image as ImageIcon, Settings, AlertCircle, ZoomIn, ZoomOut, Moon, Sun } from 'lucide-react';
import { PdfUploader } from './components/PdfUploader';
import { ApiKeyModal } from './components/ApiKeyModal';
import { FlashcardDeck } from './components/FlashcardDeck';
import { TranslationExercise } from './components/TranslationExercise';
import { PdfViewer } from './components/PdfViewer';
import { SelectionPopup } from './components/SelectionPopup';
import { getPdfDocument, extractTextFromPdfDoc, PdfDocument } from './services/pdfService';
import { analyzeStructure, generateGlossaryForSection } from './services/geminiService';
import { AppStatus, Section, GlossaryItem, Language } from './types';
import { i18n } from './i18n';

const App: React.FC = () => {
  // --- State Management ---
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
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

  // PDF Data
  const [pdfDoc, setPdfDoc] = useState<PdfDocument | null>(null);
  const [pageTexts, setPageTexts] = useState<string[]>([]); // Stores text per page for local retrieval
  const [fileName, setFileName] = useState<string | null>(null);

  // Learning Structure
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionId, setCurrentSectionId] = useState<number>(0);
  const [completedSectionIds, setCompletedSectionIds] = useState<Set<number>>(new Set());

  // Current Activity Data
  const [activeTab, setActiveTab] = useState<'text' | 'visual'>('text'); // Left pane mode
  const [visualScale, setVisualScale] = useState<number>(1.2); // Zoom level for visual mode
  const [learningStep, setLearningStep] = useState<'vocab' | 'translation' | 'done'>('vocab');
  const [sectionGlossary, setSectionGlossary] = useState<GlossaryItem[]>([]);
  const [isGlossaryLoading, setIsGlossaryLoading] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowApiKeyModal(true);
    }
  }, []);

  // Load glossary when section changes
  useEffect(() => {
    if (status === AppStatus.LEARNING && sections.length > 0) {
      loadSectionData(currentSectionId);
    }
  }, [currentSectionId, status]);

  const loadSectionData = async (sectionId: number) => {
    if (!apiKey || !sections[sectionId]) return;

    setLearningStep('vocab');
    setIsGlossaryLoading(true);
    setSectionGlossary([]);

    try {
      const section = sections[sectionId];
      // Generate glossary specific to this section
      const data = await generateGlossaryForSection(section.content, apiKey, language);
      setSectionGlossary(data.glossary);
    } catch (err) {
      console.error("Glossary generation failed", err);
      setError(t.analysisError);
    } finally {
      setIsGlossaryLoading(false);
    }
  };

  // --- Handlers ---
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowApiKeyModal(false);
    setError(null);
  };

  const handleFileSelect = async (file: File) => {
    setStatus(AppStatus.PARSING_PDF);
    setError(null);
    setFileName(file.name);

    try {
      // 1. Load PDF Document
      const doc = await getPdfDocument(file);
      setPdfDoc(doc);

      // 2. Extract Text (Full and Per-Page)
      const { fullText, pageTexts } = await extractTextFromPdfDoc(doc);
      setPageTexts(pageTexts);

      // 3. Analyze Structure (Lightweight: Titles and Page Ranges only)
      setStatus(AppStatus.ANALYZING_STRUCTURE);
      const skeletalSections = await analyzeStructure(fullText, apiKey, language);

      // 4. Construct complete sections locally using pageTexts
      const completeSections: Section[] = skeletalSections.map((s, index) => {
        const startIdx = Math.max(0, s.startPage - 1);
        const endIdx = Math.min(pageTexts.length, s.endPage);
        const content = pageTexts.slice(startIdx, endIdx).join('\n\n');

        return {
          id: index,
          title: s.title,
          startPage: s.startPage,
          endPage: s.endPage,
          content: content,
          summary: ""
        };
      });

      setSections(completeSections);

      // 5. Start Learning
      setStatus(AppStatus.LEARNING);
      setCurrentSectionId(0);

    } catch (err: any) {
      console.error(err);
      setError(err.message || t.parseError);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleVocabComplete = () => {
    setLearningStep('translation');
  };

  const handleTranslationComplete = () => {
    setLearningStep('done');
    const newCompleted = new Set(completedSectionIds);
    newCompleted.add(currentSectionId);
    setCompletedSectionIds(newCompleted);
  };

  const handleNextSection = () => {
    if (currentSectionId < sections.length - 1) {
      setCurrentSectionId(prev => prev + 1);
    }
  };

  const handleZoomIn = () => setVisualScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setVisualScale(prev => Math.max(prev - 0.2, 0.6));

  const currentSection = sections[currentSectionId];

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-sky-200 selection:text-sky-900 transition-colors">
      <ApiKeyModal isOpen={showApiKeyModal} onSave={handleSaveApiKey} language={language} />
      <SelectionPopup apiKey={apiKey} language={language} />

      {/* Header */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm h-16 flex items-center justify-between px-6 transition-colors">
        <div className="flex items-center gap-2">
          <div className="bg-sky-600 dark:bg-sky-500 p-1.5 rounded-lg text-white">
            <Book className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-slate-800 dark:text-white hidden sm:inline">PaperLingo</span>
        </div>

        {status === AppStatus.LEARNING && (
          <div className="flex-1 mx-8 max-w-2xl hidden md:flex items-center gap-2 overflow-x-auto">
            {sections.map((s) => {
              const isCompleted = completedSectionIds.has(s.id);
              const isCurrent = currentSectionId === s.id;
              const isLocked = !isCompleted && !isCurrent && s.id > 0 && !completedSectionIds.has(s.id - 1);

              return (
                <button
                  key={s.id}
                  onClick={() => !isLocked && setCurrentSectionId(s.id)}
                  disabled={isLocked}
                  className={`
                    flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                    ${isCurrent ? 'bg-sky-600 text-white ring-2 ring-sky-300 dark:ring-sky-700' :
                      isCompleted ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900' :
                        isLocked ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}
                  `}
                >
                  {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : isLocked ? <Lock className="w-3 h-3" /> : <span className="w-3 h-3 flex items-center justify-center bg-current rounded-full text-[8px] text-white opacity-50">{s.id + 1}</span>}
                  {s.title.length > 15 ? s.title.substring(0, 15) + '...' : s.title}
                </button>
              );
            })}
          </div>
        )}

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

          <button onClick={() => setShowApiKeyModal(true)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" title={t.apiKeySettingsTitle}>
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-4 sm:p-6 h-[calc(100vh-4rem)]">
        {status === AppStatus.IDLE || status === AppStatus.PARSING_PDF || status === AppStatus.ANALYZING_STRUCTURE || status === AppStatus.ERROR ? (
          <div className="max-w-xl mx-auto mt-20 text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 transition-colors">{t.appTitle}</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 transition-colors">
                {t.appDescription.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>

            <PdfUploader
              onFileSelect={handleFileSelect}
              isLoading={status !== AppStatus.IDLE && status !== AppStatus.ERROR}
              language={language}
            />

            {status === AppStatus.ANALYZING_STRUCTURE && (
              <div className="mt-6 flex flex-col items-center text-sky-600 dark:text-sky-400 animate-pulse">
                <BrainCircuit className="w-8 h-8 mb-2" />
                <p>{t.analyzingStructure}</p>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 text-red-700 dark:text-red-400 text-left">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        ) : (
          // Learning Interface
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

            {/* Left Pane: Reader */}
            <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
              {/* Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 relative bg-slate-50 dark:bg-slate-950">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'text' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400 bg-sky-50/50 dark:bg-sky-900/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <FileText className="w-4 h-4" />
                  {t.textMode}
                </button>
                <button
                  onClick={() => setActiveTab('visual')}
                  className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'visual' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400 bg-sky-50/50 dark:bg-sky-900/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <ImageIcon className="w-4 h-4" />
                  {t.visualMode}
                </button>

                {/* Zoom Controls (only for visual mode) */}
                {activeTab === 'visual' && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-sm">
                    <button onClick={handleZoomOut} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title={t.zoomOut}>
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs w-12 text-center font-mono text-slate-500 dark:text-slate-400">{Math.round(visualScale * 100)}%</span>
                    <button onClick={handleZoomIn} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title={t.zoomIn}>
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 relative overflow-hidden">
                {activeTab === 'text' ? (
                  <div className="h-full overflow-y-auto p-6 font-serif text-lg leading-loose text-slate-800 dark:text-slate-200 selection:bg-yellow-200 dark:selection:bg-sky-900/50 cursor-text">
                    <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentSection.title}</h2>
                    </div>
                    <div className="whitespace-pre-wrap">{currentSection.content}</div>
                    <p className="mt-8 text-center text-slate-400 dark:text-slate-500 text-sm italic">{t.sectionEnd}</p>
                  </div>
                ) : (
                  <div className="h-full bg-slate-800 dark:bg-slate-950 overflow-y-auto p-4 text-center">
                    {/* Show pages belonging to this section */}
                    {Array.from({ length: currentSection.endPage - currentSection.startPage + 1 }, (_, i) => currentSection.startPage + i).map(pageNum => (
                      <div key={pageNum} className="mb-4">
                        <PdfViewer pdfDoc={pdfDoc} pageNumber={pageNum} scale={visualScale} />
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">Page {pageNum}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane: Assistant & Tasks */}
            <div className="flex flex-col h-full gap-6">
              {/* Progress Info */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Section {currentSection.id + 1} {t.tasks}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {learningStep === 'vocab' ? t.step1Vocab : learningStep === 'translation' ? t.step2Translation : t.sectionComplete}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-8 rounded-full ${learningStep === 'vocab' ? 'bg-sky-500' : 'bg-green-500'}`}></div>
                  <div className={`h-2 w-8 rounded-full ${learningStep === 'vocab' ? 'bg-slate-200 dark:bg-slate-700' : learningStep === 'translation' ? 'bg-sky-500' : 'bg-green-500'}`}></div>
                </div>
              </div>

              {/* Task Container */}
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
                <div className="p-6 flex-1 overflow-y-auto">
                  {isGlossaryLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 dark:border-sky-400"></div>
                      <p>{t.extractingVocab}</p>
                    </div>
                  ) : learningStep === 'vocab' ? (
                    <FlashcardDeck
                      glossary={sectionGlossary}
                      onComplete={handleVocabComplete}
                      language={language}
                    />
                  ) : learningStep === 'translation' ? (
                    <TranslationExercise
                      originalText={currentSection.content}
                      apiKey={apiKey}
                      onComplete={handleTranslationComplete}
                      language={language}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.excellentWork}</h2>
                      <p className="text-slate-600 dark:text-slate-400 mb-8 whitespace-pre-wrap">
                        {t.masteredSection}
                      </p>
                      {currentSectionId < sections.length - 1 ? (
                        <button
                          onClick={handleNextSection}
                          className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                        >
                          {t.nextSection} <ChevronRight className="w-5 h-5" />
                        </button>
                      ) : (
                        <p className="text-sky-600 dark:text-sky-400 font-bold">{t.allComplete}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;