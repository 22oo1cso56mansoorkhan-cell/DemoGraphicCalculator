import React from 'react';
import { ChevronDown, ChevronRight, Folder, Trash2, Eye, EyeOff } from 'lucide-react';
import { FolderItem } from '../../types/graphlab';

interface FolderRowProps {
  index: number;
  item: FolderItem;
  itemCount: number;
  onUpdate: (updates: Partial<FolderItem>) => void;
  onDelete: () => void;
}

export const FolderRow: React.FC<FolderRowProps> = ({
  index,
  item,
  itemCount,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="group relative flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 px-3 py-2.5 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-medium text-slate-400 select-none w-5 text-right flex-shrink-0">
          {index + 1}
        </span>

        <button
          onClick={() => onUpdate({ collapsed: !item.collapsed })}
          className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          title={item.collapsed ? 'Expand Folder' : 'Collapse Folder'}
        >
          {item.collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />

        <input
          type="text"
          value={item.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="font-bold text-xs text-slate-800 dark:text-slate-200 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-36"
        />

        <span className="text-[10px] text-slate-400 font-mono">
          ({itemCount} items)
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdate({ visible: !item.visible })}
          className="p-1 rounded text-slate-400 hover:text-slate-700"
          title={item.visible ? 'Hide All in Folder' : 'Show All in Folder'}
        >
          {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onDelete}
          className="p-1 rounded text-slate-400 hover:text-rose-600"
          title="Delete Folder"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
