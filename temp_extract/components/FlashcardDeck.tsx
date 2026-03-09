import React, { useState, useMemo } from 'react';
import { Check, ArrowRight, RotateCcw, HelpCircle, AlertCircle } from 'lucide-react';
import { GlossaryItem } from '../types';

interface FlashcardDeckProps {
  glossary: GlossaryItem[];
  onComplete: () => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ glossary, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Track which indices have been correctly answered
  const [correctIndices, setCorrectIndices] = useState<Set<number>>(new Set());

  const currentCard = glossary[currentIndex];
  const isFinished = correctIndices.size === glossary.length && glossary.length > 0;

  // Mask the term in the context sentence for the quiz
  const maskedContext = useMemo(() => {
    if (!currentCard) return '';
    // Simple case-insensitive replacement. 
    // Note: This might replace parts of words if the term is short, but works for most technical terms.
    try {
      const regex = new RegExp(currentCard.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return currentCard.context.replace(regex, '_______');
    } catch (e) {
      return currentCard.context;
    }
  }, [currentCard]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim()) return;

    const normalize = (str: string) => str.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    const correct = normalize(userInput) === normalize(currentCard.term);

    setIsCorrect(correct);
    setShowAnswer(true);

    if (correct) {
      const newSet = new Set(correctIndices);
      newSet.add(currentIndex);
      setCorrectIndices(newSet);
    }
  };

  const handleNext = () => {
    setUserInput('');
    setShowAnswer(false);
    setIsCorrect(null);
    
    if (correctIndices.size === glossary.length) {
      onComplete();
      return;
    }

    // Find next unanswered card
    let nextIdx = currentIndex;
    let attempts = 0;
    while (attempts < glossary.length) {
      nextIdx = (nextIdx + 1) % glossary.length;
      if (!correctIndices.has(nextIdx)) {
        setCurrentIndex(nextIdx);
        break;
      }
      attempts++;
    }
  };

  const handleRetry = () => {
    setUserInput('');
    setShowAnswer(false);
    setIsCorrect(null);
    setCorrectIndices(new Set());
    setCurrentIndex(0);
  };

  if (glossary.length === 0) return <div className="text-center text-slate-500 py-8">単語が見つかりませんでした。</div>;

  if (isFinished) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
          <Check className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">全問正解！</h3>
        <p className="text-green-700 mb-8 text-lg">
          {glossary.length}個の重要単語をすべてマスターしました。<br />
          次のステップに進みましょう。
        </p>
        <button 
          onClick={handleRetry}
          className="text-green-600 hover:text-green-800 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          もう一度復習する
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] max-w-2xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
          <span className="text-2xl font-bold text-slate-800">
            {correctIndices.size} <span className="text-slate-400 text-base">/ {glossary.length}</span>
          </span>
        </div>
        <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-medium">
          Question {currentIndex + 1}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative transition-all duration-300 hover:shadow-md">
        
        {/* Question Section (Japanese) */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
          <span className="block text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">Meaning (日本語)</span>
          <h2 className="text-2xl font-bold text-slate-900 leading-relaxed">{currentCard.definition}</h2>
        </div>

        {/* Context & Input Section */}
        <div className="p-8 flex flex-col gap-6">
          
          {/* Context Hint */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-slate-700 text-lg leading-relaxed font-serif relative">
            <HelpCircle className="w-5 h-5 text-amber-400 absolute top-[-10px] left-[-10px] bg-white rounded-full" />
            "{showAnswer ? (
                // Highlight the answer in the context
                currentCard.context.split(new RegExp(`(${currentCard.term})`, 'gi')).map((part, i) => 
                  part.toLowerCase() === currentCard.term.toLowerCase() ? <span key={i} className="font-bold text-sky-600 bg-sky-100 px-1 rounded">{part}</span> : part
                )
            ) : maskedContext}"
            <p className="text-xs text-slate-400 text-right mt-2 font-sans italic">Original Context</p>
          </div>

          {/* Feedback Area */}
          {showAnswer && (
             <div className={`p-4 rounded-lg flex items-start gap-3 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {isCorrect ? <Check className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                <div className="flex-1">
                  <p className="font-bold">{isCorrect ? '正解！ Correct!' : '残念...不正解です。'}</p>
                  {!isCorrect && (
                    <div className="mt-2">
                      <p className="text-xs uppercase font-bold opacity-70">Answer</p>
                      <p className="text-lg font-bold">{currentCard.term}</p>
                    </div>
                  )}
                </div>
             </div>
          )}

          {/* Input Form */}
          {!showAnswer ? (
            <form onSubmit={handleSubmit} className="mt-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">英単語を入力してください</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type the English term..."
                  className="flex-1 border-2 border-slate-300 rounded-xl px-4 py-3 text-lg focus:border-sky-500 focus:ring-sky-500 outline-none transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-6 rounded-xl transition-colors shadow-sm"
                >
                  回答
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${isCorrect ? 'bg-sky-600 hover:bg-sky-700' : 'bg-slate-600 hover:bg-slate-700'}`}
            >
              {isCorrect ? '次の問題へ' : '次へ進む (後でやり直す)'} <ArrowRight className="w-5 h-5" />
            </button>
          )}

        </div>
      </div>
      
      {!showAnswer && (
        <p className="text-center text-slate-400 text-sm mt-4">
          文脈から適切な英単語を推測し、入力してください。
        </p>
      )}
    </div>
  );
};