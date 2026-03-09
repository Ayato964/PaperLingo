import React, { useRef } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

import { Language } from '../types';
import { i18n } from '../i18n';

interface PdfUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  language: Language;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onFileSelect, isLoading, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = i18n[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-sky-400 dark:hover:border-sky-500 transition-all cursor-pointer group"
      onClick={() => !isLoading && fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf"
        onChange={handleFileChange}
        disabled={isLoading}
      />

      <div className="flex flex-col items-center justify-center gap-4">
        {isLoading ? (
          <Loader2 className="w-16 h-16 text-sky-500 dark:text-sky-400 animate-spin" />
        ) : (
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {isLoading ? t.processingPdf : t.uploadTitle}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            {isLoading ? t.uploadReady : t.uploadDescription}
          </p>
        </div>
      </div>
    </div>
  );
};