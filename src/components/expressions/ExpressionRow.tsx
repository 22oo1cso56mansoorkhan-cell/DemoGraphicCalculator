import React, { useState } from 'react';
import {
  Trash2,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Settings2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ExpressionItem, DEFAULT_COLORS } from '../../types/graphlab';

interface ExpressionRowProps {
  index: number;
  item: ExpressionItem;
  onUpdate: (updates: Partial<ExpressionItem>) => void;
  onDelete: () => void;
  onAddBelow: () => void;
}

export const ExpressionRow: React.FC<ExpressionRowProps> = ({
  index,
  item,
  onUpdate,
  onDelete,
  onAddBelow,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSliderSettings, setShowSliderSettings] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddBelow();
    } else if (e.key === 'Backspace' && item.rawText.trim() === '') {
      e.preventDefault();
      onDelete();
    }
  };

  const slider = item.slider || {
    min: -10,
    max: 10,
    step: 0.1,
    isPlaying: false,
    speed: 1,
    direction: 1,
    loopMode: 'pingpong',
  };

  return (
    <div
      className={`group relative flex flex-col border-b border-slate-200 dark:border-slate-800 transition-colors ${
        item.visible ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/70 dark:bg-slate-900/40 opacity-70'
      }`}
    >
      <div className="flex items-center min-h-[48px] px-3 gap-2">
        {/* Row Number */}
        <span className="text-xs font-mono font-medium text-slate-400 select-none w-5 text-right flex-shrink-0">
          {index + 1}
        </span>

        {/* Color Swatch & Style Toggle */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-5 h-5 rounded-md flex items-center justify-center border border-black/10 dark:border-white/10 shadow-2xs hover:scale-105 transition-transform"
            style={{ backgroundColor: item.color }}
            title="Change Expression Color & Style"
          />

          {showColorPicker && (
            <div
              className="absolute left-0 top-7 z-30 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-44 space-y-2 text-xs"
              onMouseLeave={() => setShowColorPicker(false)}
            >
              <div className="font-semibold text-slate-700 dark:text-slate-300 text-[10px] uppercase">
                Color Palette
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onUpdate({ color: c });
                      setShowColorPicker(false);
                    }}
                    className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 border ${
                      item.color === c ? 'border-slate-900 dark:border-white scale-105' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-1.5 space-y-1">
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[10px] uppercase">
                  Line Style
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['solid', 'dashed', 'dotted'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => onUpdate({ lineStyle: style })}
                      className={`px-1.5 py-1 rounded text-[10px] font-medium capitalize border ${
                        item.lineStyle === style
                          ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mathematical Input */}
        <div className="flex-1 min-w-0 relative">
          <input
            type="text"
            value={item.rawText}
            onChange={(e) => onUpdate({ rawText: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Enter an expression (e.g. y = x^2, a = 2, sin(x))"
            className="w-full py-1.5 px-2 font-mono text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          {/* Toggle Visibility */}
          <button
            onClick={() => onUpdate({ visible: !item.visible })}
            className={`p-1.5 rounded-lg transition-colors ${
              item.visible
                ? 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
            }`}
            title={item.visible ? 'Hide Graph' : 'Show Graph'}
          >
            {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Delete Row */}
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Delete Expression"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Syntax Error Notice if invalid */}
      {item.error && (
        <div className="px-10 pb-2 text-[11px] text-rose-500 flex items-center gap-1 font-mono">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{item.error}</span>
        </div>
      )}

      {/* Variable Slider with Play / Animation Controls */}
      {item.isVariable && item.variableName && (
        <div className="mx-8 mb-2.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            {/* Play/Pause Animation Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onUpdate({
                    slider: { ...slider, isPlaying: !slider.isPlaying },
                  })
                }
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                  slider.isPlaying
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                }`}
                title={slider.isPlaying ? 'Pause Animation' : 'Play Continuous Animation'}
              >
                {slider.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {item.variableName} = {Number(item.variableValue ?? 0).toFixed(2)}
              </span>
            </div>

            {/* Slider Settings Toggle */}
            <button
              onClick={() => setShowSliderSettings(!showSliderSettings)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              title="Slider Range Settings"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Continuous Range Slider Bar */}
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-slate-400">{slider.min}</span>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={item.variableValue ?? 0}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdate({
                  variableValue: val,
                  rawText: `${item.variableName} = ${val}`,
                });
              }}
              className="flex-1 accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-slate-400">{slider.max}</span>
          </div>

          {/* Configurable Range Inputs */}
          {showSliderSettings && (
            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 grid grid-cols-4 gap-1 text-[10px] font-mono">
              <div>
                <span className="text-slate-400 block">Min</span>
                <input
                  type="number"
                  value={slider.min}
                  onChange={(e) =>
                    onUpdate({
                      slider: { ...slider, min: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <span className="text-slate-400 block">Max</span>
                <input
                  type="number"
                  value={slider.max}
                  onChange={(e) =>
                    onUpdate({
                      slider: { ...slider, max: parseFloat(e.target.value) || 10 },
                    })
                  }
                  className="w-full px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <span className="text-slate-400 block">Step</span>
                <input
                  type="number"
                  step="0.01"
                  value={slider.step}
                  onChange={(e) =>
                    onUpdate({
                      slider: { ...slider, step: parseFloat(e.target.value) || 0.1 },
                    })
                  }
                  className="w-full px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <span className="text-slate-400 block">Speed</span>
                <select
                  value={slider.speed}
                  onChange={(e) =>
                    onUpdate({
                      slider: { ...slider, speed: parseFloat(e.target.value) || 1 },
                    })
                  }
                  className="w-full px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
