import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, RotateCcw, User, ArrowRight, Check } from 'lucide-react';
import { FollowUp } from '../../types';
import { storageService } from '../../services/storage';

interface FollowUpManagerProps {
  onOpenPatient: (patientId: string) => void;
}

export const FollowUpManager: React.FC<FollowUpManagerProps> = ({ onOpenPatient }) => {
  const [followUps, setFollowUps] = useState<FollowUp[]>(storageService.getFollowUps());
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const patients = storageService.getPatients();

  const handleMarkComplete = (id: string) => {
    const updated = followUps.map(f => (f.id === id ? { ...f, status: 'Completed' as const } : f));
    setFollowUps(updated);
    const target = followUps.find(f => f.id === id);
    if (target) {
      storageService.saveFollowUp({ ...target, status: 'Completed' });
    }
  };

  const filtered = followUps.filter(f => {
    if (activeFilter === 'today') return f.dueDate === new Date().toISOString().split('T')[0];
    if (activeFilter === 'upcoming') return f.status === 'Scheduled';
    if (activeFilter === 'overdue') return f.status === 'Overdue';
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Follow-up Management</h1>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {followUps.filter(f => f.status === 'Scheduled').length} Scheduled
            </span>
          </div>
          <p className="text-xs text-slate-500">Track scheduled consultations, overdue re-examinations, and post-discharge reviews.</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {(['all', 'today', 'upcoming', 'overdue'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium cursor-pointer transition-colors ${
                activeFilter === tab ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Follow-up Due Date</th>
                <th className="py-3 px-4">Reason & Clinical Focus</th>
                <th className="py-3 px-4">Instructions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(f => {
                const patient = patients.find(p => p.id === f.patientId);
                return (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{patient?.name || f.patientId}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{f.patientId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{f.dueDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 max-w-xs truncate">{f.reason}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">{f.notes}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        f.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        f.status === 'Overdue' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {f.status !== 'Completed' && (
                        <button
                          type="button"
                          onClick={() => handleMarkComplete(f.id)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenPatient(f.patientId)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold cursor-pointer"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
