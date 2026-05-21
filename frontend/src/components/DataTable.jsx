import React from 'react';
import Badge from './Badge';

export default function DataTable({ 
  headers = [], 
  items = [], 
  loading = false, 
  onSearch, 
  searchPlaceholder = 'Search records...', 
  actions, 
  emptyMessage = 'No records found.' 
}) {
  return (
    <div className="space-y-4">
      {/* Search Header */}
      {onSearch && (
        <div className="relative max-w-sm">
          <input
            type="text"
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-dark-900/60 border border-dark-800 rounded-xl pl-10 pr-4 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500/50"
          />
          <span className="absolute left-3 top-2.5 text-dark-500 text-sm">🔍</span>
        </div>
      )}

      {/* Table Panel */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-dark-800/80 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-dark-900/80 border-b border-dark-800 text-dark-400 font-bold tracking-wider text-xs uppercase">
                {headers.map((h, i) => (
                  <th key={i} className="px-6 py-4">{h}</th>
                ))}
                {actions && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50 text-dark-300">
              {loading ? (
                <tr>
                  <td colSpan={headers.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <span className="h-6 w-6 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></span>
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-dark-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                items.map((item, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-dark-900/30 transition-colors">
                    {headers.map((h, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 font-medium text-dark-200">
                        {item[h.toLowerCase().replace(/ /g, '_')] !== undefined 
                          ? (React.isValidElement(item[h.toLowerCase().replace(/ /g, '_')])
                             ? item[h.toLowerCase().replace(/ /g, '_')]
                             : String(item[h.toLowerCase().replace(/ /g, '_')]))
                          : item[h] || 'N/A'}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {actions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
