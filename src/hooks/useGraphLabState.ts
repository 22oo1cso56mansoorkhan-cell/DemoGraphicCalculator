import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  WorkspaceDocument,
  GraphItem,
  ItemType,
  Viewport,
  GraphSettings,
  ExpressionItem,
  DEFAULT_COLORS,
} from '../types/graphlab';
import { DEFAULT_WORKSPACE } from '../types/defaultWorkspace';
import { parseExpressionString, Scope } from '../utils/mathEngine';

const STORAGE_KEY = 'graphlab_workspace_v1';
const MAX_UNDO_STACK = 30;

export function useGraphLabState() {
  // Current workspace document
  const [workspace, setWorkspace] = useState<WorkspaceDocument>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to restore saved GraphLab workspace', e);
    }
    return DEFAULT_WORKSPACE;
  });

  // Save Status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Undo / Redo stacks
  const [undoStack, setUndoStack] = useState<WorkspaceDocument[]>([]);
  const [redoStack, setRedoStack] = useState<WorkspaceDocument[]>([]);

  // Push state to undo stack
  const pushUndoState = useCallback((current: WorkspaceDocument) => {
    setUndoStack((prev) => [...prev.slice(-MAX_UNDO_STACK), current]);
    setRedoStack([]); // Clear redo
  }, []);

  // Save to LocalStorage with debounce
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
        setSaveStatus('saved');
      } catch (e) {
        console.error('LocalStorage write failed', e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [workspace]);

  // Sync theme class to document body / root
  useEffect(() => {
    if (workspace.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [workspace.settings.theme]);

  // 1. Resolve variable scope across expressions
  const scope = useMemo(() => {
    const s: Scope = {};
    workspace.items.forEach((item) => {
      if (item.type === 'expression') {
        const parsed = parseExpressionString(item.rawText, s);
        if (parsed.type === 'variable' && parsed.variableName && parsed.variableValue !== undefined) {
          s[parsed.variableName] = parsed.variableValue;
        }
      }
    });
    return s;
  }, [workspace.items]);

  // 2. RequestAnimationFrame Animation Loop for active sliders
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const hasActiveSlider = workspace.items.some(
      (it) => it.type === 'expression' && it.isVariable && it.slider?.isPlaying
    );

    if (!hasActiveSlider) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const step = (time: number) => {
      const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000); // delta in seconds
      lastTimeRef.current = time;

      setWorkspace((prev) => {
        let changed = false;
        const nextItems = prev.items.map((it) => {
          if (it.type !== 'expression' || !it.isVariable || !it.slider?.isPlaying) {
            return it;
          }

          changed = true;
          const sl = it.slider;
          const range = sl.max - sl.min;
          const rate = (range / 4) * (sl.speed || 1); // sweep entire range in ~4 seconds at 1x
          let nextVal = (it.variableValue ?? 0) + sl.direction * rate * dt;
          let nextDir = sl.direction;

          if (nextVal > sl.max) {
            if (sl.loopMode === 'loop') {
              nextVal = sl.min;
            } else {
              nextVal = sl.max;
              nextDir = -1;
            }
          } else if (nextVal < sl.min) {
            if (sl.loopMode === 'loop') {
              nextVal = sl.max;
            } else {
              nextVal = sl.min;
              nextDir = 1;
            }
          }

          // Round to step precision
          const stepVal = Math.round(nextVal * 100) / 100;

          return {
            ...it,
            variableValue: stepVal,
            rawText: `${it.variableName} = ${stepVal}`,
            slider: { ...sl, direction: nextDir },
          };
        });

        if (!changed) return prev;
        return { ...prev, items: nextItems, updatedAt: Date.now() };
      });

      animFrameRef.current = requestAnimationFrame(step);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [workspace.items]);

  // Actions
  const updateWorkspace = useCallback(
    (updater: (prev: WorkspaceDocument) => WorkspaceDocument, saveHistory = true) => {
      setWorkspace((prev) => {
        if (saveHistory) {
          pushUndoState(prev);
        }
        return updater(prev);
      });
    },
    [pushUndoState]
  );

  const renameTitle = useCallback((title: string) => {
    updateWorkspace((prev) => ({ ...prev, title, updatedAt: Date.now() }));
  }, [updateWorkspace]);

  const updateViewport = useCallback((viewport: Viewport) => {
    setWorkspace((prev) => ({ ...prev, viewport, updatedAt: Date.now() }));
  }, []);

  const updateSettings = useCallback((settings: Partial<GraphSettings>) => {
    setWorkspace((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
      updatedAt: Date.now(),
    }));
  }, []);

  // Add Item
  const addItem = useCallback((type: ItemType, afterIndex?: number) => {
    updateWorkspace((prev) => {
      const id = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const color = DEFAULT_COLORS[prev.items.length % DEFAULT_COLORS.length];
      let newItem: GraphItem;

      switch (type) {
        case 'expression':
          newItem = {
            id,
            type: 'expression',
            rawText: '',
            color,
            visible: true,
            lineStyle: 'solid',
            lineWidth: 2.5,
          };
          break;
        case 'note':
          newItem = {
            id,
            type: 'note',
            text: '',
          };
          break;
        case 'table':
          newItem = {
            id,
            type: 'table',
            name: `Table ${prev.items.filter((i) => i.type === 'table').length + 1}`,
            xLabel: 'x₁',
            yLabel: 'y₁',
            rows: [
              { id: `r-1`, x: -2, y: 4 },
              { id: `r-2`, x: 0, y: 0 },
              { id: `r-3`, x: 2, y: 4 },
            ],
            color,
            visible: true,
            showPoints: true,
            connectLines: false,
          };
          break;
        case 'inference': {
          const firstTable = prev.items.find((i) => i.type === 'table');
          newItem = {
            id,
            type: 'inference',
            tableId: firstTable ? firstTable.id : '',
            equation: 'y ~ m*x + b',
            color,
            visible: true,
          };
          break;
        }
        case 'folder':
          newItem = {
            id,
            type: 'folder',
            title: `Folder ${prev.items.filter((i) => i.type === 'folder').length + 1}`,
            collapsed: false,
            visible: true,
          };
          break;
        case 'image':
          newItem = {
            id,
            type: 'image',
            name: 'Image Item',
            url: '',
            centerX: 0,
            centerY: 0,
            width: 4,
            height: 4,
            opacity: 0.8,
            visible: true,
          };
          break;
      }

      const nextItems = [...prev.items];
      if (afterIndex !== undefined && afterIndex >= 0 && afterIndex < nextItems.length) {
        nextItems.splice(afterIndex + 1, 0, newItem);
      } else {
        nextItems.push(newItem);
      }

      return { ...prev, items: nextItems, updatedAt: Date.now() };
    });
  }, [updateWorkspace]);

  // Update Item
  const updateItem = useCallback((id: string, updates: Partial<GraphItem>) => {
    updateWorkspace((prev) => {
      const nextItems = prev.items.map((it) => {
        if (it.id !== id) return it;
        const merged = { ...it, ...updates } as GraphItem;

        // If expression text changed, re-detect if it became a variable or point
        const rawTextUpdate = 'rawText' in updates ? (updates as Partial<ExpressionItem>).rawText : undefined;
        if (merged.type === 'expression' && rawTextUpdate !== undefined) {
          const parsed = parseExpressionString(rawTextUpdate, scope);

          if (parsed.type === 'variable' && parsed.variableName && parsed.variableValue !== undefined) {
            merged.isVariable = true;
            merged.variableName = parsed.variableName;
            merged.variableValue = parsed.variableValue;
            merged.isPoint = false;
            if (!merged.slider) {
              const base = Math.abs(parsed.variableValue) || 5;
              merged.slider = {
                min: -Math.max(10, base * 2),
                max: Math.max(10, base * 2),
                step: 0.1,
                isPlaying: false,
                speed: 1,
                direction: 1,
                loopMode: 'pingpong',
              };
            }
          } else if (parsed.type === 'point' && parsed.pointCoord) {
            merged.isPoint = true;
            merged.pointCoord = parsed.pointCoord;
            merged.pointLabel = parsed.pointLabel || 'P';
            merged.isDraggable = true;
            merged.isVariable = false;
          } else {
            merged.isVariable = false;
            merged.isPoint = false;
          }
          merged.error = parsed.error;
          merged.parsedType = parsed.type;
        }

        return merged;
      });

      return { ...prev, items: nextItems, updatedAt: Date.now() };
    }, false); // don't push every character to undo
  }, [updateWorkspace, scope]);

  // Delete Item
  const deleteItem = useCallback((id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
      updatedAt: Date.now(),
    }));
  }, [updateWorkspace]);

  // Draggable Point Interaction
  const handlePointDrag = useCallback((pointId: string, newCoord: { x: number; y: number }) => {
    setWorkspace((prev) => {
      const nextItems = prev.items.map((it) => {
        if (it.id !== pointId || it.type !== 'expression') return it;
        const label = it.pointLabel || 'P';
        return {
          ...it,
          pointCoord: newCoord,
          rawText: `${label} = (${newCoord.x}, ${newCoord.y})`,
        };
      });
      return { ...prev, items: nextItems, updatedAt: Date.now() };
    });
  }, []);

  // Undo / Redo
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, workspace]);
    setWorkspace(previous);
  }, [undoStack, workspace]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, workspace]);
    setWorkspace(next);
  }, [redoStack, workspace]);

  // New Workspace (Blank)
  const newWorkspace = useCallback(() => {
    if (window.confirm('Create a new blank graph workspace? All unsaved expressions will be cleared.')) {
      pushUndoState(workspace);
      setWorkspace({
        id: `workspace-${Date.now()}`,
        title: 'Untitled Graph',
        viewport: { xMin: -10, xMax: 10, yMin: -7, yMax: 7 },
        settings: workspace.settings,
        items: [
          {
            id: `expr-${Date.now()}`,
            type: 'expression',
            rawText: 'y = x^2',
            color: DEFAULT_COLORS[0],
            visible: true,
            lineStyle: 'solid',
            lineWidth: 2.5,
          },
        ],
        updatedAt: Date.now(),
      });
    }
  }, [pushUndoState, workspace]);

  // Load Imported Workspace
  const loadWorkspace = useCallback((doc: WorkspaceDocument) => {
    pushUndoState(workspace);
    setWorkspace(doc);
  }, [pushUndoState, workspace]);

  return {
    workspace,
    scope,
    saveStatus,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
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
  };
}
