import React from 'react';
import { Search, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
}
export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  onSearch,
  actions
}: DataTableProps<T>) {
  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            size={18} />
          
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="input-field pl-10 py-1.5 text-sm" />
          
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-[var(--text-secondary)] uppercase bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  className="rounded border-[var(--border-color)] text-brand-600 focus:ring-brand-500" />
                
              </th>
              {columns.map((col, i) =>
              <th
                key={i}
                className={`px-4 py-3 font-medium ${col.className || ''}`}>
                
                  {col.header}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ?
            <tr>
                <td
                colSpan={columns.length + 1}
                className="px-4 py-8 text-center text-[var(--text-secondary)]">
                
                  No data available
                </td>
              </tr> :

            data.map((row, rowIndex) =>
            <tr
              key={rowIndex}
              className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/50 transition-colors">
              
                  <td className="px-4 py-3">
                    <input
                  type="checkbox"
                  className="rounded border-[var(--border-color)] text-brand-600 focus:ring-brand-500" />
                
                  </td>
                  {columns.map((col, colIndex) =>
              <td
                key={colIndex}
                className={`px-4 py-3 text-[var(--text-primary)] ${col.className || ''}`}>
                
                      {typeof col.accessor === 'function' ?
                col.accessor(row) :
                String(row[col.accessor] as any)}
                    </td>
              )}
                </tr>
            )
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-[var(--border-color)] flex items-center justify-between text-sm text-[var(--text-secondary)]">
        <div>
          Showing{' '}
          <span className="font-medium text-[var(--text-primary)]">1</span> to{' '}
          <span className="font-medium text-[var(--text-primary)]">
            {Math.min(10, data.length)}
          </span>{' '}
          of{' '}
          <span className="font-medium text-[var(--text-primary)]">
            {data.length}
          </span>{' '}
          results
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-1 rounded hover:bg-[var(--bg-secondary)] disabled:opacity-50"
            disabled>
            
            <ChevronLeft size={18} />
          </button>
          <button className="p-1 rounded hover:bg-[var(--bg-secondary)]">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>);

}