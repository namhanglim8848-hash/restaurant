import React, { useEffect, useState } from 'react';
import { paymentApi } from '../api/paymentApi';
import { invoiceApi } from '../api/invoiceApi';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import { useToast } from '../context/ToastContext';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    invoice_id: '',
    amount: '',
    gateway: 'cash',
    transaction_id: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [payRes, invRes] = await Promise.all([
        paymentApi.getPayments(),
        invoiceApi.getInvoices(),
      ]);
      setPayments(payRes.data);
      setInvoices(invRes.data.filter((i) => i.status === 'unpaid' || i.status === 'partially_paid'));
    } catch (err) {
      console.error(err);
      showToast('Failed to load transaction database.', 'error');
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

  const handleOpenManual = () => {
    setFormData({ invoice_id: '', amount: '', gateway: 'cash', transaction_id: '' });
    if (invoices.length === 0) {
      showToast('No outstanding unpaid invoices found!', 'info');
    }
    setIsModalOpen(true);
  };

  const handleSubmitManual = async (e) => {
    e.preventDefault();
    try {
      await paymentApi.createManualPayment(formData);
      showToast('Manual payment processed successfully.', 'success');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleInitiateEsewa = async (invoice) => {
    try {
      showToast('Initiating secure eSewa V2 transaction...', 'info');
      
      const payload = {
        invoice_id: invoice.id,
        amount: Number(invoice.total),
      };

      const response = await paymentApi.initiateEsewa(payload);
      const { payment_url, fields } = response.data;

      // Programmatic V2 Form Submission
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payment_url;
      
      Object.keys(fields).forEach((key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to initiate eSewa payment.', 'error');
    }
  };

  const getGatewayBadge = (gateway) => {
    const gateways = {
      cash: <Badge variant="success">Cash</Badge>,
      bank: <Badge variant="info">Bank Transfer</Badge>,
      qr: <Badge variant="info">Fonepay QR</Badge>,
      esewa: <Badge variant="warning">eSewa ePay</Badge>,
      credit: <Badge variant="danger">Store Credit</Badge>,
    };
    return gateways[gateway] || <Badge>{gateway}</Badge>;
  };

  const headers = ['Receipt No', 'Invoice ID', 'Gateway', 'Amount', 'Date', 'Status'];

  const safePayments = Array.isArray(payments) ? payments : [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const mappedItems = safePayments.map((p) => ({
    id: p.id,
    receipt_no: p.transaction_id || '-',
    invoice_id: String(p.invoice_id),
    gateway: getGatewayBadge(p.gateway),
    amount: `Rs. ${Number(p.amount).toFixed(2)}`,
    date: new Date(p.payment_date).toLocaleDateString('en-NP'),
    status: <Badge variant={p.status === 'completed' ? 'success' : 'warning'}>{p.status}</Badge>,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Payment Ledger & Transactions</h1>
          <p className="text-xs text-dark-400 mt-1">Govern invoices settlement ledgers, cashier cash outputs, and eSewa checkouts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleOpenManual}>
            + Receive Payment
          </Button>
        </div>
      </div>

      {/* Outstandings alert panel */}
      {safeInvoices.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">💳 Outstanding Unpaid Invoices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeInvoices.map((inv) => (
              <div key={inv.id} className="p-4 bg-dark-900 border border-dark-800 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">Inv: #{inv.invoice_number}</p>
                  <p className="text-[10px] text-dark-400">Total: Rs. {Number(inv.total).toFixed(2)}</p>
                </div>
                <Button 
                  variant="primary" 
                  className="text-[10px] px-3 py-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400"
                  onClick={() => handleInitiateEsewa(inv)}
                >
                  Pay via eSewa 🇳🇵
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Ledger */}
      <DataTable
        headers={headers}
        items={mappedItems}
        loading={loading}
      />

      {/* Manual Payment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Receive Offline / POS Payment">
        <form onSubmit={handleSubmitManual} className="space-y-4">
          <Select
            label="Outstanding Invoice"
            name="invoice_id"
            required
            value={formData.invoice_id}
            onChange={handleChange}
            options={[
              { label: '-- Select Invoice --', value: '' },
              ...safeInvoices.map((inv) => ({ label: `Inv #${inv.invoice_number} (Rs. ${inv.total})`, value: inv.id })),
            ]}
          />
          <Input
            label="Amount (Rs.)"
            name="amount"
            type="number"
            step="0.01"
            required
            value={formData.amount}
            onChange={handleChange}
          />
          <Select
            label="Payment Mode / Gateway"
            name="gateway"
            required
            value={formData.gateway}
            onChange={handleChange}
            options={[
              { label: 'Cash Ledger', value: 'cash' },
              { label: 'Fonepay QR Scan', value: 'qr' },
              { label: 'Bank Transfer', value: 'bank' },
              { label: 'Store Credit Account', value: 'credit' },
            ]}
          />
          <Input
            label="Transaction / Reference ID (Optional)"
            name="transaction_id"
            placeholder="e.g. FONEPAY-9812A"
            value={formData.transaction_id}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Record Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
