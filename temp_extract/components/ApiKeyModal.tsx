import React, { useState } from 'react';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [inputKey, setInputKey] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSave(inputKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
          <Key className="w-6 h-6 text-sky-400" />
          <h2 className="text-xl font-bold">APIキーを入力</h2>
        </div>
        
        <div className="p-6">
          <p className="text-slate-600 mb-4 text-sm leading-relaxed">
            PaperLingoを使用するには、Google Gemini APIキーが必要です。
            キーはブラウザ内にのみ保存され、外部サーバーに送信されることはありません。
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-1">
                Gemini APIキー
              </label>
              <input
                id="apiKey"
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                required
              />
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1">
              <span>キーをお持ちでないですか？</span>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sky-600 hover:underline flex items-center gap-0.5"
              >
                こちらで取得 <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm"
            >
              保存して続ける
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};