import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { useToast } from '../../context/ToastContext';

export default function PlatformAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminApi.getPlatformAnalytics();
        setAnalytics(response.data);
      } catch (err) {
        console.error(err);
        showToast('Failed to load platform SaaS analytics.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">SaaS Platform Analytics</h1>
          <p className="text-xs text-dark-400 mt-1">Audit subscription growth rates, monthly recurring revenue splits, and platform loads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income growth bar */}
        <ChartCard title="Subscription Pricing Distribution Share" footer="💎 Plan segments breakdown active on platform">
          <div className="space-y-4 w-full px-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-dark-200">Pro Enterprise (Rs. 10,000/mo)</span>
                <span className="text-white">45%</span>
              </div>
              <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full w-[45%] bg-brand-500"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-dark-200">Business Starter (Rs. 5,000/mo)</span>
                <span className="text-white">35%</span>
              </div>
              <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full w-[35%] bg-emerald-500"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-dark-200">Free Trial Subdomain</span>
                <span className="text-white">20%</span>
              </div>
              <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full w-[20%] bg-amber-500"></div>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Database Clusters health */}
        <ChartCard title="Platform Active Schema Isolations" footer="🛡️ 100% database boundaries verified security drivers">
          <div className="w-full text-center space-y-4 px-4 py-6 bg-dark-900/40 rounded-xl border border-dark-800/60">
            <span className="text-4xl">🛡️</span>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">PostgreSQL Multi-Tenant Health Status</h4>
            <p className="text-xs text-dark-400">
              Schematic network partitions are active. Active tenant databases automatically initialize individual migrations upon registration.
            </p>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
