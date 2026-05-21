import React from 'react';

export default function ChartCard({ title, children, footer }) {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-dark-800/80 shadow-2xl relative flex flex-col gap-4">
      {/* Top ambient line */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>
      
      <h3 className="text-base font-bold text-white">{title}</h3>
      
      <div className="flex-1 flex items-center justify-center min-h-[220px]">
        {children}
      </div>

      {footer && (
        <div className="border-t border-dark-800/60 pt-4 text-xs text-dark-400">
          {footer}
        </div>
      )}
    </div>
  );
}
