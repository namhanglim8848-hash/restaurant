import React, { useEffect, useState } from 'react';
import { orderApi } from '../api/orderApi';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { useToast } from '../context/ToastContext';

export default function KitchenTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchTickets = async () => {
    try {
      const response = await orderApi.getKitchenTickets();
      setTickets(response.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load active kitchen tickets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // Automated polling every 10 seconds to keep kitchen in sync
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateTicketStatus = async (id, status) => {
    try {
      await orderApi.updateKitchenTicketStatus(id, { status });
      showToast(`Kitchen Ticket marked as ${status.replace('_', ' ')}!`, 'success');
      fetchTickets();
    } catch (err) {
      console.error(err);
      showToast('Failed to update kitchen ticket status.', 'error');
    }
  };

  const getTicketStatusBadge = (status) => {
    const statuses = {
      pending: <Badge variant="warning">Pending</Badge>,
      preparing: <Badge variant="info">Preparing</Badge>,
      ready: <Badge variant="success">Ready</Badge>,
      delivered: <Badge variant="gray">Delivered</Badge>,
    };
    return statuses[status] || <Badge>{status}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Kitchen Order Tickets (KOT) console</h1>
          <p className="text-xs text-dark-400 mt-1">Monitor real-time food preparations and toggle ticket ready states</p>
        </div>
        <Button variant="secondary" onClick={fetchTickets}>
          🔄 Refresh Screen
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-dark-500 border border-dark-800">
          No food preparations currently active in the kitchen!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="glass-panel p-6 rounded-2xl border border-dark-800 relative flex flex-col justify-between min-h-[260px]"
            >
              {/* Header */}
              <div>
                <div className="flex justify-between items-start border-b border-dark-800 pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">KOT Code: #{ticket.ticket_number}</h3>
                    <p className="text-[10px] text-dark-400">Order Ref: #{ticket.order_id}</p>
                  </div>
                  {getTicketStatusBadge(ticket.status)}
                </div>

                {/* Items Checklist */}
                <div className="space-y-2 py-2">
                  {ticket.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs border-b border-dark-800/20 pb-1.5">
                      <div>
                        <p className="text-dark-200 font-semibold">{item.menu_item_name} x {item.quantity}</p>
                        {item.notes && <p className="text-[10px] text-brand-400 italic">★ "{item.notes}"</p>}
                      </div>
                      <Badge variant="gray">{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-dark-800 mt-4">
                {ticket.status === 'pending' && (
                  <Button 
                    variant="primary" 
                    className="w-full text-xs py-1.5"
                    onClick={() => handleUpdateTicketStatus(ticket.id, 'preparing')}
                  >
                    🍳 Start Prep
                  </Button>
                )}
                {ticket.status === 'preparing' && (
                  <Button 
                    variant="primary" 
                    className="w-full text-xs py-1.5"
                    onClick={() => handleUpdateTicketStatus(ticket.id, 'ready')}
                  >
                    🛎️ Mark Ready
                  </Button>
                )}
                {ticket.status === 'ready' && (
                  <Button 
                    variant="secondary" 
                    className="w-full text-xs py-1.5"
                    onClick={() => handleUpdateTicketStatus(ticket.id, 'delivered')}
                  >
                    ✓ Complete Delivery
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
