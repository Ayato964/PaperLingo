import React, { useState } from 'react';
import { Send, CheckCircle, RefreshCw } from 'lucide-react';
import { gradeTranslation } from '../services/geminiService';
import { TranslationFeedback, Language } from '../types';
import { i18n } from '../i18n';

interface TranslationExerciseProps {
  originalText: string;
  apiKey: string;
  onComplete: () => void;
  language: Language;
}

export const TranslationExercise: React.FC<TranslationExerciseProps> = ({ originalText, apiKey, onComplete, language }) => {
  const [translation, setTranslation] = useState('');
  const [feedback, setFeedback] = useState<TranslationFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const t = i18n[language];

  const handleSubmit = async () => {
    if (!translation.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await gradeTranslation(originalText, translation, apiKey, language);
      setFeedback(result);
      if (result.score >= 70) {
        onComplete();
      }
    } catch (error) {
      console.error(error);
      alert(t.gradingError);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto italic transition-colors">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">{t.targetText}</h4>
        "{originalText.substring(0, 300)}..."
      </div>

      {!feedback ? (
        <div className="flex-1 flex flex-col gap-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t.translateInstruction}
          </label>
          <textarea
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            placeholder={t.translatePlaceholder}
            className="w-full flex-1 p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-sky-500 outline-none resize-none transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={isAnalyzing || !translation.trim()}
            className="w-full bg-sky-600 dark:bg-sky-500 text-white py-3 rounded-lg font-bold hover:bg-sky-700 dark:hover:bg-sky-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {isAnalyzing ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Send className="w-4 h-4" />
            )}
            {t.getFeedbackBtn}
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${feedback.score >= 70 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'}`}>
            <div className={`text-3xl font-bold ${feedback.score >= 70 ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
              {feedback.score}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">/100</span>
            </div>
            <div>
              <h3 className={`font-bold ${feedback.score >= 70 ? 'text-green-800 dark:text-green-300' : 'text-orange-800 dark:text-orange-300'}`}>
                {feedback.score >= 70 ? t.passText : t.tryAgainText}
              </h3>
              {feedback.score >= 70 && <p className="text-sm text-green-700 dark:text-green-400">{t.canProceed}</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
            <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sky-500" />
              {t.aiFeedback}
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{feedback.feedback}</p>
          </div>

          <div className="bg-slate-800 dark:bg-slate-950 p-4 rounded-xl text-slate-300 text-sm shadow-sm transition-colors">
            <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider">{t.modelAnswer}</h4>
            <p>{feedback.correctedTranslation}</p>
          </div>

          <button
            onClick={() => setFeedback(null)}
            className="w-full py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t.rewriteBtn}
          </button>
        </div>
      )}
    </div>
  );
};
