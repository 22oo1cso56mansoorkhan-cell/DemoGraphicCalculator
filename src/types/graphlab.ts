export type ItemType = 'expression' | 'note' | 'table' | 'inference' | 'folder' | 'image';

export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  isPlaying: boolean;
  speed: number; // 0.5, 1, 2, 4
  direction: 1 | -1;
  loopMode: 'loop' | 'pingpong'; // 'loop' (restarts from min) or 'pingpong' (reverses direction)
}

export interface ExpressionItem {
  id: string;
  type: 'expression';
  rawText: string; // e.g. "y = a*x^2 + b", "f(x) = sin(x)", "a = 2", "x^2 + y^2 = 25", "y > 2x - 1"
  color: string;
  visible: boolean;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  lineWidth: number;
  folderId?: string; // If nested in a folder

  // Detected variable assignment slider
  isVariable?: boolean;
  variableName?: string;
  variableValue?: number;
  slider?: SliderConfig;

  // Geometry / Draggable Point
  isPoint?: boolean;
  pointCoord?: { x: number; y: number };
  pointLabel?: string;
  isDraggable?: boolean;

  // Evaluation Status
  error?: string;
  parsedType?: 'function' | 'implicit' | 'inequality' | 'variable' | 'point' | 'parametric' | 'value' | 'unknown';
}

export interface NoteItem {
  id: string;
  type: 'note';
  text: string;
  folderId?: string;
}

export interface TableRowData {
  id: string;
  x: number | string;
  y: number | string;
}

export interface TableItem {
  id: string;
  type: 'table';
  name: string;
  xLabel: string;
  yLabel: string;
  rows: TableRowData[];
  color: string;
  visible: boolean;
  showPoints: boolean;
  connectLines: boolean;
  folderId?: string;
}

export interface InferenceItem {
  id: string;
  type: 'inference';
  tableId: string;
  equation: string; // e.g. "y ~ m*x + b"
  color: string;
  visible: boolean;
  slope?: number;
  intercept?: number;
  rSquared?: number;
  correlation?: number;
  error?: string;
  folderId?: string;
}

export interface FolderItem {
  id: string;
  type: 'folder';
  title: string;
  collapsed: boolean;
  visible: boolean;
  folderId?: string;
}

export interface ImageItem {
  id: string;
  type: 'image';
  name: string;
  url: string;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
  folderId?: string;
}

export type GraphItem =
  | ExpressionItem
  | NoteItem
  | TableItem
  | InferenceItem
  | FolderItem
  | ImageItem;

export interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface GraphSettings {
  angleMode: 'radians' | 'degrees';
  showGrid: boolean;
  showAxes: boolean;
  showNumbers: boolean;
  showTickMarks: boolean;
  xAxisLabel: string;
  yAxisLabel: string;
  equalAspect: boolean;
  theme: 'light' | 'dark';
}

export interface WorkspaceDocument {
  id: string;
  title: string;
  items: GraphItem[];
  viewport: Viewport;
  settings: GraphSettings;
  updatedAt: number;
}

export const DEFAULT_COLORS = [
  '#2563eb', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#9333ea', // Purple
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#db2777', // Pink
  '#d97706', // Amber
];
