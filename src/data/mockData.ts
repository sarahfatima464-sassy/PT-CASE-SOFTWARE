import { Patient, ClinicalCase, CaseTemplate, AuditLogEntry, IntegrationCard, ScannedPrescription, FollowUpInfo, PatientTimelineEvent } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'CF-1001',
    name: 'Arjun Rao',
    dob: '1984-04-12',
    age: 42,
    gender: 'Male',
    phone: '+91 98480 22334',
    email: 'arjun.rao.sample@careflow-demo.io',
    address: '42 Jubilee Hills, Road No. 36, Hyderabad, Telangana',
    emergencyContact: {
      name: 'Sunita Rao',
      relationship: 'Spouse',
      phone: '+91 98480 22335'
    },
    bloodGroup: 'B+',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    existingConditions: ['Type 2 Diabetes Mellitus', 'Essential Hypertension'],
    currentMedications: ['Metformin 500mg BD', 'Telmisartan 40mg OD'],
    insuranceProvider: 'Star Health Premier Health Care',
    insuranceNumber: 'SH-IND-892401',
    referringDoctor: 'Dr. K. S. Murthy (Internal Medicine)',
    registrationDate: '2025-01-15',
    lastVisit: '2026-03-01',
    status: 'Waiting',
    waitingReason: 'Fever with cough and frontal headache x 3 days',
    waitTimeMinutes: 14
  },
  {
    id: 'CF-1002',
    name: 'Priya Sharma',
    dob: '1995-08-23',
    age: 31,
    gender: 'Female',
    phone: '+91 98112 55678',
    email: 'priya.sharma.sample@careflow-demo.io',
    address: 'Flat 304, Palm Meadows, Whitefield, Bengaluru, Karnataka',
    emergencyContact: {
      name: 'Rohan Sharma',
      relationship: 'Brother',
      phone: '+91 98112 55679'
    },
    bloodGroup: 'O+',
    allergies: ['Aspirin', 'Ibuprofen (NSAIDs)'],
    existingConditions: ['Hypothyroidism'],
    currentMedications: ['Levothyroxine 50mcg OD (empty stomach)'],
    insuranceProvider: 'HDFC ERGO Optima Secure',
    insuranceNumber: 'HE-BLR-401920',
    referringDoctor: 'Self-Referral',
    registrationDate: '2025-04-10',
    lastVisit: '2026-02-18',
    status: 'In Consultation',
    waitingReason: 'Annual endocrine & thyroid evaluation',
    waitTimeMinutes: 0
  },
  {
    id: 'CF-1003',
    name: 'Rahul Kumar',
    dob: '1970-11-05',
    age: 56,
    gender: 'Male',
    phone: '+91 99201 33456',
    email: 'rahul.kumar.sample@careflow-demo.io',
    address: '18 Bandra Reclamation, Hill Road, Mumbai, Maharashtra',
    emergencyContact: {
      name: 'Kavita Kumar',
      relationship: 'Spouse',
      phone: '+91 99201 33457'
    },
    bloodGroup: 'A+',
    allergies: ['None known'],
    existingConditions: ['Dyslipidemia', 'Mild CAD (Stented 2021)'],
    currentMedications: ['Atorvastatin 20mg HS', 'Clopidogrel 75mg OD'],
    insuranceProvider: 'ICICI Lombard Health Shield',
    insuranceNumber: 'IC-MUM-771239',
    referringDoctor: 'Dr. Anil Mehta (Cardiologist)',
    registrationDate: '2024-11-20',
    lastVisit: '2026-02-28',
    status: 'Waiting',
    waitingReason: 'Routine post-stent cardiac review & lipid check',
    waitTimeMinutes: 28
  },
  {
    id: 'CF-1004',
    name: 'Ananya Reddy',
    dob: '2017-06-14',
    age: 9,
    gender: 'Female',
    phone: '+91 94401 77890',
    email: 'reddy.family.sample@careflow-demo.io',
    address: 'Plot 12, Kavuri Hills, Madhapur, Hyderabad, Telangana',
    emergencyContact: {
      name: 'Dr. Suresh Reddy',
      relationship: 'Father',
      phone: '+91 94401 77890'
    },
    bloodGroup: 'AB+',
    allergies: ['Peanuts', 'Amoxicillin'],
    existingConditions: ['Childhood Asthma (Mild intermittent)'],
    currentMedications: ['Salbutamol Inhaler PRN'],
    insuranceProvider: 'Care Health Family Floater',
    insuranceNumber: 'CH-HYD-550192',
    referringDoctor: 'Dr. P. Madhavi (Pediatrics)',
    registrationDate: '2025-06-02',
    lastVisit: '2026-01-12',
    status: 'Active',
    waitingReason: 'Routine pediatric growth and allergy follow-up',
    waitTimeMinutes: 0
  },
  {
    id: 'CF-1005',
    name: 'Vikram Singh',
    dob: '1959-02-19',
    age: 67,
    gender: 'Male',
    phone: '+91 98710 44321',
    email: 'vikram.singh.sample@careflow-demo.io',
    address: 'B-64 Defence Colony, New Delhi, Delhi',
    emergencyContact: {
      name: 'Jaspreet Singh',
      relationship: 'Son',
      phone: '+91 98710 44322'
    },
    bloodGroup: 'O-',
    allergies: ['Ciprofloxacin'],
    existingConditions: ['Bilateral Knee Osteoarthritis', 'Stage 2 Chronic Kidney Disease'],
    currentMedications: ['Paracetamol 650mg PRN', 'Calcium + Vit D3 OD'],
    insuranceProvider: 'New India Assurance Mediclaim',
    insuranceNumber: 'NIA-DEL-338901',
    referringDoctor: 'Dr. R. K. Grover (Orthopedics)',
    registrationDate: '2024-08-14',
    lastVisit: '2026-02-25',
    status: 'Waiting',
    waitingReason: 'Bilateral knee pain worsening on stairs',
    waitTimeMinutes: 35
  },
  {
    id: 'CF-1006',
    name: 'Meera Nair',
    dob: '1998-09-30',
    age: 28,
    gender: 'Female',
    phone: '+91 98470 66543',
    email: 'meera.nair.sample@careflow-demo.io',
    address: 'House 14, Panampilly Nagar, Kochi, Kerala',
    emergencyContact: {
      name: 'Devaki Nair',
      relationship: 'Mother',
      phone: '+91 98470 66544'
    },
    bloodGroup: 'A-',
    allergies: ['Latex'],
    existingConditions: ['Polycystic Ovarian Syndrome (PCOS)', 'Migraine with Aura'],
    currentMedications: ['Myo-Inositol 2g OD', 'Naproxen 500mg PRN for migraine onset'],
    insuranceProvider: 'Max Bupa ReAssure',
    insuranceNumber: 'MB-KOC-990142',
    referringDoctor: 'Self-Referral',
    registrationDate: '2025-09-05',
    lastVisit: '2026-02-10',
    status: 'Active',
    waitingReason: 'Migraine headache prophylaxis discussion',
    waitTimeMinutes: 0
  }
];

export const INITIAL_CASES: ClinicalCase[] = [
  {
    id: 'CF-CASE-2041',
    patientId: 'CF-1001',
    patientName: 'Arjun Rao',
    doctorName: 'Dr. Ramesh Reddy, MD',
    specialty: 'General Medicine',
    date: '2026-03-01',
    chiefComplaint: 'High grade fever with chills, dry hacking cough, and severe frontal headache for 3 days.',
    historyOfPresentIllness: 'Patient was well until 3 days ago when he developed sudden onset fever peaking at 101.5°F accompanied by rigors, retro-orbital soreness, and body aches. No hemoptysis, no shortness of breath at rest.',
    duration: '3 days',
    symptoms: ['Fever', 'Dry Cough', 'Frontal Headache', 'Myalgia', 'General Malaise'],
    previousIllness: 'Similar viral prodrome 1 year ago, resolved uneventfully.',
    pastMedicalHistory: 'Type 2 Diabetes Mellitus x 6 years, Hypertension x 4 years.',
    surgicalHistory: 'Appendectomy (2012).',
    familyHistory: 'Father had MI at 65. Mother has Type 2 Diabetes.',
    socialHistory: 'Non-smoker, occasional alcohol on social occasions, desk job in IT software.',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    currentMedications: ['Metformin 500mg BD', 'Telmisartan 40mg OD'],
    vitals: {
      temperature: '101.2 °F',
      bloodPressure: '138/86 mmHg',
      pulse: '92 bpm',
      respiratoryRate: '18 /min',
      spO2: '98 % on room air',
      height: '174 cm',
      weight: '76 kg',
      bmi: '25.1'
    },
    examination: {
      cardiovascular: 'S1 S2 normal, no murmurs, normal peripheral pulses.',
      respiratory: 'Bilateral vesicular breath sounds, no crackles or wheezing heard.',
      abdomen: 'Soft, non-tender, no hepatosplenomegaly, normal bowel sounds.',
      neurological: 'Alert, oriented x 3, neck supple, Kernig negative, cranial nerves intact.',
      musculoskeletal: 'Generalized muscle soreness without joint swelling.',
      skin: 'Warm, flushed, no petechiae, purpura, or active rash.'
    },
    investigations: [
      {
        id: 'INV-101',
        testName: 'Complete Blood Count (CBC)',
        resultValue: 'WBC: 4,200 /µL (Neutrophils 48%, Lymphocytes 46%)',
        referenceRange: '4,000 - 11,000 /µL',
        unit: 'cells/µL',
        status: 'Normal',
        date: '2026-03-01'
      },
      {
        id: 'INV-102',
        testName: 'Dengue NS1 Antigen & IgM',
        resultValue: 'Negative',
        referenceRange: 'Negative',
        unit: 'Index',
        status: 'Normal',
        date: '2026-03-01'
      },
      {
        id: 'INV-103',
        testName: 'Platelet Count',
        resultValue: '210,000 /µL',
        referenceRange: '150,000 - 450,000',
        unit: '/µL',
        status: 'Normal',
        date: '2026-03-01'
      },
      {
        id: 'INV-104',
        testName: 'Random Blood Glucose',
        resultValue: '146 mg/dL',
        referenceRange: '70 - 140 mg/dL',
        unit: 'mg/dL',
        status: 'Abnormal',
        date: '2026-03-01'
      }
    ],
    aiSummary: {
      patientOverview: '42-year-old male with chronic T2DM and HTN presenting with acute 3-day febrile illness with respiratory symptoms.',
      chiefComplaintSummary: 'Fever, dry cough, and headache for 3 days.',
      historySummary: 'Sudden onset febrile episode with myalgias. Documented Penicillin and Sulfa allergy. On oral hypoglycemic and antihypertensive therapy.',
      examinationSummary: 'Febrile (101.2°F), hemodynamically stable. Clear lung fields, benign abdomen, no meningismus.',
      investigationsSummary: 'Leukopenia tendency with relative lymphocytosis consistent with acute viral illness. Mild stress hyperglycemia (146 mg/dL). Dengue NS1 negative.',
      criticalFlags: ['Penicillin Allergy — Avoid Beta-Lactams', 'Monitor glycemic control during acute viral infection'],
      disclaimer: 'AI-generated summary. Verify before clinical use.'
    },
    aiInsights: [
      {
        id: 'INS-1',
        type: 'possible_condition',
        title: 'Acute Viral Upper Respiratory Infection (URI)',
        description: 'Consistent with seasonal viral prodrome, acute onset fever, headache, clear chest findings, and relative lymphocytosis.',
        severity: 'medium',
        disclaimer: 'AI Decision Support — Clinician verification required.'
      },
      {
        id: 'INS-2',
        type: 'risk_flag',
        title: 'Documented Severe Penicillin Allergy',
        description: 'Patient has reported allergic reaction to Penicillin and Sulfa. Do NOT prescribe Amoxicillin, Augmentin, or Bactrim.',
        severity: 'critical',
        disclaimer: 'AI Decision Support — Clinician verification required.'
      },
      {
        id: 'INS-3',
        type: 'medication_consideration',
        title: 'Glycemic Spikes During Acute Infection',
        description: 'RBG is 146 mg/dL. Acute infections typically increase insulin resistance; advise continued Metformin with adequate hydration.',
        severity: 'low',
        disclaimer: 'AI Decision Support — Clinician verification required.'
      },
      {
        id: 'INS-4',
        type: 'suggested_question',
        title: 'Inquire on Household Contacts',
        description: 'Check if family members or coworkers in Hyderabad have similar viral symptoms or recent travel.',
        severity: 'low',
        disclaimer: 'AI Decision Support — Clinician verification required.'
      }
    ],
    diagnosis: {
      primary: 'Acute Viral Upper Respiratory Tract Infection',
      secondary: 'Type 2 Diabetes Mellitus (Under control)',
      differential: ['Early Influenza A/B', 'Mild Acute Bronchitis', 'Sinusitis'],
      clinicalNotes: 'Chest clear bilaterally. Vitals stable. Advised rest, oral hydration, and symptomatic antipyretic. No antibiotic indicated currently.',
      confirmedByDoctor: true
    },
    prescriptions: [
      {
        id: 'MED-201',
        name: 'Paracetamol',
        strength: '650 mg',
        dosage: '1 tablet',
        frequency: 'TDS (Three times daily after food) SOS for temp > 100°F',
        route: 'Oral',
        duration: '5 days',
        instructions: 'Take after meals with water. Do not exceed 3 tablets in 24 hours.'
      },
      {
        id: 'MED-202',
        name: 'Levocetirizine',
        strength: '5 mg',
        dosage: '1 tablet',
        frequency: 'Once daily at bedtime (HS)',
        route: 'Oral',
        duration: '5 days',
        instructions: 'May cause mild drowsiness. Avoid driving late at night.'
      },
      {
        id: 'MED-203',
        name: 'Vitamin C + Zinc Chews',
        strength: '500 mg / 10 mg',
        dosage: '1 chewable tablet',
        frequency: 'Once daily (OD)',
        route: 'Oral',
        duration: '10 days',
        instructions: 'Chew thoroughly after breakfast.'
      }
    ],
    followUp: {
      id: 'FU-301',
      patientId: 'CF-1001',
      patientName: 'Arjun Rao',
      caseId: 'CF-CASE-2041',
      doctorName: 'Dr. Ramesh Reddy, MD',
      scheduledDate: '2026-03-06',
      reason: 'Review fever status, cough resolution and fasting blood sugar',
      instructions: 'Return earlier if persistent fever > 102°F or onset of dyspnea.',
      testsRequired: ['Fasting Blood Sugar if fever persists'],
      status: 'Scheduled',
      reminderSent: true
    },
    status: 'Completed',
    sourceLanguage: 'te',
    patientModeTranscript: {
      originalText: 'నాకు మూడు రోజులుగా జ్వరం ఉంది, దగ్గు మరియు తలనొప్పి కూడా ఉంది.',
      translatedText: 'I have had fever for three days with cough and headache.',
      language: 'Telugu',
      structuredComplaint: 'Fever with chills',
      duration: '3 days',
      associatedSymptoms: ['Dry Cough', 'Headache', 'Body Pain']
    }
  }
];

export const INITIAL_SCANNED_PRESCRIPTIONS: ScannedPrescription[] = [
  {
    id: 'SCAN-5001',
    patientId: 'CF-1001',
    patientName: 'Arjun Rao',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=900&q=80',
    scannedAt: '2026-02-28 16:45',
    status: 'Verified',
    overallConfidence: 94,
    doctorVerified: true,
    notes: 'Prescription from City Care Clinic dated Oct 2025. Hand-written cursive Rx.',
    extractedMedications: [
      {
        id: 'EXT-1',
        name: 'Metformin Hydrochloride',
        strength: '500 mg',
        dosage: '1 tablet',
        frequency: 'Twice daily (BD)',
        route: 'Oral',
        duration: '30 days',
        instructions: 'After breakfast and dinner',
        confidence: 96,
        needsVerification: false
      },
      {
        id: 'EXT-2',
        name: 'Telmisartan',
        strength: '40 mg',
        dosage: '1 tablet',
        frequency: 'Once daily (OD)',
        route: 'Oral',
        duration: '30 days',
        instructions: 'Morning after food',
        confidence: 93,
        needsVerification: false
      },
      {
        id: 'EXT-3',
        name: 'Unclear Rx Entry (Likely Multivitamin / B-Complex)',
        strength: 'Unclear',
        dosage: '1 cap',
        frequency: 'OD',
        route: 'Oral',
        duration: '15 days',
        instructions: 'After lunch',
        confidence: 61,
        needsVerification: true,
        allergyWarning: '⚠ Unclear handwriting — Doctor verification required'
      }
    ]
  }
];

export const INITIAL_TEMPLATES: CaseTemplate[] = [
  {
    id: 'TMPL-01',
    name: 'General Medicine Comprehensive Case',
    specialty: 'General Medicine',
    description: 'Standard clinical evaluation template covering multi-system history, vitals, and systemic examination.',
    lastUpdated: '2026-02-15',
    isActive: true,
    fields: [
      { id: 'f1', name: 'chief_complaint', label: 'Chief Complaint', type: 'voice_text', required: true },
      { id: 'f2', name: 'duration_days', label: 'Duration of Symptoms', type: 'text', required: true },
      { id: 'f3', name: 'fever_pattern', label: 'Fever Character & Pattern', type: 'dropdown', options: ['Continuous', 'Intermittent with chills', 'Remittent', 'No fever'], required: false },
      { id: 'f4', name: 'system_review', label: 'Primary Affected Organ System', type: 'dropdown', options: ['Respiratory', 'Cardiovascular', 'Gastrointestinal', 'Neurological', 'Dermatological'], required: true },
      { id: 'f5', name: 'comorbidities', label: 'Pre-existing Comorbidities', type: 'checkbox', options: ['Diabetes', 'Hypertension', 'CAD', 'Asthma/COPD', 'CKD'], required: false }
    ]
  },
  {
    id: 'TMPL-02',
    name: 'Pediatric Growth & Acute Illness',
    specialty: 'Pediatrics',
    description: 'Specialized for infants and children with immunization tracking, milestones, and weight-based dosing.',
    lastUpdated: '2026-02-10',
    isActive: true,
    fields: [
      { id: 'p1', name: 'child_age_months', label: 'Age (Years & Months)', type: 'text', required: true },
      { id: 'p2', name: 'birth_weight', label: 'Birth Weight & Term', type: 'text', required: false },
      { id: 'p3', name: 'immunization_status', label: 'Immunization Complete for Age', type: 'radio', options: ['Up-to-date', 'Delayed', 'Not Vaccinated'], required: true },
      { id: 'p4', name: 'feeding_intake', label: 'Hydration & Oral Intake', type: 'dropdown', options: ['Normal', 'Decreased (<50%)', 'Refusing feeds', 'Vomiting everything'], required: true }
    ]
  },
  {
    id: 'TMPL-03',
    name: 'Cardiology & Chest Evaluation',
    specialty: 'Cardiology',
    description: 'Cardiovascular assessment with angina classification, NYHA functional score, and risk factor stratification.',
    lastUpdated: '2026-01-28',
    isActive: true,
    fields: [
      { id: 'c1', name: 'chest_pain_type', label: 'Chest Pain Nature', type: 'dropdown', options: ['Retrosternal crushing/pressure', 'Pleuritic/sharp', 'Aching', 'Non-anginal'], required: true },
      { id: 'c2', name: 'nyha_class', label: 'NYHA Dyspnea Class', type: 'dropdown', options: ['Class I (No limit)', 'Class II (Slight)', 'Class III (Marked)', 'Class IV (At rest)'], required: true },
      { id: 'c3', name: 'ecg_interpretation', label: 'ECG Findings', type: 'voice_text', required: false }
    ]
  },
  {
    id: 'TMPL-04',
    name: 'Dermatology Lesion & Rash Protocol',
    specialty: 'Dermatology',
    description: 'Morphological characterization of cuticular lesions, pruritus rating, and distribution mapping.',
    lastUpdated: '2026-02-20',
    isActive: true,
    fields: [
      { id: 'd1', name: 'lesion_morphology', label: 'Lesion Morphology', type: 'dropdown', options: ['Maculopapular', 'Vesicular', 'Plaque with scales', 'Urticarial wheals', 'Ulcerative'], required: true },
      { id: 'd2', name: 'itching_severity', label: 'Pruritus / Itch Severity (1-10)', type: 'number', required: false },
      { id: 'd3', name: 'body_distribution', label: 'Distribution & Photosensitivity', type: 'text', required: true }
    ]
  },
  {
    id: 'TMPL-05',
    name: 'Orthopedics & Musculoskeletal Pain',
    specialty: 'Orthopedics',
    description: 'Joint range of motion, weight-bearing ability, and radiological correlation.',
    lastUpdated: '2026-01-18',
    isActive: true,
    fields: [
      { id: 'o1', name: 'joint_involved', label: 'Joint / Bone Region', type: 'dropdown', options: ['Knee', 'Hip', 'Spine / Lumbar', 'Shoulder', 'Ankle/Foot', 'Wrist/Hand'], required: true },
      { id: 'o2', name: 'weight_bearing', label: 'Weight Bearing Ability', type: 'radio', options: ['Full weight bearing', 'Partial with antalgic gait', 'Non-weight bearing'], required: true }
    ]
  },
  {
    id: 'TMPL-06',
    name: 'Gynecology & Obstetric Evaluation',
    specialty: 'Gynecology',
    description: 'Menstrual history, obstetric score (G_P_L_A_), and pelvic findings.',
    lastUpdated: '2026-02-05',
    isActive: true,
    fields: [
      { id: 'g1', name: 'lmp_date', label: 'Last Menstrual Period (LMP)', type: 'date', required: true },
      { id: 'g2', name: 'cycle_regularity', label: 'Cycle Interval & Flow', type: 'text', required: true }
    ]
  },
  {
    id: 'TMPL-07',
    name: 'ENT & Upper Airway Clinical Form',
    specialty: 'ENT',
    description: 'Otoscopy, rhinoscopy, and throat examination evaluation.',
    lastUpdated: '2026-02-02',
    isActive: true,
    fields: [
      { id: 'e1', name: 'hearing_loss_or_tinnitus', label: 'Auditory Symptoms', type: 'dropdown', options: ['None', 'Unilateral hearing drop', 'Bilateral tinnitus', 'Ear discharge (Otorrhea)'], required: true },
      { id: 'e2', name: 'tonsillar_grade', label: 'Tonsillar Hypertrophy Grade', type: 'dropdown', options: ['Grade 0 (Absent)', 'Grade 1 (<25%)', 'Grade 2 (25-50%)', 'Grade 3 (50-75%)', 'Grade 4 (>75%)'], required: false }
    ]
  },
  {
    id: 'TMPL-08',
    name: 'Dental & Oral Health Chart',
    specialty: 'Dental',
    description: 'Tooth numbering chart, periodontal index, and caries assessment.',
    lastUpdated: '2026-01-15',
    isActive: true,
    fields: [
      { id: 'dn1', name: 'chief_dental_pain', label: 'Dental Complaint Nature', type: 'dropdown', options: ['Severe throbbing pain on biting', 'Sensitivity to cold/sweets', 'Gingival bleeding', 'Esthetic repair'], required: true }
    ]
  },
  {
    id: 'TMPL-09',
    name: 'Neurology & Cognitive Screen',
    specialty: 'Neurology',
    description: 'Cranial nerves, motor/sensory deficits, reflexes, and mini mental evaluation.',
    lastUpdated: '2026-02-22',
    isActive: true,
    fields: [
      { id: 'n1', name: 'gcs_score', label: 'Glasgow Coma Scale (E_V_M_ /15)', type: 'number', required: true },
      { id: 'n2', name: 'focal_deficit', label: 'Focal Motor or Sensory Deficit', type: 'radio', options: ['None', 'Hemiparesis', 'Paraparesis', 'Facial Droop', 'Sensory Level'], required: true }
    ]
  }
];

export const INITIAL_INTEGRATIONS: IntegrationCard[] = [
  {
    id: 'INT-01',
    name: 'CarePath Central Diagnostics Lab',
    type: 'Laboratory',
    description: 'Automated bidirectional bi-directional order dispatch & automated LIS result ingestion for CBC, LFT, KFT.',
    status: 'Connected',
    lastPing: '2 mins ago',
    endpoint: 'https://lis.careflow-demo.internal/fhir/r4/Observation',
    syncFrequency: 'Real-time Webhook'
  },
  {
    id: 'INT-02',
    name: 'MedPlus & Apollo Health e-Pharmacy',
    type: 'Pharmacy',
    description: 'Direct prescription routing, stock availability checks, and patient doorstep delivery dispatch.',
    status: 'Connected',
    lastPing: '5 mins ago',
    endpoint: 'https://rx.medplus-gateway.internal/v2/orders',
    syncFrequency: 'On-demand API'
  },
  {
    id: 'INT-03',
    name: 'District Hospital Central EHR',
    type: 'Hospital EHR',
    description: 'Bed availability, inpatient admissions, and emergency room transfer summaries.',
    status: 'Connected',
    lastPing: '12 mins ago',
    endpoint: 'https://ehr.district-health.gov.in/interop/v1',
    syncFrequency: 'Hourly batch'
  },
  {
    id: 'INT-04',
    name: 'TrueScan Imaging & MRI Center',
    type: 'Diagnostic Center',
    description: 'DICOM image viewer links, CT/MRI radiologist reports, and digital X-ray ingestion.',
    status: 'Disconnected',
    lastPing: '1 day ago',
    endpoint: 'https://pacs.truescan.internal/dicom-web',
    syncFrequency: 'Manual trigger'
  },
  {
    id: 'INT-05',
    name: 'HL7 FHIR Release 4 Gateway',
    type: 'FHIR',
    description: 'Standardized healthcare interoperability layer for Patient, Encounter, Condition, and MedicationRequest resources.',
    status: 'Connected',
    lastPing: 'Just now',
    endpoint: 'https://fhir.careflow.internal/baseR4',
    syncFrequency: 'Continuous bidirectional'
  },
  {
    id: 'INT-06',
    name: 'Legacy HL7 v2.x MLLP Broker',
    type: 'HL7',
    description: 'Support for ADT-A08 patient demographics and ORU-R01 clinical result feeds.',
    status: 'Connected',
    lastPing: '28 mins ago',
    endpoint: 'mllp://hl7.careflow.internal:2575',
    syncFrequency: 'Stream'
  },
  {
    id: 'INT-07',
    name: 'External Specialty EHR Bridges',
    type: 'External EHR',
    description: 'Secure cross-practice patient medical record exchange via SMART on FHIR OAuth profiles.',
    status: 'Disconnected',
    lastPing: 'Never',
    endpoint: 'https://smart-bridge.careflow.internal/oauth2',
    syncFrequency: 'On-demand'
  },
  {
    id: 'INT-08',
    name: 'CareFlow Open REST API',
    type: 'REST API',
    description: 'Developer endpoints for mobile companion apps, clinic check-in kiosks, and queue monitors.',
    status: 'Connected',
    lastPing: 'Just now',
    endpoint: 'https://api.careflow.internal/v1',
    syncFrequency: 'Real-time'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-03-01 10:14:22',
    userName: 'Dr. Ramesh Reddy',
    userRole: 'doctor',
    action: 'Prescription Verification & Finalization',
    record: 'Case CF-CASE-2041 (Arjun Rao)',
    ipAddress: '192.168.1.45 (Doctor Terminal 01)',
    status: 'Success',
    details: 'Verified Paracetamol 650mg TDS, Levocetirizine 5mg HS. Verified Penicillin allergy flag.'
  },
  {
    id: 'AUD-902',
    timestamp: '2026-03-01 10:02:11',
    userName: 'Kiosk Terminal (Self-Service)',
    userRole: 'patient',
    action: 'Patient Voice Intake Submitted',
    record: 'Intake Queue #14 (Arjun Rao, Telugu)',
    ipAddress: '192.168.1.90 (Patient Lobby Kiosk)',
    status: 'Success',
    details: 'Audio speech captured in Telugu. AI translation generated to English and routed to Dr. Reddy.'
  },
  {
    id: 'AUD-903',
    timestamp: '2026-03-01 09:48:05',
    userName: 'Nurse Sunita Verma',
    userRole: 'nurse',
    action: 'Vitals Entry & Triage',
    record: 'Patient CF-1001 (Arjun Rao)',
    ipAddress: '192.168.1.52 (Triage Station B)',
    status: 'Success',
    details: 'Recorded BP 138/86, Temp 101.2°F, SpO2 98%, Pulse 92 bpm.'
  },
  {
    id: 'AUD-904',
    timestamp: '2026-03-01 09:30:19',
    userName: 'Pooja Nair (Reception Desk)',
    userRole: 'reception',
    action: 'Patient Check-in & Waiting Room Assignment',
    record: 'Patient CF-1003 (Rahul Kumar)',
    ipAddress: '192.168.1.12 (Front Desk 02)',
    status: 'Success',
    details: 'Patient arrived for cardiac routine evaluation. Assigned queue token #15.'
  },
  {
    id: 'AUD-905',
    timestamp: '2026-03-01 08:55:40',
    userName: 'Dr. Ramesh Reddy',
    userRole: 'doctor',
    action: 'OCR Handwriting Scan Analysis',
    record: 'Prescription Doc SCAN-5001 (Arjun Rao)',
    ipAddress: '192.168.1.45 (Doctor Terminal 01)',
    status: 'Success',
    details: 'Processed paper prescription image. Extracted 2 verified medicines and flagged 1 unclear entry.'
  },
  {
    id: 'AUD-906',
    timestamp: '2026-03-01 08:30:00',
    userName: 'System Daemon',
    userRole: 'doctor',
    action: 'Encrypted Offline Store Synchronization',
    record: 'Local IndexedDB Sync Batch #441',
    ipAddress: '127.0.0.1 (Local Runtime)',
    status: 'Success',
    details: 'All local modifications validated against cloud database model schemas.'
  }
];

export const INITIAL_TIMELINE_EVENTS: PatientTimelineEvent[] = [
  {
    id: 'TL-101',
    patientId: 'CF-1001',
    date: '2026-03-01',
    time: '10:15 AM',
    type: 'consultation',
    title: 'Clinical Consultation Completed',
    description: 'Dr. Ramesh Reddy documented Acute Viral URI case. AI clinical summary verified.',
    actor: 'Dr. Ramesh Reddy, MD'
  },
  {
    id: 'TL-102',
    patientId: 'CF-1001',
    date: '2026-03-01',
    time: '10:14 AM',
    type: 'prescription',
    title: 'New Prescription Issued',
    description: 'Paracetamol 650mg TDS x 5d, Levocetirizine 5mg HS x 5d, Vit C + Zinc OD x 10d.',
    actor: 'Dr. Ramesh Reddy, MD'
  },
  {
    id: 'TL-103',
    patientId: 'CF-1001',
    date: '2026-03-01',
    time: '10:02 AM',
    type: 'document',
    title: 'Multilingual Patient Kiosk Intake (Telugu)',
    description: 'Patient spoke Telugu describing 3 days fever, cough, and headache. Translated to English.',
    actor: 'CareFlow Kiosk'
  },
  {
    id: 'TL-104',
    patientId: 'CF-1001',
    date: '2026-02-28',
    time: '04:45 PM',
    type: 'document',
    title: 'Historical Prescription Digitized',
    description: 'Scanned handwritten prescription from Oct 2025 digitized with OCR verification.',
    actor: 'Dr. Ramesh Reddy, MD'
  },
  {
    id: 'TL-105',
    patientId: 'CF-1001',
    date: '2026-01-15',
    time: '11:20 AM',
    type: 'investigation',
    title: 'HbA1c & Fasting Lipid Panel',
    description: 'HbA1c: 6.8% (Good control), Total Cholesterol: 182 mg/dL.',
    actor: 'Central Diagnostics Lab'
  },
  {
    id: 'TL-106',
    patientId: 'CF-1001',
    date: '2025-01-15',
    time: '09:00 AM',
    type: 'registration',
    title: 'Patient Registered at CareFlow Health',
    description: 'Initial intake with chronic T2DM and HTN noted. Penicillin and Sulfa allergies flagged.',
    actor: 'Pooja Nair (Reception Desk)'
  }
];
