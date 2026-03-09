import React, { useState, useMemo } from 'react';
import { Check, ArrowRight, RotateCcw, HelpCircle, AlertCircle } from 'lucide-react';
import { GlossaryItem, Language } from '../types';
import { i18n } from '../i18n';

interface FlashcardDeckProps {
  glossary: GlossaryItem[];
  onComplete: () => void;
  language: Language;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ glossary, onComplete, language }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [correctIndices, setCorrectIndices] = useState<Set<number>>(new Set());

  const currentCard = glossary[currentIndex];
  const isFinished = correctIndices.size === glossary.length && glossary.length > 0;
  const t = i18n[language];

  const maskedContext = useMemo(() => {
    if (!currentCard) return '';
    try {
      const regex = new RegExp(currentCard.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return currentCard.context.replace(regex, '_______');
    } catch (e) {
      return currentCard.context;
    }
  }, [currentCard]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim()) return;

    const normalize = (str: string) => str.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const correct = normalize(userInput) === normalize(currentCard.term);

    setIsCorrect(correct);
    setShowAnswer(true);

    if (correct) {
      const newSet = new Set(correctIndices);
      newSet.add(currentIndex);
      setCorrectIndices(newSet);
    }
  };

  const handleNext = () => {
    setUserInput('');
    setShowAnswer(false);
    setIsCorrect(null);

    if (correctIndices.size === glossary.length) {
      onComplete();
      return;
    }

    let nextIdx = currentIndex;
    let attempts = 0;
    while (attempts < glossary.length) {
      nextIdx = (nextIdx + 1) % glossary.length;
      if (!correctIndices.has(nextIdx)) {
        setCurrentIndex(nextIdx);
        break;
      }
      attempts++;
    }
  };

  const handleRetry = () => {
    setUserInput('');
    setShowAnswer(false);
    setIsCorrect(null);
    setCorrectIndices(new Set());
    setCurrentIndex(0);
  };

  if (glossary.length === 0) return <div className="text-center text-slate-500 py-8">{t.noWordsFound}</div>;

  if (isFinished) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 transition-colors">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 mx-auto">
          <Check className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">{t.allCorrect}</h3>
        <p className="text-green-700 dark:text-green-400 mb-8 text-lg whitespace-pre-wrap">
          {glossary.length}{t.masteredAllWords}
        </p>
        <button
          onClick={handleRetry}
          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {t.reviewAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] max-w-2xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.progress}</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white">
            {correctIndices.size} <span className="text-slate-400 dark:text-slate-500 text-base">/ {glossary.length}</span>
          </span>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-medium transition-colors">
          {t.questionNum} {currentIndex + 1}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col relative transition-all duration-300 hover:shadow-md">

        {/* Question Section */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-100 dark:border-slate-800 text-center transition-colors">
          <span className="block text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">{t.meaningLabel}</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">{currentCard.definition}</h2>
        </div>

        {/* Context & Input Section */}
        <div className="p-8 flex flex-col gap-6">

          {/* Context Hint */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg p-4 text-slate-700 dark:text-slate-300 text-lg leading-relaxed font-serif relative transition-colors">
            <HelpCircle className="w-5 h-5 text-amber-400 dark:text-amber-500 absolute top-[-10px] left-[-10px] bg-white dark:bg-slate-900 rounded-full" />
            "{showAnswer ? (
              currentCard.context.split(new RegExp(`(${currentCard.term})`, 'gi')).map((part, i) =>
                part.toLowerCase() === currentCard.term.toLowerCase() ? <span key={i} className="font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/50 px-1 rounded">{part}</span> : part
              )
            ) : maskedContext}"
            <p className="text-xs text-slate-400 dark:text-slate-500 text-right mt-2 font-sans italic">{t.originalContext}</p>
          </div>

          {/* Feedback Area */}
          {showAnswer && (
            <div className={`p-4 rounded-lg flex items-start gap-3 transition-colors ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'}`}>
              {isCorrect ? <Check className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
              <div className="flex-1">
                <p className="font-bold">{isCorrect ? t.correctFeedback : t.incorrectFeedback}</p>
                {!isCorrect && (
                  <div className="mt-2">
                    <p className="text-xs uppercase font-bold opacity-70">{t.answerLabel}</p>
                    <p className="text-lg font-bold">{currentCard.term}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input Form */}
          {!showAnswer ? (
            <form onSubmit={handleSubmit} className="mt-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.inputLabel}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-lg focus:border-sky-500 focus:ring-sky-500 outline-none transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className="bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold px-6 rounded-xl transition-colors shadow-sm"
                >
                  {t.answerBtn}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${isCorrect ? 'bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600' : 'bg-slate-600 dark:bg-slate-500 hover:bg-slate-700 dark:hover:bg-slate-600'}`}
            >
              {isCorrect ? t.nextBtn : t.skipBtn} <ArrowRight className="w-5 h-5" />
            </button>
          )}

        </div>
      </div>

      {!showAnswer && (
        <p className="text-center text-slate-400 dark:text-slate-500 text-sm mt-4">
          {t.guessInstruction}
        </p>
      )}
    </div>
  );
};