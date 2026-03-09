import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GlossaryResponse, Section, TranslationFeedback } from "../types";

const getAiClient = (apiKey: string) => {
  if (!apiKey) throw new Error("API Key is required");
  return new GoogleGenAI({ apiKey: apiKey });
};

// 1. 論文の構造解析（セクション分け） - 高速化版
// 要約と本文の生成を削除し、ページ範囲とタイトルのみを要求する
export const analyzeStructure = async (text: string, apiKey: string): Promise<Omit<Section, 'content' | 'summary' | 'id'>[]> => {
  const ai = getAiClient(apiKey);
  const prompt = `
    以下の論文テキストを分析し、論理的なセクション（章）に分割してください。
    Introduction, Methods, Results, Discussion などの主要な見出しに基づいて分割してください。
    
    テキストには "--- Page X ---" というマーカーが含まれています。
    各セクションの開始ページと終了ページをこのマーカーに基づいて推定してください。

    **重要: 各セクションの「内容」や「要約」は生成しないでください。タイトルとページ範囲のみ必要です。**
    
    出力はJSON形式で、以下のフィールドを含めてください：
    - title: セクションのタイトル（原文ママ）
    - startPage: 開始ページ番号（数値）
    - endPage: 終了ページ番号（数値）

    解析対象テキスト（抜粋）:
    ${text.substring(0, 30000)}...
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                startPage: { type: Type.NUMBER },
                endPage: { type: Type.NUMBER },
              },
              required: ['title', 'startPage', 'endPage']
            }
          }
        }
      }
    }
  });

  const json = JSON.parse(response.text || '{}');
  return json.sections;
};

// 2. 単語帳生成 (単語抽出の精度向上版)
export const generateGlossaryForSection = async (
  text: string,
  apiKey: string
): Promise<GlossaryResponse> => {
  const ai = getAiClient(apiKey);
  const prompt = `
    以下の論文セクションのテキストから、学習者が覚えるべき「英語の専門用語」を**必ず15個**抽出してください。
    
    **重要: 出力データの品質について（厳守）:**
    1. **term** は必ず「英単語」または「英語の名詞句」だけにしてください。（例: "Large Language Model" はOK。"We introduce a model..."のような文章は絶対にNG）。
    2. **definition** はその用語の「日本語訳」または「日本語での簡潔な意味」にしてください。
    3. **context** はその用語が使われている原文の文（英語）をそのまま引用してください。

    出力フォーマット:
    - term: 英語の用語（正解となる単語）
    - definition: 日本語の意味（問題文となる）
    - context: 文脈（原文の引用）
    
    テキスト:
    ${text.substring(0, 20000)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          glossary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING },
                context: { type: Type.STRING }
              },
              required: ['term', 'definition', 'context']
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}') as GlossaryResponse;
};

// 3. 翻訳の添削
export const gradeTranslation = async (
  originalText: string,
  userTranslation: string,
  apiKey: string
): Promise<TranslationFeedback> => {
  const ai = getAiClient(apiKey);
  const prompt = `
    あなたは英語論文の指導教官です。
    以下の原文（英語）に対して、学生が書いた日本語訳（和訳）を採点・添削してください。

    原文:
    "${originalText.substring(0, 2000)}"

    学生の翻訳:
    "${userTranslation}"

    以下のJSON形式で出力してください:
    1. score: 0〜100のスコア（正確さと自然さに基づく）
    2. feedback: 良かった点と、修正すべき点（日本語で具体的かつ教育的に）
    3. correctedTranslation: プロフェッショナルな模範翻訳（日本語）
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          correctedTranslation: { type: Type.STRING }
        },
        required: ['score', 'feedback', 'correctedTranslation']
      }
    }
  });

  return JSON.parse(response.text || '{}') as TranslationFeedback;
};

// 4. 選択テキストの解説 (ポップアップ用)
export const explainTermInContext = async (
  term: string,
  contextSentence: string,
  apiKey: string
): Promise<string> => {
  const ai = getAiClient(apiKey);
  const prompt = `
    以下の英文に含まれる用語について、文脈に基づいた簡潔な解説（日本語）を生成してください。
    100文字以内で答えてください。
    
    用語: "${term}"
    文脈: "${contextSentence}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "解説を生成できませんでした。";
};