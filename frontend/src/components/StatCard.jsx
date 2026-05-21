import React from 'react';

export default function StatCard({ label, value, subtext, icon, trend }) {
  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      {/* Background Icon Watermark */}
      {icon && (
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="text-6xl font-bold font-mono">{icon}</span>
        </div>
      )}
      
      <p className="text-xs font-bold uppercase tracking-wider text-dark-400 mb-2">{label}</p>
      
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-extrabold text-white">{value}</p>
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
      
      {subtext && <p className="text-xs text-dark-400 mt-2">{subtext}</p>}
    </div>
  );
}
