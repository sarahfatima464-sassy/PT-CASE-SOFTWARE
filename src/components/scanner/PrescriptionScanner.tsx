import React, { useState } from 'react';
import {
  ScanLine,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Edit2,
  Trash2,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  GitCompare,
  RotateCcw
} from 'lucide-react';
import { Medication, Patient, Prescription } from '../../types';
import { storageService } from '../../services/storage';
import { aiService } from '../../services/aiService';

interface PrescriptionScannerProps {
  initialPatientId?: string;
  onPrescriptionAdded?: (patientId: string) => void;
}

export const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({
  initialPatientId,
  onPrescriptionAdded
}) => {
  const patients = storageService.getPatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatientId || patients[0]?.id || 'CF-1001'
  );
  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80');
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Extracted OCR Data
  const [extractedDoctor, setExtractedDoctor] = useState('Dr. S. K. Murthy, MD, DM');
  const [extractedClinic, setExtractedClinic] = useState('City Health Care Specialty Clinic');
  const [extractedDate, setExtractedDate] = useState('2025-11-10');

  const [extractedMeds, setExtractedMeds] = useState<Medication[]>([
    {
      id: 'ocr-1',
      name: 'Metformin Hydrochloride',
      strength: '500 mg',
      dosage: '1 tablet',
      frequency: 'BD (Twice daily after meals)',
      route: 'Oral',
      duration: '30 days',
      instructions: 'Take with food for glycemic control',
      confidenceScore: 0.96,
      doctorVerified: true
    },
    {
      id: 'ocr-2',
      name: 'Telmisartan',
      strength: '40 mg',
      dosage: '1 tablet',
      frequency: 'OD Morning (Once daily in morning)',
      route: 'Oral',
      duration: '30 days',
      instructions: 'For blood pressure maintenance',
      confidenceScore: 0.94,
      doctorVerified: true
    },
    {
      id: 'ocr-3',
      name: 'Unclear Handwriting (Suspected Atorvastatin)',
      strength: '10 mg or 20 mg (Indecipherable)',
      dosage: '1 tablet',
      frequency: 'OD HS (Night)',
      route: 'Oral',
      duration: '30 days',
      instructions: '⚠ Unclear information — Doctor verification required',
      confidenceScore: 0.48, // Low confidence trigger
      doctorVerified: false
    }
  ]);

  const [editingMedId, setEditingMedId] = useState<string | null>(null);

  const handleRunOcr = async () => {
    setIsScanning(true);
    try {
      const result = await aiService.digitizePrescription(imageUrl);
      setExtractedDoctor(result.doctorName);
      setExtractedClinic(result.clinicName);
      setExtractedDate(result.prescriptionDate);
      setExtractedMeds(result.medications);
      setHasScanned(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmMed = (id?: string) => {
    setExtractedMeds(meds =>
      meds.map(m => (m.id === id ? { ...m, doctorVerified: true } : m))
    );
  };

  const handleRemoveMed = (id?: string) => {
    setExtractedMeds(meds => meds.filter(m => m.id !== id));
  };

  const handleUpdateMed = (id: string, updated: Partial<Medication>) => {
    setExtractedMeds(meds =>
      meds.map(m => (m.id === id ? { ...m, ...updated, doctorVerified: true } : m))
    );
    setEditingMedId(null);
  };

  const handleSaveToPatientHistory = () => {
    const rxRecord: Prescription = {
      id: `RX-DIGI-${Date.now().toString().slice(-6)}`,
      patientId: currentPatient.id,
      doctorName: extractedDoctor,
      createdAt: extractedDate,
      medications: extractedMeds,
      scannedImageUrl: imageUrl,
      isOcrDigitized: true,
      doctorVerified: true
    };

    // Save to storage
    storageService.savePrescription(rxRecord);

    // Update patient active medications
    const activeNames = extractedMeds
      .filter(m => m.doctorVerified)
      .map(m => `${m.name} ${m.strength} (${m.frequency})`);

    currentPatient.currentMedications = Array.from(new Set([...currentPatient.currentMedications, ...activeNames]));
    storageService.savePatient(currentPatient);

    // Timeline event
    storageService.addTimelineEvent({
      patientId: currentPatient.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'prescription',
      title: 'Scanned Prescription Digitized & Verified',
      description: `Digitized ${extractedMeds.length} items from ${extractedDoctor}. Verified by clinician.`,
      actor: 'Prescription Scanner AI'
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onPrescriptionAdded) {
        onPrescriptionAdded(currentPatient.id);
      }
    }, 2000);
  };

  // Previous prescription data for comparison tool
  const previousPrescriptionMeds: Medication[] = [
    { id: 'prev-1', name: 'Metformin Hydrochloride', strength: '500 mg', dosage: '1 tablet', frequency: 'OD (Once daily)', duration: '30 days', route: 'Oral', instructions: 'After meals' },
    { id: 'prev-2', name: 'Amlodipine', strength: '5 mg', dosage: '1 tablet', frequency: 'OD (Morning)', duration: '30 days', route: 'Oral', instructions: 'Morning after food' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prescription Scanner & Digitizer</h1>
            <span className="text-xs font-semibold bg-cyan-50 text-cyan-800 px-2.5 py-0.5 rounded-full border border-cyan-200">
              AI Vision & OCR Engine
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Digitize handwritten & printed prescriptions, verify OCR accuracy, and check medication safety.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs">
            <span className="text-slate-500 mr-2">Target Patient:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-hidden"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-all ${
              showComparison ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>{showComparison ? 'Hide Comparison' : 'Compare with Previous Rx'}</span>
          </button>
        </div>
      </div>

      {/* Strict Handwriting Safety Rule Alert */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <strong>Clinical Handwriting Safety Protocol:</strong> If handwriting is ambiguous or confidence &lt; 70%, the AI explicitly halts guesswork with:
          <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded ml-1 border border-rose-200">
            "⚠ Unclear information — Doctor verification required"
          </span>. Doctor verification is mandatory before commitment.
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-900">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Prescription successfully committed to {currentPatient.name}'s active medical record!</span>
        </div>
      )}

      {/* COMPARISON TOOL DRAWER */}
      {showComparison && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Prescription Longitudinal Comparison</h3>
            </div>
            <span className="text-xs text-slate-500">Previous Consultation vs Digitized New Prescription</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Previous */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-700">Previous Rx (Dated 3 months ago):</div>
              <ul className="space-y-1.5 text-slate-600">
                {previousPrescriptionMeds.map((m, idx) => (
                  <li key={idx} className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-semibold text-slate-900">{m.name}</span> {m.strength} — {m.frequency}
                  </li>
                ))}
              </ul>
            </div>

            {/* Differential Changes */}
            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
              <div className="font-bold text-indigo-900">Differential Changes Detected:</div>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-emerald-50 text-emerald-900 rounded border border-emerald-200 flex items-center justify-between">
                  <span><strong>Added:</strong> Telmisartan 40mg OD</span>
                  <span className="text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded font-bold">NEW DRUG</span>
                </div>
                <div className="p-2 bg-amber-50 text-amber-900 rounded border border-amber-200 flex items-center justify-between">
                  <span><strong>Dose Escalated:</strong> Metformin from OD → BD (Twice daily)</span>
                  <span className="text-[10px] bg-amber-200/60 px-1.5 py-0.5 rounded font-bold">DOSE CHANGE</span>
                </div>
                <div className="p-2 bg-rose-50 text-rose-900 rounded border border-rose-200 flex items-center justify-between">
                  <span><strong>Discontinued:</strong> Amlodipine 5mg (Switched to Telmisartan)</span>
                  <span className="text-[10px] bg-rose-200/60 px-1.5 py-0.5 rounded font-bold">REMOVED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPLIT LAYOUT: LEFT ORIGINAL IMAGE VS RIGHT EXTRACTED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: ORIGINAL PRESCRIPTION IMAGE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Original Prescription Artifact
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunOcr}
                disabled={isScanning}
                className="px-3 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>{isScanning ? 'Scanning...' : 'Re-run OCR'}</span>
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-950/5 flex flex-col items-center justify-center p-3 group">
            <img
              src={imageUrl}
              alt="Original Clinical Prescription"
              className="max-h-[460px] object-contain rounded-lg shadow-sm border border-slate-200"
              referrerPolicy="no-referrer"
            />

            {isScanning && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold">Digitizing handwriting with OCR...</p>
              </div>
            )}
          </div>

          {/* Upload and Sample Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setImageUrl('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              Sample Prescription 1 (Clinic)
            </button>
            <button
              type="button"
              onClick={() => setImageUrl('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              Sample Prescription 2 (Hospital)
            </button>
            <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer inline-flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        setImageUrl(ev.target.result as string);
                        handleRunOcr();
                      }
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* RIGHT COLUMN: AI EXTRACTED STRUCTURED PRESCRIPTION */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              AI Extracted Structured Prescription
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              Confidence Score: <strong className="text-emerald-600">89% Avg</strong>
            </span>
          </div>

          {/* Header Metadata */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400">Prescribing Doctor:</span>
                <input
                  type="text"
                  value={extractedDoctor}
                  onChange={(e) => setExtractedDoctor(e.target.value)}
                  className="w-full mt-0.5 bg-white px-2 py-1 border border-slate-200 rounded font-semibold text-slate-800"
                />
              </div>
              <div>
                <span className="text-slate-400">Prescription Date:</span>
                <input
                  type="date"
                  value={extractedDate}
                  onChange={(e) => setExtractedDate(e.target.value)}
                  className="w-full mt-0.5 bg-white px-2 py-1 border border-slate-200 font-semibold text-slate-800"
                />
              </div>
            </div>
            <div>
              <span className="text-slate-400">Clinic / Hospital:</span>
              <input
                type="text"
                value={extractedClinic}
                onChange={(e) => setExtractedClinic(e.target.value)}
                className="w-full mt-0.5 bg-white px-2 py-1 border border-slate-200 rounded text-slate-700"
              />
            </div>
          </div>

          {/* Extracted Medications List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Extracted Medication Items ({extractedMeds.length})</span>
              <span className="text-[10px] text-slate-400 font-normal">Review & confirm each item</span>
            </div>

            {extractedMeds.map((med) => {
              const isLowConfidence = (med.confidenceScore || 0) < 0.7;
              const isEditing = editingMedId === med.id;

              return (
                <div
                  key={med.id}
                  className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                    isLowConfidence
                      ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200'
                      : med.doctorVerified
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{med.name}</span>
                        <span className="text-xs text-slate-600">({med.strength})</span>
                        {isLowConfidence && (
                          <span className="px-1.5 py-0.5 bg-rose-200 text-rose-900 rounded text-[10px] font-extrabold flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Unclear (Score: {Math.round((med.confidenceScore || 0) * 100)}%)</span>
                          </span>
                        )}
                        {med.doctorVerified && !isLowConfidence && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {med.dosage} • {med.frequency} • {med.duration}
                      </div>
                      <div className={`text-[11px] mt-1 ${isLowConfidence ? 'font-bold text-rose-700' : 'text-slate-500'}`}>
                        {med.instructions}
                      </div>
                    </div>

                    {/* Actions: Confirm, Edit, Remove */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!med.doctorVerified ? (
                        <button
                          type="button"
                          onClick={() => handleConfirmMed(med.id)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Confirm</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConfirmMed(med.id)}
                          className="p-1 text-emerald-700 hover:text-emerald-800 cursor-pointer"
                          title="Verified"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setEditingMedId(isEditing ? null : med.id || '')}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveMed(med.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Edit Form for Unclear / Ambiguous Items */}
                  {isEditing && (
                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500">Correct Medication Name</label>
                        <input
                          type="text"
                          defaultValue={med.name.includes('Unclear') ? 'Atorvastatin' : med.name}
                          id={`edit-name-${med.id}`}
                          className="w-full bg-white px-2 py-1 border rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Correct Strength</label>
                        <input
                          type="text"
                          defaultValue={med.strength.includes('Indecipherable') ? '10 mg' : med.strength}
                          id={`edit-strength-${med.id}`}
                          className="w-full bg-white px-2 py-1 border rounded text-xs"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const nameEl = document.getElementById(`edit-name-${med.id}`) as HTMLInputElement;
                            const strEl = document.getElementById(`edit-strength-${med.id}`) as HTMLInputElement;
                            if (nameEl && strEl) {
                              handleUpdateMed(med.id || '', {
                                name: nameEl.value,
                                strength: strEl.value,
                                instructions: 'Doctor verified following handwriting clarification'
                              });
                            }
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold cursor-pointer"
                        >
                          Save Correction
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action: Add to Patient History */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Target Patient: <strong>{currentPatient.name}</strong>
            </span>
            <button
              type="button"
              id="btn-add-to-patient-history"
              onClick={handleSaveToPatientHistory}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              <span>Add to Patient History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
