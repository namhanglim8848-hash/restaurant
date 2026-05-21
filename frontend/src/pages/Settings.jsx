import React, { useEffect, useState } from 'react';
import { tenantApi } from '../api/tenantApi';
import Button from '../components/Button';
import Input from '../components/Input';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const [settings, setSettings] = useState({
    business_name: '',
    pan_number: '',
    vat_number: '',
    is_vat_registered: false,
    currency: 'Rs.',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const loadSettings = async () => {
    try {
      const response = await tenantApi.getSettings();
      if (response.data) {
        setSettings({
          business_name: response.data.business_name || '',
          pan_number: response.data.pan_number || '',
          vat_number: response.data.vat_number || '',
          is_vat_registered: Boolean(response.data.is_vat_registered),
          currency: response.data.currency || 'Rs.',
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load workspace settings.', 'error');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tenantApi.updateSettings(settings);
      showToast('Workspace tax settings saved successfully!', 'success');
      loadSettings();
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Business Settings / Compliance</h1>
          <p className="text-xs text-dark-400 mt-1">Govern tax registration codes, VAT rates, and restaurant detail states</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="glass-panel p-8 rounded-2xl border border-dark-800/80 shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>
          
          <h3 className="text-base font-bold text-white mb-6">🇳🇵 Nepalese Fiscal Audit Setup</h3>

          {loading ? (
            <div className="flex justify-center py-6">
              <span className="h-6 w-6 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Registered Business Name"
                name="business_name"
                required
                value={settings.business_name}
                onChange={handleChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="PAN (Permanent Account Number)"
                  name="pan_number"
                  placeholder="e.g. 601234567"
                  value={settings.pan_number}
                  onChange={handleChange}
                />
                <Input
                  label="VAT Registration Number"
                  name="vat_number"
                  placeholder="e.g. 601234567"
                  value={settings.vat_number}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center gap-2 py-2 border-y border-dark-800/40">
                <input
                  id="is_vat_registered"
                  name="is_vat_registered"
                  type="checkbox"
                  checked={settings.is_vat_registered}
                  onChange={handleChange}
                  className="rounded border-dark-800 bg-dark-950 text-brand-500"
                />
                <label htmlFor="is_vat_registered" className="text-xs text-dark-300 font-semibold select-none">
                  Enable Standard Nepalese 13% Value Added Tax (VAT) in checkout logs
                </label>
              </div>

              <Input
                label="Base Currency Code"
                name="currency"
                required
                value={settings.currency}
                onChange={handleChange}
              />

              <Button type="submit" variant="primary" loading={saving} className="w-full mt-4">
                Save Compliance Configurations
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
