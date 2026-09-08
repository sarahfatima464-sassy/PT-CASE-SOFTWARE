import React from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  Calendar,
  UserPlus,
  FolderPlus,
  Mic,
  ScanLine,
  Search,
  History,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Activity,
  Lock,
  Eye
} from 'lucide-react';
import { Patient, ClinicalCase, User } from '../../types';
import { storageService } from '../../services/storage';
import { permissionService } from '../../services/permissionService';

interface DashboardProps {
  currentUser?: User | null;
  onNavigateToNewCase: (patientId?: string) => void;
  onNavigateToNewPatient: () => void;
  onNavigateToPatientProfile: (patientId: string) => void;
  onNavigateToScanner: () => void;
  onNavigateToHistory: () => void;
  onNavigateToAIInsights: () => void;
  onOpenPatientMode: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  onNavigateToNewCase,
  onNavigateToNewPatient,
  onNavigateToPatientProfile,
  onNavigateToScanner,
  onNavigateToHistory,
  onNavigateToAIInsights,
  onOpenPatientMode
}) => {
  const patients = storageService.getPatients();
  const cases = storageService.getCases();
  const followUps = storageService.getFollowUps();

  const isReception = currentUser?.role === 'reception';
  const canEditClinical = permissionService.canEditClinicalData(currentUser);

  const patientsToday = patients.length;
  const casesCompleted = cases.filter(c => c.status === 'Completed').length;
  const pendingReviews = patients.filter(p => p.status === 'Waiting').length;
  const followUpsDue = followUps.filter(f => f.status === 'Scheduled').length;

  const waitingPatients = patients.filter(p => p.status === 'Waiting');
  const recentPatients = patients.slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Reception View-Only Notice */}
      {isReception && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <strong>Front Desk View Only:</strong> Logged in as Reception staff. You can register patients, search medical directories, and manage the waiting room. Starting clinical cases and prescribing requires Doctor/Nurse credentials.
            </div>
          </div>
          <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold uppercase tracking-wider text-[10px]">
            Receptionist Role
          </span>
        </div>
      )}

      {/* Welcome Banner & Role Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-medium border border-indigo-400/30 mb-1">
            <Activity className="w-3.5 h-3.5 text-indigo-300" />
            <span>
              Workspace • {currentUser?.name || 'Sarah Fatima'} ({currentUser?.role ? currentUser.role.toUpperCase() : 'DOCTOR'})
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">CareFlow Clinical Overview</h1>
          <p className="text-xs text-indigo-200 max-w-xl">
            Real-time multi-modal case capture, voice-to-text intake, prescription digitization, and AI decision support.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={onOpenPatientMode}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Open Patient Kiosk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {canEditClinical && (
            <button
              type="button"
              id="dash-quick-new-case"
              onClick={() => onNavigateToNewCase()}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Clinical Case</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{patientsToday}</div>
            <div className="text-xs text-slate-500 font-medium">Patients Registered</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{casesCompleted}</div>
            <div className="text-xs text-slate-500 font-medium">Cases Completed</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{pendingReviews}</div>
            <div className="text-xs text-slate-500 font-medium">Waiting Room Queue</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{followUpsDue}</div>
            <div className="text-xs text-slate-500 font-medium">Follow-ups Scheduled</div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Clinical Quick Actions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            id="qa-new-patient"
            onClick={onNavigateToNewPatient}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-center gap-2 group transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">New Patient</span>
          </button>

          {canEditClinical ? (
            <>
              <button
                type="button"
                id="qa-new-case"
                onClick={() => onNavigateToNewCase()}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-center gap-2 group transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800">New Case</span>
              </button>

              <button
                type="button"
                id="qa-voice-entry"
                onClick={() => onNavigateToNewCase('CF-1001')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-center gap-2 group transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Voice Case Entry</span>
              </button>
            </>
          ) : (
            <div className="p-3.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 flex flex-col items-center justify-center text-center gap-1.5 opacity-90 col-span-2">
              <Lock className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-bold text-amber-800">Clinical Workflow Restricted</span>
              <span className="text-[10px] text-amber-700">Case entry & diagnosis require Doctor/Nurse login</span>
            </div>
          )}

          <button
            type="button"
            id="qa-scan-rx"
            onClick={onNavigateToScanner}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-center gap-2 group transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ScanLine className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Scan Old Rx</span>
          </button>

          <button
            type="button"
            id="qa-search-patient"
            onClick={() => {
              const el = document.getElementById('global-patient-search');
              el?.focus();
            }}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-center gap-2 group transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Search Patient</span>
          </button>

          <button
            type="button"
            id="qa-case-history"
            onClick={onNavigateToHistory}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-center gap-2 group transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Case History</span>
          </button>
        </div>
      </div>

      {/* Main Two Column Section: Waiting Room + AI Insights Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting Room & Intake Queue (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900">Waiting Room & Kiosk Triage Queue</h2>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
              {waitingPatients.length} Waiting
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Complaint / Reason</th>
                  <th className="py-2.5 px-3">Wait Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {waitingPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{patient.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{patient.id} • {patient.gender}, {patient.age}y</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs truncate">
                      {patient.waitingReason || 'General clinical consultation'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        <Clock className="w-3 h-3" />
                        <span>{patient.waitTimeMinutes || 12} mins</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                        Waiting
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {canEditClinical ? (
                        <button
                          type="button"
                          onClick={() => onNavigateToNewCase(patient.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Start Case</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onNavigateToPatientProfile(patient.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Profile</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights Card (1 Col) with Critical Verification Disclaimer */}
        <div className="bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/30 rounded-2xl border border-indigo-200/80 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">AI Clinical Insights</h3>
            </div>
            <button
              type="button"
              onClick={onNavigateToAIInsights}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Risk Flag: Penicillin Allergy</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-snug">
                Patient Arjun Rao (CF-1001) has documented Penicillin hypersensitivity. Beta-lactams contraindicated.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Missing Info: Family History</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-snug">
                Cardiovascular hereditary history is unconfirmed for patient Rahul Kumar (CF-1003).
              </p>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Possible Condition: Viral URI</span>
              </div>
              <p className="text-[11px] text-indigo-700 leading-snug">
                Symptoms from multilingual patient intake align with acute viral URI vs early seasonal influenza.
              </p>
            </div>
          </div>

          {/* Strict Clinician Verification Label Required by Prompt */}
          <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200/80 text-[10px] text-slate-600 font-medium leading-relaxed text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500 inline-block mr-1 -mt-0.5" />
            <strong>AI Decision Support — Clinician verification required.</strong> Never present AI output as final diagnosis without doctor evaluation.
          </div>
        </div>
      </div>

      {/* Recent Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Patients</h2>
          <button
            type="button"
            onClick={() => {}}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
          >
            View Directory ({patients.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Patient ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Demographics</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Last Visit</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPatients.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => onNavigateToPatientProfile(patient.id)}
                  className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-3 font-mono font-medium text-indigo-600">{patient.id}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 group-hover:text-indigo-600">{patient.name}</td>
                  <td className="py-3 px-3 text-slate-600">{patient.age}y / {patient.gender} • Blood: {patient.bloodGroup}</td>
                  <td className="py-3 px-3 text-slate-600">{patient.phone}</td>
                  <td className="py-3 px-3 text-slate-600">{patient.lastVisit}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      patient.status === 'Waiting' ? 'bg-amber-100 text-amber-800' :
                      patient.status === 'In Consultation' ? 'bg-blue-100 text-blue-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-slate-400 group-hover:text-indigo-600 font-medium inline-flex items-center gap-1">
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
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
