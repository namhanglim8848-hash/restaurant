import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { useToast } from '../../context/ToastContext';

export default function PlansList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: '',
    billing_period: 'monthly',
    trial_period_days: 14,
    features: '',
    is_active: true,
    whatsapp_reports_enabled: true,
    analytics_enabled: true,
  });
  const [errors, setErrors] = useState({});

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getPlans();
      const plansArray = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPlans(plansArray);
    } catch (err) {
      console.error(err);
      showToast('Failed to load subscription plans.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      code: '',
      price: '',
      billing_period: 'monthly',
      trial_period_days: 14,
      features: '',
      is_active: true,
      whatsapp_reports_enabled: true,
      analytics_enabled: true,
    });
    setEditingId(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setFormData({
      name: plan.name,
      code: plan.code || plan.slug || '',
      price: typeof plan.price === 'string' ? Number(plan.price.replace(/[^\d.]/g, '')) || 0 : plan.price,
      billing_period: (plan.billing_interval || 'monthly').toLowerCase(),
      trial_period_days: plan.trial_period_days ?? 14,
      features: Array.isArray(plan.features) ? plan.features.join('\n') : (plan.features || ''),
      is_active: plan.is_active ?? true,
      whatsapp_reports_enabled: plan.whatsapp_reports_enabled ?? true,
      analytics_enabled: plan.analytics_enabled ?? true,
    });
    setEditingId(plan.id);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Format features text area to JSON array for backend standard compatibility!
    const formattedFeatures = formData.features
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      name: formData.name,
      slug: formData.code ? formData.code.toLowerCase().replace(/\s+/g, '-') : formData.name.toLowerCase().replace(/\s+/g, '-'),
      price: Number(formData.price),
      billing_interval: formData.billing_period,
      duration_days: formData.billing_period === 'yearly' ? 365 : 30,
      trial_period_days: Number(formData.trial_period_days),
      whatsapp_reports_enabled: Boolean(formData.whatsapp_reports_enabled),
      analytics_enabled: Boolean(formData.analytics_enabled),
      features: formattedFeatures,
      is_active: Boolean(formData.is_active),
      max_staff: null,
      max_products: null,
      max_invoices_per_month: null,
    };

    try {
      if (editingId) {
        await adminApi.updatePlan(editingId, payload);
        showToast('Plan updated successfully.', 'success');
      } else {
        await adminApi.createPlan(payload);
        showToast('Plan created successfully.', 'success');
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error(err);
      if (err.errors) {
        setErrors(err.errors);
      } else {
        showToast(err.message || 'Action failed.', 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      await adminApi.deletePlan(id);
      showToast('Plan deleted successfully.', 'success');
      fetchPlans();
    } catch (err) {
      showToast('Delete action failed.', 'error');
    }
  };

  const headers = ['Name', 'Code', 'Price', 'Billing Period', 'Trial Days', 'Status'];

  const mappedItems = plans.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.slug || p.code,
    price: `Rs. ${Number(p.price).toFixed(2)}`,
    billing_period: (p.billing_interval || 'monthly').toUpperCase(),
    trial_days: `${p.trial_period_days} Days`,
    status: (
      <Badge variant={p.is_active ? 'success' : 'danger'}>
        {p.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
    // raw values for editing
    features: p.features,
    is_active: p.is_active,
    trial_period_days: p.trial_period_days,
    billing_interval: p.billing_interval || 'monthly',
    whatsapp_reports_enabled: p.whatsapp_reports_enabled ?? true,
    analytics_enabled: p.analytics_enabled ?? true,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">SaaS Subscription Plans</h1>
          <p className="text-xs text-dark-400 mt-1">Manage platform pricing structures, Starter/Business/Pro features limits, and Trial boundaries</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Create Plan
        </Button>
      </div>

      <DataTable
        headers={headers}
        items={mappedItems}
        loading={loading}
        actions={(item) => (
          <>
            <Button variant="ghost" className="text-brand-400" onClick={() => handleOpenEdit(item)}>
              ✏️ Edit
            </Button>
            <Button variant="ghost" className="text-red-400" onClick={() => handleDelete(item.id)}>
              🗑️ Delete
            </Button>
          </>
        )}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Plan Name"
            name="name"
            required
            placeholder="e.g. Pro Platinum"
            value={formData.name}
            onChange={handleChange}
            error={errors.name?.[0]}
          />
          <Input
            label="Unique Plan Code"
            name="code"
            required
            placeholder="e.g. pro-platinum"
            value={formData.code}
            onChange={handleChange}
            error={errors.code?.[0]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (Rs.)"
              name="price"
              type="number"
              required
              value={formData.price}
              onChange={handleChange}
              error={errors.price?.[0]}
            />
            <Select
              label="Billing Cycle"
              name="billing_period"
              required
              value={formData.billing_period}
              onChange={handleChange}
              options={[
                { label: 'Monthly Recurring', value: 'monthly' },
                { label: 'Yearly Recurring', value: 'yearly' },
              ]}
            />
          </div>

          <Input
            label="Trial Period Days"
            name="trial_period_days"
            type="number"
            required
            value={formData.trial_period_days}
            onChange={handleChange}
            error={errors.trial_period_days?.[0]}
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-dark-400">
              Plan Features Checklist (One per line)
            </label>
            <textarea
              name="features"
              placeholder="e.g. Unlimited POS&#10;eSewa Integration&#10;Automated Close-of-Day Reports"
              value={formData.features}
              onChange={handleChange}
              className="w-full bg-dark-950/60 border border-dark-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500/50 min-h-[100px]"
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
              className="rounded border-dark-800 bg-dark-950 text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="is_active" className="text-xs text-dark-300 font-semibold">
              This plan is active and selectable centrally
            </label>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              id="whatsapp_reports_enabled"
              name="whatsapp_reports_enabled"
              type="checkbox"
              checked={formData.whatsapp_reports_enabled}
              onChange={handleChange}
              className="rounded border-dark-800 bg-dark-950 text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="whatsapp_reports_enabled" className="text-xs text-dark-300 font-semibold">
              Enable WhatsApp Daily Reports
            </label>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              id="analytics_enabled"
              name="analytics_enabled"
              type="checkbox"
              checked={formData.analytics_enabled}
              onChange={handleChange}
              className="rounded border-dark-800 bg-dark-950 text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="analytics_enabled" className="text-xs text-dark-300 font-semibold">
              Enable Advanced Analytics & BI Features
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
