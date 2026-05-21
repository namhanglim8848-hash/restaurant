import React, { useEffect, useState } from 'react';
import { whatsappApi } from '../api/whatsappApi';
import Button from '../components/Button';
import Input from '../components/Input';
import { useToast } from '../context/ToastContext';

export default function WhatsAppReports() {
  const [settings, setSettings] = useState({
    recipient_phone: '',
    auto_send_daily: false,
    auto_send_time: '20:00',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  const loadSettings = async () => {
    try {
      const response = await whatsappApi.getSettings();
      if (response.data) {
        setSettings({
          recipient_phone: response.data.recipient_phone || '',
          auto_send_daily: Boolean(response.data.auto_send_daily),
          auto_send_time: response.data.auto_send_time || '20:00',
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load WhatsApp report configurations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await whatsappApi.updateSettings(settings);
      showToast('WhatsApp reports configuration saved!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update configurations.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendManualReport = async () => {
    setSending(true);
    try {
      showToast('Generating daily WhatsApp report summary...', 'info');
      const genRes = await whatsappApi.generateDailyReportManually();
      
      const reportId = genRes.data.id;
      showToast('Dispatching report payload to WhatsApp server API...', 'info');
      await whatsappApi.sendWhatsAppManually(reportId);
      
      showToast('WhatsApp Daily Summary successfully sent!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'WhatsApp dispatch failed. Check Twilio sandbox credentials.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">WhatsApp Automated Reports</h1>
          <p className="text-xs text-dark-400 mt-1">Receive automated sales summaries, cash drawer audits, and top menu parameters instantly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Configuration Card */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-xl relative">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>
          <h3 className="text-base font-bold text-white mb-4">⚙️ Twilio WhatsApp Settings</h3>
          
          {loading ? (
            <p className="text-xs text-dark-500">Syncing settings...</p>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <Input
                label="Recipient WhatsApp Number"
                name="recipient_phone"
                required
                placeholder="e.g. +9779812345678"
                value={settings.recipient_phone}
                onChange={handleChange}
              />
              <Input
                label="Automated Dispatch Time"
                name="auto_send_time"
                type="time"
                value={settings.auto_send_time}
                onChange={handleChange}
              />
              <div className="flex items-center gap-2 py-2">
                <input
                  id="auto_send_daily"
                  name="auto_send_daily"
                  type="checkbox"
                  checked={settings.auto_send_daily}
                  onChange={handleChange}
                  className="rounded border-dark-800 bg-dark-950 text-brand-500"
                />
                <label htmlFor="auto_send_daily" className="text-xs text-dark-300 font-semibold">
                  Enable automated close-of-day dispatch to recipient
                </label>
              </div>

              <Button type="submit" variant="primary" loading={saving} className="w-full">
                Save WhatsApp Settings
              </Button>
            </form>
          )}
        </div>

        {/* Manual Test Dispatch Card */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-xl relative flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>
          <div>
            <h3 className="text-base font-bold text-white mb-4">⚡ Test Manual Report</h3>
            <p className="text-sm text-dark-300 mb-6">
              Generate a snapshot of today's total restaurant sales, transactions count, tax summaries, and WhatsApp template payload, then immediately trigger dispatch!
            </p>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleSendManualReport}
            loading={sending}
            className="w-full py-3 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20"
          >
            💬 Trigger Manual Daily Report Dispatch
          </Button>
        </div>
      </div>
    </div>
  );
}
