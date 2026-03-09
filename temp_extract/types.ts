export interface GlossaryItem {
  term: string;
  definition: string;
  context: string;
  isLearned?: boolean; // 学習済みフラグ
}

export interface GlossaryResponse {
  glossary: GlossaryItem[];
}

export interface Section {
  id: number;
  title: string;
  startPage: number;
  endPage: number;
  summary: string; // 短い概要
  content: string; // セクション内のテキスト
}

export interface TranslationFeedback {
  score: number; // 100点満点
  feedback: string; // 良い点、改善点
  correctedTranslation: string; // AIによる模範解答
}

export enum AppStatus {
  IDLE = 'IDLE',
  PARSING_PDF = 'PARSING_PDF',
  ANALYZING_STRUCTURE = 'ANALYZING_STRUCTURE', // 構造解析中
  LEARNING = 'LEARNING', // 学習モード
  ERROR = 'ERROR'
}

export interface AnalysisError {
  message: string;
  code?: string;
}
