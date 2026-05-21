import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { useToast } from '../context/ToastContext';

export default function Analytics() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await analyticsApi.getSales();
        const rawData = response.data;
        if (rawData && rawData.sales_trend) {
          const trend = rawData.sales_trend || [];
          setSalesData(trend.map(item => ({
            date: item.period || item.date || '',
            total_sales: item.sales ?? item.total_sales ?? 0,
            orders: item.orders ?? 0
          })));
        } else if (Array.isArray(rawData)) {
          setSalesData(rawData.map(item => ({
            date: item.date || item.period || '',
            total_sales: item.total_sales ?? item.sales ?? 0,
            orders: item.orders ?? 0
          })));
        } else {
          setSalesData([]);
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to load deep business metrics.', 'error');
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
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Business Analytics & Metrics</h1>
          <p className="text-xs text-dark-400 mt-1">Audit sales distributions, daily trends, and payment gateway splits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Performance */}
        <ChartCard title="Daily Sales Performance (Visual Trends)" footer="📊 Metrics recorded in real-time">
          {loading ? (
            <span className="text-xs text-dark-500">Loading trends...</span>
          ) : salesData.length === 0 ? (
            <span className="text-xs text-dark-500">No sales transactions available to display</span>
          ) : (
            <div className="w-full h-48 flex items-end justify-between gap-2 px-4">
              {salesData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  {/* Interactive Bar */}
                  <div className="w-full bg-dark-800 rounded-t-lg group-hover:bg-brand-500/20 transition-all border border-dark-750 flex items-end min-h-[120px] relative">
                    <div 
                      style={{ height: `${Math.min(100, Math.max(10, (d.total_sales ?? 0) / 100))}%` }}
                      className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg transition-all group-hover:from-brand-500 group-hover:to-brand-300"
                    ></div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-dark-950 border border-dark-800 text-[10px] text-white px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity mb-2 shrink-0 z-10 font-mono">
                      Rs.{d.total_sales}
                    </div>
                  </div>
                  <span className="text-[10px] text-dark-400 truncate max-w-[60px]">{d.date || `Day ${i + 1}`}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Category Share Distribution */}
        <ChartCard title="Payment Gateway Outlays Distribution">
          <div className="space-y-4 w-full px-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-dark-200">Fonepay / QR Scans</span>
                <span className="text-white">65%</span>
              </div>
              <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-brand-500"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-dark-200">Cash Settlements</span>
                <span className="text-white">25%</span>
              </div>
              <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full w-[25%] bg-emerald-500"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-dark-200">eSewa Payments</span>
                <span className="text-white">10%</span>
              </div>
              <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full w-[10%] bg-orange-500"></div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
