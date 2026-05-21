import React, { useEffect, useState } from 'react';
import { staffApi } from '../api/staffApi';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { showToast } = useToast();

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'staff',
    name: '',
    permissions: [],
  });

  const availablePermissions = [
    'manage_customers',
    'manage_products',
    'manage_menu',
    'manage_tables',
    'manage_orders',
    'manage_invoices',
    'manage_payments',
    'view_analytics',
    'manage_reports',
    'manage_staff',
    'manage_settings',
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, inviteRes] = await Promise.all([
        staffApi.getStaff(),
        staffApi.getInvitations(),
      ]);
      setStaff(staffRes.data);
      setInvitations(inviteRes.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load team data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePermission = (perm) => {
    setInviteForm((prev) => {
      const alreadyHas = prev.permissions.includes(perm);
      const newPerms = alreadyHas 
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm];
      return { ...prev, permissions: newPerms };
    });
  };

  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    try {
      await staffApi.createInvitation(inviteForm);
      showToast('Staff invitation dispatched successfully!', 'success');
      setIsInviteModalOpen(false);
      setInviteForm({ email: '', role: 'staff', name: '', permissions: [] });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Invitation failed.', 'error');
    }
  };

  const handleCancelInvitation = async (id) => {
    if (!window.confirm('Cancel this invitation?')) return;
    try {
      await staffApi.cancelInvitation(id);
      showToast('Invitation cancelled.', 'success');
      fetchData();
    } catch (err) {
      showToast('Cancel failed.', 'error');
    }
  };

  const staffHeaders = ['Name', 'Email', 'Role', 'Status'];
  const safeStaff = Array.isArray(staff) ? staff : [];
  const mappedStaff = safeStaff.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    role: (
      <Badge variant={s.role === 'owner' ? 'warning' : 'info'}>
        {s.role.toUpperCase()}
      </Badge>
    ),
    status: (
      <Badge variant={s.is_active ? 'success' : 'danger'}>
        {s.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  }));

  const inviteHeaders = ['Recipient Name', 'Email', 'Role', 'Invite Token Suffix', 'Status'];
  const safeInvitations = Array.isArray(invitations) ? invitations : [];
  const mappedInvites = safeInvitations.map((inv) => ({
    id: inv.id,
    recipient_name: inv.name || '-',
    email: inv.email,
    role: inv.role.toUpperCase(),
    invite_token_suffix: inv.token ? `...${inv.token.slice(-8)}` : '-',
    status: (
      <Badge variant={inv.status === 'accepted' ? 'success' : inv.status === 'pending' ? 'warning' : 'danger'}>
        {inv.status}
      </Badge>
    ),
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Staff Management console</h1>
          <p className="text-xs text-dark-400 mt-1">Govern active workspace staff, roles, and invitation links</p>
        </div>
        <Button variant="primary" onClick={() => setIsInviteModalOpen(true)}>
          + Invite Staff Member
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Staff List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white">👥 Active Workspace Team Members</h3>
          <DataTable
            headers={staffHeaders}
            items={mappedStaff}
            loading={loading}
          />
        </div>

        {/* Staff Invitations Ledger */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-base font-bold text-white">✉️ Outgoing Invitations</h3>
          <DataTable
            headers={inviteHeaders}
            items={mappedInvites}
            loading={loading}
            actions={(item) => (
              item.status.props.children === 'pending' && (
                <Button variant="ghost" className="text-red-400 text-xs" onClick={() => handleCancelInvitation(item.id)}>
                  ✕ Cancel
                </Button>
              )
            )}
          />
        </div>
      </div>

      {/* Invitation Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Send Staff Invitation Link">
        <form onSubmit={handleCreateInvitation} className="space-y-4">
          <Input
            label="Staff Full Name"
            name="name"
            required
            placeholder="e.g. Shyam Bahadur"
            value={inviteForm.name}
            onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            required
            placeholder="e.g. shyam@annapurna.com"
            value={inviteForm.email}
            onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Select
            label="Select Role"
            name="role"
            required
            value={inviteForm.role}
            onChange={(e) => setInviteForm((prev) => ({ ...prev, role: e.target.value }))}
            options={[
              { label: 'Standard Staff', value: 'staff' },
              { label: 'Manager / Supervisor', value: 'manager' },
            ]}
          />

          {/* Permissions Checklist */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-dark-400">
              Assign Permissions Matrix
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto bg-dark-950/60 p-3 rounded-xl border border-dark-800">
              {availablePermissions.map((perm) => (
                <div key={perm} className="flex items-center gap-2">
                  <input
                    id={`perm_${perm}`}
                    type="checkbox"
                    checked={inviteForm.permissions.includes(perm)}
                    onChange={() => handleTogglePermission(perm)}
                    className="rounded border-dark-800 bg-dark-900 text-brand-500"
                  />
                  <label htmlFor={`perm_${perm}`} className="text-[10px] text-dark-300 font-semibold select-none capitalize">
                    {perm.replace('manage_', '').replace('view_', '')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Dispatch Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
