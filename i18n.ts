import { Language } from './types';

type Translations = {
    [key in Language]: Record<string, string>;
};

export const i18n: Translations = {
    English: {
        // Shared / Layout
        appTitle: "Master Your Papers",
        appDescription: "PaperLingo is an AI-powered learning platform that analyzes paper structures and supports you from vocabulary learning to translation exercises.",
        apiKeySettingsTitle: "API Key Settings",
        uploadTitle: "Upload Research Paper",
        uploadDescription: "Drag & drop or click to select a PDF file",
        processingPdf: "Processing PDF...",
        uploadReady: "Please wait while we extract the text.",
        closeFileTitle: "Close File",
        apiKeyModalTitle: "Enter API Key",
        apiKeyModalDesc: "PaperLingo requires a Google Gemini API key to function. Your key is stored locally in your browser and never sent to our servers.",
        apiKeyLabel: "Gemini API Key",
        apiKeyPlaceholder: "AIzaSy...",
        noApiKeyText: "Don't have a key?",
        getApiKeyLink: "Get one here",
        saveContinueBtn: "Save & Continue",
        toggleDarkMode: "Toggle Dark Mode",

        // App Main Content
        analyzingStructure: "AI is scanning the paper structure...",
        textMode: "Text Mode",
        visualMode: "Visual Mode",
        zoomOut: "Zoom Out",
        zoomIn: "Zoom In",
        sectionEnd: "-- Section End --",
        tasks: "Tasks",
        step1Vocab: "Step 1: Memorize Keywords",
        step2Translation: "Step 2: Comprehension Check",
        sectionComplete: "Section Complete!",
        extractingVocab: "AI is extracting key terms...",
        excellentWork: "Excellent Work!",
        masteredSection: "You have mastered the content of this section! Let's move on to the next one.",
        nextSection: "Next Section",
        allComplete: "You have completed studying the entire paper! Great job!",
        parseError: "Failed to parse PDF.",
        analysisError: "AI analysis failed. Please try again.",

        // FlashcardDeck
        noWordsFound: "No words found.",
        allCorrect: "Perfect Score!",
        masteredAllWords: "You've successfully mastered all key terms. Proceed to the next step.",
        reviewAgain: "Review Again",
        progress: "Progress",
        questionNum: "Question",
        meaningLabel: "Meaning",
        originalContext: "Original Context",
        correctFeedback: "Correct!",
        incorrectFeedback: "Incorrect. Try again.",
        answerLabel: "Answer",
        inputLabel: "Type the English term",
        inputPlaceholder: "Type the English term...",
        answerBtn: "Submit",
        nextBtn: "Next Question",
        skipBtn: "Skip for now",
        guessInstruction: "Guess the appropriate English word from the context and type it.",

        // TranslationExercise
        targetText: "Target Text (Excerpt)",
        translateInstruction: "Translate the summary of this section, or any sentence you found interesting:",
        translatePlaceholder: "Type here...",
        getFeedbackBtn: "Get Feedback",
        gradingError: "An error occurred during grading.",
        passText: "Passed! Excellent understanding.",
        tryAgainText: "Almost there!",
        canProceed: "You can proceed to the next section.",
        aiFeedback: "AI Feedback",
        modelAnswer: "Model Answer",
        rewriteBtn: "Rewrite",

        // SelectionPopup
        generatingExplanation: "Generating explanation...",
        getAiExplanation: "Get AI Explanation",
        explanationError: "An error occurred."
    },
    Japanese: {
        // Shared / Layout
        appTitle: "論文を、マスターしよう。",
        appDescription: "PaperLingoは、AIを活用して論文の構造を解析し、単語学習から翻訳演習までをサポートする学習プラットフォームです。",
        apiKeySettingsTitle: "APIキー設定",
        uploadTitle: "論文をアップロード",
        uploadDescription: "ドラッグ＆ドロップ、またはクリックしてPDFファイルを選択",
        processingPdf: "PDFを処理中...",
        uploadReady: "テキストを抽出しています。しばらくお待ちください。",
        closeFileTitle: "ファイルを閉じる",
        apiKeyModalTitle: "APIキーを入力",
        apiKeyModalDesc: "PaperLingoを利用するには、Google Gemini APIキーが必要です。キーはブラウザにローカルに保存され、サーバーに送信されることはありません。",
        apiKeyLabel: "Gemini APIキー",
        apiKeyPlaceholder: "AIzaSy...",
        noApiKeyText: "キーをお持ちでないですか？",
        getApiKeyLink: "こちらから取得",
        saveContinueBtn: "保存して続ける",
        toggleDarkMode: "ダークモードを切り替え",

        // App Main Content
        analyzingStructure: "AIが論文の構成をスキャンしています...",
        textMode: "テキストモード",
        visualMode: "ビジュアルモード",
        zoomOut: "縮小",
        zoomIn: "拡大",
        sectionEnd: "-- Section End --",
        tasks: "Tasks",
        step1Vocab: "Step 1: 重要単語を覚える",
        step2Translation: "Step 2: 理解度チェック",
        sectionComplete: "セクション完了！",
        extractingVocab: "AIが重要単語を抽出しています...",
        excellentWork: "Excellent Work!",
        masteredSection: "このセクションの内容をマスターしました。\n次のセクションに進んで学習を続けましょう。",
        nextSection: "次のセクションへ",
        allComplete: "論文全体の学習が完了しました！お疲れ様でした！",
        parseError: "PDFの解析に失敗しました。",
        analysisError: "分析に失敗しました。もう一度お試しください。",

        // FlashcardDeck
        noWordsFound: "単語が見つかりませんでした。",
        allCorrect: "全問正解！",
        masteredAllWords: "個の重要単語をすべてマスターしました。\n次のステップに進みましょう。",
        reviewAgain: "もう一度復習する",
        progress: "Progress",
        questionNum: "Question",
        meaningLabel: "Meaning (日本語)",
        originalContext: "Original Context",
        correctFeedback: "正解！ Correct!",
        incorrectFeedback: "残念...不正解です。",
        answerLabel: "Answer",
        inputLabel: "英単語を入力してください",
        inputPlaceholder: "Type the English term...",
        answerBtn: "回答",
        nextBtn: "次の問題へ",
        skipBtn: "次へ進む (後でやり直す)",
        guessInstruction: "文脈から適切な英単語を推測し、入力してください。",

        // TranslationExercise
        targetText: "翻訳対象 (抜粋)",
        translateInstruction: "このセクションの要約、または気になった一文を和訳してください：",
        translatePlaceholder: "ここに入力...",
        getFeedbackBtn: "添削を受ける",
        gradingError: "採点中にエラーが発生しました。",
        passText: "合格！素晴らしい理解力です。",
        tryAgainText: "もう少しです！",
        canProceed: "次のセクションに進めます。",
        aiFeedback: "AIからのフィードバック",
        modelAnswer: "模範解答",
        rewriteBtn: "書き直す",

        // SelectionPopup
        generatingExplanation: "解説を生成中...",
        getAiExplanation: "AIで解説を見る",
        explanationError: "エラーが発生しました。"
    }
};
