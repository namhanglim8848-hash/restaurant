import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      {/* Modal Dialog */}
      <div className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-fade-in">
        {/* Glow Line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>

        {/* Header */}
        <div className="p-6 border-b border-dark-800/80 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-dark-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-dark-300">
          {children}
        </div>
      </div>
    </div>
  );
}
