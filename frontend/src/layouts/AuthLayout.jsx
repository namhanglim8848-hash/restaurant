import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blurred decorative glowing spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-xl shadow-brand-500/20 mb-3 border border-brand-300/20">
            <span className="text-xl font-bold text-white tracking-wider">G</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight glow-text">Growstro</h1>
          <p className="text-dark-400 text-sm mt-1">Multi-Tenant SaaS for Nepal-based Businesses</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-dark-800/80 shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"></div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
