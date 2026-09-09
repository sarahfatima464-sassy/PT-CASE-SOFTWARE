export type UserRole = 'doctor' | 'nurse' | 'reception' | 'patient';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown / Not Tested';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  specialty?: string;
  clinicName: string;
}

export interface Patient {
  id: string; // e.g. "CF-1001"
  name: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bloodGroup: BloodGroup;
  allergies: string[];
  existingConditions: string[];
  currentMedications: string[];
  preferredLanguage?: string;
  createdAt?: string;
  updatedAt?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  referringDoctor?: string;
  registrationDate: string;
  lastVisit: string;
  status: 'Active' | 'In Consultation' | 'Waiting' | 'Discharged';
  waitingReason?: string;
  waitTimeMinutes?: number;
}

export interface VitalSigns {
  temperature: string; // e.g. "98.6 °F"
  bloodPressure: string; // e.g. "120/80 mmHg"
  pulse: string; // e.g. "72 bpm"
  respiratoryRate: string; // e.g. "16 /min"
  spO2: string; // e.g. "98 %"
  height: string; // e.g. "172 cm"
  weight: string; // e.g. "70 kg"
  bmi: string; // e.g. "23.7"
}

export interface SystemicExamination {
  cardiovascular: string;
  respiratory: string;
  abdomen: string;
  neurological: string;
  musculoskeletal: string;
  skin: string;
}

export interface InvestigationResult {
  id: string;
  testName: string;
  resultValue: string;
  referenceRange: string;
  unit: string;
  status: 'Normal' | 'Abnormal' | 'Critical' | 'Pending';
  date: string;
}

export type ReminderStatus = 'Upcoming' | 'Due Now' | 'Taken' | 'Snoozed' | 'Missed' | 'Skipped';

export interface MedicationReminderRecord {
  id: string;
  patientId: string;
  prescriptionId: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  scheduledDate: string;
  status: ReminderStatus;
  takenAt?: string;
  snoozedUntil?: string;
  createdAt: string;
  updatedAt?: string;
  route?: string;
  dosage?: string;
  instructions?: string;
  beforeAfterFood?: string;
}

export interface Medication {
  id?: string;
  medicationId?: string;
  prescriptionId?: string;
  patientId?: string;
  name: string;
  strength: string; // e.g. "500 mg"
  dosage: string; // e.g. "1 tablet"
  frequency: string; // e.g. "Twice daily (BD)"
  route: string; // e.g. "Oral"
  duration: string; // e.g. "5 days"
  instructions?: string; // e.g. "After food"
  beforeAfterFood?: string;
  startDate?: string;
  endDate?: string;
  reminderEnabled?: boolean;
  reminderTimes?: string[];
  doctor?: string;
  prescriptionIdRef?: string;
  allergyWarning?: string;
  confidence?: number;
  confidenceScore?: number;
  needsVerification?: boolean;
  doctorVerified?: boolean;
}

export interface Diagnosis {
  primary: string;
  secondary?: string;
  differential: string[];
  clinicalNotes: string;
  confirmedByDoctor: boolean;
}

export interface FollowUpInfo {
  id?: string;
  patientId?: string;
  patientName?: string;
  caseId?: string;
  doctorName?: string;
  scheduledDate?: string;
  dueDate?: string;
  date?: string;
  reason?: string;
  instructions?: string;
  notes?: string;
  testsRequired?: string[];
  status?: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Overdue';
  reminderSent?: boolean;
}

export interface AIInsight {
  id: string;
  type: 'risk_flag' | 'missing_info' | 'possible_condition' | 'medication_consideration' | 'suggested_question';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  disclaimer: string;
}

export interface AISummary {
  patientOverview: string;
  chiefComplaintSummary: string;
  historySummary: string;
  examinationSummary: string;
  investigationsSummary: string;
  criticalFlags: string[];
  disclaimer: string;
}

export interface ClinicalCase {
  id: string; // e.g. "CF-CASE-2041"
  caseId?: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName: string;
  specialty: string;
  date: string;
  caseDate?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  deletedAt?: string;
  recycleBinMovedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  recycleBinExpiresAt?: string; // Legacy field retained for stored-record compatibility; never used for expiration
  chiefComplaint: string;
  historyOfPresentIllness: string;
  duration: string;
  symptoms: string[];
  previousIllness?: string;
  pastMedicalHistory?: string;
  surgicalHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  allergies: string[];
  currentMedications: string[];
  vitals: VitalSigns;
  examination: SystemicExamination;
  investigations: InvestigationResult[];
  aiSummary?: AISummary;
  aiInsights: AIInsight[];
  diagnosis: Diagnosis;
  primaryDiagnosis?: string;
  differentialDiagnosis?: string[];
  prescriptions: Medication[];
  treatment?: Medication[];
  clinicalNotes?: string;
  followUp?: Partial<FollowUpInfo>;
  status: 'Draft' | 'Completed' | 'Pending Review' | 'draft' | 'in_progress' | 'completed' | 'archived' | 'deleted';
  sourceLanguage?: string;
  patientModeTranscript?: {
    originalText: string;
    translatedText: string;
    language: string;
    structuredComplaint: string;
    duration: string;
    associatedSymptoms: string[];
  };
}

export interface PatientIntake {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  language: string;
  originalLanguage?: string;
  originalLocale?: string;
  originalTranscript: string;
  translatedText: string;
  structuredComplaint: string;
  structuredSymptoms: string[];
  duration: string;
  inputMode: 'voice' | 'text' | 'touch';
  createdAt: string;
}

export interface RecycleBinCase {
  caseId: string;
  patientId: string;
  patientName: string;
  caseTitle: string;
  doctorName: string;
  completedOrDeletedDate: string;
  deletedBy: string;
  deletionReason?: string;
  recycleBinExpiresAt?: string;
  daysRemaining?: number;
  originalStatus: string;
  isCompleted: boolean;
  caseData: ClinicalCase;
  retention: 'permanent';
  movedToRecycleBinAt: string;
}

export interface ScannedPrescription {
  id: string;
  patientId: string;
  patientName?: string;
  imageUrl?: string;
  scannedAt?: string;
  status?: 'Processing' | 'Verified' | 'Pending Verification';
  overallConfidence?: number;
  extractedMedications?: Medication[];
  doctorVerified?: boolean;
  notes?: string;
}

export interface PatientTimelineEvent {
  id: string;
  patientId: string;
  date: string;
  time: string;
  type: 'registration' | 'consultation' | 'diagnosis' | 'investigation' | 'prescription' | 'medication_change' | 'follow_up' | 'document' | 'case';
  title: string;
  description: string;
  actor: string;
  metadata?: Record<string, any>;
}

export interface TemplateField {
  id: string;
  name?: string;
  label: string;
  type: 'text' | 'number' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'voice_text';
  options?: string[];
  required: boolean;
  defaultValue?: string;
}

export interface CaseTemplate {
  id: string;
  name: string;
  specialty: string;
  description: string;
  fields: TemplateField[];
  lastUpdated: string;
  isActive: boolean;
}

export interface SyncQueueItem {
  id: string;
  recordType: 'Patient' | 'Case' | 'Prescription' | 'FollowUp' | 'AuditLog';
  recordId: string;
  operation: 'Create' | 'Update' | 'Delete';
  status: 'Pending' | 'Syncing' | 'Synced' | 'Error';
  timestamp: string;
  data: any;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  userRole: UserRole;
  action: string;
  record: string;
  patientId?: string;
  caseId?: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Denied';
  details?: string;
}

export interface IntegrationCard {
  id: string;
  name: string;
  type: 'Laboratory' | 'Pharmacy' | 'Hospital EHR' | 'Diagnostic Center' | 'External EHR' | 'FHIR' | 'HL7' | 'REST API';
  description: string;
  status: 'Connected' | 'Disconnected' | 'Configuring';
  lastPing?: string;
  endpoint?: string;
  syncFrequency: string;
  protocol?: string;
  lastSync?: string;
}

// Convenient aliases for clinical modules
export type Vitals = VitalSigns;
export type AIClinicalSummary = AISummary;
export type AIClinicalInsight = AIInsight;
export type FollowUp = FollowUpInfo;
export type AuditLog = AuditLogEntry;
export type IntegrationConfig = IntegrationCard;
export type SpecialtyTemplate = CaseTemplate & { isCustom?: boolean };
export type Prescription = ScannedPrescription & {
  doctorName?: string;
  clinicName?: string;
  createdAt?: string;
  medications?: Medication[];
  scannedImageUrl?: string;
  isOcrDigitized?: boolean;
};
export type TimelineEvent = PatientTimelineEvent;
export type Investigation = InvestigationResult;

