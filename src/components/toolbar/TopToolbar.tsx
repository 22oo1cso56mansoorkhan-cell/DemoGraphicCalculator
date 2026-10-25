import React, { useState } from 'react';
import {
  Activity,
  RotateCcw,
  RotateCw,
  Share2,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Plus,
  Check,
  Edit2,
  Download,
  Keyboard,
  FilePlus,
  Trash2,
} from 'lucide-react';
import { GraphSettings } from '../../types/graphlab';

interface TopToolbarProps {
  title: string;
  onRenameTitle: (title: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenExport: () => void;
  onNewWorkspace: () => void;
  onToggleKeypad: () => void;
  isKeypadOpen: boolean;
  settings: GraphSettings;
  onUpdateSettings: (settings: Partial<GraphSettings>) => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  title,
  onRenameTitle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenSettings,
  onOpenHelp,
  onOpenExport,
  onNewWorkspace,
  onToggleKeypad,
  isKeypadOpen,
  settings,
  onUpdateSettings,
  saveStatus,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      onRenameTitle(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-12 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 flex items-center justify-between gap-3 select-none z-40">
      {/* Brand & Document Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-black text-sm tracking-tight text-slate-900 dark:text-slate-100 hidden sm:inline">
            GraphLab
          </span>
        </div>

        <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 hidden sm:block" />

        {/* Editable Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="px-2 py-0.5 text-xs font-semibold rounded border border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-slate-900 dark:text-slate-100 outline-none max-w-[200px]"
            />
          ) : (
            <button
              onClick={() => {
                setTempTitle(title);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 truncate transition-colors max-w-[200px] sm:max-w-xs"
              title="Click to rename document"
            >
              <span className="truncate">{title}</span>
              <Edit2 className="w-3 h-3 text-slate-400 opacity-60" />
            </button>
          )}

          {/* Auto-save Status Pill */}
          <span className="hidden md:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-400 font-medium">
            {saveStatus === 'saved' ? 'Saved' : 'Saving...'}
          </span>
        </div>
      </div>

      {/* Center / Right Toolbar Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* New / Clear Workspace */}
        <button
          onClick={onNewWorkspace}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="New Blank Graph"
        >
          <FilePlus className="w-4 h-4" />
        </button>

        {/* Keypad Toggle */}
        <button
          onClick={onToggleKeypad}
          className={`p-1.5 rounded-lg transition-colors ${
            isKeypadOpen
              ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Toggle Math Keypad"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Export / Share Modal */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          title="Export graph as image (PNG) or JSON document"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Graph Settings (Trig mode, Grid, Axes)"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Help & Shortcuts */}
        <button
          onClick={onOpenHelp}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Help & Keyboard Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() =>
            onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
          }
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={settings.theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
};
