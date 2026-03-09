import React, { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { explainTermInContext } from '../services/geminiService';

interface SelectionPopupProps {
  apiKey: string;
}

export const SelectionPopup: React.FC<SelectionPopupProps> = ({ apiKey }) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [contextText, setContextText] = useState('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
        // Don't hide immediately if we are showing a result, only if clicking outside
        return;
      }

      const text = selection.toString().trim();
      // 300文字制限に緩和（フレーズや文単位での選択を許可）
      if (text.length > 300) return; 

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // 文脈を取得 (選択範囲を含む親要素のテキスト)
      const context = selection.anchorNode?.parentElement?.textContent || "";

      setSelectedText(text);
      setContextText(context);
      setPosition({
        x: rect.left + window.scrollX + (rect.width / 2),
        y: rect.top + window.scrollY - 10
      });
      setExplanation(null); // Reset previous result
    };

    // マウスアップで選択終了を検知
    document.addEventListener('mouseup', handleSelection);
    
    // 選択解除のハンドリング (ポップアップ外クリック)
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.selection-popup')) return;
      // 選択範囲がなければ閉じる
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
      const result = await explainTermInContext(selectedText, contextText, apiKey);
      setExplanation(result);
    } catch (error) {
      setExplanation("エラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  if (!position) return null;

  return (
    <div 
      className="selection-popup fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200 w-72 transform -translate-x-1/2 -translate-y-full mt-[-10px]"
      style={{ left: position.x, top: position.y }}
    >
      {!explanation ? (
        <button
          onClick={handleExplain}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full p-2 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors"
        >
          {isLoading ? (
            <span className="animate-pulse">解説を生成中...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-sky-500" />
              AIで解説を見る
            </>
          )}
        </button>
      ) : (
        <div className="p-3 relative">
          <button 
            onClick={() => setPosition(null)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
          <h4 className="font-bold text-slate-800 text-sm mb-1 pr-4 line-clamp-2">{selectedText}</h4>
          <p className="text-sm text-slate-600 leading-relaxed max-h-40 overflow-y-auto">
            {explanation}
          </p>
        </div>
      )}
      {/* Triangle arrow */}
      <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>
    </div>
  );
};