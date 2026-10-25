import React, { useState } from 'react';
import { useGraphLabState } from './hooks/useGraphLabState';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { ExpressionPanel } from './components/expressions/ExpressionPanel';
import { CoordinateCanvas } from './components/graph/CoordinateCanvas';
import { MathKeypad } from './components/keypad/MathKeypad';
import { SettingsModal } from './components/modals/SettingsModal';
import { HelpShortcutsModal } from './components/modals/HelpShortcutsModal';
import { ExportModal } from './components/modals/ExportModal';
import { ChevronRight } from 'lucide-react';

export const App: React.FC = () => {
  const {
    workspace,
    scope,
    saveStatus,
    canUndo,
    canRedo,
    undo,
    redo,
    renameTitle,
    updateViewport,
    updateSettings,
    addItem,
    updateItem,
    deleteItem,
    handlePointDrag,
    newWorkspace,
    loadWorkspace,
  } = useGraphLabState();

  // UI state
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Keypad insert helper: appends to the last or active expression
  const handleKeypadInsert = (text: string) => {
    const exprItems = workspace.items.filter((it) => it.type === 'expression');
    if (exprItems.length > 0) {
      const lastExpr = exprItems[exprItems.length - 1];
      updateItem(lastExpr.id, { rawText: lastExpr.rawText + text });
    } else {
      addItem('expression');
    }
  };

  const handleKeypadBackspace = () => {
    const exprItems = workspace.items.filter((it) => it.type === 'expression');
    if (exprItems.length > 0) {
      const lastExpr = exprItems[exprItems.length - 1];
      if (lastExpr.rawText.length > 0) {
        updateItem(lastExpr.id, { rawText: lastExpr.rawText.slice(0, -1) });
      }
    }
  };

  const handleKeypadClear = () => {
    const exprItems = workspace.items.filter((it) => it.type === 'expression');
    if (exprItems.length > 0) {
      const lastExpr = exprItems[exprItems.length - 1];
      updateItem(lastExpr.id, { rawText: '' });
    }
  };

  const isDark = workspace.settings.theme === 'dark';

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Application Toolbar */}
      <TopToolbar
        title={workspace.title}
        onRenameTitle={renameTitle}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onNewWorkspace={newWorkspace}
        onToggleKeypad={() => setIsKeypadOpen(!isKeypadOpen)}
        isKeypadOpen={isKeypadOpen}
        settings={workspace.settings}
        onUpdateSettings={updateSettings}
        saveStatus={saveStatus}
      />

      {/* Main GraphLab Workspace */}
      <div className="flex-1 w-full h-[calc(100vh-3rem)] flex overflow-hidden relative">
        {/* Left Expression Panel */}
        <ExpressionPanel
          items={workspace.items}
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onDeleteItem={deleteItem}
        />

        {/* Floating Re-Open Button when Left Panel is Collapsed */}
        {isPanelCollapsed && (
          <button
            onClick={() => setIsPanelCollapsed(false)}
            className="absolute left-3 top-3 z-30 p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Expand Expression Panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Coordinate Graph Canvas */}
        <div className="flex-1 h-full min-w-0 relative">
          <CoordinateCanvas
            items={workspace.items}
            viewport={workspace.viewport}
            onViewportChange={updateViewport}
            onPointDrag={handlePointDrag}
            settings={workspace.settings}
            scope={scope}
            isDark={isDark}
          />
        </div>
      </div>

      {/* On-Screen Math Keypad */}
      <MathKeypad
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        onInsert={handleKeypadInsert}
        onBackspace={handleKeypadBackspace}
        onClear={handleKeypadClear}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={workspace.settings}
        onUpdateSettings={updateSettings}
        viewport={workspace.viewport}
        onUpdateViewport={updateViewport}
      />

      <HelpShortcutsModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        workspace={workspace}
        onImportWorkspace={loadWorkspace}
      />
    </div>
  );
};

export default App;
