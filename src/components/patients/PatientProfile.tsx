import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Stethoscope,
  ScanLine,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  FileText,
  Clock,
  Activity,
  Pill,
  Microscope,
  CheckCircle2,
  FolderClock,
  FileCheck,
  Plus,
  Lock,
  Languages,
  Sparkles
} from 'lucide-react';
import { Patient, ClinicalCase, Prescription, Investigation, FollowUp, TimelineEvent, User } from '../../types';
import { storageService } from '../../services/storage';
import { permissionService } from '../../services/permissionService';
import { MedicationReminderView } from '../patient-mode/MedicationReminderView';

interface PatientProfileProps {
  patientId: string;
  currentUser?: User | null;
  onBack: () => void;
  onStartNewCase: (patientId: string) => void;
  onScanPrescription: (patientId: string) => void;
}

type ProfileTab =
  | 'overview'
  | 'history'
  | 'cases'
  | 'medications'
  | 'investigations'
  | 'prescriptions'
  | 'followups'
  | 'documents'
  | 'timeline';

export const PatientProfile: React.FC<PatientProfileProps> = ({
  patientId,
  currentUser,
  onBack,
  onStartNewCase,
  onScanPrescription
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  const patients = storageService.getPatients();
  const patient = patients.find(p => p.id === patientId) || patients[0];

  const canEditClinical = permissionService.canEditClinicalData(currentUser);
  const patientIntakes = storageService.getPatientIntakes();
  const intake = patientIntakes.find(i => i.patientId === patient.id);

  const cases = storageService.getCasesByPatient(patient.id);
  const prescriptions = storageService.getPrescriptionsByPatient(patient.id);
  const investigations = storageService.getInvestigationsByPatient(patient.id);
  const followUps = storageService.getFollowUpsByPatient(patient.id);
  const timelineEvents = storageService.getTimelineByPatient(patient.id);

  const tabs: { id: ProfileTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Medical History' },
    { id: 'cases', label: 'Clinical Cases', count: cases.length },
    { id: 'medications', label: 'Medications', count: patient.currentMedications.length },
    { id: 'investigations', label: 'Investigations', count: investigations.length },
    { id: 'prescriptions', label: 'Prescriptions', count: prescriptions.length },
    { id: 'followups', label: 'Follow-ups', count: followUps.length },
    { id: 'documents', label: 'Documents' },
    { id: 'timeline', label: 'Timeline', count: timelineEvents.length }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        {/* Reception View-Only Notice */}
        {!canEditClinical && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Reception View-Only Access:</strong> Front desk staff have read-only access to clinical documentation. Clinical diagnoses, case completions, and prescriptions are restricted to doctors.
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer mt-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{patient.name}</h1>
                <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                  {patient.id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  patient.status === 'Waiting' ? 'bg-amber-100 text-amber-800' :
                  patient.status === 'In Consultation' ? 'bg-blue-100 text-blue-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {patient.status}
                </span>

                {patient.preferredLanguage && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 inline-flex items-center gap-1">
                    <Languages className="w-3 h-3" />
                    <span>Language: {patient.preferredLanguage.toUpperCase()}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1.5">
                <span>{patient.age} years old ({patient.gender})</span>
                <span>•</span>
                <span>DOB: {patient.dob}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">Blood: {patient.bloodGroup}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {patient.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons with RBAC protection */}
          <div className="flex items-center gap-2">
            {canEditClinical ? (
              <>
                <button
                  type="button"
                  id="profile-btn-scan-rx"
                  onClick={() => onScanPrescription(patient.id)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ScanLine className="w-4 h-4 text-cyan-700" />
                  <span>Scan Prescription</span>
                </button>

                <button
                  type="button"
                  id="profile-btn-start-case"
                  onClick={() => onStartNewCase(patient.id)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Start Case</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border border-amber-300 flex items-center gap-1.5 shadow-xs">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>View Only 🔒</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Prominent Allergy & Condition Warning Banners */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {patient.allergies.length > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 rounded-lg text-xs font-bold border border-rose-200 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>ALLERGY ALERT: {patient.allergies.join(', ')}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium">
              <span>No drug allergies on record</span>
            </div>
          )}

          {patient.existingConditions.map((cond, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg text-xs font-semibold border border-indigo-200/60"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span>{cond}</span>
            </span>
          ))}

          {patient.insuranceProvider && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium ml-auto">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>{patient.insuranceProvider} ({patient.insuranceNumber || 'Active'})</span>
            </span>
          )}
        </div>
      </div>

      {/* 9 Tab Navigation */}
      <div className="border-b border-slate-200 bg-white px-3 rounded-xl shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`profile-tab-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Panels */}
      <div>
        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Vitals Summary Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Most Recent Vitals</h3>
                  <span className="text-[11px] text-slate-400">Recorded {patient.lastVisit}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-500">Blood Pressure</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">130/84 <span className="text-[10px] font-normal text-slate-500">mmHg</span></div>
                    <div className="text-[10px] text-amber-600 font-medium">Pre-hypertension</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-500">Pulse Rate</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">78 <span className="text-[10px] font-normal text-slate-500">bpm</span></div>
                    <div className="text-[10px] text-emerald-600 font-medium">Normal Sinus</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-500">Body Temp</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">99.4 <span className="text-[10px] font-normal text-slate-500">°F</span></div>
                    <div className="text-[10px] text-amber-600 font-medium">Low-grade fever</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-500">Oxygen (SpO2)</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">98 <span className="text-[10px] font-normal text-slate-500">%</span></div>
                    <div className="text-[10px] text-emerald-600 font-medium">Adequate room air</div>
                  </div>
                </div>
              </div>

              {/* Active Clinical Cases preview */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Cases</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cases')}
                    className="text-xs text-indigo-600 font-semibold cursor-pointer"
                  >
                    View All ({cases.length})
                  </button>
                </div>
                {cases.length > 0 ? (
                  <div className="space-y-2">
                    {cases.map(c => (
                      <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-xs text-slate-900">{c.primaryDiagnosis}</div>
                          <div className="text-[11px] text-slate-500">
                            Dr: {c.doctorName} • {c.specialty} • {c.caseDate}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 p-4 text-center">No cases recorded yet.</div>
                )}
              </div>

              {/* Patient Self-Service Kiosk Intake & Language Card */}
              <div className="bg-white p-5 rounded-2xl border border-teal-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Kiosk Intake & Preferred Language
                    </h3>
                  </div>
                  <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 font-semibold px-2 py-0.5 rounded-full">
                    {patient.preferredLanguage ? `Language: ${patient.preferredLanguage.toUpperCase()}` : 'Default: English'}
                  </span>
                </div>

                {intake ? (
                  <div className="space-y-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 font-semibold block">Chief Complaint:</span>
                      <p className="text-slate-900 font-bold mt-0.5">{intake.structuredComplaint} ({intake.duration})</p>
                    </div>

                    {intake.originalTranscript && (
                      <div>
                        <span className="text-slate-500 font-semibold block">Original Patient Statement / Voice:</span>
                        <p className="text-slate-800 italic mt-0.5 font-medium">"{intake.originalTranscript}"</p>
                      </div>
                    )}

                    {intake.translatedText && intake.translatedText !== intake.originalTranscript && (
                      <div className="p-2 bg-indigo-50/60 rounded-lg border border-indigo-100">
                        <span className="text-indigo-600 font-semibold block text-[11px]">English Clinical Translation:</span>
                        <p className="text-indigo-950 font-medium mt-0.5">{intake.translatedText}</p>
                      </div>
                    )}

                    {intake.structuredSymptoms && intake.structuredSymptoms.length > 0 && (
                      <div>
                        <span className="text-slate-500 font-semibold block mb-1">Associated Symptoms:</span>
                        <div className="flex flex-wrap gap-1">
                          {intake.structuredSymptoms.map((symp, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 text-[11px] font-medium">
                              {symp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <p>Preferred Language: <strong>{patient.preferredLanguage ? patient.preferredLanguage.toUpperCase() : 'English'}</strong></p>
                    {patient.waitingReason && (
                      <p className="mt-1">Reason for visit: <strong>{patient.waitingReason}</strong></p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">Directly registered or consultation completed.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Contact & Insurance */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Details</h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <span>{patient.address}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">Emergency Contact:</div>
                  <div className="text-xs font-medium text-slate-800">
                    {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
                  </div>
                  <div className="text-xs text-slate-600">{patient.emergencyContact.phone}</div>
                </div>
              </div>

              {/* Active Medications Preview */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Regimen</h3>
                <div className="space-y-1.5">
                  {patient.currentMedications.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100">
                      <Pill className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MEDICAL HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900">Comprehensive Medical History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase">Chronic Conditions</div>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                  {patient.existingConditions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 space-y-2">
                <div className="text-xs font-bold text-rose-800 uppercase">Documented Drug Hypersensitivities</div>
                <ul className="list-disc pl-5 text-xs text-rose-800 space-y-1">
                  {patient.allergies.length > 0 ? (
                    patient.allergies.map((a, i) => (
                      <li key={i} className="font-semibold">{a} — Anaphylactoid / Skin rash caution</li>
                    ))
                  ) : (
                    <li>No known drug allergies reported.</li>
                  )}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase">Family History</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Father: Type 2 Diabetes Mellitus, CAD. Mother: Hypertension. No hereditary renal disease.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase">Surgical & Social History</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Appendectomy (2014, uncomplicated). Non-smoker, occasional alcohol intake, sedentary desk work.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. CASES */}
        {activeTab === 'cases' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Encounter Case Records</h3>
              <button
                type="button"
                onClick={() => onStartNewCase(patient.id)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Case</span>
              </button>
            </div>

            {cases.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {c.id}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{c.primaryDiagnosis}</span>
                    <span className="text-xs text-slate-500 font-medium">({c.specialty})</span>
                  </div>
                  <span className="text-xs text-slate-500">{c.caseDate}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                  <div><strong>Chief Complaint:</strong> {c.chiefComplaint} ({c.duration})</div>
                  <div><strong>Symptoms:</strong> {c.symptoms.join(', ')}</div>
                  {c.aiSummary && (
                    <div className="mt-2 p-2 bg-indigo-50/50 rounded border border-indigo-100 text-[11px] text-indigo-900">
                      <strong>AI Summary:</strong> {c.aiSummary.chiefComplaintSummary || c.aiSummary.historySummary}
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                  <span>Attending: <strong>{c.doctorName}</strong></span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Status: {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. MEDICATIONS */}
        {activeTab === 'medications' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Medication History & Current Regimens</h3>
              <div className="space-y-3">
                {patient.currentMedications.map((med, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{med}</div>
                        <div className="text-[11px] text-slate-500">Route: Oral • Compliance: High • Verified by Sarah Fatima</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <MedicationReminderView patientId={patient.id} />
          </div>
        )}

        {/* 5. INVESTIGATIONS */}
        {activeTab === 'investigations' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Laboratory & Diagnostic Reports</h3>
            <div className="space-y-3">
              {investigations.map(inv => (
                <div key={inv.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Microscope className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-900">{inv.testName}</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{inv.category}</span>
                    </div>
                    <span className="text-xs text-slate-500">{inv.date}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <div>
                      <span className="text-slate-400">Result Value:</span>
                      <div className="font-bold text-slate-800">{inv.resultValue || 'Normal'} {inv.unit}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Reference Range:</span>
                      <div className="text-slate-700">{inv.referenceRange || 'Reference not applicable'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Interpret:</span>
                      <div className={`font-semibold ${inv.isAbnormal ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {inv.isAbnormal ? '⚠ Abnormal High' : 'Within Normal Range'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Source:</span>
                      <div className="text-slate-700">LIS Auto-sync</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Prescription Records</h3>
              <button
                type="button"
                onClick={() => onScanPrescription(patient.id)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Digitize Old Rx</span>
              </button>
            </div>

            {prescriptions.map(rx => (
              <div key={rx.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                      {rx.id}
                    </span>
                    <span className="text-xs text-slate-600">Prescribed by {rx.doctorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rx.isOcrDigitized && (
                      <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium border border-purple-200">
                        OCR Digitized
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{rx.createdAt}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Medication</th>
                        <th className="py-2 px-3">Dosage / Frequency</th>
                        <th className="py-2 px-3">Duration</th>
                        <th className="py-2 px-3">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rx.medications.map((m, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-semibold text-slate-900">{m.name} ({m.strength})</td>
                          <td className="py-2 px-3 text-slate-700">{m.dosage} • {m.frequency}</td>
                          <td className="py-2 px-3 text-slate-700">{m.duration}</td>
                          <td className="py-2 px-3 text-slate-600">{m.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 7. FOLLOW-UPS */}
        {activeTab === 'followups' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Scheduled Follow-up Consultations</h3>
            <div className="space-y-3">
              {followUps.map(f => (
                <div key={f.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-900">{f.dueDate}</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                        {f.reason}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">{f.notes}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Clinical Documents & Records</h3>
              <button
                type="button"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                + Upload Document
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">Previous_Prescription_DrMurthy.png</div>
                  <div className="text-[10px] text-slate-500">Scanned PNG • 1.2 MB • Digitized</div>
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <FileCheck className="w-8 h-8 text-teal-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">CBC_Differential_Report_CarePath.pdf</div>
                  <div className="text-[10px] text-slate-500">PDF Report • 420 KB • LIS Integrated</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Patient Longitudinal Care Timeline</h3>
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timelineEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{evt.title}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{evt.date} • {evt.time}</span>
                    </div>
                    <p className="text-xs text-slate-600">{evt.description}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Recorded by: <span className="font-medium text-slate-700">{evt.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
