import React, { useEffect, useRef } from 'react';
import { renderPageToCanvas, PdfDocument } from '../services/pdfService';

interface PdfViewerProps {
  pdfDoc: PdfDocument | null;
  pageNumber: number;
  scale?: number;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ pdfDoc, pageNumber, scale = 1.5 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPageToCanvas(pdfDoc, pageNumber, canvasRef.current, scale);
    }
  }, [pdfDoc, pageNumber, scale]);

  if (!pdfDoc) return <div className="bg-slate-200 h-full animate-pulse"></div>;

  return (
    <div className="w-full overflow-auto flex justify-center p-1">
      <canvas 
        ref={canvasRef} 
        className="shadow-lg max-w-full h-auto object-contain bg-white"
      />
    </div>
  );
};