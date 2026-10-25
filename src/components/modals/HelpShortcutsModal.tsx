import React from 'react';
import { X, HelpCircle, Command, Sparkles, BookOpen } from 'lucide-react';

interface HelpShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpShortcutsModal: React.FC<HelpShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              GraphLab Guide & Mathematical Syntax
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700 dark:text-slate-300">
          {/* Keyboard Shortcuts */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5" />
              <span>Keyboard & Navigation Shortcuts</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between">
                <span>New Expression</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 shadow-2xs font-semibold">
                  Enter
                </kbd>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between">
                <span>Delete Empty Row</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 shadow-2xs font-semibold">
                  Backspace
                </kbd>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between">
                <span>Undo</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 shadow-2xs font-semibold">
                  Ctrl+Z
                </kbd>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between">
                <span>Redo</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 shadow-2xs font-semibold">
                  Ctrl+Y
                </kbd>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between">
                <span>Pan Graph</span>
                <span className="font-sans text-slate-500">Click & Drag</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between">
                <span>Zoom</span>
                <span className="font-sans text-slate-500">Mouse Wheel</span>
              </div>
            </div>
          </div>

          {/* Mathematical Syntax Examples */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Supported Mathematical Syntax
            </h4>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="font-sans font-bold text-blue-600 block mb-0.5">Explicit Functions:</span>
                <code>y = x^2 - 4</code> or <code>f(x) = a * sin(x)</code>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="font-sans font-bold text-purple-600 block mb-0.5">Variables & Animated Sliders:</span>
                <code>a = 2</code>, <code>b = -1.5</code> (Click ▶ Play on slider to animate!)
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="font-sans font-bold text-emerald-600 block mb-0.5">Implicit Conic & Circular Equations:</span>
                <code>x^2 + y^2 = 25</code>, <code>x^2/9 + y^2/4 = 1</code>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="font-sans font-bold text-amber-600 block mb-0.5">Inequalities (Shaded Regions):</span>
                <code>y &gt; x^2 - 2</code>, <code>y &lt;= 2x + 1</code>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="font-sans font-bold text-rose-600 block mb-0.5">Draggable Interactive Points:</span>
                <code>A = (3, 2)</code> (Click & drag the point directly on the graph!)
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="font-sans font-bold text-teal-600 block mb-0.5">Supported Math Functions:</span>
                <code>sin, cos, tan, asin, acos, atan, sqrt, abs, ln, exp, floor, ceil, round</code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
