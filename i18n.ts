import { Language } from './types';

type Translations = {
    [key in Language]: {
        appTitle: string;
        appDescription: string;
        apiKeySettingsTitle: string;
        uploadTitle: string;
        uploadDescription: string;
        processingPdf: string;
        uploadReady: string;
        closeFileTitle: string;
        aiAssistantTitle: string;
        termsFound: string;
        analyzingTerms: string;
        readyToAnalyze: string;
        generateGlossaryBtn: string;
        apiKeyModalTitle: string;
        apiKeyModalDesc: string;
        apiKeyLabel: string;
        apiKeyPlaceholder: string;
        noApiKeyText: string;
        getApiKeyLink: string;
        saveContinueBtn: string;
        toggleDarkMode: string;
    };
};

export const i18n: Translations = {
    English: {
        appTitle: "Analyze Research Papers with AI",
        appDescription: "Upload a PDF to instantly generate a glossary of technical terms and context-aware definitions.",
        apiKeySettingsTitle: "API Key Settings",
        uploadTitle: "Upload Research Paper",
        uploadDescription: "Drag & drop or click to select a PDF file",
        processingPdf: "Processing PDF...",
        uploadReady: "Please wait while we extract the text.",
        closeFileTitle: "Close File",
        aiAssistantTitle: "Auto-Glossary",
        termsFound: "Terms Found",
        analyzingTerms: "Gemini is analyzing technical terms...",
        readyToAnalyze: "Ready to analyze. Click the button below to extract key terms and definitions.",
        generateGlossaryBtn: "Generate Glossary",
        apiKeyModalTitle: "Enter API Key",
        apiKeyModalDesc: "PaperLingo requires a Google Gemini API key to function. Your key is stored locally in your browser and never sent to our servers.",
        apiKeyLabel: "Gemini API Key",
        apiKeyPlaceholder: "AIzaSy...",
        noApiKeyText: "Don't have a key?",
        getApiKeyLink: "Get one here",
        saveContinueBtn: "Save & Continue",
        toggleDarkMode: "Toggle Dark Mode"
    },
    Japanese: {
        appTitle: "AIで論文を分析",
        appDescription: "PDFをアップロードすると、専門用語や文脈に沿った定義の用語集を瞬時に生成します。",
        apiKeySettingsTitle: "APIキー設定",
        uploadTitle: "論文をアップロード",
        uploadDescription: "ドラッグ＆ドロップ、またはクリックしてPDFファイルを選択",
        processingPdf: "PDFを処理中...",
        uploadReady: "テキストを抽出しています。しばらくお待ちください。",
        closeFileTitle: "ファイルを閉じる",
        aiAssistantTitle: "自動用語集",
        termsFound: "用語を発見",
        analyzingTerms: "Geminiが専門用語を分析しています...",
        readyToAnalyze: "分析の準備が完了しました。下のボタンをクリックして主要な用語と定義を抽出してください。",
        generateGlossaryBtn: "用語集を生成",
        apiKeyModalTitle: "APIキーを入力",
        apiKeyModalDesc: "PaperLingoを利用するには、Google Gemini APIキーが必要です。キーはブラウザにローカルに保存され、サーバーに送信されることはありません。",
        apiKeyLabel: "Gemini APIキー",
        apiKeyPlaceholder: "AIzaSy...",
        noApiKeyText: "キーをお持ちでないですか？",
        getApiKeyLink: "こちらから取得",
        saveContinueBtn: "保存して続ける",
        toggleDarkMode: "ダークモードを切り替え"
    }
};
