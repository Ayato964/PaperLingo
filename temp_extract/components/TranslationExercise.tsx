import React, { useState } from 'react';
import { Send, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { gradeTranslation } from '../services/geminiService';
import { TranslationFeedback } from '../types';

interface TranslationExerciseProps {
  originalText: string;
  apiKey: string;
  onComplete: () => void;
}

export const TranslationExercise: React.FC<TranslationExerciseProps> = ({ originalText, apiKey, onComplete }) => {
  const [translation, setTranslation] = useState('');
  const [feedback, setFeedback] = useState<TranslationFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async () => {
    if (!translation.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await gradeTranslation(originalText, translation, apiKey);
      setFeedback(result);
      if (result.score >= 70) { // 合格ライン
        onComplete();
      }
    } catch (error) {
      console.error(error);
      alert("採点中にエラーが発生しました。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600 max-h-40 overflow-y-auto italic">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">翻訳対象 (抜粋)</h4>
        "{originalText.substring(0, 300)}..."
      </div>

      {!feedback ? (
        <div className="flex-1 flex flex-col gap-4">
          <label className="block text-sm font-medium text-slate-700">
            このセクションの要約、または気になった一文を和訳してください：
          </label>
          <textarea
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            placeholder="ここに入力..."
            className="w-full flex-1 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={isAnalyzing || !translation.trim()}
            className="w-full bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Send className="w-4 h-4" />
            )}
            添削を受ける
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className={`p-4 rounded-xl border flex items-center gap-4 ${feedback.score >= 70 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className={`text-3xl font-bold ${feedback.score >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
              {feedback.score}
              <span className="text-sm font-normal text-slate-500 ml-1">/100</span>
            </div>
            <div>
              <h3 className={`font-bold ${feedback.score >= 70 ? 'text-green-800' : 'text-orange-800'}`}>
                {feedback.score >= 70 ? '合格！素晴らしい理解力です。' : 'もう少しです！'}
              </h3>
              {feedback.score >= 70 && <p className="text-sm text-green-700">次のセクションに進めます。</p>}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sky-500" />
              AIからのフィードバック
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{feedback.feedback}</p>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl text-slate-300 text-sm shadow-sm">
             <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider">模範解答</h4>
             <p>{feedback.correctedTranslation}</p>
          </div>

          <button
            onClick={() => setFeedback(null)}
            className="w-full py-3 text-slate-500 hover:bg-slate-100 rounded-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            書き直す
          </button>
        </div>
      )}
    </div>
  );
};
