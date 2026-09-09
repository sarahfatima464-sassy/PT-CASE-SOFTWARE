import React, { useState } from 'react';
import { UserPlus, ArrowLeft, Save, Stethoscope, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { Patient } from '../../types';
import { storageService } from '../../services/storage';

interface PatientRegistrationProps {
  onCancel: () => void;
  onSaved: (patient: Patient, startCaseNow: boolean) => void;
}

export const PatientRegistration: React.FC<PatientRegistrationProps> = ({ onCancel, onSaved }) => {
  const existingPatients = storageService.getPatients();
  const nextIdNumber = 1000 + existingPatients.length + 1;
  const initialId = `CF-${nextIdNumber}`;

  const [formData, setFormData] = useState<Partial<Patient>>({
    id: initialId,
    name: '',
    dob: '1992-05-15',
    age: 33,
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    bloodGroup: 'B+',
    allergies: [],
    existingConditions: [],
    currentMedications: [],
    insuranceProvider: '',
    insuranceNumber: '',
    referringDoctor: '',
    registrationDate: new Date().toISOString().split('T')[0],
    lastVisit: new Date().toISOString().split('T')[0],
    status: 'Active',
    emergencyContact: {
      name: '',
      relationship: 'Spouse',
      phone: ''
    }
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [medInput, setMedInput] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto calculate age when DOB changes
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dobStr = e.target.value;
    const dob = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    setFormData(prev => ({ ...prev, dob: dobStr, age: Math.max(0, age) }));
  };

  // Check duplicate patient by phone or exact name
  const handlePhoneBlur = () => {
    if (formData.phone) {
      const match = existingPatients.find(p => p.phone.replace(/\D/g, '') === formData.phone?.replace(/\D/g, ''));
      if (match) {
        setDuplicateWarning(`Potential duplicate detected! Patient ${match.name} (${match.id}) is already registered with this phone number.`);
        return;
      }
    }
    setDuplicateWarning(null);
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim() && !formData.allergies?.includes(allergyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const handleAddCondition = () => {
    if (conditionInput.trim() && !formData.existingConditions?.includes(conditionInput.trim())) {
      setFormData(prev => ({
        ...prev,
        existingConditions: [...(prev.existingConditions || []), conditionInput.trim()]
      }));
      setConditionInput('');
    }
  };

  const handleAddMedication = () => {
    if (medInput.trim() && !formData.currentMedications?.includes(medInput.trim())) {
      setFormData(prev => ({
        ...prev,
        currentMedications: [...(prev.currentMedications || []), medInput.trim()]
      }));
      setMedInput('');
    }
  };

  const handleSave = (startCaseNow: boolean) => {
    if (!formData.name?.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!formData.phone?.trim()) {
      setErrorMessage('Phone contact number is required.');
      return;
    }
    if (!formData.address?.trim()) {
      setErrorMessage('Residential address is required.');
      return;
    }

    const newPatient: Patient = {
      id: formData.id || initialId,
      name: formData.name.trim(),
      dob: formData.dob || '1990-01-01',
      age: formData.age || 30,
      gender: formData.gender as any || 'Male',
      phone: formData.phone.trim(),
      email: formData.email?.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@patient.sample`,
      address: formData.address.trim(),
      emergencyContact: formData.emergencyContact || {
        name: 'Family Member',
        relationship: 'Relative',
        phone: formData.phone
      },
      bloodGroup: formData.bloodGroup as any || 'O+',
      allergies: formData.allergies || [],
      existingConditions: formData.existingConditions || [],
      currentMedications: formData.currentMedications || [],
      insuranceProvider: formData.insuranceProvider || '',
      insuranceNumber: formData.insuranceNumber || '',
      referringDoctor: formData.referringDoctor || 'Direct Walk-in',
      registrationDate: formData.registrationDate || new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0],
      status: startCaseNow ? 'In Consultation' : 'Active',
      waitingReason: startCaseNow ? 'New Registration Case' : undefined
    };

    // Save to durable store
    storageService.savePatient(newPatient);

    storageService.addTimelineEvent({
      patientId: newPatient.id,
      date: newPatient.registrationDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'registration',
      title: 'Patient Formally Registered',
      description: `Demographics recorded. Allergies: ${newPatient.allergies.join(', ') || 'None reported'}.`,
      actor: 'Reception Intake'
    });

    onSaved(newPatient, startCaseNow);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Patient Registration</h1>
            <p className="text-xs text-slate-500">Capture verified demographics, contact, clinical history, and insurance.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-save-patient"
            onClick={() => handleSave(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Patient</span>
          </button>
          <button
            type="button"
            id="btn-save-start-case"
            onClick={() => handleSave(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Save & Start Case</span>
          </button>
        </div>
      </div>

      {/* Warnings & Errors */}
      {duplicateWarning && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>{duplicateWarning}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Form sections */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Section 1: Demographics */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>1. Identity & Demographics</span>
            <span className="text-xs font-mono font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              ID: {formData.id}
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrorMessage(null);
                }}
                placeholder="e.g. Meera Nair"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={handleDobChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup || 'Unknown / Not Tested'}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown / Not Tested'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Emergency */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            2. Contact & Emergency Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={handlePhoneBlur}
                placeholder="+91 98480 12345"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Referring Doctor / Clinic</label>
              <input
                type="text"
                value={formData.referringDoctor}
                onChange={(e) => setFormData({ ...formData, referringDoctor: e.target.value })}
                placeholder="Self-referral / Sarah Fatima"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Residential Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Flat 102, Green Glen Layout, Bellandur, Bengaluru"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Person</label>
              <input
                type="text"
                value={formData.emergencyContact?.name}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: { ...(formData.emergencyContact || { relationship: 'Spouse', phone: '' }), name: e.target.value }
                })}
                placeholder="Contact Name"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
              <select
                value={formData.emergencyContact?.relationship}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: { ...(formData.emergencyContact || { name: '', phone: '' }), relationship: e.target.value }
                })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone</label>
              <input
                type="tel"
                value={formData.emergencyContact?.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: { ...(formData.emergencyContact || { name: '', relationship: 'Spouse' }), phone: e.target.value }
                })}
                placeholder="Emergency Contact Phone"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Clinical Background (Allergies, Chronic Illnesses, Meds) */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            3. Clinical Background & Drug Allergies
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Allergies */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Drug / Food Allergies
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                  placeholder="e.g. Penicillin"
                  className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100 cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1 min-h-[30px] p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                {formData.allergies?.map((allergy, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium"
                  >
                    <span>{allergy}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        allergies: formData.allergies?.filter((_, idx) => idx !== i)
                      })}
                      className="text-rose-600 hover:text-rose-900 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Existing Conditions */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Existing Conditions
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={conditionInput}
                  onChange={(e) => setConditionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
                  placeholder="e.g. Type 2 Diabetes"
                  className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold hover:bg-indigo-100 cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1 min-h-[30px] p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                {formData.existingConditions?.map((cond, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium"
                  >
                    <span>{cond}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        existingConditions: formData.existingConditions?.filter((_, idx) => idx !== i)
                      })}
                      className="text-indigo-600 hover:text-indigo-900 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Current Medications
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={medInput}
                  onChange={(e) => setMedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedication())}
                  placeholder="e.g. Metformin 500mg BD"
                  className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1 min-h-[30px] p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                {formData.currentMedications?.map((med, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium"
                  >
                    <span>{med}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        currentMedications: formData.currentMedications?.filter((_, idx) => idx !== i)
                      })}
                      className="text-emerald-600 hover:text-emerald-900 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Insurance */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            4. Health Insurance & Coverage
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Insurance Provider</label>
              <input
                type="text"
                value={formData.insuranceProvider}
                onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                placeholder="Star Health / HDFC Ergo / ICICI Lombard"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Policy / Card Number</label>
              <input
                type="text"
                value={formData.insuranceNumber}
                onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                placeholder="e.g. SH-POL-99201"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
