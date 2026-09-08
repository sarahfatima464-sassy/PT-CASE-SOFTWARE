import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Stethoscope,
  ChevronRight,
  Calendar,
  User as UserIcon,
  Eye,
  X,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Clock,
  AlertCircle,
  Lock
} from 'lucide-react';
import { ClinicalCase, User } from '../../types';
import { storageService } from '../../services/storage';
import { permissionService } from '../../services/permissionService';

interface CaseHistoryProps {
  currentUser?: User | null;
  onOpenPatient: (patientId: string) => void;
  onNavigateToRecycleBin?: () => void;
}

export const CaseHistory: React.FC<CaseHistoryProps> = ({ currentUser, onOpenPatient, onNavigateToRecycleBin }) => {
  const [cases, setCases] = useState<ClinicalCase[]>(storageService.getCases());
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'in_progress' | 'completed' | 'deleted'>('All');
  const [selectedCase, setSelectedCase] = useState<ClinicalCase | null>(null);
  const [softDeleteConfirmCase, setSoftDeleteConfirmCase] = useState<ClinicalCase | null>(null);
  const [deletionReason, setDeletionReason] = useState<string>('Clinical consultation completed or rescheduled');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const patients = storageService.getPatients();

  const canComplete = permissionService.canCompleteCase(currentUser);
  const canDelete = permissionService.canDeleteCase(currentUser);
  const canRestore = permissionService.canRestoreCase(currentUser);
  const isReception = currentUser?.role === 'reception';

  const refreshCases = () => {
    setCases(storageService.getCases());
  };

  const getDaysRemaining = (expiresAt?: string) => {
    if (!expiresAt) return 30;
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // Complete an active case (triggers 30-day retention)
  const handleCompleteCase = (c: ClinicalCase) => {
    const perm = permissionService.checkPermission('COMPLETE_CASE', currentUser);
    if (!perm.allowed) {
      setNotificationMsg(`Action denied: ${perm.reason}`);
      setTimeout(() => setNotificationMsg(null), 4000);
      return;
    }
    storageService.completeCase(c.id, currentUser?.id || 'DOC-101', currentUser?.name || 'Dr. Ramesh Reddy, MD');
    setNotificationMsg(`Case ${c.id} completed and moved into 30-day retention.`);
    refreshCases();
    if (selectedCase?.id === c.id) setSelectedCase(null);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Soft-delete a case into recycle bin
  const handleSoftDelete = () => {
    if (!softDeleteConfirmCase) return;
    const perm = permissionService.checkPermission('DELETE_CASE', currentUser);
    if (!perm.allowed) {
      setNotificationMsg(`Action denied: ${perm.reason}`);
      setTimeout(() => setNotificationMsg(null), 4000);
      return;
    }
    storageService.softDeleteCase(softDeleteConfirmCase.id, currentUser?.name || 'Dr. Ramesh Reddy, MD', deletionReason);
    setNotificationMsg(`Case ${softDeleteConfirmCase.id} moved to Recycle Bin (30-day soft quarantine).`);
    setSoftDeleteConfirmCase(null);
    refreshCases();
    if (selectedCase?.id === softDeleteConfirmCase.id) setSelectedCase(null);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Restore a case
  const handleRestoreCase = (c: ClinicalCase) => {
    const perm = permissionService.checkPermission('RESTORE_CASE', currentUser);
    if (!perm.allowed) {
      setNotificationMsg(`Action denied: ${perm.reason}`);
      setTimeout(() => setNotificationMsg(null), 4000);
      return;
    }
    storageService.restoreCase(c.id, currentUser?.name || 'Dr. Ramesh Reddy, MD');
    setNotificationMsg(`Case ${c.id} restored to active clinical workflow.`);
    refreshCases();
    if (selectedCase?.id === c.id) setSelectedCase(null);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const filtered = cases.filter(c => {
    const patient = patients.find(p => p.id === c.patientId);
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.primaryDiagnosis && c.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesSpecialty = specialtyFilter === 'All' || c.specialty === specialtyFilter;

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'in_progress'
        ? (c.status === 'in_progress' || c.status === 'Draft')
        : statusFilter === 'completed'
        ? (c.status === 'completed' || c.status === 'Completed')
        : c.status === 'deleted';

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const activeCount = cases.filter(c => c.status === 'in_progress' || c.status === 'Draft').length;
  const completedCount = cases.filter(c => c.status === 'completed' || c.status === 'Completed').length;
  const deletedCount = cases.filter(c => c.status === 'deleted').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Case History & Clinical Archive</h1>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {cases.length} Total Encounters
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, review, complete, and manage 30-day retention policies across clinical encounters.
          </p>
        </div>

        {onNavigateToRecycleBin && (
          <button
            type="button"
            onClick={onNavigateToRecycleBin}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4 text-amber-600" />
            <span>Open 30-Day Recycle Bin ({deletedCount + completedCount})</span>
          </button>
        )}
      </div>

      {/* Reception View-Only Notice */}
      {isReception && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 shadow-xs">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <strong>View Only Mode:</strong> Reception personnel have read-only access to case archives and clinical notes. Case completions, deletions, and restorations require doctor authentication.
          </div>
        </div>
      )}

      {/* Notification */}
      {notificationMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-medium shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button type="button" onClick={() => setNotificationMsg(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by diagnosis, case ID, patient name, doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              statusFilter === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({cases.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              statusFilter === 'in_progress'
                ? 'bg-teal-600 text-white'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              statusFilter === 'completed'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('deleted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              statusFilter === 'deleted'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Recycle Bin ({deletedCount})
          </button>

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="bg-white px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Specialties</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Dermatology">Dermatology</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Primary Diagnosis</th>
                <th className="py-3 px-4">Specialty</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Status & Retention</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No clinical cases found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const patient = patients.find(p => p.id === c.patientId);
                  const isDeleted = c.status === 'deleted';
                  const isCompleted = c.status === 'completed' || c.status === 'Completed';
                  const daysLeft = getDaysRemaining(c.recycleBinExpiresAt);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600">{c.id}</td>
                      <td className="py-3.5 px-4 text-slate-600">{c.caseDate || c.date}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {patient?.name || c.patientName || c.patientId}
                        <span className="block text-[11px] text-slate-400 font-normal font-mono">{c.patientId}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {c.primaryDiagnosis || c.chiefComplaint}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{c.specialty}</td>
                      <td className="py-3.5 px-4 text-slate-700">{c.doctorName}</td>
                      <td className="py-3.5 px-4">
                        {isDeleted ? (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              Soft-Deleted
                            </span>
                            <span className="block text-[10px] text-rose-600 font-medium mt-0.5">
                              {daysLeft}d in Recycle Bin
                            </span>
                          </div>
                        ) : isCompleted ? (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              Completed
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              30-day retention ({daysLeft}d)
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                            Active Encounter
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCase(c)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {canComplete && !isDeleted && !isCompleted && (
                            <button
                              type="button"
                              onClick={() => handleCompleteCase(c)}
                              className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md text-xs font-semibold cursor-pointer"
                              title="Complete Case & Move to 30-Day Retention"
                            >
                              Complete
                            </button>
                          )}

                          {canDelete && !isDeleted && (
                            <button
                              type="button"
                              onClick={() => setSoftDeleteConfirmCase(c)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Move to Recycle Bin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {canRestore && isDeleted && (
                            <button
                              type="button"
                              onClick={() => handleRestoreCase(c)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Case Record: {selectedCase.id}</h2>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                    {selectedCase.specialty}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    selectedCase.status === 'deleted'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedCase.status === 'completed' || selectedCase.status === 'Completed'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {selectedCase.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Date: {selectedCase.caseDate || selectedCase.date} • Attending: {selectedCase.doctorName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 uppercase">Chief Complaint & Duration:</span>
                <p className="text-slate-800 font-medium">{selectedCase.chiefComplaint} ({selectedCase.duration || 'N/A'})</p>
                <p className="text-slate-600 mt-1">{selectedCase.historyOfPresentIllness}</p>
              </div>

              <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-1">
                <span className="font-bold text-indigo-900 uppercase">Primary Confirmed Diagnosis:</span>
                <p className="text-sm font-bold text-indigo-950">{selectedCase.primaryDiagnosis}</p>
                {selectedCase.differentialDiagnosis && selectedCase.differentialDiagnosis.length > 0 && (
                  <p className="text-indigo-800 text-[11px] mt-1">
                    <strong>Differentials:</strong> {selectedCase.differentialDiagnosis.join(', ')}
                  </p>
                )}
              </div>

              {/* 30-Day Retention Notice */}
              {selectedCase.recycleBinExpiresAt && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>
                      30-Day Retention: Retained until {new Date(selectedCase.recycleBinExpiresAt).toLocaleDateString()} ({getDaysRemaining(selectedCase.recycleBinExpiresAt)} days left)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded">
                    Soft Quarantine
                  </span>
                </div>
              )}

              {selectedCase.prescriptions && selectedCase.prescriptions.length > 0 && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 uppercase">Prescribed Treatment Regimen:</span>
                  <ul className="space-y-1">
                    {selectedCase.prescriptions.map((m, i) => (
                      <li key={i} className="p-2 bg-white rounded border border-slate-200 text-slate-800">
                        <strong>{m.name} {m.strength}</strong> — {m.dosage} {m.frequency} for {m.duration} ({m.instructions})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onOpenPatient(selectedCase.patientId);
                  setSelectedCase(null);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Patient Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                {canRestore && selectedCase.status === 'deleted' ? (
                  <button
                    type="button"
                    onClick={() => handleRestoreCase(selectedCase)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Restore to Active
                  </button>
                ) : canComplete && selectedCase.status !== 'completed' && selectedCase.status !== 'Completed' ? (
                  <button
                    type="button"
                    onClick={() => handleCompleteCase(selectedCase)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Complete Case
                  </button>
                ) : null}

                {isReception && (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>View Only 🔒</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Reason Modal */}
      {softDeleteConfirmCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Move Case {softDeleteConfirmCase.id} to Recycle Bin?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                The encounter will be safely stored in the 30-day Recycle Bin. It will disappear from active doctor queues but remains 100% restorable.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Reason for soft delete:</label>
              <input
                type="text"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSoftDeleteConfirmCase(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSoftDelete}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Move to Recycle Bin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
