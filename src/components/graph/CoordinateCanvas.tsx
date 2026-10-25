import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import {
  GraphItem,
  Viewport,
  GraphSettings,
  ExpressionItem,
} from '../../types/graphlab';
import {
  parseExpressionString,
  sampleFunctionSegments,
  contourImplicit,
  Scope,
} from '../../utils/mathEngine';

interface CoordinateCanvasProps {
  items: GraphItem[];
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  onPointDrag?: (pointId: string, newCoord: { x: number; y: number }) => void;
  settings: GraphSettings;
  scope: Scope;
  isDark?: boolean;
}

export const CoordinateCanvas: React.FC<CoordinateCanvasProps> = ({
  items,
  viewport,
  onViewportChange,
  onPointDrag,
  settings,
  scope,
  isDark = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dragging / Panning State
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

  // Active Draggable Point State
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);

  // Hover & Crosshair State
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; cx: number; cy: number } | null>(null);

  // Loaded image cache
  const imageElementsRef = useRef<Record<string, HTMLImageElement>>({});

  // Reset Viewport
  const handleResetViewport = () => {
    onViewportChange({
      xMin: -10,
      xMax: 10,
      yMin: -7,
      yMax: 7,
    });
  };

  // Zoom centered on viewport center
  const handleZoom = (factor: number) => {
    const xCenter = (viewport.xMin + viewport.xMax) / 2;
    const yCenter = (viewport.yMin + viewport.yMax) / 2;
    const xSpan = (viewport.xMax - viewport.xMin) * factor;
    const ySpan = (viewport.yMax - viewport.yMin) * factor;

    onViewportChange({
      xMin: xCenter - xSpan / 2,
      xMax: xCenter + xSpan / 2,
      yMin: yCenter - ySpan / 2,
      yMax: yCenter + ySpan / 2,
    });
  };

  // Preload any image items
  useEffect(() => {
    items.forEach((item) => {
      if (item.type === 'image' && item.url && !imageElementsRef.current[item.id]) {
        const img = new Image();
        img.src = item.url;
        img.onload = () => {
          imageElementsRef.current[item.id] = img;
        };
      }
    });
  }, [items]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Coordinate conversions
    const toCanvasX = (x: number) => ((x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - viewport.yMin) / (viewport.yMax - viewport.yMin)) * height;
    const toDataX = (cx: number) => viewport.xMin + (cx / width) * (viewport.xMax - viewport.xMin);
    const toDataY = (cy: number) => viewport.yMin + ((height - cy) / height) * (viewport.yMax - viewport.yMin);

    // 1. Clear background
    ctx.fillStyle = isDark ? '#0b0f19' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Grid & Axes
    if (settings.showGrid) {
      const xRange = viewport.xMax - viewport.xMin;
      const yRange = viewport.yMax - viewport.yMin;

      // Adaptive intervals based on zoom
      const getNiceInterval = (range: number, targetTicks: number = 8) => {
        const rough = range / targetTicks;
        const mag = Math.pow(10, Math.floor(Math.log10(rough)));
        const normalized = rough / mag;
        if (normalized < 1.5) return 1 * mag;
        if (normalized < 3.5) return 2 * mag;
        if (normalized < 7.5) return 5 * mag;
        return 10 * mag;
      };

      const xStep = getNiceInterval(xRange, 10);
      const yStep = getNiceInterval(yRange, 8);
      const minorXStep = xStep / 5;
      const minorYStep = yStep / 5;

      // Minor grid lines
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = isDark ? '#1a2234' : '#f1f5f9';

      for (let x = Math.floor(viewport.xMin / minorXStep) * minorXStep; x <= viewport.xMax; x += minorXStep) {
        const cx = toCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();
      }
      for (let y = Math.floor(viewport.yMin / minorYStep) * minorYStep; y <= viewport.yMax; y += minorYStep) {
        const cy = toCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();
      }

      // Major grid lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? '#26334d' : '#e2e8f0';

      for (let x = Math.floor(viewport.xMin / xStep) * xStep; x <= viewport.xMax; x += xStep) {
        const cx = toCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();
      }
      for (let y = Math.floor(viewport.yMin / yStep) * yStep; y <= viewport.yMax; y += yStep) {
        const cy = toCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();
      }

      // Numeric Tick Labels
      if (settings.showNumbers) {
        ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.font = '11px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const yZeroCanvas = Math.max(15, Math.min(height - 20, toCanvasY(0)));

        for (let x = Math.floor(viewport.xMin / xStep) * xStep; x <= viewport.xMax; x += xStep) {
          if (Math.abs(x) < 1e-9) continue;
          const cx = toCanvasX(x);
          const label = Math.abs(x) >= 1000 || (Math.abs(x) < 0.01 && x !== 0) ? x.toExponential(1) : Math.round(x * 100) / 100;
          ctx.fillText(`${label}`, cx, yZeroCanvas + 4);
        }

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const xZeroCanvas = Math.max(35, Math.min(width - 15, toCanvasX(0)));

        for (let y = Math.floor(viewport.yMin / yStep) * yStep; y <= viewport.yMax; y += yStep) {
          if (Math.abs(y) < 1e-9) continue;
          const cy = toCanvasY(y);
          const label = Math.abs(y) >= 1000 || (Math.abs(y) < 0.01 && y !== 0) ? y.toExponential(1) : Math.round(y * 100) / 100;
          ctx.fillText(`${label}`, xZeroCanvas - 6, cy);
        }
      }
    }

    // 3. Draw Main Axes (x=0, y=0)
    if (settings.showAxes) {
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = isDark ? '#475569' : '#64748b';

      // X-Axis (y=0)
      if (viewport.yMin <= 0 && viewport.yMax >= 0) {
        const cy0 = toCanvasY(0);
        ctx.beginPath();
        ctx.moveTo(0, cy0);
        ctx.lineTo(width, cy0);
        ctx.stroke();
      }

      // Y-Axis (x=0)
      if (viewport.xMin <= 0 && viewport.xMax >= 0) {
        const cx0 = toCanvasX(0);
        ctx.beginPath();
        ctx.moveTo(cx0, 0);
        ctx.lineTo(cx0, height);
        ctx.stroke();
      }

      // Origin label (0, 0)
      if (viewport.xMin < 0 && viewport.xMax > 0 && viewport.yMin < 0 && viewport.yMax > 0) {
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('0', toCanvasX(0) - 5, toCanvasY(0) + 4);
      }
    }

    // 4. Draw Uploaded Images
    items.forEach((item) => {
      if (item.type === 'image' && item.visible && imageElementsRef.current[item.id]) {
        const img = imageElementsRef.current[item.id];
        const imgX = toCanvasX(item.centerX - item.width / 2);
        const imgY = toCanvasY(item.centerY + item.height / 2);
        const imgW = (item.width / (viewport.xMax - viewport.xMin)) * width;
        const imgH = (item.height / (viewport.yMax - viewport.yMin)) * height;

        ctx.save();
        ctx.globalAlpha = item.opacity;
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
        ctx.restore();
      }
    });

    // 5. Draw Mathematical Expressions
    items.forEach((item) => {
      if (item.type !== 'expression' || !item.visible) return;

      const parsed = parseExpressionString(item.rawText, scope);

      ctx.save();
      ctx.strokeStyle = item.color;
      ctx.fillStyle = item.color;
      ctx.lineWidth = item.lineWidth || 2.5;

      if (item.lineStyle === 'dashed') ctx.setLineDash([6, 4]);
      else if (item.lineStyle === 'dotted') ctx.setLineDash([2, 3]);
      else ctx.setLineDash([]);

      // Case A: Explicit function y = f(x)
      if (parsed.type === 'function' && parsed.rpn) {
        const segments = sampleFunctionSegments(
          parsed.rpn,
          viewport.xMin,
          viewport.xMax,
          viewport.yMin,
          viewport.yMax,
          width > 800 ? 800 : 500,
          scope,
          settings.angleMode
        );

        segments.forEach((seg) => {
          if (seg.length === 0) return;
          ctx.beginPath();
          ctx.moveTo(toCanvasX(seg[0].x), toCanvasY(seg[0].y));
          for (let i = 1; i < seg.length; i++) {
            ctx.lineTo(toCanvasX(seg[i].x), toCanvasY(seg[i].y));
          }
          ctx.stroke();
        });
      }

      // Case B: Implicit curve F(x, y) = 0
      else if (parsed.type === 'implicit' && parsed.implicitRpn) {
        const contourLines = contourImplicit(
          parsed.implicitRpn,
          viewport.xMin,
          viewport.xMax,
          viewport.yMin,
          viewport.yMax,
          80,
          60,
          scope,
          settings.angleMode
        );

        ctx.beginPath();
        contourLines.forEach((l) => {
          ctx.moveTo(toCanvasX(l.x1), toCanvasY(l.y1));
          ctx.lineTo(toCanvasX(l.x2), toCanvasY(l.y2));
        });
        ctx.stroke();
      }

      // Case C: Inequality
      else if (parsed.type === 'inequality' && parsed.rpn) {
        const segments = sampleFunctionSegments(
          parsed.rpn,
          viewport.xMin,
          viewport.xMax,
          viewport.yMin,
          viewport.yMax,
          width > 800 ? 800 : 500,
          scope,
          settings.angleMode
        );

        // Draw boundary line (dashed for strict <, >, solid for <=, >=)
        if (parsed.relation === '<' || parsed.relation === '>') {
          ctx.setLineDash([6, 4]);
        }
        segments.forEach((seg) => {
          if (seg.length === 0) return;
          ctx.beginPath();
          ctx.moveTo(toCanvasX(seg[0].x), toCanvasY(seg[0].y));
          for (let i = 1; i < seg.length; i++) {
            ctx.lineTo(toCanvasX(seg[i].x), toCanvasY(seg[i].y));
          }
          ctx.stroke();
        });

        // Translucent fill
        ctx.save();
        ctx.fillStyle = item.color;
        ctx.globalAlpha = 0.12;
        segments.forEach((seg) => {
          if (seg.length === 0) return;
          ctx.beginPath();
          ctx.moveTo(toCanvasX(seg[0].x), toCanvasY(seg[0].y));
          for (let i = 1; i < seg.length; i++) {
            ctx.lineTo(toCanvasX(seg[i].x), toCanvasY(seg[i].y));
          }
          const yBoundary = parsed.relation?.includes('>') ? toCanvasY(viewport.yMax) : toCanvasY(viewport.yMin);
          ctx.lineTo(toCanvasX(seg[seg.length - 1].x), yBoundary);
          ctx.lineTo(toCanvasX(seg[0].x), yBoundary);
          ctx.closePath();
          ctx.fill();
        });
        ctx.restore();
      }

      // Case D: Draggable Point (A = (x, y))
      if (item.isPoint && item.pointCoord) {
        const px = toCanvasX(item.pointCoord.x);
        const py = toCanvasY(item.pointCoord.y);

        if (px >= -20 && px <= width + 20 && py >= -20 && py <= height + 20) {
          // Point circle
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fillStyle = item.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Coordinate label
          ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          const name = item.pointLabel || 'P';
          ctx.fillText(
            `${name}(${item.pointCoord.x.toFixed(1)}, ${item.pointCoord.y.toFixed(1)})`,
            px + 8,
            py - 4
          );
        }
      }

      ctx.restore();
    });

    // 6. Draw Tables (Scatter points and connect lines)
    items.forEach((item) => {
      if (item.type !== 'table' || !item.visible) return;

      const points = item.rows
        .map((r) => ({
          x: typeof r.x === 'number' ? r.x : parseFloat(String(r.x)),
          y: typeof r.y === 'number' ? r.y : parseFloat(String(r.y)),
        }))
        .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

      ctx.save();
      ctx.strokeStyle = item.color;
      ctx.fillStyle = item.color;
      ctx.lineWidth = 2;

      // Connected lines
      if (item.connectLines && points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(points[0].x), toCanvasY(points[0].y));
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(toCanvasX(points[i].x), toCanvasY(points[i].y));
        }
        ctx.stroke();
      }

      // Scatter Points
      if (item.showPoints) {
        points.forEach((p) => {
          const cx = toCanvasX(p.x);
          const cy = toCanvasY(p.y);
          ctx.beginPath();
          ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
      ctx.restore();
    });

    // 7. Draw Inference / Regression Lines
    items.forEach((item) => {
      if (item.type !== 'inference' || !item.visible) return;
      if (item.slope === undefined || item.intercept === undefined) return;

      const m = item.slope;
      const b = item.intercept;
      const x1 = viewport.xMin;
      const y1 = m * x1 + b;
      const x2 = viewport.xMax;
      const y2 = m * x2 + b;

      ctx.save();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
      ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
      ctx.stroke();
      ctx.restore();
    });

    // 8. Interactive Hover Crosshairs and Coordinate Readout
    if (hoverCoord && !isPanning && !draggedPointId) {
      const { cx, cy, x, y } = hoverCoord;

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)';
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      // Tooltip pill
      const label = `(${Math.round(x * 100) / 100}, ${Math.round(y * 100) / 100})`;
      ctx.font = '11px ui-monospace, monospace';
      const textWidth = ctx.measureText(label).width;
      const boxW = textWidth + 14;
      const boxH = 22;
      const boxX = Math.min(width - boxW - 10, Math.max(10, cx + 12));
      const boxY = Math.min(height - boxH - 10, Math.max(10, cy - 28));

      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, boxX + boxW / 2, boxY + boxH / 2);

      ctx.restore();
    }
  }, [items, viewport, settings, scope, isDark, hoverCoord, isPanning, draggedPointId]);

  // Pointer Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const dataX = viewport.xMin + (cx / rect.width) * (viewport.xMax - viewport.xMin);
    const dataY = viewport.yMin + ((rect.height - cy) / rect.height) * (viewport.yMax - viewport.yMin);

    // Check if clicked near an interactive point
    const hitRadius = 15; // pixels
    let hitPoint: ExpressionItem | null = null;

    items.forEach((it) => {
      if (it.type === 'expression' && it.isPoint && it.pointCoord && it.isDraggable !== false) {
        const px = ((it.pointCoord.x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * rect.width;
        const py = rect.height - ((it.pointCoord.y - viewport.yMin) / (viewport.yMax - viewport.yMin)) * rect.height;
        const dist = Math.hypot(cx - px, cy - py);
        if (dist <= hitRadius) {
          hitPoint = it;
        }
      }
    });

    if (hitPoint) {
      setDraggedPointId((hitPoint as ExpressionItem).id);
      return;
    }

    // Otherwise initiate pan
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const dataX = viewport.xMin + (cx / rect.width) * (viewport.xMax - viewport.xMin);
    const dataY = viewport.yMin + ((rect.height - cy) / rect.height) * (viewport.yMax - viewport.yMin);

    // If dragging a point
    if (draggedPointId && onPointDrag) {
      const snappedX = Math.round(dataX * 10) / 10;
      const snappedY = Math.round(dataY * 10) / 10;
      onPointDrag(draggedPointId, { x: snappedX, y: snappedY });
      return;
    }

    // If panning
    if (isPanning && panStart) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPanStart({ x: e.clientX, y: e.clientY });

      const xSpan = viewport.xMax - viewport.xMin;
      const ySpan = viewport.yMax - viewport.yMin;
      const xDelta = (dx / rect.width) * xSpan;
      const yDelta = (dy / rect.height) * ySpan;

      onViewportChange({
        xMin: viewport.xMin - xDelta,
        xMax: viewport.xMax - xDelta,
        yMin: viewport.yMin + yDelta,
        yMax: viewport.yMax + yDelta,
      });
      return;
    }

    // Hover readout
    setHoverCoord({
      cx,
      cy,
      x: dataX,
      y: dataY,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setPanStart(null);
    setDraggedPointId(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const mouseX = viewport.xMin + (cx / rect.width) * (viewport.xMax - viewport.xMin);
    const mouseY = viewport.yMin + ((rect.height - cy) / rect.height) * (viewport.yMax - viewport.yMin);

    const factor = e.deltaY > 0 ? 1.15 : 0.85;

    onViewportChange({
      xMin: mouseX - (mouseX - viewport.xMin) * factor,
      xMax: mouseX + (viewport.xMax - mouseX) * factor,
      yMin: mouseY - (mouseY - viewport.yMin) * factor,
      yMax: mouseY + (viewport.yMax - mouseY) * factor,
    });
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-white dark:bg-slate-950 flex flex-col">
      {/* Floating Canvas Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => handleZoom(0.8)}
          title="Zoom In (+)"
          aria-label="Zoom In"
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(1.25)}
          title="Zoom Out (-)"
          aria-label="Zoom Out"
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetViewport}
          title="Default View (Home)"
          aria-label="Reset View"
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Coordinate Canvas */}
      <div className="flex-1 w-full h-full relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsPanning(false);
            setDraggedPointId(null);
            setHoverCoord(null);
          }}
          onWheel={handleWheel}
        />
      </div>

      {/* Subtle Coordinate Origin Readout */}
      <div className="absolute bottom-2 right-3 z-10 text-[10px] text-slate-400 dark:text-slate-600 font-mono pointer-events-none">
        x: [{viewport.xMin.toFixed(1)}, {viewport.xMax.toFixed(1)}] • y: [{viewport.yMin.toFixed(1)}, {viewport.yMax.toFixed(1)}]
      </div>
    </div>
  );
};
