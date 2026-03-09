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
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert('Please select a PDF file.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert('Please select a PDF file.');
      }
    }
  };

  return (
    <div
      onClick={() => !isLoading && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        w-full p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
        flex flex-col items-center justify-center text-center group
        ${isLoading
          ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/20'
          : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 bg-white dark:bg-slate-800'}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
      />

      <div className="flex flex-col items-center gap-4">
        {isLoading ? (
          <div className="relative">
            <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
            <Loader2 className="w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-spin relative z-10" />
          </div>
        ) : (
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 group-hover:bg-sky-100 dark:group-hover:bg-sky-800 rounded-full flex items-center justify-center transition-colors">
            <UploadCloud className="w-10 h-10 text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400" />
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 transition-colors">
            {isLoading ? t.processingPdf : t.uploadTitle}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm transition-colors">
            {isLoading ? t.uploadReady : t.uploadDescription}
          </p>
        </div>
      </div>
    </div>
  );
};