import React, { useEffect, useState } from 'react';
import { productApi } from '../api/productApi';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    duration_minutes: '',
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  const fetchServices = async (search = '') => {
    setLoading(true);
    try {
      const response = await productApi.getServices(search ? { query: search } : {});
      setServices(response.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load services.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(searchQuery);
  }, [searchQuery]);

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
      category: '',
      price: '',
      duration_minutes: '',
      is_active: true,
    });
    setEditingId(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (serv) => {
    setFormData({
      name: serv.name,
      category: serv.category || '',
      price: serv.price,
      duration_minutes: serv.duration_minutes || '',
      is_active: serv.is_active ?? true,
    });
    setEditingId(serv.id);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      if (editingId) {
        await productApi.updateService(editingId, formData);
        showToast('Service updated successfully.', 'success');
      } else {
        await productApi.createService(formData);
        showToast('Service registered successfully.', 'success');
      }
      setIsModalOpen(false);
      fetchServices(searchQuery);
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
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await productApi.deleteService(id);
      showToast('Service deleted successfully.', 'success');
      fetchServices(searchQuery);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete service.', 'error');
    }
  };

  const headers = ['Name', 'Category', 'Price', 'Duration', 'Status'];

  const safeServices = Array.isArray(services) ? services : [];

  const mappedItems = safeServices.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category || '-',
    price: `Rs. ${Number(s.price).toFixed(2)}`,
    duration: s.duration_minutes ? `${s.duration_minutes} mins` : '-',
    status: (
      <Badge variant={s.is_active ? 'success' : 'danger'}>
        {s.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
    // Raw inputs
    is_active: s.is_active,
    duration_minutes: s.duration_minutes,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Custom Professional Services</h1>
          <p className="text-xs text-dark-400 mt-1">Govern digital fees, events, room charges, booking values, or staff costs</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Add Service
        </Button>
      </div>

      <DataTable
        headers={headers}
        items={mappedItems}
        loading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search services..."
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
        title={editingId ? 'Edit Service Details' : 'Register New Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Service Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name?.[0]}
          />
          <Input
            label="Category"
            name="category"
            placeholder="e.g. Booking, Service Fee"
            value={formData.category}
            onChange={handleChange}
            error={errors.category?.[0]}
          />
          <Input
            label="Price (Rs.)"
            name="price"
            type="number"
            step="0.01"
            required
            value={formData.price}
            onChange={handleChange}
            error={errors.price?.[0]}
          />
          <Input
            label="Duration (Minutes - Optional)"
            name="duration_minutes"
            type="number"
            placeholder="e.g. 60"
            value={formData.duration_minutes}
            onChange={handleChange}
            error={errors.duration_minutes?.[0]}
          />

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
              This service is active and visible in POS
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
