import React from 'react';
import { X, Settings } from 'lucide-react';
import { GraphSettings, Viewport } from '../../types/graphlab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GraphSettings;
  onUpdateSettings: (settings: Partial<GraphSettings>) => void;
  viewport: Viewport;
  onUpdateViewport: (viewport: Viewport) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  viewport,
  onUpdateViewport,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Graph Settings
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
        <div className="p-5 space-y-4 text-xs">
          {/* Angle Mode */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Trigonometric Angle Mode
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => onUpdateSettings({ angleMode: 'radians' })}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  settings.angleMode === 'radians'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Radians
              </button>
              <button
                onClick={() => onUpdateSettings({ angleMode: 'degrees' })}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  settings.angleMode === 'degrees'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Degrees
              </button>
            </div>
          </div>

          {/* Grid & Axes Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Display Elements
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-600 dark:text-slate-400">Coordinate Grid Lines</span>
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(e) => onUpdateSettings({ showGrid: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-600 dark:text-slate-400">Axes (x=0, y=0)</span>
                <input
                  type="checkbox"
                  checked={settings.showAxes}
                  onChange={(e) => onUpdateSettings({ showAxes: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-600 dark:text-slate-400">Numeric Tick Labels</span>
                <input
                  type="checkbox"
                  checked={settings.showNumbers}
                  onChange={(e) => onUpdateSettings({ showNumbers: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* Viewport Bounds */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Viewport Window Bounds
            </label>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">xMin</span>
                <input
                  type="number"
                  value={viewport.xMin}
                  onChange={(e) =>
                    onUpdateViewport({ ...viewport, xMin: parseFloat(e.target.value) || -10 })
                  }
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">xMax</span>
                <input
                  type="number"
                  value={viewport.xMax}
                  onChange={(e) =>
                    onUpdateViewport({ ...viewport, xMax: parseFloat(e.target.value) || 10 })
                  }
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">yMin</span>
                <input
                  type="number"
                  value={viewport.yMin}
                  onChange={(e) =>
                    onUpdateViewport({ ...viewport, yMin: parseFloat(e.target.value) || -7 })
                  }
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">yMax</span>
                <input
                  type="number"
                  value={viewport.yMax}
                  onChange={(e) =>
                    onUpdateViewport({ ...viewport, yMax: parseFloat(e.target.value) || 7 })
                  }
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
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
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
