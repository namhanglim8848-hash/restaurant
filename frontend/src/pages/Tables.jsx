import React, { useEffect, useState } from 'react';
import { tenantApi } from '../api/tenantApi';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';

export default function Tables() {
  const [spaces, setSpaces] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const { showToast } = useToast();

  const [spaceForm, setSpaceForm] = useState({ name: '', description: '' });
  const [tableForm, setTableForm] = useState({ table_number: '', capacity: 4, space_id: '', status: 'vacant' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [spaceRes, tableRes] = await Promise.all([
        tenantApi.getSpaces(),
        tenantApi.getTables(),
      ]);
      setSpaces(spaceRes.data);
      setTables(tableRes.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load table configurations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    try {
      await tenantApi.createSpace(spaceForm);
      showToast('Space created successfully.', 'success');
      setIsSpaceModalOpen(false);
      setSpaceForm({ name: '', description: '' });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      await tenantApi.createTable(tableForm);
      showToast('Table created successfully.', 'success');
      setIsTableModalOpen(false);
      setTableForm({ table_number: '', capacity: 4, space_id: '', status: 'vacant' });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Delete this table?')) return;
    try {
      await tenantApi.deleteTable(id);
      showToast('Table deleted successfully.', 'success');
      fetchData();
    } catch (err) {
      showToast('Delete action failed.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      vacant: <Badge variant="success">Vacant</Badge>,
      occupied: <Badge variant="danger">Occupied</Badge>,
      reserved: <Badge variant="warning">Reserved</Badge>,
      cleaning: <Badge variant="info">Cleaning</Badge>,
      inactive: <Badge variant="gray">Inactive</Badge>,
    };
    return statuses[status] || <Badge>{status}</Badge>;
  };

  const tableHeaders = ['Table Number', 'Capacity', 'Space', 'Status'];
  const safeSpaces = Array.isArray(spaces) ? spaces : [];
  const safeTables = Array.isArray(tables) ? tables : [];

  const mappedTables = safeTables.map((t) => {
    const space = safeSpaces.find((s) => s.id === t.space_id);
    return {
      id: t.id,
      table_number: t.table_number,
      capacity: String(t.capacity),
      space: space ? space.name : '-',
      status: getStatusBadge(t.status),
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Spaces & Table Layouts</h1>
          <p className="text-xs text-dark-400 mt-1">Govern dining seating grids, areas, capacities, and space limits</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsSpaceModalOpen(true)}>
            + Add Area/Space
          </Button>
          <Button variant="primary" onClick={() => {
            if (safeSpaces.length === 0) {
              showToast('Please create at least one space/area first!', 'warning');
              return;
            }
            setTableForm((prev) => ({ ...prev, space_id: safeSpaces[0].id }));
            setIsTableModalOpen(true);
          }}>
            + Add Table
          </Button>
        </div>
      </div>

      {/* Grid Layout of Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spaces Overview Card */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-xl lg:col-span-1">
          <h3 className="text-base font-bold text-white mb-4">🏠 Business Spaces / Areas</h3>
          {loading ? (
            <p className="text-xs text-dark-500">Loading areas...</p>
          ) : safeSpaces.length === 0 ? (
            <p className="text-xs text-dark-500">No areas defined yet. Create Ground Floor or Rooftop!</p>
          ) : (
            <div className="space-y-3">
              {safeSpaces.map((s) => (
                <div key={s.id} className="p-3 bg-dark-900 border border-dark-800 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{s.name}</p>
                    <p className="text-xs text-dark-400 truncate">{s.description || 'No description'}</p>
                  </div>
                  <Badge variant="info">
                    {safeTables.filter((t) => t.space_id === s.id).length} Tables
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Seating List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white">🪑 Registered Seating Table Grid</h3>
          <DataTable
            headers={tableHeaders}
            items={mappedTables}
            loading={loading}
            actions={(item) => (
              <Button variant="ghost" className="text-red-400 text-xs" onClick={() => handleDeleteTable(item.id)}>
                🗑️ Delete
              </Button>
            )}
          />
        </div>
      </div>

      {/* Space Creation Modal */}
      <Modal isOpen={isSpaceModalOpen} onClose={() => setIsSpaceModalOpen(false)} title="Register Seating Space/Area">
        <form onSubmit={handleCreateSpace} className="space-y-4">
          <Input
            label="Space Name"
            name="name"
            required
            placeholder="e.g. Ground Floor, Outdoor Garden, Rooftop"
            value={spaceForm.name}
            onChange={(e) => setSpaceForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Brief Description"
            name="description"
            placeholder="e.g. Non-smoking zone, VIP private booths"
            value={spaceForm.description}
            onChange={(e) => setSpaceForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsSpaceModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Space
            </Button>
          </div>
        </form>
      </Modal>

      {/* Table Creation Modal */}
      <Modal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} title="Add Table to Seating Plan">
        <form onSubmit={handleCreateTable} className="space-y-4">
          <Input
            label="Table Code / Number"
            name="table_number"
            required
            placeholder="e.g. T-12, Premium-01"
            value={tableForm.table_number}
            onChange={(e) => setTableForm((prev) => ({ ...prev, table_number: e.target.value }))}
          />
          <Input
            label="Seating Capacity"
            name="capacity"
            type="number"
            required
            value={tableForm.capacity}
            onChange={(e) => setTableForm((prev) => ({ ...prev, capacity: e.target.value }))}
          />
          <Select
            label="Select Seating Space/Area"
            name="space_id"
            required
            value={tableForm.space_id}
            onChange={(e) => setTableForm((prev) => ({ ...prev, space_id: e.target.value }))}
            options={safeSpaces.map((s) => ({ label: s.name, value: s.id }))}
          />
          <Select
            label="Initial Table Seating Status"
            name="status"
            required
            value={tableForm.status}
            onChange={(e) => setTableForm((prev) => ({ ...prev, status: e.target.value }))}
            options={[
              { label: 'Vacant', value: 'vacant' },
              { label: 'Occupied', value: 'occupied' },
              { label: 'Reserved', value: 'reserved' },
              { label: 'Cleaning', value: 'cleaning' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsTableModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Seating Table
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
