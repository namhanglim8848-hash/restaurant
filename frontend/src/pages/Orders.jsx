import React, { useEffect, useState } from 'react';
import { orderApi } from '../api/orderApi';
import { productApi } from '../api/productApi';
import { tenantApi } from '../api/tenantApi';
import { customerApi } from '../api/customerApi';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';
import { getCategoryLabel } from '../utils/formatters';

export default function Orders() {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderType, setOrderType] = useState('dine_in');
  
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [vatRate, setVatRate] = useState(0.13); // Default 13% Nepalese VAT

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const [tableRes, menuRes, custRes] = await Promise.all([
        tenantApi.getTables(),
        productApi.getMenuItems(),
        customerApi.getCustomers(),
      ]);
      const safeTables = Array.isArray(tableRes.data) ? tableRes.data : [];
      const safeMenuItems = Array.isArray(menuRes.data) ? menuRes.data : [];
      const safeCustomers = Array.isArray(custRes.data) ? custRes.data : [];

      setTables(safeTables.filter(t => t.status === 'vacant' || t.status === 'occupied'));
      setMenuItems(safeMenuItems.filter(i => i.is_available));
      setCustomers(safeCustomers);
    } catch (err) {
      console.error(err);
      showToast('Failed to load menu or table registry.', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, note: '' }];
    });
    showToast(`Added ${item.name} to cart.`, 'success');
  };

  const updateQuantity = (id, amt) => {
    setCart((prev) => 
      prev.map((i) => {
        if (i.id === id) {
          const newQty = i.quantity + amt;
          return newQty > 0 ? { ...i, quantity: newQty } : i;
        }
        return i;
      }).filter((i) => i.quantity > 0)
    );
  };

  const updateItemNote = (id, noteText) => {
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, note: noteText } : i));
  };

  // Compute calculated pricing
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const discountAmount = Number(discount) > 0 ? Number(discount) : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const vatAmount = taxableAmount * vatRate;
  const total = taxableAmount + vatAmount;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showToast('Cart is empty!', 'warning');
      return;
    }
    if (orderType === 'dine_in' && !selectedTable) {
      showToast('Please select a dining table for Dine-in!', 'warning');
      return;
    }

    setLoading(true);
    try {
      const itemsPayload = cart.map((i) => ({
        menu_item_id: i.id,
        quantity: i.quantity,
        price: Number(i.price),
        notes: i.note || null,
      }));

      const payload = {
        table_id: orderType === 'dine_in' ? selectedTable : null,
        customer_id: selectedCustomer || null,
        type: orderType,
        discount: Number(discountAmount),
        tax: Number(vatAmount),
        total: Number(total),
        notes: notes || null,
        items: itemsPayload,
      };

      await orderApi.createOrder(payload);
      showToast('Order Placed Successfully! KOT dispatched to kitchen.', 'success');
      
      // Clear Cart
      setCart([]);
      setSelectedTable('');
      setSelectedCustomer('');
      setNotes('');
      setDiscount(0);
      loadData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to dispatch order ticket.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Point of Sales / POS Console</h1>
          <p className="text-xs text-dark-400 mt-1">Dispense orders, choose tables, apply VAT, and print KOT instantly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: POS Menu Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">🛒 1. Configure Order Context</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Order Type"
                name="order_type"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                options={[
                  { label: 'Dine-In Seating', value: 'dine_in' },
                  { label: 'Takeaway / Pickup', value: 'takeaway' },
                  { label: 'Delivery Service', value: 'delivery' },
                ]}
              />

              {orderType === 'dine_in' && (
                <Select
                  label="Select Table"
                  name="table_id"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  options={[
                    { label: '-- Select Table --', value: '' },
                    ...tables.map((t) => ({ label: `Table ${t.table_number} (${t.capacity} pax)`, value: t.id })),
                  ]}
                />
              )}

              <Select
                label="Customer (Optional)"
                name="customer_id"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                options={[
                  { label: '-- Walk-in Customer --', value: '' },
                  ...customers.map((c) => ({ label: `${c.name} (${c.phone})`, value: c.id })),
                ]}
              />
            </div>
          </div>

          {/* Menu Catalog Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">🍔 Available Food & Beverage Items</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => addToCart(item)}
                  className="glass-card p-4 flex flex-col justify-between cursor-pointer active:scale-95 transition-all min-h-[120px]"
                >
                  <div>
                    <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">{getCategoryLabel(item.category)}</span>
                    <p className="text-sm font-bold text-white mt-1 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-dark-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs font-bold text-white">Rs. {Number(item.price).toFixed(2)}</span>
                    <span className="text-[10px] bg-brand-500/10 text-brand-400 font-bold px-2 py-0.5 rounded-full">+ Add</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: POS Cart Summary & Fiscal Outlays */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-2xl relative flex flex-col min-h-[500px]">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>
            <h3 className="text-base font-bold text-white border-b border-dark-800 pb-4 mb-4">🛒 Cart Summary</h3>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[300px]">
              {cart.length === 0 ? (
                <p className="text-xs text-dark-500 text-center py-12">No food items added. Select foods from the catalog!</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-3 bg-dark-900 border border-dark-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-dark-400">Rs. {Number(item.price).toFixed(2)} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-dark-950 border border-dark-800 px-2 py-1 rounded-lg">
                        <button className="text-xs text-dark-300 hover:text-white" onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <span className="text-xs text-white font-mono">{item.quantity}</span>
                        <button className="text-xs text-dark-300 hover:text-white" onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Add food instructions..."
                      value={item.note}
                      onChange={(e) => updateItemNote(item.id, e.target.value)}
                      className="w-full bg-dark-950/60 border border-dark-800 rounded-lg px-2 py-1 text-[10px] text-dark-200 focus:outline-none"
                    />
                  </div>
                ))
              )}
            </div>

            {/* Cart Price Calculations */}
            <div className="border-t border-dark-800 pt-4 mt-6 space-y-2 text-xs">
              <div className="flex justify-between text-dark-400">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-dark-400">
                <span>Discount Amount</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-20 bg-dark-900 border border-dark-850 text-right px-2 py-0.5 rounded text-white text-[11px]"
                />
              </div>
              <div className="flex justify-between text-dark-400">
                <span>Nepalese VAT (13%)</span>
                <span>Rs. {vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white border-t border-dark-800 pt-2 mt-2">
                <span>Grand Total</span>
                <span className="text-brand-400 font-mono">Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Dispatch Button */}
            <Button 
              variant="primary" 
              onClick={handlePlaceOrder}
              loading={loading}
              className="w-full mt-6"
              disabled={cart.length === 0}
            >
              🍳 Place Order & Dispatch KOT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
