import React, { useRef, useState } from 'react';
import { X, Download, Upload, Image, FileCode, CheckCircle, AlertCircle } from 'lucide-react';
import { WorkspaceDocument } from '../../types/graphlab';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceDocument;
  onImportWorkspace: (doc: WorkspaceDocument) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onImportWorkspace,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  // Export JSON file
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(workspace, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspace.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.graphlab.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Canvas PNG
  const handleExportPng = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspace.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_graph.png`;
    a.click();
  };

  // Import JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as WorkspaceDocument;

        if (!parsed || !Array.isArray(parsed.items)) {
          throw new Error('Invalid GraphLab document structure.');
        }

        onImportWorkspace(parsed);
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => {
          onClose();
        }, 800);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Share & Export Workspace
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
        <div className="p-5 space-y-3 text-xs">
          {/* Option 1: Export Image */}
          <button
            onClick={handleExportPng}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 flex items-center justify-between text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Image className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Export Graph Image (PNG)
                </div>
                <div className="text-[11px] text-slate-400">
                  Download high-resolution image of active plot
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          {/* Option 2: Export JSON */}
          <button
            onClick={handleExportJson}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 flex items-center justify-between text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Export Workspace Document (JSON)
                </div>
                <div className="text-[11px] text-slate-400">
                  Save all equations, sliders, and settings to file
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
          </button>

          {/* Option 3: Import JSON */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Import Workspace Document (JSON)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Load a saved GraphLab workspace file
                  </div>
                </div>
              </div>
              <Upload className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>
          </div>

          {/* Feedback messages */}
          {importSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-[11px]">
              <CheckCircle className="w-4 h-4" />
              <span>Workspace loaded successfully!</span>
            </div>
          )}

          {importError && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4" />
              <span>{importError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
