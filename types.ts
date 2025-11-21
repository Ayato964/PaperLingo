export interface GlossaryItem {
  term: string;
  definition: string;
  context: string;
}

export interface GlossaryResponse {
  glossary: GlossaryItem[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  PARSING_PDF = 'PARSING_PDF',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface AnalysisError {
  message: string;
  code?: string;
}