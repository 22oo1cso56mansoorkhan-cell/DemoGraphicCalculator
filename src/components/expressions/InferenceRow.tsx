import React, { useEffect } from 'react';
import { Trash2, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { InferenceItem, TableItem } from '../../types/graphlab';
import { calculateLinearRegression } from '../../utils/mathEngine';

interface InferenceRowProps {
  index: number;
  item: InferenceItem;
  tables: TableItem[];
  onUpdate: (updates: Partial<InferenceItem>) => void;
  onDelete: () => void;
}

export const InferenceRow: React.FC<InferenceRowProps> = ({
  index,
  item,
  tables,
  onUpdate,
  onDelete,
}) => {
  // Re-calculate linear regression whenever linked table data updates
  useEffect(() => {
    const targetTable = tables.find((t) => t.id === item.tableId) || tables[0];
    if (targetTable) {
      const points = targetTable.rows
        .map((r) => ({
          x: typeof r.x === 'number' ? r.x : parseFloat(String(r.x)),
          y: typeof r.y === 'number' ? r.y : parseFloat(String(r.y)),
        }))
        .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

      const fit = calculateLinearRegression(points);
      if (fit) {
        onUpdate({
          slope: fit.slope,
          intercept: fit.intercept,
          rSquared: fit.rSquared,
          correlation: fit.correlation,
          error: undefined,
        });
      } else {
        onUpdate({
          slope: undefined,
          intercept: undefined,
          rSquared: undefined,
          error: 'Need at least 2 valid data points to perform linear regression.',
        });
      }
    }
  }, [tables, item.tableId]);

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

          <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>

          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
            Linear Regression Fit
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onUpdate({ visible: !item.visible })}
            className="p-1 rounded text-slate-400 hover:text-slate-700"
            title={item.visible ? 'Hide Fit' : 'Show Fit'}
          >
            {item.visible ? <Eye className="w-3.5 h-3.5 text-purple-600" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded text-slate-400 hover:text-rose-600"
            title="Delete Regression"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="ml-7 space-y-1.5 text-xs">
        {/* Table Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px]">Dataset:</span>
          <select
            value={item.tableId}
            onChange={(e) => onUpdate({ tableId: e.target.value })}
            className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
          >
            {tables.map((tbl) => (
              <option key={tbl.id} value={tbl.id}>
                {tbl.name} ({tbl.rows.length} rows)
              </option>
            ))}
          </select>
        </div>

        {/* Model Output */}
        {item.slope !== undefined && item.intercept !== undefined ? (
          <div className="p-2.5 rounded-lg bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-1 font-mono text-[11px]">
            <div className="font-bold text-purple-900 dark:text-purple-200 text-xs">
              y = {item.slope}x {item.intercept >= 0 ? '+' : '-'} {Math.abs(item.intercept)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-purple-700 dark:text-purple-300 text-[10px]">
              <div>R² (Fit): <span className="font-bold">{item.rSquared}</span></div>
              <div>r (Correlation): <span className="font-bold">{item.correlation}</span></div>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-amber-600 italic">
            {item.error || 'Select a table with coordinate values to compute regression.'}
          </div>
        )}
      </div>
    </div>
  );
};
