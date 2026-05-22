import React, { useEffect, useState } from 'react';
import { productApi } from '../api/productApi';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';
import { getCategoryLabel } from '../utils/formatters';

export default function MenuItems() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    is_available: true,
  });
  const [errors, setErrors] = useState({});

  const fetchMenuItems = async (search = '') => {
    setLoading(true);
    try {
      const response = await productApi.getMenuItems(search ? { query: search } : {});
      setMenuItems(response.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load menu items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems(searchQuery);
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
      description: '',
      is_available: true,
    });
    setEditingId(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      name: item.name,
      category: getCategoryLabel(item.category, ''),
      price: item.price,
      description: item.description || '',
      is_available: item.is_available ?? true,
    });
    setEditingId(item.id);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      if (editingId) {
        await productApi.updateMenuItem(editingId, formData);
        showToast('Menu item updated successfully.', 'success');
      } else {
        await productApi.createMenuItem(formData);
        showToast('Menu item added successfully.', 'success');
      }
      setIsModalOpen(false);
      fetchMenuItems(searchQuery);
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
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await productApi.deleteMenuItem(id);
      showToast('Menu item deleted successfully.', 'success');
      fetchMenuItems(searchQuery);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete menu item.', 'error');
    }
  };

  const headers = ['Name', 'Category', 'Price', 'Description', 'Availability'];

  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];

  const mappedItems = safeMenuItems.map((item) => ({
    id: item.id,
    name: item.name,
    category: getCategoryLabel(item.category),
    price: `Rs. ${Number(item.price).toFixed(2)}`,
    description: item.description || '-',
    availability: (
      <Badge variant={item.is_available ? 'success' : 'danger'}>
        {item.is_available ? 'Available' : 'Unavailable'}
      </Badge>
    ),
    // Raw inputs
    is_available: item.is_available,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Menu items / Restaurant Catalog</h1>
          <p className="text-xs text-dark-400 mt-1">Govern dine-in food catalogs, categories, kitchen routing, and availability status</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Add Food Item
        </Button>
      </div>

      <DataTable
        headers={headers}
        items={mappedItems}
        loading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search menu items..."
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
        title={editingId ? 'Edit Menu Item Details' : 'Add Food Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Food Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name?.[0]}
          />
          <Input
            label="Category"
            name="category"
            placeholder="e.g. Momo, Pizza, Dessert"
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
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-dark-400">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Brief description of the item..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-dark-950/60 border border-dark-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500/50 min-h-[80px]"
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              id="is_available"
              name="is_available"
              type="checkbox"
              checked={formData.is_available}
              onChange={handleChange}
              className="rounded border-dark-800 bg-dark-950 text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="is_available" className="text-xs text-dark-300 font-semibold">
              This item is active and available to order
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Menu Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
