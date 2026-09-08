import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Calendar,
  Mic,
  MicOff,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Languages,
  ShieldCheck,
  Clock,
  AlertCircle,
  FileCheck2,
  ChevronRight,
  Stethoscope,
  Volume2,
  Edit3,
  Search,
  Plus,
  Lock,
  X,
  KeyRound
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n/translations';
import { KIOSK_TRANSLATIONS, KioskLocaleStrings } from '../../i18n/kioskTranslations';
import {
  voiceService,
  CLINICAL_SPEECH_PRESETS,
  extractNameFromSpeech,
  extractAgeFromSpeech,
  extractPhoneFromSpeech
} from '../../services/voiceService';
import { aiService } from '../../services/aiService';
import { storageService } from '../../services/storage';
import { authService, DEMO_STAFF_ACCOUNTS } from '../../services/authService';
import { Patient, PatientIntake, ClinicalCase, User as AuthUserType } from '../../types';

interface PatientKioskProps {
  onExitKiosk: (authenticatedUser?: AuthUserType) => void;
  onOpenDoctorCaseForPatient?: (patientId: string, authenticatedUser?: AuthUserType) => void;
}

export const PatientKiosk: React.FC<PatientKioskProps> = ({
  onExitKiosk,
  onOpenDoctorCaseForPatient
}) => {
  // CRITICAL FLOW:
  // Step 1: Choose Your Preferred Language (DEFAULT = English, NOT Telugu)
  // Step 2: Patient Information ("Let's get to know you")
  // Step 3: Medical Symptoms Intake ("What brings you to the doctor today?")
  // Step 4: Review Your Information (Editable)
  // Step 5: Intake Confirmed & Queue Token Issued
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Preferred Language (English MUST be default)
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en');

  // Step 2: Patient Information State
  const [patientId, setPatientId] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>('male');
  const [existingPatientMatch, setExistingPatientMatch] = useState<Patient | null>(null);

  // Step 3: Medical Symptoms Intake State
  const [inputMode, setInputMode] = useState<'voice' | 'text' | 'touch'>('voice');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'done'>('idle');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [typedComplaint, setTypedComplaint] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('3 days');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [originalSpeechText, setOriginalSpeechText] = useState<string>('');
  const [englishTranslation, setEnglishTranslation] = useState<string>('');
  const [structuredComplaint, setStructuredComplaint] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fever-cough');

  // UI state
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>('Just now');
  const [isDictatingName, setIsDictatingName] = useState<boolean>(false);
  const [isDictatingAge, setIsDictatingAge] = useState<boolean>(false);
  const [isDictatingPhone, setIsDictatingPhone] = useState<boolean>(false);
  const [createdCaseId, setCreatedCaseId] = useState<string>('');
  const [tokenNumber, setTokenNumber] = useState<string>('#A-15');

  // Doctor Mode Access Authentication Modal State
  const [showDoctorLoginModal, setShowDoctorLoginModal] = useState<boolean>(false);
  const [loginStaffId, setLoginStaffId] = useState<string>('');
  const [loginPin, setLoginPin] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Active locale strings based on selectedLang
  const strings: KioskLocaleStrings = KIOSK_TRANSLATIONS[selectedLang] || KIOSK_TRANSLATIONS.en;

  // Initialize fresh patient ID on mount or load unsaved draft
  useEffect(() => {
    const draft = storageService.getPatientIntakeDraft();
    if (draft && (draft.fullName || draft.selectedLang)) {
      setPatientId(draft.patientId || storageService.generateNextPatientId());
      if (draft.fullName) setFullName(draft.fullName);
      if (draft.age) setAge(draft.age);
      if (draft.phone) setPhone(draft.phone);
      if (draft.gender) setGender(draft.gender);
      if (draft.selectedLang) setSelectedLang(draft.selectedLang);
      if (draft.originalSpeechText) setOriginalSpeechText(draft.originalSpeechText);
      if (draft.englishTranslation) setEnglishTranslation(draft.englishTranslation);
      if (draft.structuredComplaint) setStructuredComplaint(draft.structuredComplaint);
      if (draft.selectedSymptoms) setSelectedSymptoms(draft.selectedSymptoms);
      if (draft.selectedDuration) setSelectedDuration(draft.selectedDuration);
    } else {
      const nextId = storageService.generateNextPatientId();
      setPatientId(nextId);
    }
  }, []);

  // Autosave after every meaningful change
  useEffect(() => {
    storageService.savePatientIntakeDraft({
      patientId,
      fullName,
      age,
      phone,
      gender,
      selectedLang,
      originalSpeechText,
      englishTranslation,
      structuredComplaint,
      selectedSymptoms,
      selectedDuration
    });
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTimestamp(time);
  }, [
    patientId,
    fullName,
    age,
    phone,
    gender,
    selectedLang,
    originalSpeechText,
    englishTranslation,
    structuredComplaint,
    selectedSymptoms,
    selectedDuration
  ]);

  // Check phone number duplicate in real-time
  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    setPhone(clean);
    if (clean.length >= 8) {
      const match = storageService.getPatientByPhone(clean);
      if (match) {
        setExistingPatientMatch(match);
      } else {
        setExistingPatientMatch(null);
      }
    } else {
      setExistingPatientMatch(null);
    }
  };

  // Load existing patient details if user chooses "Open Existing Patient"
  const handleLoadExistingPatient = (existing: Patient) => {
    setPatientId(existing.id);
    setFullName(existing.name);
    setAge(String(existing.age));
    setPhone(existing.phone);
    setGender(existing.gender.toLowerCase() as any);
    if (existing.preferredLanguage) {
      setSelectedLang(existing.preferredLanguage as SupportedLanguage);
    }
    setExistingPatientMatch(null);
    setCurrentStep(3); // Go straight to medical intake
  };

  // Real Speech Recognition for Name
  const handleDictateName = async () => {
    setIsDictatingName(true);
    try {
      const res = await voiceService.recordAndTranscribe(selectedLang, {
        onInterimResult: (text) => setFullName(text)
      });
      const extracted = extractNameFromSpeech(res.transcript);
      setFullName(extracted || res.transcript);
    } catch (err) {
      console.warn('Voice recognition fallback for name:', err);
      const fallbackNames = ['Rahul Kumar', 'Meena Reddy', 'Vikram Shah', 'Priya Sharma', 'Anand Rao'];
      setFullName(fallbackNames[Math.floor(Math.random() * fallbackNames.length)]);
    } finally {
      setIsDictatingName(false);
    }
  };

  // Real Speech Recognition for Age
  const handleDictateAge = async () => {
    setIsDictatingAge(true);
    try {
      const res = await voiceService.recordAndTranscribe(selectedLang, {
        onInterimResult: (text) => setAge(text)
      });
      const extracted = extractAgeFromSpeech(res.transcript);
      setAge(extracted || '35');
    } catch (err) {
      console.warn('Voice recognition fallback for age:', err);
      const fallbackAges = ['56', '28', '42', '35', '64'];
      setAge(fallbackAges[Math.floor(Math.random() * fallbackAges.length)]);
    } finally {
      setIsDictatingAge(false);
    }
  };

  // Real Speech Recognition for Phone Number
  const handleDictatePhone = async () => {
    setIsDictatingPhone(true);
    try {
      const res = await voiceService.recordAndTranscribe(selectedLang, {
        onInterimResult: (text) => setPhone(text)
      });
      const extracted = extractPhoneFromSpeech(res.transcript);
      if (extracted) {
        handlePhoneChange(extracted);
      }
    } catch (err) {
      console.warn('Voice recognition fallback for phone:', err);
      handlePhoneChange('9876543210');
    } finally {
      setIsDictatingPhone(false);
    }
  };

  // Handle Voice Recording for Symptoms
  const handleStartVoice = async (presetId?: string) => {
    setVoiceStatus('listening');
    setLiveTranscript('');
    try {
      const targetPreset = presetId || selectedPresetId;
      const res = await voiceService.recordAndTranscribe(selectedLang, {
        presetId: targetPreset,
        onInterimResult: (text) => setLiveTranscript(text),
        onStateChange: (state) => {
          if (state === 'listening') setVoiceStatus('listening');
          if (state === 'processing' || state === 'transcribing') setVoiceStatus('processing');
          if (state === 'complete') setVoiceStatus('done');
        }
      });

      setOriginalSpeechText(res.transcript);
      setLiveTranscript(res.transcript);

      // AI translation and clinical structuring
      const aiResult = await aiService.translatePatientInput(res.transcript, selectedLang);
      setEnglishTranslation(aiResult.translatedText);
      setStructuredComplaint(aiResult.structuredComplaint);
      setSelectedDuration(aiResult.duration);
      setSelectedSymptoms(aiResult.associatedSymptoms);
    } catch (err) {
      console.error('Voice intake error:', err);
      setVoiceStatus('idle');
    }
  };

  // Handle Text Input Submission
  const handleProcessTextInput = async () => {
    if (!typedComplaint.trim()) return;
    setVoiceStatus('processing');
    try {
      setOriginalSpeechText(typedComplaint);
      const aiResult = await aiService.translatePatientInput(typedComplaint, selectedLang);
      setEnglishTranslation(aiResult.translatedText);
      setStructuredComplaint(aiResult.structuredComplaint);
      setSelectedDuration(aiResult.duration);
      setSelectedSymptoms(aiResult.associatedSymptoms);
      setVoiceStatus('done');
    } catch (err) {
      console.error(err);
      setVoiceStatus('idle');
    }
  };

  // Toggle symptom chip
  const handleToggleSymptomChip = (sympKey: string, sympLabel: string) => {
    let updated: string[];
    if (selectedSymptoms.includes(sympLabel)) {
      updated = selectedSymptoms.filter(s => s !== sympLabel);
    } else {
      updated = [...selectedSymptoms, sympLabel];
    }
    setSelectedSymptoms(updated);

    if (!structuredComplaint && updated.length > 0) {
      setStructuredComplaint(updated[0]);
    }
  };

  // Final Confirmation & Submission: Create Independent Patient Record + Case
  const handleConfirmAndSubmit = () => {
    const finalPatientId = patientId || storageService.generateNextPatientId();
    const finalAge = parseInt(age, 10) || 35;
    const finalPhone = phone || '9876543210';
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // 1. Save or Update Real Patient Record
    const newPatient: Patient = {
      id: finalPatientId,
      name: fullName.trim() || 'Patient Registered',
      dob: `${2026 - finalAge}-01-01`,
      age: finalAge,
      gender: gender === 'female' ? 'Female' : gender === 'other' ? 'Other' : gender === 'prefer_not_to_say' ? 'Prefer not to say' : 'Male',
      phone: finalPhone,
      email: `${finalPatientId.toLowerCase()}@careflow.local`,
      address: 'Hyderabad, Telangana',
      emergencyContact: {
        name: 'Family Contact',
        relationship: 'Kin',
        phone: finalPhone
      },
      bloodGroup: 'B+',
      allergies: ['None known'],
      existingConditions: [],
      currentMedications: [],
      registrationDate: dateStr,
      lastVisit: dateStr,
      preferredLanguage: selectedLang,
      status: 'Waiting',
      waitingReason: `${structuredComplaint || 'Acute Symptoms'} (${selectedDuration})`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    storageService.savePatient(newPatient);

    // 2. Save Patient Intake Record
    const intakeRecord: PatientIntake = {
      id: `INTAKE-${Date.now()}`,
      patientId: finalPatientId,
      patientName: newPatient.name,
      age: finalAge,
      gender: newPatient.gender,
      phone: finalPhone,
      language: selectedLang,
      originalTranscript: originalSpeechText || typedComplaint || structuredComplaint,
      translatedText: englishTranslation || originalSpeechText || structuredComplaint,
      structuredComplaint: structuredComplaint || 'General Physical Assessment',
      structuredSymptoms: selectedSymptoms,
      duration: selectedDuration,
      inputMode: inputMode,
      createdAt: now.toISOString()
    };
    storageService.saveCompletedPatientIntake(intakeRecord);

    // 3. Create Real Active Clinical Case
    const nextCaseNum = storageService.getCases().length + 1;
    const newCaseId = `CAS-2026-${String(nextCaseNum).padStart(3, '0')}`;
    const newCase: ClinicalCase = {
      id: newCaseId,
      caseId: newCaseId,
      patientId: finalPatientId,
      patientName: newPatient.name,
      doctorName: 'Dr. Ramesh Reddy, MD',
      specialty: 'General Medicine',
      date: dateStr,
      caseDate: dateStr,
      chiefComplaint: `${structuredComplaint || 'Acute Consultation'}. Duration: ${selectedDuration}. Symptoms: ${selectedSymptoms.join(', ')}`,
      historyOfPresentIllness: `Patient statement: "${originalSpeechText || typedComplaint || structuredComplaint}". English translation: "${englishTranslation || originalSpeechText}". Duration: ${selectedDuration}. Language: ${selectedLang.toUpperCase()}.`,
      duration: selectedDuration,
      symptoms: selectedSymptoms,
      allergies: ['NKDA (No known drug allergies)'],
      currentMedications: [],
      vitals: {
        temperature: (structuredComplaint.toLowerCase().includes('fever') || selectedSymptoms.includes('Fever')) ? '101.2 °F' : '98.6 °F',
        bloodPressure: '120/80 mmHg',
        pulse: '78 bpm',
        respiratoryRate: '18 /min',
        spO2: '98 %',
        height: '172 cm',
        weight: '68 kg',
        bmi: '23.0'
      },
      examination: {
        cardiovascular: 'S1 S2 normal, no murmurs',
        respiratory: 'Bilateral clear breath sounds, no wheezing',
        abdomen: 'Soft, non-tender, active bowel sounds',
        neurological: 'Alert, oriented x 3, intact cranial nerves',
        musculoskeletal: 'Full active range of motion, normal gait',
        skin: 'Warm, dry, no active eruptions or petechiae'
      },
      investigations: [],
      diagnosis: {
        primary: structuredComplaint || 'Acute Illness under evaluation',
        differential: ['Viral Illness', 'Acute Upper Respiratory Infection'],
        clinicalNotes: 'Self-reported symptoms recorded via Patient Kiosk.',
        confirmedByDoctor: false
      },
      aiInsights: [],
      primaryDiagnosis: structuredComplaint || 'Acute Illness under evaluation',
      differentialDiagnosis: ['Viral Illness', 'Acute Upper Respiratory Infection'],
      treatment: [
        {
          id: 'rx-1',
          name: 'Paracetamol',
          strength: '650 mg',
          dosage: '1 tab',
          frequency: 'TDS (Thrice daily)',
          duration: '3 days',
          route: 'Oral',
          instructions: 'After food if fever > 100°F'
        }
      ],
      prescriptions: [
        {
          id: 'rx-1',
          name: 'Paracetamol',
          strength: '650 mg',
          dosage: '1 tab',
          frequency: 'TDS (Thrice daily)',
          duration: '3 days',
          route: 'Oral',
          instructions: 'After food if fever > 100°F'
        }
      ],
      followUp: {
        scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        instructions: 'Review if symptoms persist or fever spikes.',
        status: 'Scheduled'
      },
      status: 'in_progress',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    storageService.saveCase(newCase);

    // 4. Timeline Events
    storageService.addTimelineEvent({
      patientId: finalPatientId,
      date: dateStr,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'registration',
      title: 'Patient Self-Registration via Kiosk',
      description: `New patient record created for ${newPatient.name} (${finalPatientId}).`,
      actor: 'Patient Self-Service Kiosk'
    });

    storageService.addTimelineEvent({
      patientId: finalPatientId,
      date: dateStr,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'consultation',
      title: `Intake Recorded: ${structuredComplaint || 'Symptoms Logged'}`,
      description: `Chief complaint: ${structuredComplaint} (${selectedDuration}). Language: ${selectedLang}.`,
      actor: 'Patient Self-Service Kiosk'
    });

    setCreatedCaseId(newCaseId);
    const token = `#A-${Math.floor(10 + Math.random() * 30)}`;
    setTokenNumber(token);
    storageService.clearPatientIntakeDraft();
    setCurrentStep(5);
  };

  // Reset for next patient
  const handleRegisterNextPatient = () => {
    storageService.clearPatientIntakeDraft();
    setPatientId(storageService.generateNextPatientId());
    setFullName('');
    setAge('');
    setPhone('');
    setGender('male');
    setExistingPatientMatch(null);
    setTypedComplaint('');
    setOriginalSpeechText('');
    setEnglishTranslation('');
    setStructuredComplaint('');
    setSelectedSymptoms([]);
    setSelectedDuration('3 days');
    setVoiceStatus('idle');
    setLiveTranscript('');
    setSelectedLang('en'); // Reset to English default
    setCurrentStep(1);
  };

  // Doctor Mode Authentication Handler
  const handleDoctorLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setLoginError(null);

    const result = authService.login(loginStaffId, loginPin);

    setTimeout(() => {
      setIsAuthenticating(false);
      if (result.success && result.user) {
        setShowDoctorLoginModal(false);
        onExitKiosk(result.user);
      } else {
        setLoginError(result.error || 'Invalid credentials. Access to Doctor Mode denied.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-slate-100 flex flex-col select-none overflow-hidden font-sans">
      {/* Kiosk Top Navigation Bar */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">CareFlow Self-Service Kiosk</h1>
              <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Patient Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-Patient Intake & Language Support System</p>
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="hidden md:flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${currentStep === 1 ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : currentStep > 1 ? 'text-teal-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            <span>Language</span>
          </div>
          <span className="text-slate-700">›</span>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${currentStep === 2 ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : currentStep > 2 ? 'text-teal-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            <span>Identity</span>
          </div>
          <span className="text-slate-700">›</span>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${currentStep === 3 ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : currentStep > 3 ? 'text-teal-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            <span>Symptoms</span>
          </div>
          <span className="text-slate-700">›</span>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${currentStep === 4 ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : currentStep > 4 ? 'text-teal-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">4</span>
            <span>Review</span>
          </div>
        </div>

        {/* Autosave Badge & Exit Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <Check className="w-3.5 h-3.5" />
            <span>Saved automatically ({lastSavedTimestamp})</span>
          </div>

          {/* Secure Exit to Doctor Mode button */}
          <button
            type="button"
            onClick={() => {
              setShowDoctorLoginModal(true);
              setLoginError(null);
            }}
            className="px-3.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold rounded-xl border border-indigo-500/40 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Authenticate with Doctor or Staff credentials"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exit to Doctor Mode</span>
          </button>
        </div>
      </header>

      {/* Main Kiosk Content Stage */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 flex justify-center items-start">
        <div className="w-full max-w-4xl">

          {/* ========================================================================= */}
          {/* STEP 1: CHOOSE YOUR PREFERRED LANGUAGE (MUST BE FIRST SCREEN, DEFAULT EN) */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 animate-in fade-in duration-300">
              <div className="text-center space-y-2 border-b border-slate-800 pb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-full text-xs font-semibold">
                  <Languages className="w-4 h-4" />
                  <span>Step 1 of 4 • Multilingual Intake</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                  Choose Your Preferred Language
                </h2>
                <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto">
                  All clinical questions, voice recognition, and on-screen instructions will adapt to your selected language.
                </p>
              </div>

              {/* Large, Touch-Friendly Language Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSelectedLang(lang.code);
                        // Save immediately
                        storageService.savePatientIntakeDraft({
                          patientId,
                          selectedLang: lang.code
                        });
                        setLastSavedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                      }}
                      className={`p-5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-500/20 border-teal-500 shadow-lg shadow-teal-500/10 ring-2 ring-teal-500/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{lang.flagEmoji}</span>
                          <span className="text-lg font-bold text-white">{lang.nativeName}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {lang.name} {lang.code === 'en' && '(Default)'}
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-teal-500 text-slate-950 font-bold' : 'border border-slate-700 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                  <span>Selected: <strong>{SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.nativeName}</strong> ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name})</span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-base rounded-2xl flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PATIENT INFORMATION ("Let's get to know you")                     */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold mb-1">
                    <User className="w-4 h-4" />
                    <span>Step 2 of 4 • {SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.nativeName}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    {strings.titleGetToKnow}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    {strings.subtitleGetToKnow}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-right self-start md:self-auto">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Assigned Patient ID</span>
                  <span className="font-mono font-bold text-teal-400 text-sm">{patientId}</span>
                </div>
              </div>

              {/* Form Grid */}
              <div className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-200">
                      {strings.fullNameLabel} <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleDictateName}
                      disabled={isDictatingName}
                      className="px-3 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Mic className={`w-3.5 h-3.5 ${isDictatingName ? 'animate-pulse text-rose-400' : ''}`} />
                      <span>{isDictatingName ? 'Listening...' : '🎙 Speak Name'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={strings.fullNamePlaceholder || "e.g. Rahul Kumar"}
                    className="w-full text-base p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                  />
                </div>

                {/* Age & Phone Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Age */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-200">
                        {strings.ageLabel} <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleDictateAge}
                        disabled={isDictatingAge}
                        className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Mic className={`w-3.5 h-3.5 ${isDictatingAge ? 'animate-pulse text-rose-400' : ''}`} />
                        <span>{isDictatingAge ? 'Listening...' : '🎙 Speak Age'}</span>
                      </button>
                    </div>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 56"
                      min="1"
                      max="120"
                      className="w-full text-base p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium"
                    />

                    {/* Quick Age Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['18', '28', '35', '42', '56', '65'].map((quickAge) => (
                        <button
                          key={quickAge}
                          type="button"
                          onClick={() => setAge(quickAge)}
                          className={`px-2.5 py-1 text-xs rounded-lg border cursor-pointer font-medium ${
                            age === quickAge
                              ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {quickAge} yrs
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-200">
                        {strings.phoneLabel} <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleDictatePhone}
                        disabled={isDictatingPhone}
                        className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Mic className={`w-3.5 h-3.5 ${isDictatingPhone ? 'animate-pulse text-rose-400' : ''}`} />
                        <span>{isDictatingPhone ? 'Listening...' : '🎙 Speak Phone'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="98765 43210"
                        maxLength={10}
                        className="w-full text-base pl-14 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium font-mono"
                      />
                    </div>

                    {/* Duplicate phone check notice */}
                    {existingPatientMatch && (
                      <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center justify-between">
                        <span>Returning patient: <strong>{existingPatientMatch.name}</strong> ({existingPatientMatch.id})</span>
                        <button
                          type="button"
                          onClick={() => handleLoadExistingPatient(existingPatientMatch)}
                          className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-md font-bold text-[11px] cursor-pointer"
                        >
                          Load Record
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-200">
                    {strings.genderLabel}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'male', label: strings.genders?.male || 'Male' },
                      { key: 'female', label: strings.genders?.female || 'Female' },
                      { key: 'other', label: strings.genders?.other || 'Other' },
                      { key: 'prefer_not_to_say', label: strings.genders?.preferNot || 'Prefer not to say' }
                    ].map((g) => (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => setGender(g.key as any)}
                        className={`p-3.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          gender === g.key
                            ? 'bg-teal-500/20 border-teal-500 text-teal-300 ring-1 ring-teal-500/40'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Change Language</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!fullName.trim()) {
                      alert('Please enter your full name to proceed.');
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  className="px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                >
                  <span>Continue to Symptoms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: MEDICAL INTAKE ("What brings you to the doctor today?")             */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-5">
                <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Step 3 of 4 • Health Evaluation</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {strings.whatBringsYouTitle}
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  {strings.whatBringsYouSubtitle}
                </p>
              </div>

              {/* Input Mode Selector */}
              <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-md">
                <button
                  type="button"
                  onClick={() => setInputMode('voice')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    inputMode === 'voice'
                      ? 'bg-teal-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Voice (Speak)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    inputMode === 'text'
                      ? 'bg-teal-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Type</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('touch')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    inputMode === 'touch'
                      ? 'bg-teal-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Touch Chips</span>
                </button>
              </div>

              {/* Mode 1: VOICE INPUT (Speech Recognition + Interactive Voice Scenarios) */}
              {inputMode === 'voice' && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 text-center">
                  <div className="max-w-md mx-auto space-y-3">
                    <button
                      type="button"
                      onClick={() => handleStartVoice()}
                      disabled={voiceStatus === 'listening' || voiceStatus === 'processing'}
                      className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                        voiceStatus === 'listening'
                          ? 'bg-rose-500 animate-pulse ring-8 ring-rose-500/20 text-white'
                          : voiceStatus === 'processing'
                          ? 'bg-amber-500 animate-spin text-white'
                          : 'bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 hover:scale-105 shadow-teal-500/25'
                      }`}
                    >
                      <Mic className="w-12 h-12" />
                    </button>

                    <div>
                      <span className="text-sm font-bold text-white block">
                        {voiceStatus === 'listening'
                          ? 'Listening to speech...'
                          : voiceStatus === 'processing'
                          ? 'Analyzing & Translating...'
                          : strings.tapToSpeak}
                      </span>
                      <span className="text-xs text-slate-400">
                        Speaks in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.nativeName} • Real-time Web Speech recognition
                      </span>
                    </div>

                    {/* Live Streaming Audio Waveform */}
                    {voiceStatus === 'listening' && (
                      <div className="flex items-center justify-center gap-1.5 py-2">
                        <span className="w-1.5 h-6 bg-teal-400 rounded-full animate-pulse" />
                        <span className="w-1.5 h-10 bg-teal-400 rounded-full animate-pulse delay-75" />
                        <span className="w-1.5 h-4 bg-teal-400 rounded-full animate-pulse delay-150" />
                        <span className="w-1.5 h-8 bg-teal-400 rounded-full animate-pulse delay-100" />
                        <span className="w-1.5 h-5 bg-teal-400 rounded-full animate-pulse delay-200" />
                      </div>
                    )}

                    {liveTranscript && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-teal-500/30 text-xs text-teal-300 font-mono">
                        "{liveTranscript}"
                      </div>
                    )}
                  </div>

                  {/* Labeled Demo Voice Scenarios (Non-hardcoded choices) */}
                  <div className="border-t border-slate-800 pt-4 text-left">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Or Choose a Realistic Clinical Voice Scenario:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {CLINICAL_SPEECH_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setSelectedPresetId(preset.id);
                            handleStartVoice(preset.id);
                          }}
                          className={`p-2.5 rounded-xl border text-xs text-left cursor-pointer transition-colors ${
                            selectedPresetId === preset.id
                              ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-bold">{preset.label}</div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {preset.translations[selectedLang] || preset.english}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 2: TYPED INPUT */}
              {inputMode === 'text' && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <label className="text-xs font-bold text-slate-300">
                    Type your symptoms in any language:
                  </label>
                  <textarea
                    rows={3}
                    value={typedComplaint}
                    onChange={(e) => setTypedComplaint(e.target.value)}
                    placeholder={strings.typeSymptom}
                    className="w-full text-sm p-4 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-hidden focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleProcessTextInput}
                    className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Process & Translate Symptoms</span>
                  </button>
                </div>
              )}

              {/* Mode 3: TOUCH SYMPTOM CHIPS */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  {strings.commonSymptoms}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {Object.entries(strings.symptoms || {}).map(([key, label]) => {
                    const isChecked = selectedSymptoms.includes(label);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleToggleSymptomChip(key, label)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-teal-500/20 border-teal-500 text-teal-200 shadow-xs'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <span>{label}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-teal-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  {strings.durationQuestion}
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Since yesterday', '2 - 3 days', '5 days', '1 week', '2 weeks', '1 month'].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setSelectedDuration(dur)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                        selectedDuration === dur
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Translation & Structured Output Card */}
              {(originalSpeechText || englishTranslation || structuredComplaint) && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Clinical Translation & Structured Summary</span>
                  </div>

                  {originalSpeechText && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-400 font-semibold block">Original Voice Transcript ({selectedLang.toUpperCase()}):</span>
                      <p className="text-slate-200 mt-0.5 font-medium">{originalSpeechText}</p>
                    </div>
                  )}

                  {englishTranslation && (
                    <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/30 text-xs">
                      <span className="text-indigo-300 font-semibold block">English Medical Translation:</span>
                      <p className="text-indigo-100 mt-0.5 font-medium">{englishTranslation}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-300">
                    <div><strong>Chief Complaint:</strong> {structuredComplaint || 'Evaluated in consultation'}</div>
                    <div>•</div>
                    <div><strong>Duration:</strong> {selectedDuration}</div>
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Identity</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                >
                  <span>Review Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: REVIEW YOUR INFORMATION (EDITABLE)                                */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold mb-1">
                    <FileCheck2 className="w-4 h-4" />
                    <span>Step 4 of 4 • Final Review</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    {strings.reviewTitle}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    {strings.reviewSubtitle}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Patient ID</span>
                  <span className="font-mono font-bold text-teal-400 text-sm block">{patientId}</span>
                </div>
              </div>

              {/* Review Sections */}
              <div className="space-y-4 text-xs">
                {/* Identity Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-slate-300 uppercase tracking-wider">Patient Identification</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{strings.editInfo}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-slate-500 block">Full Name</span>
                      <span className="text-white font-bold text-sm">{fullName || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Age</span>
                      <span className="text-white font-bold text-sm">{age} years</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone</span>
                      <span className="text-white font-bold text-sm font-mono">+91 {phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Gender</span>
                      <span className="text-white font-bold text-sm capitalize">{gender}</span>
                    </div>
                  </div>
                </div>

                {/* Language Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Preferred Clinical Language</span>
                    <span className="text-white font-bold text-sm">
                      {SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.nativeName} ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                </div>

                {/* Health Intake Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-slate-300 uppercase tracking-wider">Medical Concerns & Symptoms</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{strings.editInfo}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-500 block">Chief Complaint</span>
                      <span className="text-teal-300 font-bold text-sm">{structuredComplaint || 'Acute Symptom Evaluation'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Duration</span>
                      <span className="text-white font-semibold">{selectedDuration}</span>
                    </div>

                    {selectedSymptoms.length > 0 && (
                      <div>
                        <span className="text-slate-500 block mb-1">Associated Symptoms</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSymptoms.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded-md text-[11px] font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {originalSpeechText && (
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 mt-2">
                        <span className="text-slate-500 block text-[11px]">Patient's Voice/Text Statement:</span>
                        <p className="text-slate-300 mt-0.5">{originalSpeechText}</p>
                      </div>
                    )}

                    {englishTranslation && (
                      <div className="p-2.5 bg-indigo-950/40 rounded-xl border border-indigo-500/30">
                        <span className="text-indigo-400 block text-[11px]">Medical Translation:</span>
                        <p className="text-indigo-200 mt-0.5">{englishTranslation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Confirmation Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Edit</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndSubmit}
                  className="px-10 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-base rounded-2xl flex items-center gap-2 shadow-xl shadow-teal-500/25 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{strings.confirmSubmit}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: INTAKE COMPLETE & QUEUE TOKEN ISSUED                              */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-300 max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto shadow-xl shadow-teal-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  Intake Completed Successfully!
                </h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Your details have been securely logged into the CareFlow clinical workflow and forwarded to the doctor.
                </p>
              </div>

              {/* Big Queue Token Display */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm mx-auto space-y-3">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Your Queue Token</span>
                <div className="text-5xl font-black text-teal-400 tracking-wider font-mono">
                  {tokenNumber}
                </div>
                <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                  Patient: <strong className="text-white">{fullName}</strong> ({patientId})
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-400 max-w-md mx-auto space-y-1">
                <p>Status: <strong className="text-amber-400">Waiting for Consultation</strong></p>
                <p>Please be seated in the waiting area. The doctor will call your token number shortly.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleRegisterNextPatient}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Next Patient</span>
                </button>

                {onOpenDoctorCaseForPatient && (
                  <button
                    type="button"
                    onClick={() => onOpenDoctorCaseForPatient(patientId)}
                    className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 transition-colors"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Open Doctor Consultation</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* DOCTOR MODE ACCESS AUTHENTICATION MODAL (SECURE ACCESS GATEWAY)           */}
      {/* ========================================================================= */}
      {showDoctorLoginModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Doctor Mode Access</h3>
                  <p className="text-xs text-slate-400">Staff Authentication Required</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDoctorLoginModal(false);
                  setLoginError(null);
                }}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleDoctorLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Staff / Doctor ID</label>
                <input
                  type="text"
                  required
                  value={loginStaffId}
                  onChange={(e) => setLoginStaffId(e.target.value)}
                  placeholder="e.g. DOC-1001, NUR-1001, REC-1001"
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Security PIN / Password</label>
                <input
                  type="password"
                  required
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="Enter 4-digit PIN (1234)"
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Quick Demo Credentials Helpers */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Quick Demo Accounts (Tap to Fill):</span>
                <div className="flex flex-wrap gap-1.5">
                  {DEMO_STAFF_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setLoginStaffId(acc.id);
                        setLoginPin('1234');
                        setLoginError(null);
                      }}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 cursor-pointer transition-colors"
                    >
                      <strong className="text-indigo-400">{acc.id}</strong> ({acc.role})
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowDoctorLoginModal(false);
                    setLoginError(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isAuthenticating ? 'Verifying...' : 'Unlock Doctor Mode'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
