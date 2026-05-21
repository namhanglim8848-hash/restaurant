import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export default function TenantsList() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenantSummary, setSelectedTenantSummary] = useState(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const { showToast } = useToast();

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getTenants();
      const tenantsArray = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setTenants(tenantsArray);
    } catch (err) {
      console.error(err);
      showToast('Failed to load tenants directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminApi.updateTenantStatus(id, status);
      showToast(`Tenant status updated to ${status}!`, 'success');
      fetchTenants();
    } catch (err) {
      showToast('Failed to update tenant status.', 'error');
    }
  };

  const handleViewSummary = async (tenant) => {
    setSummaryLoading(true);
    setSelectedTenantSummary(null);
    setIsSummaryModalOpen(true);
    try {
      const response = await adminApi.getTenantSummary(tenant.id);
      setSelectedTenantSummary({
        name: tenant.business_name || tenant.name || 'Tenant',
        domain: tenant.domain || `${tenant.id}.localhost`,
        ...response.data,
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch partition summary metrics.', 'error');
      setIsSummaryModalOpen(false);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDeleteTenant = async (id) => {
    if (!window.confirm('Are you sure you want to soft-delete this tenant? Physical databases will remain untouched.')) return;
    try {
      await adminApi.deleteTenant(id, false);
      showToast('Tenant soft deleted successfully.', 'success');
      fetchTenants();
    } catch (err) {
      showToast('Failed to delete tenant.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      active: <Badge variant="success">Active</Badge>,
      suspended: <Badge variant="danger">Suspended</Badge>,
      deactivated: <Badge variant="warning">Deactivated</Badge>,
      trial: <Badge variant="info">Trial</Badge>,
    };
    return statuses[status] || <Badge>{status}</Badge>;
  };

  const headers = ['Business Name', 'Subdomain', 'Email', 'Status', 'Registered At'];

  const mappedItems = tenants.map((t) => ({
    id: t.id,
    business_name: t.business_name || t.name || 'N/A',
    subdomain: t.domain || `${t.id}.localhost`,
    email: t.email || '-',
    status: getStatusBadge(t.status || 'active'),
    registered_at: new Date(t.created_at).toLocaleDateString('en-NP'),
    // raw values
    raw_status: t.status || 'active',
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Tenants & Database Lifecycles</h1>
          <p className="text-xs text-dark-400 mt-1">Govern multi-tenant subdomains, suspend accounts, and view database totals summaries</p>
        </div>
      </div>

      <DataTable
        headers={headers}
        items={mappedItems}
        loading={loading}
        actions={(item) => (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              className="text-brand-400 font-semibold text-xs"
              onClick={() => handleViewSummary(item)}
            >
              📊 Stats
            </Button>
            
            {item.raw_status === 'active' ? (
              <Button 
                variant="ghost" 
                className="text-amber-400 font-semibold text-xs"
                onClick={() => handleUpdateStatus(item.id, 'suspended')}
              >
                ⏸ Suspend
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                className="text-emerald-400 font-semibold text-xs"
                onClick={() => handleUpdateStatus(item.id, 'active')}
              >
                ▶ Restore
              </Button>
            )}

            <Button 
              variant="ghost" 
              className="text-red-400 font-semibold text-xs"
              onClick={() => handleDeleteTenant(item.id)}
            >
              🗑️ Soft Delete
            </Button>
          </div>
        )}
      />

      {/* Database Summary Modal */}
      <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Partition Database Summary">
        {summaryLoading ? (
          <div className="flex justify-center py-8">
            <span className="h-6 w-6 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></span>
          </div>
        ) : selectedTenantSummary ? (
          <div className="space-y-6">
            <div className="border-b border-dark-800 pb-4">
              <h4 className="text-sm font-bold text-white uppercase">{selectedTenantSummary.name}</h4>
              <p className="text-xs text-dark-400">{selectedTenantSummary.domain}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl text-center">
                <p className="text-2xl font-extrabold text-brand-400">{selectedTenantSummary.customers_count ?? 0}</p>
                <p className="text-[10px] text-dark-400 uppercase font-bold tracking-wider mt-1">Customers</p>
              </div>

              <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl text-center">
                <p className="text-2xl font-extrabold text-brand-400">{selectedTenantSummary.orders_count ?? 0}</p>
                <p className="text-[10px] text-dark-400 uppercase font-bold tracking-wider mt-1">Orders POS</p>
              </div>

              <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl text-center">
                <p className="text-2xl font-extrabold text-brand-400">{selectedTenantSummary.invoices_count ?? 0}</p>
                <p className="text-[10px] text-dark-400 uppercase font-bold tracking-wider mt-1">Invoices</p>
              </div>

              <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl text-center">
                <p className="text-2xl font-extrabold text-brand-400">{selectedTenantSummary.staff_count ?? 0}</p>
                <p className="text-[10px] text-dark-400 uppercase font-bold tracking-wider mt-1">Staff Users</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={() => setIsSummaryModalOpen(false)}>
                Close Summary
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
