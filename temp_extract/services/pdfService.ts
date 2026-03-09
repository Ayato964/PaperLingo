import * as pdfjsLib from 'pdfjs-dist';

// Explicitly set the worker source to a CDN URL that matches the library version.
const pdfjsVersion = pdfjsLib.version || '4.0.379';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

export interface PdfDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<any>;
}

// Load the PDF document proxy
export const getPdfDocument = async (file: File): Promise<PdfDocument> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  return await loadingTask.promise;
};

// Extract text logic (reused for structure analysis)
// Modified to return both full text and per-page text for local sectioning
export const extractTextFromPdfDoc = async (pdf: PdfDocument): Promise<{ fullText: string, pageTexts: string[] }> => {
  try {
    let fullText = '';
    const pageTexts: string[] = [];
    // Limit to first 20 pages to avoid massive tokens for MVP structure analysis, 
    // but we might want to parse all for reading. For MVP, let's keep it relatively small or parse all.
    // Parsing text is fast locally, so we can parse all pages.
    const maxPagesToParse = pdf.numPages;

    for (let i = 1; i <= maxPagesToParse; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // @ts-ignore
      const pageText = textContent.items.map((item: any) => item.str || '').join(' ');
      
      pageTexts.push(pageText);
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }
    return { fullText, pageTexts };
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('PDFのテキスト抽出に失敗しました。');
  }
};

// Render a specific page to a canvas context
export const renderPageToCanvas = async (
  pdf: PdfDocument,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.5
) => {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: canvas.getContext('2d')!,
    viewport: viewport,
  };

  await page.render(renderContext).promise;
};