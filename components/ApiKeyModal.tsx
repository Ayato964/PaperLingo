import React, { useState } from 'react';
import { Key, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { i18n } from '../i18n';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  language: Language;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, language }) => {
  const [inputKey, setInputKey] = useState('');
  const t = i18n[language];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSave(inputKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-700 transition-colors">
        <div className="bg-slate-900 dark:bg-slate-950 p-6 text-white flex items-center gap-3 transition-colors">
          <Key className="w-6 h-6 text-sky-400" />
          <h2 className="text-xl font-bold">{t.apiKeyModalTitle}</h2>
        </div>

        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm leading-relaxed transition-colors">
            {t.apiKeyModalDesc}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 transition-colors">
                {t.apiKeyLabel}
              </label>
              <input
                id="apiKey"
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder={t.apiKeyPlaceholder}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                required
              />
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 transition-colors">
              <span>{t.noApiKeyText}</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5"
              >
                {t.getApiKeyLink} <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm"
            >
              {t.saveContinueBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};