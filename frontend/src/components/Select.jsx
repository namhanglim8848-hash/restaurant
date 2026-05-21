import React from 'react';

export default function Select({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  error, 
  required = false,
  className = '',
  ...props 
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-bold uppercase tracking-wider text-dark-400">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-dark-950/60 border rounded-xl px-4 py-2.5 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${
          error ? 'border-red-500/50 focus:ring-red-500/30' : 'border-dark-800 focus:border-brand-500/50'
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-dark-900 text-dark-100">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-red-400 font-medium mt-0.5">{error}</span>
      )}
    </div>
  );
}
