import React, { useRef } from 'react';
import { Image as ImageIcon, Trash2, Eye, EyeOff, Upload } from 'lucide-react';
import { ImageItem } from '../../types/graphlab';

interface ImageRowProps {
  index: number;
  item: ImageItem;
  onUpdate: (updates: Partial<ImageItem>) => void;
  onDelete: () => void;
}

export const ImageRow: React.FC<ImageRowProps> = ({ index, item, onUpdate, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate({ url, name: file.name });
    }
  };

  return (
    <div
      className={`group relative flex flex-col border-b border-slate-200 dark:border-slate-800 p-3 space-y-2 transition-colors ${
        item.visible ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/70 dark:bg-slate-900/40 opacity-70'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-slate-400 select-none w-5 text-right flex-shrink-0">
            {index + 1}
          </span>

          <div className="p-1 rounded bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>

          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
            {item.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onUpdate({ visible: !item.visible })}
            className="p-1 rounded text-slate-400 hover:text-slate-700"
            title={item.visible ? 'Hide Image' : 'Show Image'}
          >
            {item.visible ? <Eye className="w-3.5 h-3.5 text-teal-600" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded text-slate-400 hover:text-rose-600"
            title="Delete Image"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="ml-7 space-y-2 text-xs">
        {/* Upload or change image */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          >
            <Upload className="w-3 h-3" />
            <span>{item.url ? 'Change Image' : 'Upload Image'}</span>
          </button>
        </div>

        {/* Position & Size Controls */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">Center (x, y)</span>
            <div className="flex gap-1">
              <input
                type="number"
                value={item.centerX}
                onChange={(e) => onUpdate({ centerX: parseFloat(e.target.value) || 0 })}
                className="w-1/2 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                placeholder="x"
              />
              <input
                type="number"
                value={item.centerY}
                onChange={(e) => onUpdate({ centerY: parseFloat(e.target.value) || 0 })}
                className="w-1/2 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                placeholder="y"
              />
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Width × Height</span>
            <div className="flex gap-1">
              <input
                type="number"
                min="0.1"
                value={item.width}
                onChange={(e) => onUpdate({ width: parseFloat(e.target.value) || 1 })}
                className="w-1/2 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                placeholder="w"
              />
              <input
                type="number"
                min="0.1"
                value={item.height}
                onChange={(e) => onUpdate({ height: parseFloat(e.target.value) || 1 })}
                className="w-1/2 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                placeholder="h"
              />
            </div>
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">Opacity:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={item.opacity}
            onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
            className="flex-1 accent-teal-600 h-1"
          />
          <span className="font-mono text-slate-500 w-8 text-right">
            {Math.round(item.opacity * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
