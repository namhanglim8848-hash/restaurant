import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import Input from '../../components/Input';
import { useToast } from '../../context/ToastContext';

export default function SubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    tenant_id: '',
    subscription_plan_id: '',
    starts_at: '',
    ends_at: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const subRes = await adminApi.getSubscriptions();
      const tenantRes = await adminApi.getTenants();
      const planRes = await adminApi.getPlans();
      
      const subArray = Array.isArray(subRes.data) ? subRes.data : (subRes.data?.data || []);
      const tenantArray = Array.isArray(tenantRes.data) ? tenantRes.data : (tenantRes.data?.data || []);
      const planArray = Array.isArray(planRes.data) ? planRes.data : (planRes.data?.data || []);

      setSubscriptions(subArray);
      setTenants(tenantArray);
      setPlans(planArray.filter(p => p.is_active));
    } catch (err) {
      console.error(err);
      showToast('Failed to load subscriptions register.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAssign = () => {
    setFormData({ tenant_id: '', subscription_plan_id: '', starts_at: '', ends_at: '' });
    if (tenants.length === 0 || plans.length === 0) {
      showToast('Ensure active plans and registered tenants exist.', 'warning');
    }
    setIsModalOpen(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        starts_at: formData.starts_at || null,
        ends_at: formData.ends_at || null,
      };
      await adminApi.assignSubscription(formData.tenant_id, formData.subscription_plan_id, payload);
      showToast('Plan subscription assigned successfully.', 'success');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Assignment failed.', 'error');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this subscription?')) return;
    try {
      await adminApi.cancelSubscription(id);
      showToast('Subscription cancelled.', 'success');
      loadData();
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  const handleExpire = async (id) => {
    if (!window.confirm('Mark this subscription as expired?')) return;
    try {
      await adminApi.expireSubscription(id);
      showToast('Subscription expired.', 'success');
      loadData();
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      active: <Badge variant="success">Active</Badge>,
      trialing: <Badge variant="info">Trialing</Badge>,
      cancelled: <Badge variant="danger">Cancelled</Badge>,
      expired: <Badge variant="gray">Expired</Badge>,
    };
    return statuses[status] || <Badge>{status}</Badge>;
  };

  const headers = ['Tenant', 'Subscription Plan', 'Period', 'Status', 'Expiry Date'];

  const mappedItems = subscriptions.map((s) => {
    const tenant = tenants.find(t => t.id === s.tenant_id);
    const plan = plans.find(p => p.id === s.subscription_plan_id);
    return {
      id: s.id,
      tenant: tenant ? (tenant.business_name || tenant.name) : `Tenant ID: ${s.tenant_id}`,
      subscription_plan: plan ? plan.name : `Plan ID: ${s.subscription_plan_id}`,
      period: `${new Date(s.starts_at).toLocaleDateString('en-NP')} - ${s.ends_at ? new Date(s.ends_at).toLocaleDateString('en-NP') : 'Lifetime'}`,
      status: getStatusBadge(s.status),
      expiry_date: s.ends_at ? new Date(s.ends_at).toLocaleDateString('en-NP') : 'Never',
      // raw
      raw_status: s.status,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">SaaS Subscriptions ledger</h1>
          <p className="text-xs text-dark-400 mt-1">Assign starter plans, process manual payments contracts, and manage cancellations</p>
        </div>
        <Button variant="primary" onClick={handleOpenAssign}>
          + Assign Subscription
        </Button>
      </div>

      <DataTable
        headers={headers}
        items={mappedItems}
        loading={loading}
        actions={(item) => (
          item.raw_status === 'active' || item.raw_status === 'trialing' ? (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                className="text-amber-400 text-xs font-bold"
                onClick={() => handleCancel(item.id)}
              >
                Cancel
              </Button>
              <Button 
                variant="ghost" 
                className="text-red-400 text-xs font-bold"
                onClick={() => handleExpire(item.id)}
              >
                Expire
              </Button>
            </div>
          ) : null
        )}
      />

      {/* Subscription Assignment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign SaaS Plan Subscription">
        <form onSubmit={handleAssign} className="space-y-4">
          <Select
            label="Select Tenant Subdomain"
            name="tenant_id"
            required
            value={formData.tenant_id}
            onChange={handleChange}
            options={[
              { label: '-- Select Tenant --', value: '' },
              ...tenants.map((t) => ({ label: t.business_name || t.name, value: t.id })),
            ]}
          />
          <Select
            label="Select Pricing Plan"
            name="subscription_plan_id"
            required
            value={formData.subscription_plan_id}
            onChange={handleChange}
            options={[
              { label: '-- Select Plan --', value: '' },
              ...plans.map((p) => ({ label: `${p.name} (Rs. ${p.price})`, value: p.id })),
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Starts At Date (Optional)"
              name="starts_at"
              type="date"
              value={formData.starts_at}
              onChange={handleChange}
            />
            <Input
              label="Ends At Date (Optional)"
              name="ends_at"
              type="date"
              value={formData.ends_at}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Assign Contract
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
