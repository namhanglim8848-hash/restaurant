import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col justify-between py-12 px-4 relative overflow-hidden bg-dark-950">
      {/* Dynamic Background lighting glow meshes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Header Bar */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between z-10 border-b border-dark-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg border border-brand-300/15">
            <span className="text-base font-bold text-white">G</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Growstro SaaS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-bold text-dark-300 hover:text-white transition-all">
            Workspace Login
          </Link>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-dark-400 font-medium">Nepal Cluster Online</span>
        </div>
      </header>

      {/* Main Hero Showcase */}
      <main className="max-w-4xl mx-auto w-full my-auto text-center z-10 flex flex-col items-center py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6">
          🇳🇵 Nepal's Premier Isolated Seating & Billing Platform
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-white">
          Empower Your Restaurant with <span className="glow-text">Growstro SaaS</span>
        </h1>
        
        <p className="text-dark-300 text-lg max-w-2xl mb-12">
          Provision an isolated PostgreSQL database, secure your custom subdomain handle, and settled bills seamlessly. Fully local, lightning-fast, and tax compliant.
        </p>

        {/* CTA Launch Section */}
        <div className="w-full max-w-md bg-dark-900/40 p-1 border border-dark-800 rounded-2xl flex flex-col items-center gap-6 shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/35 to-transparent"></div>
          
          <div className="p-8 space-y-6 w-full text-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-dark-400">Get Started in Seconds</h3>
            <p className="text-xs text-dark-300">
              Zero manual setups. Provision your dynamic subdomain and instantly configure live menu POS billing now.
            </p>
            <Link
              to="/register"
              className="w-full neon-btn py-3.5 flex items-center justify-center gap-2 font-bold text-center text-sm shadow-xl"
            >
              Launch Your Isolated Business Workspace ⚡
            </Link>
          </div>
        </div>

        {/* Features Checklist Grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-20 text-left">
          <div className="glass-panel p-6 rounded-2xl border border-dark-900 hover:border-brand-500/20 transition-all">
            <span className="text-2xl">🛡️</span>
            <h4 className="text-sm font-bold text-white mt-3">PostgreSQL Isolation</h4>
            <p className="text-xs text-dark-400 mt-2">
              Every restaurant is allocated its own database partition. Secure, isolated, and scalable.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-dark-900 hover:border-brand-500/20 transition-all">
            <span className="text-2xl">🇳🇵</span>
            <h4 className="text-sm font-bold text-white mt-3">Nepal Fiscal Compliance</h4>
            <p className="text-xs text-dark-400 mt-2">
              Automatic 13% standard VAT rules, PAN audits logging, and instant eSewa Sandbox gateways checkout.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-dark-900 hover:border-brand-500/20 transition-all">
            <span className="text-2xl">💬</span>
            <h4 className="text-sm font-bold text-white mt-3">Automated Reports</h4>
            <p className="text-xs text-dark-400 mt-2">
              Dispatches comprehensive end-of-day restaurant sales reports directly to your mobile phone via WhatsApp.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto w-full text-center z-10 border-t border-dark-900/60 pt-6">
        <p className="text-xs text-dark-500">© 2026 Growstro SaaS. Designed for Nepalese Entrepreneurs. Powered by Vite & Tailwind CSS.</p>
      </footer>
    </div>
  );
}
