import React, { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { explainTermInContext } from '../services/geminiService';
import { Language } from '../types';
import { i18n } from '../i18n';

interface SelectionPopupProps {
  apiKey: string;
  language: Language;
}

export const SelectionPopup: React.FC<SelectionPopupProps> = ({ apiKey, language }) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [contextText, setContextText] = useState('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const t = i18n[language];

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 300) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const context = selection.anchorNode?.parentElement?.textContent || "";

      setSelectedText(text);
      setContextText(context);
      setPosition({
        x: rect.left + window.scrollX + (rect.width / 2),
        y: rect.top + window.scrollY - 10
      });
      setExplanation(null);
    };

    document.addEventListener('mouseup', handleSelection);

    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.selection-popup')) return;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPosition(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExplain = async () => {
    setIsLoading(true);
    try {
      const result = await explainTermInContext(selectedText, contextText, apiKey, language);
      setExplanation(result);
    } catch (error) {
      setExplanation(t.explanationError);
    } finally {
      setIsLoading(false);
    }
  };

  if (!position) return null;

  return (
    <div
      className="selection-popup fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-72 transform -translate-x-1/2 -translate-y-full mt-[-10px] transition-colors"
      style={{ left: position.x, top: position.y }}
    >
      {!explanation ? (
        <button
          onClick={handleExplain}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full p-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-700 dark:hover:text-sky-400 rounded-lg transition-colors"
        >
          {isLoading ? (
            <span className="animate-pulse">{t.generatingExplanation}</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-sky-500" />
              {t.getAiExplanation}
            </>
          )}
        </button>
      ) : (
        <div className="p-3 relative">
          <button
            onClick={() => setPosition(null)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1 pr-4 line-clamp-2">{selectedText}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
            {explanation}
          </p>
        </div>
      )}
      <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 rotate-45 transition-colors"></div>
    </div>
  );
};