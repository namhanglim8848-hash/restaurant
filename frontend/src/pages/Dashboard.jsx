import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { tenantSlug } = useAuth();

  useEffect(() => {
    const fetchDashboardOverview = async () => {
      try {
        const response = await analyticsApi.getOverview();
        setMetrics(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch real-time workspace analytics overview.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <span className="h-8 w-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></span>
        <p className="text-sm text-dark-400">Syncing with dynamic PostgreSQL partition...</p>
      </div>
    );
  }

  // Calculate fallbacks cleanly
  const todaySales = metrics?.today_sales ?? 0;
  const monthSales = metrics?.this_month_sales ?? 0;
  const totalOrders = metrics?.total_orders ?? 0;
  const netRevenue = metrics?.net_revenue ?? 0;

  return (
    <div className="space-y-8 relative animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-800/40 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome to <span className="glow-text capitalize">{tenantSlug || 'Growstro'}</span> Workspace!
          </h1>
          <p className="text-sm text-dark-400 mt-1">Real-time point of sales, automated KOT, billing, and VAT audits.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
          Active Database: <span className="font-mono text-white select-all">tenant_{tenantSlug}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-5 py-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Today's Revenue"
          value={`Rs. ${Number(todaySales).toFixed(2)}`}
          subtext="📊 Refreshed in real-time"
          icon="💸"
        />

        <StatCard
          label="Monthly Revenue"
          value={`Rs. ${Number(monthSales).toFixed(2)}`}
          subtext="📈 Cumulative 30-day stats"
          icon="📊"
        />

        <StatCard
          label="Total Workspace Orders"
          value={String(totalOrders)}
          subtext="🛒 Dynamic tickets completed"
          icon="📦"
        />

        <StatCard
          label="Net Earnings"
          value={`Rs. ${Number(netRevenue).toFixed(2)}`}
          subtext="🇳🇵 Tax and discounts applied"
          icon="💰"
        />
      </div>

      {/* Grid for lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Invoices & Bills */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-xl relative">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>
          <h3 className="text-base font-bold text-white mb-4">📢 Nepalese Fiscal Compliance (VAT/PAN)</h3>
          
          <div className="text-sm text-dark-300 space-y-4">
            <p>
              Growstro is engineered under standard IRS Nepalese tax rules. Automated VAT (Value Added Tax) partitions isolate bills at 13% tax thresholds automatically whenever enabled inside Settings.
            </p>
            <div className="bg-dark-950/60 rounded-xl p-4 border border-dark-800/80 font-mono text-xs text-dark-400 space-y-2">
              <div><span className="text-white">DBMS Connection:</span> PostgreSQL 15+ (Isolated Schema)</div>
              <div><span className="text-white">Active Partition ID:</span> pgsql_tenant_{tenantSlug}</div>
              <div><span className="text-white">VAT Standard Rate:</span> 13.00%</div>
              <div><span className="text-white">eSewa Payments:</span> Production Sandbox enabled</div>
            </div>
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-xl relative">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>
          <h3 className="text-base font-bold text-white mb-4">⚡ Quick Action Workspace</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <a 
              href="/orders" 
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-500/30 transition-all text-center gap-2 hover:bg-dark-800"
            >
              <span className="text-2xl">🛒</span>
              <span className="text-xs font-semibold text-white">Create Order / POS</span>
            </a>

            <a 
              href="/kitchen-tickets" 
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-500/30 transition-all text-center gap-2 hover:bg-dark-800"
            >
              <span className="text-2xl">🍳</span>
              <span className="text-xs font-semibold text-white">Kitchen Status (KOT)</span>
            </a>

            <a 
              href="/invoices" 
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-500/30 transition-all text-center gap-2 hover:bg-dark-800"
            >
              <span className="text-2xl">📄</span>
              <span className="text-xs font-semibold text-white">Manage Bills / Invoices</span>
            </a>

            <a 
              href="/staff" 
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-500/30 transition-all text-center gap-2 hover:bg-dark-800"
            >
              <span className="text-2xl">🔑</span>
              <span className="text-xs font-semibold text-white">Manage Staff Roles</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
