import React, { useEffect, useState } from 'react';
import { invoiceApi } from '../api/invoiceApi';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { useToast } from '../context/ToastContext';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceApi.getInvoices();
      setInvoices(response.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load invoices.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownloadPdf = async (id, invoiceNumber) => {
    try {
      const blob = await invoiceApi.downloadPdf(id);
      
      // Handle the file stream download cleanly
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast('VAT Invoice PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate PDF. Verify PHP print extensions.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      paid: <Badge variant="success">Paid</Badge>,
      unpaid: <Badge variant="warning">Unpaid</Badge>,
      partially_paid: <Badge variant="info">Partial</Badge>,
      cancelled: <Badge variant="danger">Cancelled</Badge>,
    };
    return statuses[status] || <Badge>{status}</Badge>;
  };

  const headers = ['Invoice Number', 'Order ID', 'Subtotal', 'VAT Amount', 'Grand Total', 'Status'];

  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const mappedItems = safeInvoices.map((inv) => ({
    id: inv.id,
    invoice_number: inv.invoice_number,
    order_id: String(inv.order_id),
    subtotal: `Rs. ${Number(inv.subtotal).toFixed(2)}`,
    vat_amount: `Rs. ${Number(inv.tax).toFixed(2)}`,
    grand_total: `Rs. ${Number(inv.total).toFixed(2)}`,
    status: getStatusBadge(inv.status),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">VAT Invoices / Bills Registry</h1>
          <p className="text-xs text-dark-400 mt-1">Audit customer tax invoices, PAN details, and total sales parameters</p>
        </div>
      </div>

      <DataTable
        headers={headers}
        items={mappedItems}
        loading={loading}
        actions={(item) => (
          <Button 
            variant="ghost" 
            className="text-brand-400 font-semibold"
            onClick={() => handleDownloadPdf(item.id, item.invoice_number)}
          >
            📥 Download PDF
          </Button>
        )}
      />
    </div>
  );
}
