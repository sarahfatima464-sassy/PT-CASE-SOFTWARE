import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  User as UserIcon,
  Stethoscope,
  ShieldAlert,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { ClinicalCase, User } from '../../types';
import { permissionService } from '../../services/permissionService';

interface RecycleBinProps {
  currentUser?: User | null;
  onOpenPatient?: (patientId: string) => void;
  onOpenCase?: (caseId: string) => void;
}

export const RecycleBin: React.FC<RecycleBinProps> = ({ currentUser, onOpenPatient, onOpenCase }) => {
  const [recycleCases, setRecycleCases] = useState<ClinicalCase[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'deleted' | 'completed'>('all');
  const [selectedCaseForView, setSelectedCaseForView] = useState<ClinicalCase | null>(null);
  const [caseToDeletePermanently, setCaseToDeletePermanently] = useState<ClinicalCase | null>(null);
  const [caseToRestore, setCaseToRestore] = useState<ClinicalCase | null>(null);
  const [permanentDeleteReason, setPermanentDeleteReason] = useState<string>('Clinician authorized final erasure');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const canRestore = permissionService.canRestoreCase(currentUser);
  const canPermanentDelete = permissionService.canPermanentlyDeleteCase(currentUser);
  const isReception = currentUser?.role === 'reception';

  // Load cases from storageService
  const loadRecycleBin = () => {
    const cases = storageService.getRecycleBinCases();
    setRecycleCases(cases);
  };

  useEffect(() => {
    loadRecycleBin();
  }, []);

  // Restore case after confirmation
  const handleRestore = (c: ClinicalCase) => {
    const perm = permissionService.checkPermission('restore_case', currentUser);
    if (!perm.allowed) {
      setActionSuccessMessage(`Action denied: ${perm.reason}`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      return;
    }
    const success = storageService.restoreCase(c.id, currentUser?.name || 'Sarah Fatima');
    if (success) {
      setActionSuccessMessage(`Case ${c.id} for ${c.patientName} has been restored to active workflow.`);
      loadRecycleBin();
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  // Permanently delete case
  const handleConfirmPermanentDelete = () => {
    if (!caseToDeletePermanently) return;
    const perm = permissionService.checkPermission('permanently_delete_case', currentUser);
    if (!perm.allowed) {
      setActionSuccessMessage(`Action denied: ${perm.reason}`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      return;
    }
    const success = storageService.permanentlyDeleteCase(
      caseToDeletePermanently.id,
      currentUser?.name || 'Sarah Fatima',
      permanentDeleteReason
    );
    if (success) {
      setActionSuccessMessage(`Case ${caseToDeletePermanently.id} permanently destroyed per retention protocol.`);
      setCaseToDeletePermanently(null);
      loadRecycleBin();
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  // Filter cases
  const filteredCases = recycleCases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.primaryDiagnosis && c.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.doctorName && c.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.completedAt && c.completedAt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.recycleBinMovedAt && c.recycleBinMovedAt.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'deleted'
        ? c.status === 'deleted'
        : c.status === 'completed';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Permanent Recycle Bin & Retention Archive
            </h1>
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
              {recycleCases.length} Retained Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Completed and soft-deleted cases are retained indefinitely unless an authorized clinician permanently deletes them. Restoring a case returns it instantly to the active clinical workflow.
          </p>
        </div>

      </div>

      {/* Reception View-Only Notice */}
      {isReception && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 shadow-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <strong>View Only Mode:</strong> Reception personnel have read-only visibility into the permanent case retention inventory. Restoring cases or permanently purging records requires authorized clinical/admin credentials.
          </div>
        </div>
      )}

      {/* Action Notification */}
      {actionSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-medium shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Retention Policy Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900">
              Regulatory Retention Policy: Permanent Storage
            </h4>
            <p className="text-amber-800/80 mt-0.5">
              Encounters marked as Completed or Deleted remain in the Recycle Bin indefinitely unless an authorized clinician deliberately performs a permanent deletion. Restore and purge actions are recorded in the system audit log.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
            Permanent Retention Active
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by case ID, patient name, ID, diagnosis, doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white px-3 py-2 text-xs border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Retained Records ({recycleCases.length})</option>
            <option value="deleted">Soft-Deleted Only</option>
            <option value="completed">Completed / Archived Only</option>
          </select>
        </div>
      </div>

      {/* Recycle Bin Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Recycle Bin is Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no cases currently in the permanent retention archive. When cases are completed or soft-deleted, they will appear here and remain stored indefinitely.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Case ID</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Diagnosis / Specialty</th>
                  <th className="py-3.5 px-4">Doctor</th>
                  <th className="py-3.5 px-4">Case Status</th>
                  <th className="py-3.5 px-4">Completed / Stored</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((c) => {
                  const isSoftDeleted = c.status === 'deleted';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Case ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {c.id}
                      </td>

                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{c.patientName}</div>
                        <span className="text-[11px] text-slate-400 font-mono">{c.patientId}</span>
                      </td>

                      {/* Diagnosis */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {c.primaryDiagnosis || c.chiefComplaint}
                        </div>
                        <span className="text-[11px] text-slate-400">{c.specialty}</span>
                      </td>

                      {/* Doctor */}
                      <td className="py-3.5 px-4 text-slate-700">
                        {c.doctorName || 'Sarah Fatima'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isSoftDeleted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                            <Trash className="w-3 h-3 text-rose-500" />
                            Soft-Deleted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                            Completed (Permanent Archive)
                          </span>
                        )}
                        {c.deletionReason && (
                          <span className="block text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                            Reason: {c.deletionReason}
                          </span>
                        )}
                      </td>

                      {/* Permanent retention */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700">
                          {c.completedAt ? `Completed ${new Date(c.completedAt).toLocaleDateString()}` : c.deletedAt ? `Deleted ${new Date(c.deletedAt).toLocaleDateString()}` : 'Date not recorded'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Stored {c.recycleBinMovedAt ? new Date(c.recycleBinMovedAt).toLocaleDateString() : 'date not recorded'}
                        </div>
                        <span className="text-[11px] text-emerald-700 font-semibold">Stored Permanently</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedCaseForView(c)}
                            title="Inspect Medical Record"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Restore */}
                          {canRestore && (
                            <button
                              type="button"
                              onClick={() => setCaseToRestore(c)}
                              title="Restore Case to Active Workflow"
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Recover Case</span>
                            </button>
                          )}

                          {/* Permanent Delete */}
                          {canPermanentDelete && (
                            <button
                              type="button"
                              onClick={() => setCaseToDeletePermanently(c)}
                              title="Permanently Delete Record"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Case Details Inspection Modal */}
      {selectedCaseForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Clinical Case Details: {selectedCaseForView.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: {selectedCaseForView.patientName} ({selectedCaseForView.patientId})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCaseForView(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Primary Diagnosis</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedCaseForView.primaryDiagnosis || 'Acute Consultation'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Specialty</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedCaseForView.specialty}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Chief Complaint</span>
                  <span className="text-slate-700">{selectedCaseForView.chiefComplaint}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Duration</span>
                  <span className="text-slate-700">{selectedCaseForView.duration || 'N/A'}</span>
                </div>
              </div>

              {/* Vitals */}
              {selectedCaseForView.vitals && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Recorded Vital Signs
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-slate-400 block">BP:</span>
                      <span className="font-semibold text-slate-800">{selectedCaseForView.vitals.bloodPressure}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Pulse:</span>
                      <span className="font-semibold text-slate-800">{selectedCaseForView.vitals.pulse}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Temp:</span>
                      <span className="font-semibold text-slate-800">{selectedCaseForView.vitals.temperature}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">SpO2:</span>
                      <span className="font-semibold text-slate-800">{selectedCaseForView.vitals.spO2}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Prescriptions */}
              {selectedCaseForView.prescriptions && selectedCaseForView.prescriptions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Prescribed Medications ({selectedCaseForView.prescriptions.length})
                  </span>
                  <div className="space-y-1">
                    {selectedCaseForView.prescriptions.map((p, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800">{p.name} {p.strength}</span>
                          <span className="text-slate-500 text-[11px] block">{p.frequency} — {p.duration}</span>
                        </div>
                        <span className="text-[11px] text-indigo-600 font-semibold">{p.route}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Retention Expiry Details */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-800">
                <div className="font-bold">Retention Details:</div>
                <div className="mt-0.5">
                  Stored indefinitely. No automatic expiration applies. This case remains available in the archive until an authorized user explicitly chooses permanent deletion.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setCaseToRestore(selectedCaseForView);
                  setSelectedCaseForView(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Recover Case
              </button>
              <button
                type="button"
                onClick={() => setSelectedCaseForView(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Deletion Safety Confirmation Modal */}
      {caseToDeletePermanently && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-rose-200 shadow-2xl p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Permanently Destroy Case {caseToDeletePermanently.id}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This case will be permanently deleted and cannot be recovered. Are you sure you want to continue? The encounter record for <strong>{caseToDeletePermanently.patientName}</strong> will be removed from storage and recorded in the audit log.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Reason for Permanent Erasure:
              </label>
              <input
                type="text"
                value={permanentDeleteReason}
                onChange={(e) => setPermanentDeleteReason(e.target.value)}
                placeholder="e.g. Test record / Clinician authorized removal"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setCaseToDeletePermanently(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Permanently Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {caseToRestore && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-emerald-200 shadow-2xl p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Recover this case?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Recover this case and return it to the active case workflow? All patient, clinical, prescription, follow-up, and AI information will be restored.
              </p>
              <p className="text-xs text-slate-500 mt-2"><strong>{caseToRestore.patientName}</strong> · {caseToRestore.id}</p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setCaseToRestore(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  handleRestore(caseToRestore);
                  setCaseToRestore(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Recover Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
