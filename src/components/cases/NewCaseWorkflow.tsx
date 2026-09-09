import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Mic,
  Activity,
  Pill,
  Calendar,
  FileCheck,
  Plus,
  Trash2,
  ShieldCheck,
  RotateCcw,
  Lock,
  Eye
} from 'lucide-react';
import { Patient, ClinicalCase, Medication, Vitals, AIClinicalSummary, AIClinicalInsight, User } from '../../types';
import { storageService } from '../../services/storage';
import { voiceService } from '../../services/voiceService';
import { aiService } from '../../services/aiService';
import { permissionService } from '../../services/permissionService';
import { VoiceInputButton } from '../common/VoiceInputButton';

interface NewCaseWorkflowProps {
  initialPatientId?: string;
  currentUser?: User | null;
  onCancel: () => void;
  onCaseCompleted: (caseId: string) => void;
}

const SPECIALTIES = [
  'General Medicine',
  'Pediatrics',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Gynecology',
  'ENT',
  'Dental',
  'Neurology'
];

export const NewCaseWorkflow: React.FC<NewCaseWorkflowProps> = ({
  initialPatientId,
  currentUser,
  onCancel,
  onCaseCompleted
}) => {
  const patients = storageService.getPatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatientId || patients[0]?.id || 'CF-1001'
  );
  const [workflowCaseId] = useState(() => `CASE-${Date.now().toString().slice(-6)}`);
  const [activeStep, setActiveStep] = useState<number>(1);

  const canEditClinical = permissionService.canEditClinicalData(currentUser);
  const canCompleteCase = permissionService.canCompleteCase(currentUser);

  // Check if patient had kiosk intake
  const patientIntakes = storageService.getPatientIntakes();
  const existingIntake = patientIntakes.find(i => i.patientId === selectedPatientId);

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Form State
  const [specialty, setSpecialty] = useState('General Medicine');

  // History taking
  const [chiefComplaint, setChiefComplaint] = useState(
    existingIntake ? existingIntake.structuredComplaint : 'Acute fever and chills with productive cough'
  );
  const [hpi, setHpi] = useState(
    existingIntake ? (existingIntake.translatedText || existingIntake.originalTranscript) : 'Patient reports sudden onset of moderate grade fever associated with frontal headache and throat irritation.'
  );
  const [duration, setDuration] = useState(existingIntake ? existingIntake.duration : '3 days');
  const [symptoms, setSymptoms] = useState<string[]>(
    existingIntake && existingIntake.associatedSymptoms && existingIntake.associatedSymptoms.length > 0
      ? existingIntake.associatedSymptoms
      : existingIntake && existingIntake.structuredSymptoms && existingIntake.structuredSymptoms.length > 0
      ? existingIntake.structuredSymptoms
      : ['Fever', 'Cough', 'Headache']
  );
  const [newSymptomInput, setNewSymptomInput] = useState('');

  // Dynamically synchronize intake data when selectedPatientId changes
  useEffect(() => {
    const intake = storageService.getPatientIntakes().find(i => i.patientId === selectedPatientId);
    const p = storageService.getPatientById(selectedPatientId);
    if (intake) {
      setChiefComplaint(intake.structuredComplaint || intake.originalTranscript || 'Acute Symptoms under evaluation');
      setHpi(intake.translatedText || intake.originalTranscript || 'Patient presented via self-service kiosk with acute symptoms.');
      setDuration(intake.duration || '3 days');
      const symps = intake.associatedSymptoms || intake.structuredSymptoms;
      if (symps && symps.length > 0) {
        setSymptoms(symps);
      }
    } else if (p && p.waitingReason) {
      setChiefComplaint(p.waitingReason);
      setHpi(`Patient presenting for consultation regarding ${p.waitingReason}.`);
    }
  }, [selectedPatientId]);

  // Vitals
  const [vitals, setVitals] = useState<Vitals>({
    temperature: '100.2 °F',
    bloodPressure: '124/82 mmHg',
    pulseRate: '88 bpm',
    respiratoryRate: '18 /min',
    spo2: '98 %',
    height: '172 cm',
    weight: '68 kg',
    bmi: '23.0 kg/m²'
  });

  // Systemic exam
  const [systemicExam, setSystemicExam] = useState<Record<string, string>>({
    general: 'Conscious, oriented, febrile to touch, no pallor/icterus',
    cvs: 'S1, S2 heard, normal rhythm, no murmurs',
    rs: 'Bilateral vesicular breath sounds, mild rhonchi right lower zone',
    gi: 'Soft, non-tender, bowel sounds active',
    cns: 'No focal neurological deficit',
    musculoskeletal: 'Normal range of motion'
  });

  // Investigations
  const [investigations, setInvestigations] = useState<string[]>([
    'Complete Blood Count (CBC)',
    'Rapid Malaria / Dengue NS1 Antigen'
  ]);
  const [newInvestigationInput, setNewInvestigationInput] = useState('');

  // AI Summary & Insights
  const [aiSummary, setAiSummary] = useState<AIClinicalSummary | null>(null);
  const [aiInsights, setAiInsights] = useState<AIClinicalInsight[]>([]);
  const [aiSummaryState, setAiSummaryState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);
  const [aiSummaryGeneratedAt, setAiSummaryGeneratedAt] = useState<string | null>(null);
  const [aiSummaryFingerprint, setAiSummaryFingerprint] = useState<string | null>(null);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);

  const buildAICaseData = (): Partial<ClinicalCase> => ({
    id: workflowCaseId,
    caseId: workflowCaseId,
    patientId: currentPatient.id,
    patientName: `${currentPatient.name}, ${currentPatient.age}-year-old`,
    chiefComplaint,
    historyOfPresentIllness: hpi,
    duration,
    symptoms,
    allergies: currentPatient.allergies,
    currentMedications: currentPatient.currentMedications,
    vitals: {
      temperature: vitals.temperature,
      bloodPressure: vitals.bloodPressure,
      pulse: vitals.pulseRate || 'N/A',
      respiratoryRate: vitals.respiratoryRate,
      spO2: vitals.spo2 || 'N/A',
      height: vitals.height,
      weight: vitals.weight,
      bmi: vitals.bmi
    },
    examination: systemicExam,
    investigations: investigations.map((testName, index) => ({
      id: `entered-${index}`,
      testName,
      resultValue: 'Pending',
      referenceRange: '',
      unit: '',
      status: 'Pending' as const,
      date: new Date().toISOString().split('T')[0]
    }))
  });

  const getAICaseFingerprint = () => JSON.stringify(buildAICaseData());

  const generateAISummary = async () => {
    setAiSummaryState('loading');
    setAiSummaryError(null);
    try {
      const fingerprint = getAICaseFingerprint();
      const generated = await aiService.generatePatientSummary(buildAICaseData());
      setAiSummary(generated);
      setAiSummaryFingerprint(fingerprint);
      setAiSummaryGeneratedAt(new Date().toISOString());
      setAiSummaryState('success');
    } catch (error) {
      console.error('AI summary generation failed', error);
      setAiSummaryError('AI Summary could not be generated. Try Again.');
      setAiSummaryState('error');
    }
  };

  const generateAIInsights = async () => {
    setAiInsightsLoading(true);
    try {
      setAiInsights(await aiService.generateClinicalInsights(buildAICaseData()));
    } finally {
      setAiInsightsLoading(false);
    }
  };

  const handleAIAction = async () => {
    await Promise.all([generateAISummary(), generateAIInsights()]);
    setActiveStep(6);
  };

  useEffect(() => {
    if (activeStep === 6 && !aiSummary && aiSummaryState === 'idle') {
      void generateAISummary();
    }
    if (activeStep === 7 && aiInsights.length === 0 && !aiInsightsLoading) {
      void generateAIInsights();
    }
  }, [activeStep]);

  const currentAIFingerprint = getAICaseFingerprint();
  const aiSummaryIsStale = Boolean(aiSummaryFingerprint && aiSummaryFingerprint !== currentAIFingerprint);

  // Diagnosis
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('Acute Upper Respiratory Tract Infection (URI)');
  const [differentialDiagnoses, setDifferentialDiagnoses] = useState<string[]>([
    'Acute Bronchitis',
    'Seasonal Influenza',
    'Early Bacterial Sinusitis'
  ]);
  const [doctorNotes, setDoctorNotes] = useState('Patient educated on hydration and red-flag symptoms. To report immediately if high fever persists >48 hours.');
  const [doctorConfirmed, setDoctorConfirmed] = useState(true);

  // Treatment / Medications
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: 'm1',
      name: 'Paracetamol',
      strength: '650 mg',
      dosage: '1 tablet',
      frequency: 'TDS (Thrice daily after meals)',
      route: 'Oral',
      duration: '5 days',
      instructions: 'Take after meals for fever/body aches. Do not exceed 3000mg/day.'
    },
    {
      id: 'm2',
      name: 'Cetirizine',
      strength: '10 mg',
      dosage: '1 tablet',
      frequency: 'Once at night (OD HS)',
      route: 'Oral',
      duration: '5 days',
      instructions: 'For allergic rhinitis / rhinorrhea symptoms.'
    },
    {
      id: 'm3',
      name: 'Ambroxol Syrup',
      strength: '30 mg/5ml',
      dosage: '10 ml',
      frequency: 'TDS (Thrice daily)',
      route: 'Oral',
      duration: '5 days',
      instructions: 'Expectorant for productive cough.'
    }
  ]);

  const [newMedName, setNewMedName] = useState('');
  const [newMedStrength, setNewMedStrength] = useState('500 mg');
  const [newMedDosage, setNewMedDosage] = useState('1 tablet');
  const [newMedFreq, setNewMedFreq] = useState('BD (Twice daily)');
  const [newMedDuration, setNewMedDuration] = useState('5 days');

  // Allergy warning checker: Detects Penicillin, Amox, Augmentin, etc.
  const allergyConflicts = medications.filter(m => {
    const medLower = m.name.toLowerCase();
    const isPenicillinClass =
      medLower.includes('penicillin') ||
      medLower.includes('amoxicillin') ||
      medLower.includes('augmentin') ||
      medLower.includes('ampicillin');
    return isPenicillinClass && currentPatient.allergies.some(a => a.toLowerCase().includes('penicillin'));
  });

  // Follow-up
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 5);
  const [followUpDate, setFollowUpDate] = useState(nextWeekDate.toISOString().split('T')[0]);
  const [followUpReason, setFollowUpReason] = useState('Review symptom resolution & repeat vitals check');
  const [followUpAdvice, setFollowUpAdvice] = useState('Warm saline gargles, adequate hydration, return if dyspnea develops.');

  // Save Case
  const handleSaveCase = async () => {
    const perm = permissionService.checkPermission('complete_case', currentUser);
    if (!perm.allowed) {
      alert(perm.reason || "You don't have permission to perform this action. Doctor authorization required.");
      return;
    }

    let summaryForCase = aiSummary;
    if (!summaryForCase || aiSummaryIsStale) {
      try {
        summaryForCase = await aiService.generatePatientSummary(buildAICaseData());
        setAiSummary(summaryForCase);
        setAiSummaryFingerprint(getAICaseFingerprint());
        setAiSummaryGeneratedAt(new Date().toISOString());
        setAiSummaryState('success');
      } catch (error) {
        setAiSummaryError('AI Summary could not be generated. Try Again.');
        setAiSummaryState('error');
        return;
      }
    }

    let insightsForCase = aiInsights;
    if (insightsForCase.length === 0) {
      insightsForCase = await aiService.generateClinicalInsights(buildAICaseData());
      setAiInsights(insightsForCase);
    }

    const newCase: ClinicalCase = {
      id: workflowCaseId,
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      doctorName: currentUser?.name || 'Sarah Fatima',
      specialty: specialty,
      date: new Date().toISOString().split('T')[0],
      caseDate: new Date().toISOString().split('T')[0],
      chiefComplaint: chiefComplaint,
      historyOfPresentIllness: hpi,
      duration: duration,
      symptoms: symptoms,
      allergies: currentPatient.allergies,
      currentMedications: currentPatient.currentMedications,
      vitals: vitals,
      examination: systemicExam,
      investigations: investigations,
      aiSummary: summaryForCase,
      aiInsights: insightsForCase,
      primaryDiagnosis: primaryDiagnosis,
      differentialDiagnosis: differentialDiagnoses,
      diagnosis: {
        primary: primaryDiagnosis,
        differential: differentialDiagnoses,
        clinicalNotes: doctorNotes,
        confirmedByDoctor: true
      },
      prescriptions: medications,
      treatment: medications,
      followUp: {
        date: followUpDate,
        reason: followUpReason,
        instructions: followUpAdvice
      },
      clinicalNotes: doctorNotes,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save case
    storageService.saveCase(newCase);
    const completedCase = storageService.completeCase(
      newCase.id,
      currentUser?.id || 'DOC-101',
      currentUser?.name || 'Sarah Fatima'
    );
    if (!completedCase) {
      setAiSummaryError('The case could not be completed. Try Again.');
      return;
    }

    // Save prescription
    storageService.savePrescription({
      id: `RX-${Date.now().toString().slice(-6)}`,
      patientId: currentPatient.id,
      caseId: newCase.id,
      doctorName: currentUser?.name || 'Sarah Fatima',
      createdAt: newCase.caseDate,
      medications: medications,
      isOcrDigitized: false,
      doctorVerified: true
    });

    // Save scheduled follow-up
    storageService.saveFollowUp({
      id: `FU-${Date.now().toString().slice(-6)}`,
      patientId: currentPatient.id,
      dueDate: followUpDate,
      reason: followUpReason,
      notes: followUpAdvice,
      status: 'Scheduled'
    });

    // Update patient status to Active and update last visit
    currentPatient.status = 'Active';
    currentPatient.lastVisit = newCase.caseDate;
    currentPatient.waitingReason = undefined;
    storageService.savePatient(currentPatient);

    // Add to timeline
    storageService.addTimelineEvent({
      patientId: currentPatient.id,
      date: newCase.caseDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'case',
      title: `Consultation Completed (${specialty})`,
      description: `Diagnosis: ${primaryDiagnosis}. ${medications.length} medications prescribed. Follow-up on ${followUpDate}.`,
      actor: currentUser?.name || 'Sarah Fatima'
    });

    onCaseCompleted(newCase.id);
  };

  const steps = [
    { num: 1, title: 'Patient' },
    { num: 2, title: 'Specialty' },
    { num: 3, title: 'History' },
    { num: 4, title: 'Examination' },
    { num: 5, title: 'Investigations' },
    { num: 6, title: 'AI Summary' },
    { num: 7, title: 'AI Insights' },
    { num: 8, title: 'Diagnosis' },
    { num: 9, title: 'Prescription' },
    { num: 10, title: 'Follow-up' },
    { num: 11, title: 'Review & Save' }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Workflow Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Case Taking</h1>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                11-Step Guided Workflow
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Patient: <strong>{currentPatient.name}</strong> ({currentPatient.id}) • {specialty}
            </p>
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAIAction}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Action</span>
          </button>
          {activeStep > 1 && (
            <button
              type="button"
              onClick={() => setActiveStep(activeStep - 1)}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Previous
            </button>
          )}

          {activeStep < 11 ? (
            <button
              type="button"
              id="workflow-btn-next"
              onClick={() => setActiveStep(activeStep + 1)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Next Step ({activeStep + 1}/11)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : canCompleteCase ? (
            <button
              type="button"
              id="workflow-btn-save-case"
              onClick={handleSaveCase}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Complete & Save Case</span>
            </button>
          ) : (
            <div className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>View Only 🔒 (Doctor Access Required)</span>
            </div>
          )}
        </div>
      </div>

      {/* Reception View-Only Notice */}
      {!canEditClinical && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <strong>View Only Mode:</strong> Reception personnel have read-only access. You can navigate through all 11 clinical steps to review records, but cannot save or modify clinical cases.
          </div>
        </div>
      )}

      {/* Step Progress Bar / Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {steps.map((step) => {
            const isCurrent = activeStep === step.num;
            const isCompleted = activeStep > step.num;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStep(step.num)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCurrent ? 'bg-white text-indigo-600' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isCompleted ? '✓' : step.num}
                </span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kiosk Pre-filled Alert Banner if available */}
      {existingIntake && activeStep <= 3 && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <strong>Kiosk Intake Pre-filled:</strong> Patient submitted {existingIntake.language.toUpperCase()} ({existingIntake.inputMode}) symptoms ("{existingIntake.translatedText || existingIntake.originalTranscript}"). Form fields auto-populated.
            </div>
          </div>
          <span className="text-[10px] bg-teal-200/60 font-semibold px-2 py-0.5 rounded">Synced</span>
        </div>
      )}

      {/* Allergy alert banner visible throughout case taking */}
      {currentPatient.allergies.length > 0 && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong>Patient Allergy Warning:</strong> {currentPatient.name} is allergic to <strong>{currentPatient.allergies.join(', ')}</strong>. Exercise extreme caution in Step 9 (Prescription).
          </span>
        </div>
      )}

      {/* STEP CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs min-h-[420px]">
        {/* STEP 1: PATIENT SELECTION */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Step 1: Patient Selection & Demographics</h2>
            <div className="max-w-md">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) — {p.gender}, {p.age}y — Status: {p.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Patient Details Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{currentPatient.name}</h3>
                  <div className="text-xs text-slate-500 font-mono">{currentPatient.id} • {currentPatient.gender}, {currentPatient.age} years</div>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-800">
                  {currentPatient.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Phone:</span>
                  <div className="font-medium text-slate-800">{currentPatient.phone}</div>
                </div>
                <div>
                  <span className="text-slate-400">Blood Group:</span>
                  <div className="font-bold text-slate-800">{currentPatient.bloodGroup}</div>
                </div>
                <div>
                  <span className="text-slate-400">Allergies:</span>
                  <div className={`font-bold ${currentPatient.allergies.length ? 'text-rose-600' : 'text-slate-600'}`}>
                    {currentPatient.allergies.join(', ') || 'None'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Existing Conditions:</span>
                  <div className="font-medium text-slate-800">{currentPatient.existingConditions.join(', ') || 'None'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SPECIALTY SELECTION */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Step 2: Specialty Selection</h2>
            <p className="text-xs text-slate-500">Choose the clinical specialty to calibrate examination fields and template parameters.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {SPECIALTIES.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => setSpecialty(spec)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    specialty === spec
                      ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-sm font-semibold">{spec}</div>
                  <div className="text-[11px] text-slate-500 font-normal mt-0.5">Specialty intake protocol</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: HISTORY TAKING (VOICE + TEXT) */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Step 3: Clinical History Taking</h2>
              <VoiceInputButton
                label="Dictate Chief Complaint"
                onTranscript={(text) => {
                  setChiefComplaint(text);
                  setHpi(`Patient reports: ${text}`);
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Complaint</label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                  placeholder="e.g. Fever, productive cough, headache"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                  placeholder="e.g. 3 days"
                />
              </div>

              <div className="sm:col-span-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    History of Present Illness (HPI)
                  </label>
                  <VoiceInputButton
                    size="sm"
                    label="Dictate HPI"
                    onTranscript={(t) => setHpi(prev => `${prev} ${t}`)}
                  />
                </div>
                <textarea
                  rows={3}
                  value={hpi}
                  onChange={(e) => setHpi(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                  placeholder="Detailed narrative of illness progression..."
                />
              </div>

              {/* Symptoms chips */}
              <div className="sm:col-span-3 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Associated Symptoms</label>
                <div className="flex flex-wrap gap-1.5">
                  {symptoms.map((s, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 text-xs px-2.5 py-1 rounded-full font-medium">
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => setSymptoms(symptoms.filter((_, i) => i !== idx))}
                        className="text-indigo-400 hover:text-indigo-900 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    value={newSymptomInput}
                    onChange={(e) => setNewSymptomInput(e.target.value)}
                    placeholder="Add additional symptom..."
                    className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSymptomInput.trim() && !symptoms.includes(newSymptomInput.trim())) {
                        setSymptoms([...symptoms, newSymptomInput.trim()]);
                        setNewSymptomInput('');
                      }
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: EXAMINATION & VITALS */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900">Step 4: Clinical Examination & Vitals</h2>

            {/* Vitals Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Physiological Vitals</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temperature</label>
                  <input
                    type="text"
                    value={vitals.temperature}
                    onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={vitals.bloodPressure}
                    onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pulse Rate</label>
                  <input
                    type="text"
                    value={vitals.pulseRate}
                    onChange={(e) => setVitals({ ...vitals, pulseRate: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Oxygen (SpO2)</label>
                  <input
                    type="text"
                    value={vitals.spo2}
                    onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Systemic Examination with Voice */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Systemic Clinical Findings</h3>
                <VoiceInputButton
                  size="sm"
                  label="Dictate Exam Notes"
                  onTranscript={(txt) => {
                    setSystemicExam(prev => ({
                      ...prev,
                      general: `${prev.general}. ${txt}`
                    }));
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">General Appearance</label>
                  <input
                    type="text"
                    value={systemicExam.general}
                    onChange={(e) => setSystemicExam({ ...systemicExam, general: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Respiratory System (RS)</label>
                  <input
                    type="text"
                    value={systemicExam.rs}
                    onChange={(e) => setSystemicExam({ ...systemicExam, rs: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Cardiovascular System (CVS)</label>
                  <input
                    type="text"
                    value={systemicExam.cvs}
                    onChange={(e) => setSystemicExam({ ...systemicExam, cvs: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Gastrointestinal (GI)</label>
                  <input
                    type="text"
                    value={systemicExam.gi}
                    onChange={(e) => setSystemicExam({ ...systemicExam, gi: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: INVESTIGATIONS */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Step 5: Diagnostic Investigations</h2>
            <p className="text-xs text-slate-500">Order or record diagnostic laboratory tests, imaging, and bedside evaluations.</p>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {[
                  'Complete Blood Count (CBC)',
                  'Fasting Blood Glucose',
                  'Lipid Profile',
                  'Liver Function Test (LFT)',
                  'Kidney Function Test (KFT)',
                  'Urinalysis Routine',
                  'Chest X-Ray (PA View)',
                  '12-Lead ECG',
                  'CRP / ESR Inflammatory Markers'
                ].map((testName) => {
                  const isChecked = investigations.includes(testName);
                  return (
                    <button
                      key={testName}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setInvestigations(investigations.filter(t => t !== testName));
                        } else {
                          setInvestigations([...investigations, testName]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {testName}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Add Custom Test / Investigation</label>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={newInvestigationInput}
                    onChange={(e) => setNewInvestigationInput(e.target.value)}
                    placeholder="e.g. Serum Ferritin, Thyroid Profile"
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newInvestigationInput.trim() && !investigations.includes(newInvestigationInput.trim())) {
                        setInvestigations([...investigations, newInvestigationInput.trim()]);
                        setNewInvestigationInput('');
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: AI SUMMARY */}
        {activeStep === 6 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Step 6: AI Structured Clinical Summary</h2>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold border border-indigo-200">
                Auto-generated from clinical entries
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
              <div className="text-xs text-indigo-900">
                <strong>Case-specific AI Summary</strong>
                <span className="block text-indigo-700">Uses {currentPatient.name}'s current patient and case information.</span>
              </div>
              <button
                type="button"
                onClick={() => void generateAISummary()}
                disabled={aiSummaryState === 'loading'}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-bold cursor-pointer disabled:cursor-wait"
              >
                {aiSummaryState === 'loading' ? 'Generating AI Summary…' : aiSummary ? 'Regenerate Summary' : 'Generate AI Summary'}
              </button>
            </div>

            {aiSummaryIsStale && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3">
                <span>Case information has changed — Regenerate AI Summary</span>
                <button type="button" onClick={() => void generateAISummary()} className="font-bold text-amber-800 underline cursor-pointer">Regenerate Summary</button>
              </div>
            )}

            {aiSummaryState === 'error' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center justify-between gap-3">
                <span>{aiSummaryError || 'AI Summary could not be generated. Try Again.'}</span>
                <button type="button" onClick={() => void generateAISummary()} className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold cursor-pointer">Retry</button>
              </div>
            )}

            {/* Strict AI disclaimer banner required by instructions */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>AI-generated summary. Verify before clinical use.</strong> Doctor retains absolute decision-making responsibility.
              </span>
            </div>

            {aiSummary && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-xs font-bold text-slate-700 uppercase">Patient Overview</div>
                  <p className="text-xs text-slate-700 leading-relaxed">{aiSummary.patientOverview}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{aiSummary.historySummary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1">
                    <div className="text-xs font-bold text-emerald-800 uppercase">Chief Complaint</div>
                    <p className="text-xs text-emerald-900">{aiSummary.chiefComplaintSummary}</p>
                    <div className="text-xs font-bold text-emerald-800 uppercase pt-2">Examination</div>
                    <p className="text-xs text-emerald-900">{aiSummary.examinationSummary}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-xs font-bold text-slate-700 uppercase">Investigations</div>
                    <p className="text-xs text-slate-700">{aiSummary.investigationsSummary}</p>
                    <div className="text-xs font-bold text-slate-700 uppercase pt-2">Critical Flags</div>
                    <p className="text-xs text-slate-700">{aiSummary.criticalFlags.length > 0 ? aiSummary.criticalFlags.join('; ') : 'No critical flags identified.'}</p>
                  </div>
                </div>
                {aiSummaryGeneratedAt && <p className="text-[11px] text-slate-500">AI Summary Generated • Last generated: {new Date(aiSummaryGeneratedAt).toLocaleString()}</p>}
              </div>
            )}
          </div>
        )}

        {/* STEP 7: AI INSIGHTS & RISK FLAGS */}
        {activeStep === 7 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Step 7: AI Clinical Insights & Risk Flags</h2>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                Clinical Decision Support System
              </span>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 border border-slate-200 text-center font-medium">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
              <strong>AI Decision Support — Clinician verification required.</strong> Insights are algorithmic suggestions to aid clinical awareness.
            </div>

            <div className="space-y-3">
              {aiInsightsLoading && <div className="p-4 text-xs text-slate-600">Generating AI Insights...</div>}
              {!aiInsightsLoading && aiInsights.length === 0 && <button type="button" onClick={() => void generateAIInsights()} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer">Generate AI Insights</button>}
              {aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border space-y-1 ${
                    insight.severity === 'high'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : insight.severity === 'medium'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{insight.title}</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/60">
                      {insight.severity} Priority
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 8: DIAGNOSIS */}
        {activeStep === 8 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Step 8: Diagnosis & Differential</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Clinical Diagnosis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={primaryDiagnosis}
                  onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg font-semibold text-slate-900"
                  placeholder="e.g. Acute Upper Respiratory Infection"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Differential Diagnoses
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {differentialDiagnoses.map((d, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>{d}</span>
                      <button
                        type="button"
                        onClick={() => setDifferentialDiagnoses(differentialDiagnoses.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doctor Clinical Notes & Observations
                </label>
                <textarea
                  rows={3}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={doctorConfirmed}
                    onChange={(e) => setDoctorConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>I, {currentUser?.name || 'Sarah Fatima'}, have clinically examined and confirmed this diagnosis.</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: TREATMENT & PRESCRIPTION (WITH ALLERGY WARNING) */}
        {activeStep === 9 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Step 9: Treatment & Prescription</h2>
              <span className="text-xs text-slate-500">{medications.length} items prescribed</span>
            </div>

            {/* Potential allergy conflict warning banner */}
            {allergyConflicts.length > 0 && (
              <div className="p-3.5 bg-rose-100 border-2 border-rose-500 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2 animate-pulse">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  ⚠ Potential allergy conflict — verify medication before prescribing! Patient has Penicillin allergy on file. Remove or substitute beta-lactam drugs.
                </div>
              </div>
            )}

            {/* Medications Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Medication</th>
                    <th className="py-2.5 px-3">Dosage</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Instructions</th>
                    <th className="py-2.5 px-3 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medications.map((m, idx) => (
                    <tr key={m.id || idx}>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {m.name} ({m.strength})
                      </td>
                      <td className="py-2 px-3">{m.dosage}</td>
                      <td className="py-2 px-3">{m.frequency}</td>
                      <td className="py-2 px-3">{m.duration}</td>
                      <td className="py-2 px-3 text-slate-600">{m.instructions}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setMedications(medications.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add medication tool */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase">Add Medication to Regimen</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="Medication name (e.g. Azithromycin)"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Strength (e.g. 500mg)"
                    value={newMedStrength}
                    onChange={(e) => setNewMedStrength(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 1 tab)"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Freq (OD / BD / TDS)"
                    value={newMedFreq}
                    onChange={(e) => setNewMedFreq(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (newMedName.trim()) {
                        setMedications([
                          ...medications,
                          {
                            id: `m-${Date.now()}`,
                            name: newMedName.trim(),
                            strength: newMedStrength,
                            dosage: newMedDosage,
                            frequency: newMedFreq,
                            route: 'Oral',
                            duration: newMedDuration,
                            instructions: 'Take as directed by doctor.'
                          }
                        ]);
                        setNewMedName('');
                      }
                    }}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    + Add Medication
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 10: FOLLOW-UP */}
        {activeStep === 10 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Step 10: Follow-up Scheduling</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Follow-up</label>
                <input
                  type="text"
                  value={followUpReason}
                  onChange={(e) => setFollowUpReason(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Instructions & Lifestyle Guidance
                </label>
                <textarea
                  rows={3}
                  value={followUpAdvice}
                  onChange={(e) => setFollowUpAdvice(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 11: REVIEW & SAVE */}
        {activeStep === 11 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Step 11: Final Clinical Review & Verification</h2>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Ready to Commit
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400">Patient:</span>
                  <div className="font-bold text-slate-900">{currentPatient.name} ({currentPatient.id})</div>
                </div>
                <div>
                  <span className="text-slate-400">Specialty:</span>
                  <div className="font-bold text-slate-900">{specialty}</div>
                </div>
                <div>
                  <span className="text-slate-400">Attending:</span>
                  <div className="font-bold text-slate-900">{currentUser?.name || 'Sarah Fatima'}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400">Primary Diagnosis:</span>
                <div className="text-sm font-bold text-indigo-700">{primaryDiagnosis}</div>
              </div>

              <div>
                <span className="text-slate-400">Prescription Summary:</span>
                <div className="text-slate-800 font-medium mt-0.5">
                  {medications.map(m => `${m.name} ${m.strength} (${m.frequency})`).join(' • ')}
                </div>
              </div>

              <div>
                <span className="text-slate-400">Follow-up:</span>
                <div className="text-slate-800 font-medium">{followUpDate} — {followUpReason}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Review from Start
              </button>
              <button
                type="button"
                id="final-confirm-save-btn"
                onClick={handleSaveCase}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Commit Case Record</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
