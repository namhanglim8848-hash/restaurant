import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import { useToast } from '../../context/ToastContext';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await adminApi.getAuditLogs();
        const logsArray = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setLogs(logsArray);
      } catch (err) {
        console.error(err);
        showToast('Failed to load platform central audit logs.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const headers = ['Action Event', 'Model Reference', 'User ID', 'IP Address', 'Recorded At'];

  const mappedItems = logs.map((log) => ({
    id: log.id,
    action_event: (
      <Badge variant={log.event === 'delete' ? 'danger' : log.event === 'update' ? 'warning' : 'success'}>
        {log.event.toUpperCase()}
      </Badge>
    ),
    model_reference: log.auditable_type ? `${log.auditable_type.split('\\').pop()} (#${log.auditable_id})` : '-',
    user_id: String(log.user_id || 'System Cron'),
    ip_address: log.ip_address || '-',
    recorded_at: new Date(log.created_at).toLocaleString('en-NP'),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-dark-800/40">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Central System Audit Logs</h1>
          <p className="text-xs text-dark-400 mt-1">Review administrative actions, database mutations, and platform control security states</p>
        </div>
      </div>

      <DataTable
        headers={headers}
        items={mappedItems}
        loading={loading}
      />
    </div>
  );
}
