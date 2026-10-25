import React from 'react';
import { X, Delete } from 'lucide-react';

interface MathKeypadProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

export const MathKeypad: React.FC<MathKeypadProps> = ({
  isOpen,
  onClose,
  onInsert,
  onBackspace,
  onClear,
}) => {
  if (!isOpen) return null;

  const keyGroups = [
    // Column 1: Functions
    ['sin(', 'cos(', 'tan(', 'ln(', 'sqrt('],
    // Column 2: Math Symbols & Vars
    ['x', 'y', 'pi', 'e', '^'],
    // Column 3: Numbers 7, 4, 1, 0
    ['7', '4', '1', '0', '('],
    // Column 4: Numbers 8, 5, 2, .
    ['8', '5', '2', '.', ')'],
    // Column 5: Numbers 9, 6, 3, =
    ['9', '6', '3', '=', '<='],
    // Column 6: Operators
    ['/', '*', '-', '+', '>='],
  ];

  return (
    <div className="fixed bottom-3 right-3 sm:right-6 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Math Keypad
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onBackspace}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Close Keypad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {keyGroups.map((col, cIdx) => (
          <div key={cIdx} className="flex flex-col gap-1.5">
            {col.map((key) => {
              const isOperator = ['+', '-', '*', '/', '^', '='].includes(key);
              const isFunction = key.endsWith('(');
              const isVar = ['x', 'y', 'pi', 'e'].includes(key);

              return (
                <button
                  key={key}
                  onClick={() => onInsert(key)}
                  className={`h-9 px-2 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 border ${
                    isOperator
                      ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                      : isFunction
                      ? 'bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                      : isVar
                      ? 'bg-amber-50 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
