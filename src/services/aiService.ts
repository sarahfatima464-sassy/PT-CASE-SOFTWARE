import { ClinicalCase, AISummary, AIInsight, Medication, ScannedPrescription } from '../types';

export interface PrescriptionComparisonResult {
  added: Medication[];
  removed: Medication[];
  doseChanged: { previous: Medication; current: Medication; detail: string }[];
  frequencyChanged: { previous: Medication; current: Medication; detail: string }[];
  unchanged: Medication[];
}

export class AIService {
  /**
   * Generates a structured clinical summary from raw case details.
   */
  public async generatePatientSummary(caseData: Partial<ClinicalCase>): Promise<AISummary> {
    // Simulate generation latency
    await new Promise(r => setTimeout(r, 1200));

    const flags: string[] = [];
    if (caseData.allergies && caseData.allergies.length > 0) {
      flags.push(`Allergies Present: ${caseData.allergies.join(', ')} — Contraindicated in treatment`);
    }
    if (caseData.vitals?.temperature && parseFloat(caseData.vitals.temperature) > 100) {
      flags.push(`Febrile state noted: ${caseData.vitals.temperature}`);
    }
    if (caseData.vitals?.bloodPressure && parseInt(caseData.vitals.bloodPressure.split('/')[0] || '0') > 135) {
      flags.push(`Borderline elevated systolic blood pressure: ${caseData.vitals.bloodPressure}`);
    }

    return {
      patientOverview: `${caseData.patientName || 'Patient'} (Patient ID: ${caseData.patientId || 'current'}, Case ID: ${caseData.caseId || 'current'}) presenting with ${caseData.duration || 'an undocumented duration'} of symptoms. Previous medical information and current medications were reviewed.`,
      chiefComplaintSummary: caseData.chiefComplaint || 'Acute presentation documented.',
      historySummary: `${caseData.historyOfPresentIllness || 'History of present illness captured via multimodal intake.'} Symptoms recorded: ${caseData.symptoms?.join(', ') || 'None recorded'}. Current medications: ${caseData.currentMedications?.join(', ') || 'None recorded'}.`,
      examinationSummary: `Vitals: BP ${caseData.vitals?.bloodPressure || 'N/A'}, Pulse ${caseData.vitals?.pulse || 'N/A'}, Temp ${caseData.vitals?.temperature || 'N/A'}, SpO2 ${caseData.vitals?.spO2 || 'N/A'}. Examination findings: ${Object.values(caseData.examination || {}).join('; ') || 'Not recorded'}.`,
      investigationsSummary: caseData.investigations && caseData.investigations.length > 0
        ? caseData.investigations.map(i => `${i.testName}: ${i.resultValue} (${i.status})`).join('; ')
        : 'Routine clinical labs pending or within acceptable baseline.',
      criticalFlags: flags,
      disclaimer: 'AI-generated summary. Verify before clinical use.'
    };
  }

  /**
   * Analyzes case and returns AI Insights (Possible conditions, risk flags, missing info, medication considerations)
   */
  public async generateClinicalInsights(caseData: Partial<ClinicalCase>): Promise<AIInsight[]> {
    await new Promise(r => setTimeout(r, 1000));
    const insights: AIInsight[] = [];

    // 1. Possible conditions (NEVER called Diagnosis)
    const complaintLower = (caseData.chiefComplaint || '').toLowerCase();
    if (complaintLower.includes('fever') || complaintLower.includes('cough') || complaintLower.includes('headache')) {
      insights.push({
        id: `INS-${Date.now()}-1`,
        type: 'possible_condition',
        title: 'Possible Condition: Acute Viral Upper Respiratory Infection (URI)',
        description: 'Symptoms of fever, dry cough, and headache with normal respiratory sounds are most consistent with viral etiology. Consider symptomatic antipyretics and rest before initiating empirical antibiotics.',
        severity: 'medium',
        disclaimer: 'AI Decision Support — Clinician verification required.'
      });
      insights.push({
        id: `INS-${Date.now()}-2`,
        type: 'possible_condition',
        title: 'Possible Condition: Seasonal Influenza / Acute Rhinosinusitis',
        description: 'Differential considerations include early Influenza or viral prodrome. Check for acute facial pressure or localized sinus tenderness.',
        severity: 'low',
        disclaimer: 'AI Decision Support — Clinician verification required.'
      });
    } else {
      insights.push({
        id: `INS-${Date.now()}-1`,
        type: 'possible_condition',
        title: 'Possible Condition: Multi-system Evaluation Indicated',
        description: 'Recorded clinical parameters suggest continued monitoring and correlation with laboratory biomarkers.',
        severity: 'medium',
        disclaimer: 'AI Decision Support — Clinician verification required.'
      });
    }

    // 2. Risk Flags
    if (caseData.allergies && caseData.allergies.some(a => a.toLowerCase().includes('penicillin'))) {
      insights.push({
        id: `INS-${Date.now()}-3`,
        type: 'risk_flag',
        title: 'Risk Flag: High-Risk Penicillin Allergy Contraindication',
        description: 'Patient has documented Penicillin allergy. Beta-lactams, Amoxicillin, and Augmentin are contraindicated. In case of secondary bacterial infection, consider Macrolides (Azithromycin) or Doxycycline.',
        severity: 'critical',
        disclaimer: 'AI Decision Support — Clinician verification required.'
      });
    }

    // 3. Missing Information
    if (!caseData.familyHistory || caseData.familyHistory.trim().length === 0) {
      insights.push({
        id: `INS-${Date.now()}-4`,
        type: 'missing_info',
        title: 'Missing Information: Family Medical History Not Documented',
        description: 'No documentation for hereditary cardiovascular, diabetes, or autoimmune history in first-degree relatives.',
        severity: 'medium',
        disclaimer: 'AI Decision Support — Clinician verification required.'
      });
    }
    if (!caseData.surgicalHistory || caseData.surgicalHistory.trim().length === 0) {
      insights.push({
        id: `INS-${Date.now()}-5`,
        type: 'missing_info',
        title: 'Missing Information: Prior Surgical Interventions',
        description: 'Previous surgical history has not been confirmed with the patient during intake.',
        severity: 'low',
        disclaimer: 'AI Decision Support — Clinician verification required.'
      });
    }

    // 4. Medication Considerations
    insights.push({
      id: `INS-${Date.now()}-6`,
      type: 'medication_consideration',
      title: 'Medication Consideration: Monitor Glycemic Profile & Renal Safety',
      description: 'Metformin should be monitored if dehydration occurs due to persistent pyrexia. Ensure adequate oral fluids.',
      severity: 'low',
      disclaimer: 'AI Decision Support — Clinician verification required.'
    });

    return insights;
  }

  /**
   * Translates patient speech/text to English with structured mapping
   */
  public async translatePatientInput(text: string, fromLang: string): Promise<{
    originalText: string;
    translatedText: string;
    structuredComplaint: string;
    duration: string;
    associatedSymptoms: string[];
  }> {
    await new Promise(r => setTimeout(r, 600));

    const lower = text.toLowerCase();

    // 1. Knee Pain
    if (lower.includes('knee') || text.includes('మోకాలి') || text.includes('మోకాలు') || text.includes('घुटने') || text.includes('முழங்கால்')) {
      const dur = lower.includes('week') || text.includes('వారాలు') || text.includes('हफ्ते') ? '2 weeks' : '10 days';
      return {
        originalText: text,
        translatedText: fromLang === 'en' ? text : 'I have had severe knee pain and stiffness for two weeks, with difficulty walking.',
        structuredComplaint: 'Knee Pain',
        duration: dur,
        associatedSymptoms: ['Joint Stiffness', 'Difficulty Walking', 'Localized Swelling']
      };
    }

    // 2. Stomach / Abdominal Pain
    if (lower.includes('stomach') || lower.includes('abdomen') || lower.includes('belly') || text.includes('కడుపు') || text.includes('కడుపునొప్పి') || text.includes('पेट') || text.includes('വയറു')) {
      const dur = lower.includes('yesterday') || text.includes('నిన్నటి') || text.includes('कल') ? 'Since yesterday' : '2 days';
      return {
        originalText: text,
        translatedText: fromLang === 'en' ? text : 'I have had cramping stomach pain and nausea since yesterday.',
        structuredComplaint: 'Abdominal Pain',
        duration: dur,
        associatedSymptoms: ['Nausea', 'Epigastric Cramps', 'Loss of Appetite']
      };
    }

    // 3. Headache
    if (lower.includes('headache') || text.includes('తలనొప్పి') || text.includes('తల') || text.includes('सिरदर्द') || text.includes('தலைவலி')) {
      const dur = lower.includes('5') || lower.includes('five') || text.includes('ఐదు') || text.includes('पाँच') ? '5 days' : '3 days';
      return {
        originalText: text,
        translatedText: fromLang === 'en' ? text : 'I have been experiencing a persistent throbbing headache for five days.',
        structuredComplaint: 'Headache',
        duration: dur,
        associatedSymptoms: ['Throbbing Pain', 'Photophobia', 'Mild Dizziness']
      };
    }

    // 4. Skin itching / Rash
    if (lower.includes('skin') || lower.includes('itch') || lower.includes('rash') || text.includes('దురద') || text.includes('చర్మ') || text.includes('खुजली') || text.includes('त्वचा')) {
      return {
        originalText: text,
        translatedText: fromLang === 'en' ? text : 'I have had severe skin itching and red patches for one week.',
        structuredComplaint: 'Skin Itching & Rash',
        duration: '1 week',
        associatedSymptoms: ['Pruritus', 'Erythematous Patches', 'Dry Skin']
      };
    }

    // 5. Chest Pain
    if (lower.includes('chest') || text.includes('ఛాతీ') || text.includes('सीना') || text.includes('सीने') || text.includes('மார்பு')) {
      return {
        originalText: text,
        translatedText: fromLang === 'en' ? text : 'I have tightness and pain in my chest that worsens on exertion.',
        structuredComplaint: 'Chest Discomfort',
        duration: '2 days',
        associatedSymptoms: ['Shortness of Breath', 'Palpitations']
      };
    }

    // 6. Back Pain
    if (lower.includes('back') || text.includes('వెన్ను') || text.includes('నడుము') || text.includes('पीठ') || text.includes('कमर')) {
      return {
        originalText: text,
        translatedText: fromLang === 'en' ? text : 'I have severe lower back ache and difficulty bending since last week.',
        structuredComplaint: 'Lower Back Pain',
        duration: '1 week',
        associatedSymptoms: ['Lumbar Stiffness', 'Radiating Discomfort']
      };
    }

    // 7. Fever & Cough
    if (lower.includes('fever') || lower.includes('cough') || text.includes('జ్వరం') || text.includes('దగ్గు') || text.includes('बुखार') || text.includes('खांसी') || text.includes('காய்ச்சல்')) {
      const dur = lower.includes('3') || text.includes('మూడు') || text.includes('तीन') ? '3 days' : '4 days';
      return {
        originalText: text,
        translatedText: fromLang === 'en' ? text : 'I have had fever and persistent cough for three days.',
        structuredComplaint: 'Fever & Cough',
        duration: dur,
        associatedSymptoms: ['Cough', 'Frontal Headache', 'Body Ache']
      };
    }

    // Fallback: parse dynamic English/vernacular text
    let inferredDuration = '3 days';
    if (lower.includes('day')) {
      const match = lower.match(/(\d+|one|two|three|four|five|six|seven)\s*days?/);
      if (match) inferredDuration = `${match[1]} days`;
    } else if (lower.includes('week')) {
      const match = lower.match(/(\d+|one|two|three)\s*weeks?/);
      if (match) inferredDuration = `${match[1]} weeks`;
    } else if (lower.includes('yesterday')) {
      inferredDuration = 'Since yesterday';
    }

    const firstPhrase = text.split(/[.,;\n]/)[0]?.trim() || text;

    return {
      originalText: text,
      translatedText: text,
      structuredComplaint: firstPhrase.length > 50 ? firstPhrase.substring(0, 50) + '...' : firstPhrase,
      duration: inferredDuration,
      associatedSymptoms: ['General Discomfort', 'Fatigue']
    };
  }

  /**
   * Prescription OCR digitization with handwriting uncertainty safety rule
   */
  public async digitizePrescription(imageUrl?: string): Promise<{
    extractedMedications: Medication[];
    medications: Medication[];
    doctorName: string;
    clinicName: string;
    prescriptionDate: string;
    overallConfidence: number;
    unclearItemsCount: number;
    rawText: string;
  }> {
    // Realistic AI OCR scan latency
    await new Promise(r => setTimeout(r, 1600));

    const extractedMedications: Medication[] = [
      {
        id: `MED-OCR-${Date.now()}-1`,
        name: 'Amoxicillin',
        strength: '500 mg',
        dosage: '1 tablet',
        frequency: 'Twice daily (BD)',
        route: 'Oral',
        duration: '5 days',
        instructions: 'After food',
        confidence: 96,
        needsVerification: false
      },
      {
        id: `MED-OCR-${Date.now()}-2`,
        name: 'Paracetamol',
        strength: '650 mg',
        dosage: '1 tablet',
        frequency: 'Thrice daily (TDS)',
        route: 'Oral',
        duration: '3 days',
        instructions: 'Take when fever > 100°F',
        confidence: 94,
        needsVerification: false
      },
      {
        id: `MED-OCR-${Date.now()}-3`,
        name: 'Pantoprazole',
        strength: '40 mg',
        dosage: '1 tablet',
        frequency: 'Once daily (OD)',
        route: 'Oral',
        duration: '5 days',
        instructions: '30 mins before breakfast',
        confidence: 89,
        needsVerification: false
      },
      {
        id: `MED-OCR-${Date.now()}-4`,
        name: 'Unclear Handwriting Entry (Cursive Script)',
        strength: 'Unclear (250mg or 500mg?)',
        dosage: '1 cap',
        frequency: 'Unclear (BD / TDS)',
        route: 'Oral',
        duration: 'Unclear',
        instructions: 'After meals',
        confidence: 48,
        needsVerification: true,
        allergyWarning: '⚠ Unclear information — Doctor verification required'
      }
    ];

    return {
      doctorName: 'Sarah Fatima',
      clinicName: 'City Health Care Specialty Clinic',
      prescriptionDate: new Date().toISOString().split('T')[0],
      medications: extractedMedications,
      extractedMedications,
      overallConfidence: 87,
      unclearItemsCount: 1,
      rawText: "Rx: Tab Amoxicillin 500mg 1 tab BD x 5d PC\nTab Paracetamol 650mg TDS x 3d SOS\nTab Pantoprazole 40mg 1 tab OD BBF x 5d\n[Unclear script: ~~~ 1 cap ? x ?]"
    };
  }

  /**
   * Compares previous prescription against current prescription
   */
  public comparePrescriptions(previous: Medication[], current: Medication[]): PrescriptionComparisonResult {
    const added: Medication[] = [];
    const removed: Medication[] = [];
    const doseChanged: { previous: Medication; current: Medication; detail: string }[] = [];
    const frequencyChanged: { previous: Medication; current: Medication; detail: string }[] = [];
    const unchanged: Medication[] = [];

    const norm = (s: string) => s.toLowerCase().trim();

    // Check each in current
    for (const cur of current) {
      const match = previous.find(p => norm(p.name).includes(norm(cur.name)) || norm(cur.name).includes(norm(p.name)));
      if (!match) {
        added.push(cur);
      } else {
        let changed = false;
        if (norm(cur.strength) !== norm(match.strength)) {
          doseChanged.push({
            previous: match,
            current: cur,
            detail: `Dose changed: ${match.strength} → ${cur.strength}`
          });
          changed = true;
        }
        if (norm(cur.frequency) !== norm(match.frequency)) {
          frequencyChanged.push({
            previous: match,
            current: cur,
            detail: `Frequency changed: ${match.frequency} → ${cur.frequency}`
          });
          changed = true;
        }
        if (!changed) {
          unchanged.push(cur);
        }
      }
    }

    // Check removed from previous
    for (const prev of previous) {
      const match = current.find(c => norm(c.name).includes(norm(prev.name)) || norm(prev.name).includes(norm(c.name)));
      if (!match) {
        removed.push(prev);
      }
    }

    return { added, removed, doseChanged, frequencyChanged, unchanged };
  }
}

export const aiService = new AIService();
