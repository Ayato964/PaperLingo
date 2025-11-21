import * as pdfjsLib from 'pdfjs-dist';

// Explicitly set the worker source to a CDN URL that matches the library version.
// This bypasses Vite bundling issues and "Invalid URL" errors associated with local worker files.
const pdfjsVersion = pdfjsLib.version || '4.0.379';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    // Iterate through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items and join them with spaces
      // @ts-ignore - item.str exists on TextItem in v4
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
        
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to parse PDF. Please ensure it is a valid text-based PDF.');
  }
};