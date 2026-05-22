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

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    cost: '',
    stock_quantity: 0,
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  const fetchProducts = async (search = '') => {
    setLoading(true);
    try {
      const response = await productApi.getProducts(search ? { query: search } : {});
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(searchQuery);
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
      sku: '',
      category: '',
      price: '',
      cost: '',
      stock_quantity: 0,
      is_active: true,
    });
    setEditingId(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setFormData({
      name: prod.name,
      sku: prod.sku || '',
      category: getCategoryLabel(prod.category, ''),
      price: prod.price,
      cost: prod.cost || '',
      stock_quantity: prod.stock_quantity ?? 0,
      is_active: prod.is_active ?? true,
    });
    setEditingId(prod.id);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      if (editingId) {
        await productApi.updateProduct(editingId, formData);
        showToast('Product updated successfully.', 'success');
      } else {
        await productApi.createProduct(formData);
        showToast('Product added successfully.', 'success');
      }
      setIsModalOpen(false);
      fetchProducts(searchQuery);
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
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.deleteProduct(id);
      showToast('Product deleted successfully.', 'success');
      fetchProducts(searchQuery);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete product.', 'error');
    }
  };

  const headers = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'];

  const safeProducts = Array.isArray(products) ? products : [];

  const mappedItems = safeProducts.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku || '-',
    category: getCategoryLabel(p.category),
    price: `Rs. ${Number(p.price).toFixed(2)}`,
    stock: String(p.stock_quantity ?? 0),
    status: (
      <Badge variant={p.is_active ? 'success' : 'danger'}>
        {p.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
    // Raw props for form population
    is_active: p.is_active,
    cost: p.cost,
    stock_quantity: p.stock_quantity,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Physical Inventory / Products</h1>
          <p className="text-xs text-dark-400 mt-1">Manage physical stocks, SKUs, sales price rates, and cost calculations</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Add Product
        </Button>
      </div>

      <DataTable
        headers={headers}
        items={mappedItems}
        loading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search products by name, SKU..."
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
        title={editingId ? 'Edit Product Details' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name?.[0]}
          />
          <Input
            label="SKU Code"
            name="sku"
            placeholder="e.g. BEV-COKE-300"
            value={formData.sku}
            onChange={handleChange}
            error={errors.sku?.[0]}
          />
          <Input
            label="Category"
            name="category"
            placeholder="e.g. Beverage, Bakery"
            value={formData.category}
            onChange={handleChange}
            error={errors.category?.[0]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Selling Price (Rs.)"
              name="price"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={handleChange}
              error={errors.price?.[0]}
            />
            <Input
              label="Unit Cost (Rs.)"
              name="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={handleChange}
              error={errors.cost?.[0]}
            />
          </div>
          <Input
            label="Stock Quantity"
            name="stock_quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={handleChange}
            error={errors.stock_quantity?.[0]}
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
              This product is active and visible in POS
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
