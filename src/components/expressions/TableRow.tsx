import React, { useState } from 'react';
import { Trash2, Plus, Eye, EyeOff, Table as TableIcon } from 'lucide-react';
import { TableItem, DEFAULT_COLORS } from '../../types/graphlab';

interface TableRowProps {
  index: number;
  item: TableItem;
  onUpdate: (updates: Partial<TableItem>) => void;
  onDelete: () => void;
}

export const TableRow: React.FC<TableRowProps> = ({ index, item, onUpdate, onDelete }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleCellChange = (rowIndex: number, col: 'x' | 'y', valStr: string) => {
    const nextRows = [...item.rows];
    nextRows[rowIndex] = { ...nextRows[rowIndex], [col]: valStr };
    onUpdate({ rows: nextRows });
  };

  const handleAddRow = () => {
    const nextRows = [
      ...item.rows,
      { id: `r-${Date.now()}-${Math.random()}`, x: '', y: '' },
    ];
    onUpdate({ rows: nextRows });
  };

  const handleRemoveRow = (rIdx: number) => {
    if (item.rows.length <= 1) return;
    const nextRows = item.rows.filter((_, i) => i !== rIdx);
    onUpdate({ rows: nextRows });
  };

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

          {/* Color button */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-5 h-5 rounded-md flex items-center justify-center border border-black/10 shadow-2xs hover:scale-105 transition-transform"
              style={{ backgroundColor: item.color }}
              title="Change Table Color"
            />
            {showColorPicker && (
              <div
                className="absolute left-0 top-7 z-30 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-36 grid grid-cols-4 gap-1.5"
                onMouseLeave={() => setShowColorPicker(false)}
              >
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onUpdate({ color: c });
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded-md hover:scale-110"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-medium text-xs text-slate-800 dark:text-slate-200">
            <TableIcon className="w-3.5 h-3.5 text-blue-600" />
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-28 text-xs font-semibold"
            />
          </div>
        </div>

        {/* Display Toggles & Delete */}
        <div className="flex items-center gap-1.5 text-xs">
          <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={item.connectLines}
              onChange={(e) => onUpdate({ connectLines: e.target.checked })}
              className="rounded text-blue-600 focus:ring-0"
            />
            <span>Connect</span>
          </label>

          <button
            onClick={() => onUpdate({ visible: !item.visible })}
            className="p-1 rounded text-slate-400 hover:text-slate-700"
            title={item.visible ? 'Hide Table' : 'Show Table'}
          >
            {item.visible ? <Eye className="w-3.5 h-3.5 text-blue-600" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onDelete}
            className="p-1 rounded text-slate-400 hover:text-rose-600"
            title="Delete Table"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Spreadsheet grid */}
      <div className="ml-7 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden max-w-sm">
        <table className="w-full text-xs font-mono">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="py-1 px-3 w-1/2 text-center font-bold">{item.xLabel}</th>
              <th className="py-1 px-3 w-1/2 text-center font-bold">{item.yLabel}</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {item.rows.map((row, rIdx) => (
              <tr key={row.id}>
                <td className="p-1 border-r border-slate-100 dark:border-slate-800">
                  <input
                    type="text"
                    value={row.x}
                    onChange={(e) => handleCellChange(rIdx, 'x', e.target.value)}
                    className="w-full text-center bg-transparent outline-none py-0.5 text-slate-900 dark:text-slate-100"
                    placeholder="x"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="text"
                    value={row.y}
                    onChange={(e) => handleCellChange(rIdx, 'y', e.target.value)}
                    className="w-full text-center bg-transparent outline-none py-0.5 text-slate-900 dark:text-slate-100"
                    placeholder="y"
                  />
                </td>
                <td className="p-1 text-center">
                  {item.rows.length > 1 && (
                    <button
                      onClick={() => handleRemoveRow(rIdx)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                      title="Remove Row"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleAddRow}
        className="ml-7 self-start py-1 px-2.5 rounded-md border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium flex items-center gap-1 transition-colors"
      >
        <Plus className="w-3 h-3" />
        <span>Add Row</span>
      </button>
    </div>
  );
};
