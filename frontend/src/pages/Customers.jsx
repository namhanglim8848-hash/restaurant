import React, { useEffect, useState } from 'react';
import { customerApi } from '../api/customerApi';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { useToast } from '../context/ToastContext';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    loyalty_points: 0,
  });
  const [errors, setErrors] = useState({});

  const fetchCustomers = async (search = '') => {
    setLoading(true);
    try {
      const response = await customerApi.getCustomers(search ? { query: search } : {});
      setCustomers(response.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load customers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(searchQuery);
  }, [searchQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenCreate = () => {
    setFormData({ name: '', phone: '', email: '', loyalty_points: 0 });
    setEditingId(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      loyalty_points: customer.loyalty_points || 0,
    });
    setEditingId(customer.id);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      if (editingId) {
        await customerApi.updateCustomer(editingId, formData);
        showToast('Customer updated successfully.', 'success');
      } else {
        await customerApi.createCustomer(formData);
        showToast('Customer registered successfully.', 'success');
      }
      setIsModalOpen(false);
      fetchCustomers(searchQuery);
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
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customerApi.deleteCustomer(id);
      showToast('Customer deleted successfully.', 'success');
      fetchCustomers(searchQuery);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete customer.', 'error');
    }
  };

  const headers = ['Name', 'Phone', 'Email', 'Loyalty Points', 'Total Spent', 'Due Amount'];

  const safeCustomers = Array.isArray(customers) ? customers : [];

  const mappedItems = safeCustomers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email || '-',
    loyalty_points: c.loyalty_points ?? 0,
    total_spent: `Rs. ${Number(c.total_spent ?? 0).toFixed(2)}`,
    due_amount: `Rs. ${Number(c.due_amount ?? 0).toFixed(2)}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Customers Registry</h1>
          <p className="text-xs text-dark-400 mt-1">Govern customer details, loyalty bounds, and due balances</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Add Customer
        </Button>
      </div>

      <DataTable
        headers={headers}
        items={mappedItems}
        loading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by name, phone..."
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
        title={editingId ? 'Edit Customer Details' : 'Register New Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name?.[0]}
          />
          <Input
            label="Phone Number"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone?.[0]}
          />
          <Input
            label="Email Address (Optional)"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email?.[0]}
          />
          <Input
            label="Loyalty Points"
            name="loyalty_points"
            type="number"
            value={formData.loyalty_points}
            onChange={handleChange}
            error={errors.loyalty_points?.[0]}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Details
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
