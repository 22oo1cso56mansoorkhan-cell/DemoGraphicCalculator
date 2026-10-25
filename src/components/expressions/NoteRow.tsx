import React from 'react';
import { Trash2, FileText } from 'lucide-react';
import { NoteItem } from '../../types/graphlab';

interface NoteRowProps {
  index: number;
  item: NoteItem;
  onUpdate: (updates: Partial<NoteItem>) => void;
  onDelete: () => void;
}

export const NoteRow: React.FC<NoteRowProps> = ({ index, item, onUpdate, onDelete }) => {
  return (
    <div className="group relative flex flex-col border-b border-slate-200 dark:border-slate-800 bg-amber-50/20 dark:bg-amber-950/10 p-3 transition-colors">
      <div className="flex items-start gap-2">
        <span className="text-xs font-mono font-medium text-slate-400 select-none w-5 text-right flex-shrink-0 pt-1">
          {index + 1}
        </span>

        <div className="p-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-0.5">
          <FileText className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            value={item.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Add a mathematical note or explanation..."
            rows={2}
            className="w-full text-xs text-slate-800 dark:text-slate-200 bg-transparent border-0 focus:outline-none focus:ring-0 resize-y leading-relaxed font-sans"
          />
        </div>

        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-70 group-hover:opacity-100 transition-all flex-shrink-0"
          title="Delete Note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
