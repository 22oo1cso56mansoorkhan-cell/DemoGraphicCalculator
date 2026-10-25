import React, { useState } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Folder,
  Layers,
  Sparkles,
} from 'lucide-react';
import { GraphItem, ItemType, TableItem, FolderItem } from '../../types/graphlab';
import { ExpressionRow } from './ExpressionRow';
import { NoteRow } from './NoteRow';
import { TableRow } from './TableRow';
import { InferenceRow } from './InferenceRow';
import { FolderRow } from './FolderRow';
import { ImageRow } from './ImageRow';
import { AddItemMenu } from './AddItemMenu';

interface ExpressionPanelProps {
  items: GraphItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddItem: (type: ItemType, afterIndex?: number) => void;
  onUpdateItem: (id: string, updates: Partial<GraphItem>) => void;
  onDeleteItem: (id: string) => void;
}

export const ExpressionPanel: React.FC<ExpressionPanelProps> = ({
  items,
  isCollapsed,
  onToggleCollapse,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Find all active tables for Inference linking
  const tables = items.filter((it): it is TableItem => it.type === 'table');

  // Track collapsed folders
  const collapsedFolderIds = new Set(
    items.filter((it): it is FolderItem => it.type === 'folder' && it.collapsed).map((f) => f.id)
  );

  return (
    <div
      className={`relative h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-0 border-r-0 overflow-hidden' : 'w-full md:w-[380px] lg:w-[420px]'
      }`}
    >
      {/* Top Header Bar */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 px-3 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          {/* Add Item (+) Button */}
          <div className="relative">
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
              title="Add expression, note, table, folder, or image"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>

            <AddItemMenu
              isOpen={isAddMenuOpen}
              onClose={() => setIsAddMenuOpen(false)}
              onAddItem={(type) => onAddItem(type)}
            />
          </div>

          <span className="text-[11px] font-mono text-slate-400 font-medium">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Collapse Left Panel Button */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Collapse Panel (Expand Graph)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Expression Item Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {items.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              Workspace is empty
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Click <strong>Add Item</strong> above or choose an option below to start graphing.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => onAddItem('expression')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700"
              >
                + Expression
              </button>
              <button
                onClick={() => onAddItem('table')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                + Table
              </button>
            </div>
          </div>
        ) : (
          items.map((item, index) => {
            // Hide items inside collapsed folder
            if (item.folderId && collapsedFolderIds.has(item.folderId)) {
              return null;
            }

            if (item.type === 'expression') {
              return (
                <ExpressionRow
                  key={item.id}
                  index={index}
                  item={item}
                  onUpdate={(updates) => onUpdateItem(item.id, updates)}
                  onDelete={() => onDeleteItem(item.id)}
                  onAddBelow={() => onAddItem('expression', index)}
                />
              );
            }

            if (item.type === 'note') {
              return (
                <NoteRow
                  key={item.id}
                  index={index}
                  item={item}
                  onUpdate={(updates) => onUpdateItem(item.id, updates)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              );
            }

            if (item.type === 'table') {
              return (
                <TableRow
                  key={item.id}
                  index={index}
                  item={item}
                  onUpdate={(updates) => onUpdateItem(item.id, updates)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              );
            }

            if (item.type === 'inference') {
              return (
                <InferenceRow
                  key={item.id}
                  index={index}
                  item={item}
                  tables={tables}
                  onUpdate={(updates) => onUpdateItem(item.id, updates)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              );
            }

            if (item.type === 'folder') {
              const childrenCount = items.filter((it) => it.folderId === item.id).length;
              return (
                <FolderRow
                  key={item.id}
                  index={index}
                  item={item}
                  itemCount={childrenCount}
                  onUpdate={(updates) => onUpdateItem(item.id, updates)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              );
            }

            if (item.type === 'image') {
              return (
                <ImageRow
                  key={item.id}
                  index={index}
                  item={item}
                  onUpdate={(updates) => onUpdateItem(item.id, updates)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              );
            }

            return null;
          })
        )}
      </div>
    </div>
  );
};
