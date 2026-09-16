import React, { useEffect, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/admin/audit-logs', { params: { action: search } });
        setLogs(response.data.data);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Audit Log Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">Immutable tracking of administrative actions, price adjustments, and stock alterations</p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by action (e.g. order_status_updated, inventory_adjusted, product_created)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>
      </div>

      <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Administrator</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity</th>
              <th className="py-3 px-4">IP Address</th>
              <th className="py-3 px-4">Payload Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="py-3.5 px-4 text-slate-400">{formatDate(log.created_at)}</td>
                <td className="py-3.5 px-4 text-white font-sans font-bold">
                  {log.user?.name || 'System Auto'}
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">
                    {log.action}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  {log.entity_type} #{log.entity_id}
                </td>
                <td className="py-3.5 px-4 text-slate-500">{log.ip_address || '127.0.0.1'}</td>
                <td className="py-3.5 px-4 max-w-xs truncate text-slate-400 text-[10px]">
                  {log.new_values ? JSON.stringify(log.new_values) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
