import React from 'react';
import { BookOpen } from 'lucide-react';
import { GlossaryItem } from '../types';

interface GlossaryCardProps {
  item: GlossaryItem;
}

export const GlossaryCard: React.FC<GlossaryCardProps> = ({ item }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-500 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-1 min-w-[24px]">
          <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400 flex items-center justify-center text-xs font-bold">
            <BookOpen className="w-3 h-3" />
          </div>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-lg">{item.term}</h4>
          <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed text-sm">{item.definition}</p>
          <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded border-l-2 border-slate-300 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400 italic">
            "{item.context}"
          </div>
        </div>
      </div>
    </div>
  );
};