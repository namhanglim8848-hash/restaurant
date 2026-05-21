import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      
      {/* Dynamic Floating Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl flex items-center justify-between border backdrop-blur-md transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in cursor-pointer ${
              t.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
                : t.type === 'error'
                ? 'bg-red-950/90 border-red-500/30 text-red-300'
                : 'bg-brand-950/90 border-brand-500/30 text-brand-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {t.type === 'success' ? '✓' : t.type === 'error' ? '⚠' : 'ℹ'}
              </span>
              <p className="text-sm font-medium">{t.message}</p>
            </div>
            <button className="text-xs opacity-50 hover:opacity-100 ml-4">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
