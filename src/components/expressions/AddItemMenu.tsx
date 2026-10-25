import React from 'react';
import {
  FunctionSquare,
  FileText,
  Table as TableIcon,
  TrendingUp,
  Folder,
  Image as ImageIcon,
} from 'lucide-react';
import { ItemType } from '../../types/graphlab';

interface AddItemMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (type: ItemType) => void;
}

export const AddItemMenu: React.FC<AddItemMenuProps> = ({ isOpen, onClose, onAddItem }) => {
  if (!isOpen) return null;

  const menuItems: Array<{ type: ItemType; label: string; icon: React.ReactNode; desc: string }> = [
    {
      type: 'expression',
      label: 'Expression',
      icon: <FunctionSquare className="w-4 h-4 text-blue-600" />,
      desc: 'Equation, function, or variable',
    },
    {
      type: 'note',
      label: 'Note',
      icon: <FileText className="w-4 h-4 text-amber-600" />,
      desc: 'Text explanation or instructions',
    },
    {
      type: 'table',
      label: 'Table',
      icon: <TableIcon className="w-4 h-4 text-emerald-600" />,
      desc: 'Data points with x and y values',
    },
    {
      type: 'inference',
      label: 'Inference',
      icon: <TrendingUp className="w-4 h-4 text-purple-600" />,
      desc: 'Linear regression on table points',
    },
    {
      type: 'folder',
      label: 'Folder',
      icon: <Folder className="w-4 h-4 text-amber-500" />,
      desc: 'Group and organize items',
    },
    {
      type: 'image',
      label: 'Image',
      icon: <ImageIcon className="w-4 h-4 text-teal-600" />,
      desc: 'Plot image on coordinate plane',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Floating Dropdown Menu */}
      <div className="absolute left-3 top-12 z-50 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Add to Workspace
        </div>
        {menuItems.map((item) => (
          <button
            key={item.type}
            onClick={() => {
              onAddItem(item.type);
              onClose();
            }}
            className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors group"
          >
            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                {item.label}
              </div>
              <div className="text-[10px] text-slate-400">
                {item.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};
