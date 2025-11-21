import React, { useRef } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface PdfUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 hover:border-sky-400 transition-all cursor-pointer group"
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
          <Loader2 className="w-16 h-16 text-sky-500 animate-spin" />
        ) : (
          <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            {isLoading ? "Processing PDF..." : "Upload Research Paper"}
          </h3>
          <p className="text-slate-500 mt-2 text-sm">
            {isLoading ? "Please wait while we extract the text." : "Drag & drop or click to select a PDF file"}
          </p>
        </div>
      </div>
    </div>
  );
};