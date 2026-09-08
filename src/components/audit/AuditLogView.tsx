import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Lock, User, Clock, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '../../types';
import { storageService } from '../../services/storage';

export const AuditLogView: React.FC = () => {
  const [logs] = useState<AuditLog[]>(storageService.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = logs.filter(l => {
    const matchesSearch =
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.record.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.ipAddress.includes(searchTerm);
    const matchesRole = roleFilter === 'All' || l.userRole.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security & Clinical Audit Logs</h1>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Immutable Trace Log
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Cryptographically timestamped audit trail of patient access, prescription generation, and data mutations.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Security Level: <strong>HIPAA & ABDM Compliant Logging</strong>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user, clinical action, record ID, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white px-3 py-2 text-xs border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
        >
          <option value="All">All User Roles</option>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
          <option value="reception">Reception</option>
          <option value="system">System / Kiosk</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4">Record / Entity</th>
                <th className="py-3 px-4">IP / Terminal</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{l.userName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                      {l.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{l.action}</td>
                  <td className="py-3 px-4 font-mono text-indigo-600 font-medium">{l.record}</td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{l.ipAddress}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{l.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
