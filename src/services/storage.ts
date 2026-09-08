import { Patient, ClinicalCase, CaseTemplate, AuditLogEntry, IntegrationCard, ScannedPrescription, FollowUpInfo, PatientTimelineEvent, SyncQueueItem, PatientIntake } from '../types';
import { INITIAL_PATIENTS, INITIAL_CASES, INITIAL_TEMPLATES, INITIAL_AUDIT_LOGS, INITIAL_INTEGRATIONS, INITIAL_SCANNED_PRESCRIPTIONS, INITIAL_TIMELINE_EVENTS } from '../data/mockData';

const STORAGE_KEYS = {
  PATIENTS: 'careflow_patients_v1',
  CASES: 'careflow_cases_v1',
  TEMPLATES: 'careflow_templates_v1',
  AUDIT_LOGS: 'careflow_audit_logs_v1',
  INTEGRATIONS: 'careflow_integrations_v1',
  SCANNED_RX: 'careflow_scanned_rx_v1',
  TIMELINE: 'careflow_timeline_v1',
  FOLLOW_UPS: 'careflow_followups_v1',
  SYNC_QUEUE: 'careflow_sync_queue_v1',
  IS_ONLINE: 'careflow_network_online_v1',
  CURRENT_USER: 'careflow_current_user_v1',
  APP_SETTINGS: 'careflow_settings_v1',
  PATIENT_INTAKE_QUEUE: 'careflow_patient_intake_queue_v1',
  INTAKE_DRAFT: 'careflow_intake_draft_v1',
  PATIENT_INTAKES: 'careflow_patient_intakes_v1'
};

class StorageService {
  private listeners: Set<() => void> = new Set();
  private isOnlineState: boolean = true;

  constructor() {
    this.initStorage();
    this.migrateLegacyDoctorNames();
    const storedOnline = localStorage.getItem(STORAGE_KEYS.IS_ONLINE);
    if (storedOnline !== null) {
      this.isOnlineState = storedOnline === 'true';
    } else {
      this.isOnlineState = navigator.onLine;
    }

    window.addEventListener('online', () => {
      if (localStorage.getItem(STORAGE_KEYS.IS_ONLINE) === null) {
        this.setOnline(true);
      }
    });
    window.addEventListener('offline', () => {
      if (localStorage.getItem(STORAGE_KEYS.IS_ONLINE) === null) {
        this.setOnline(false);
      }
    });
  }

  private initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASES)) {
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INTEGRATIONS)) {
      localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(INITIAL_INTEGRATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCANNED_RX)) {
      localStorage.setItem(STORAGE_KEYS.SCANNED_RX, JSON.stringify(INITIAL_SCANNED_PRESCRIPTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TIMELINE)) {
      localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(INITIAL_TIMELINE_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE)) {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATIENT_INTAKE_QUEUE)) {
      localStorage.setItem(STORAGE_KEYS.PATIENT_INTAKE_QUEUE, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS)) {
      const followUps: FollowUpInfo[] = INITIAL_CASES.flatMap(c => c.followUp ? [c.followUp] : []);
      localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(followUps));
    }
  }

  private migrateLegacyDoctorNames() {
    const legacyNames = ['Dr. Ramesh Reddy, MD', 'Dr. Ramesh Reddy', 'Ramanjoge', 'Arvind Rao'];
    const replaceLegacyNames = (value: string) => legacyNames.reduce((result, legacyName) => result.replaceAll(legacyName, 'Sarah Fatima'), value);

    for (const key of [STORAGE_KEYS.CASES, STORAGE_KEYS.AUDIT_LOGS]) {
      const stored = localStorage.getItem(key);
      if (stored) {
        const migrated = replaceLegacyNames(stored);
        if (migrated !== stored) localStorage.setItem(key, migrated);
      }
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // Network Online/Offline
  public isOnline(): boolean {
    return this.isOnlineState;
  }

  public setOnline(status: boolean) {
    this.isOnlineState = status;
    localStorage.setItem(STORAGE_KEYS.IS_ONLINE, String(status));
    this.addAuditLog({
      userName: 'Network Monitor',
      userRole: 'doctor',
      action: status ? 'Network Restored (Online)' : 'Network Disconnected (Switched to Offline-First)',
      record: 'System Connection State',
      status: 'Success'
    });
    this.notify();
  }

  // Sync Queue
  public getSyncQueue(): SyncQueueItem[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE) || '[]');
    } catch {
      return [];
    }
  }

  public addToSyncQueue(recordType: SyncQueueItem['recordType'], recordId: string, operation: SyncQueueItem['operation'], data: any) {
    const queue = this.getSyncQueue();
    const newItem: SyncQueueItem = {
      id: `SYNC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      recordType,
      recordId,
      operation,
      status: this.isOnlineState ? 'Synced' : 'Pending',
      timestamp: new Date().toISOString(),
      data
    };
    queue.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    this.notify();
  }

  public async synchronizeQueue(onProgress?: (current: number, total: number) => void): Promise<{ success: boolean; syncedCount: number }> {
    const queue = this.getSyncQueue();
    const pending = queue.filter(item => item.status === 'Pending' || item.status === 'Error');
    if (pending.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    let synced = 0;
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === 'Pending' || queue[i].status === 'Error') {
        queue[i].status = 'Syncing';
        localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
        this.notify();

        // Simulate network transmit latency
        await new Promise(res => setTimeout(res, 350));

        queue[i].status = 'Synced';
        synced++;
        if (onProgress) {
          onProgress(synced, pending.length);
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    this.addAuditLog({
      userName: 'Sync Center',
      userRole: 'doctor',
      action: 'Batch Synchronization Completed',
      record: `${synced} records pushed to remote server`,
      status: 'Success',
      details: 'All offline patient, case, and prescription updates synchronized successfully.'
    });
    this.notify();
    return { success: true, syncedCount: synced };
  }

  // Patients
  public getPatients(): Patient[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    } catch {
      return INITIAL_PATIENTS;
    }
  }

  public getPatientById(id: string): Patient | undefined {
    return this.getPatients().find(p => p.id === id);
  }

  public getPatientByPhone(phone: string): Patient | undefined {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) return undefined;
    return this.getPatients().find(p => {
      const pClean = p.phone.replace(/[^0-9]/g, '');
      return pClean === cleanPhone || pClean.endsWith(cleanPhone) || cleanPhone.endsWith(pClean);
    });
  }

  public generateNextPatientId(): string {
    const patients = this.getPatients();
    let maxNum = 1000;
    for (const p of patients) {
      const match = p.id.match(/^CF-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    return `CF-${maxNum + 1}`;
  }

  public savePatient(patient: Patient): Patient {
    const patients = this.getPatients();
    const index = patients.findIndex(p => p.id === patient.id);
    let operation: SyncQueueItem['operation'] = 'Update';

    if (index >= 0) {
      patients[index] = patient;
    } else {
      operation = 'Create';
      patients.unshift(patient);
    }

    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    this.addToSyncQueue('Patient', patient.id, operation, patient);
    this.addAuditLog({
      userName: 'Current Clinician',
      userRole: 'doctor',
      action: `${operation} Patient Record`,
      record: `${patient.name} (${patient.id})`,
      patientId: patient.id,
      status: 'Success'
    });
    this.notify();
    return patient;
  }

  // Patient Intake Drafts & Autosave
  public savePatientIntakeDraft(draft: any) {
    try {
      localStorage.setItem(STORAGE_KEYS.INTAKE_DRAFT, JSON.stringify({
        ...draft,
        lastSavedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Failed to save intake draft', e);
    }
  }

  public getPatientIntakeDraft(): any | null {
    try {
      const draft = localStorage.getItem(STORAGE_KEYS.INTAKE_DRAFT);
      return draft ? JSON.parse(draft) : null;
    } catch {
      return null;
    }
  }

  public clearPatientIntakeDraft() {
    localStorage.removeItem(STORAGE_KEYS.INTAKE_DRAFT);
  }

  public saveCompletedPatientIntake(intake: PatientIntake): PatientIntake {
    const intakes = this.getPatientIntakes();
    intakes.unshift(intake);
    localStorage.setItem(STORAGE_KEYS.PATIENT_INTAKES, JSON.stringify(intakes));
    this.clearPatientIntakeDraft();
    this.notify();
    return intake;
  }

  // Cases
  public getCases(): ClinicalCase[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CASES) || '[]');
    } catch {
      return INITIAL_CASES;
    }
  }

  public getCaseById(id: string): ClinicalCase | undefined {
    return this.getCases().find(c => c.id === id || c.caseId === id);
  }

  public getCasesByPatientId(patientId: string): ClinicalCase[] {
    // Only return cases belonging to this patient and not deleted (unless requested)
    return this.getCases().filter(c => c.patientId === patientId && c.status !== 'deleted');
  }

  public getAllCasesByPatientId(patientId: string): ClinicalCase[] {
    return this.getCases().filter(c => c.patientId === patientId);
  }

  public getActiveCases(): ClinicalCase[] {
    return this.getCases().filter(c => c.status !== 'deleted' && c.status !== 'completed' && c.status !== 'archived');
  }

  public saveCase(clinicalCase: ClinicalCase): ClinicalCase {
    const cases = this.getCases();
    const index = cases.findIndex(c => c.id === clinicalCase.id || (clinicalCase.caseId && c.id === clinicalCase.caseId));
    let operation: SyncQueueItem['operation'] = 'Update';

    if (index >= 0) {
      cases[index] = clinicalCase;
    } else {
      operation = 'Create';
      cases.unshift(clinicalCase);
    }

    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    this.addToSyncQueue('Case', clinicalCase.id, operation, clinicalCase);

    // Also add to patient timeline
    this.addTimelineEvent({
      patientId: clinicalCase.patientId,
      date: clinicalCase.date || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'consultation',
      title: `Consultation Encounter (${clinicalCase.specialty})`,
      description: `Chief Complaint: ${clinicalCase.chiefComplaint.substring(0, 100)}...`,
      actor: clinicalCase.doctorName
    });

    // If follow-up present, save follow-up
    if (clinicalCase.followUp) {
      this.saveFollowUp(clinicalCase.followUp);
    }

    this.addAuditLog({
      userName: clinicalCase.doctorName,
      userRole: 'doctor',
      action: `${operation} Case ${clinicalCase.id}`,
      record: `${clinicalCase.patientName} (${clinicalCase.patientId})`,
      patientId: clinicalCase.patientId,
      caseId: clinicalCase.id,
      status: 'Success',
      details: `Primary diagnosis: ${clinicalCase.diagnosis?.primary || clinicalCase.primaryDiagnosis || 'Under Investigation'}`
    });

    this.notify();
    return clinicalCase;
  }

  /**
   * Completes a case: removes it from active list and marks it with 30-day retention in Recycle Bin
   */
  public completeCase(caseId: string, doctorId: string = 'DOC-1001', doctorName: string = 'Sarah Fatima', notes?: string): ClinicalCase | undefined {
    const cases = this.getCases();
    const c = cases.find(item => item.id === caseId || item.caseId === caseId);
    if (!c) return undefined;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    c.status = 'completed';
    c.completedAt = now.toISOString();
    c.doctorId = doctorId;
    c.doctorName = doctorName;
    c.recycleBinExpiresAt = expiresAt;
    c.updatedAt = now.toISOString();

    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    this.addToSyncQueue('Case', c.id, 'Update', c);

    this.addTimelineEvent({
      patientId: c.patientId,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'consultation',
      title: `Case Completed (${c.specialty})`,
      description: `Case completed and moved into 30-day recovery retention.`,
      actor: doctorName
    });

    this.addAuditLog({
      userId: doctorId,
      userName: doctorName,
      userRole: 'doctor',
      action: 'Case Completed',
      patientId: c.patientId,
      caseId: c.id,
      record: `${c.patientName} (${c.id})`,
      status: 'Success',
      details: `Completed and retained in 30-day recycle bin until ${expiresAt.split('T')[0]}.`
    });

    this.notify();
    return c;
  }

  /**
   * Soft-deletes a case: moves it to Recycle Bin for 30 days
   */
  public softDeleteCase(caseId: string, deletedBy: string = 'Sarah Fatima', reason: string = 'Moved to Recycle Bin by clinician'): ClinicalCase | undefined {
    const cases = this.getCases();
    const c = cases.find(item => item.id === caseId || item.caseId === caseId);
    if (!c) return undefined;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    c.status = 'deleted';
    c.deletedAt = now.toISOString();
    c.deletedBy = deletedBy;
    c.deletionReason = reason;
    c.recycleBinExpiresAt = expiresAt;
    c.updatedAt = now.toISOString();

    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    this.addToSyncQueue('Case', c.id, 'Update', c);

    this.addTimelineEvent({
      patientId: c.patientId,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'case',
      title: `Case Moved to Recycle Bin`,
      description: `Case soft-deleted: ${reason}. Recoverable for 30 days.`,
      actor: deletedBy
    });

    this.addAuditLog({
      userName: deletedBy,
      userRole: 'doctor',
      action: 'Case Moved to Recycle Bin',
      patientId: c.patientId,
      caseId: c.id,
      record: `${c.patientName} (${c.id})`,
      status: 'Warning',
      details: reason
    });

    this.notify();
    return c;
  }

  /**
   * Restores a case from Recycle Bin back to active workflow
   */
  public restoreCase(caseId: string, restoredBy: string = 'Sarah Fatima'): ClinicalCase | undefined {
    const cases = this.getCases();
    const c = cases.find(item => item.id === caseId || item.caseId === caseId);
    if (!c) return undefined;

    const now = new Date();
    c.status = 'in_progress';
    c.deletedAt = undefined;
    c.deletedBy = undefined;
    c.deletionReason = undefined;
    c.recycleBinExpiresAt = undefined;
    c.updatedAt = now.toISOString();

    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    this.addToSyncQueue('Case', c.id, 'Update', c);

    this.addTimelineEvent({
      patientId: c.patientId,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'case',
      title: `Case Restored from Recycle Bin`,
      description: `Case restored to active consultation status with all medical history intact.`,
      actor: restoredBy
    });

    this.addAuditLog({
      userName: restoredBy,
      userRole: 'doctor',
      action: 'Case Restored',
      patientId: c.patientId,
      caseId: c.id,
      record: `${c.patientName} (${c.id})`,
      status: 'Success',
      details: 'Case recovered from Recycle Bin with all diagnoses, vitals, and prescriptions preserved.'
    });

    this.notify();
    return c;
  }

  /**
   * Permanently deletes a case after confirmation or retention expiration
   */
  public permanentlyDeleteCase(caseId: string, purgedBy: string = 'System Admin / Doctor', reason: string = 'Retention expired / Clinician authorized permanent destruction'): boolean {
    let cases = this.getCases();
    const target = cases.find(item => item.id === caseId || item.caseId === caseId);
    if (!target) return false;

    cases = cases.filter(item => item.id !== caseId && item.caseId !== caseId);
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    this.addToSyncQueue('Case', caseId, 'Delete', { id: caseId, patientId: target.patientId });

    this.addAuditLog({
      userName: purgedBy,
      userRole: 'doctor',
      action: 'Case Permanently Purged',
      patientId: target.patientId,
      caseId: caseId,
      record: `${target.patientName} (${caseId})`,
      status: 'Warning',
      details: `Encounter record permanently purged. Reason: ${reason}`
    });

    this.notify();
    return true;
  }

  /**
   * Returns all cases currently in the 30-day Recycle Bin
   */
  public getRecycleBinCases(): ClinicalCase[] {
    const allCases = this.getCases();
    const now = Date.now();
    const result: ClinicalCase[] = [];

    for (const c of allCases) {
      if (c.status === 'deleted' || (c.status === 'completed' && c.recycleBinExpiresAt)) {
        const expiresTime = c.recycleBinExpiresAt ? new Date(c.recycleBinExpiresAt).getTime() : now + 30 * 86400000;
        const diffDays = Math.max(0, Math.ceil((expiresTime - now) / (1000 * 60 * 60 * 24)));

        if (!c.recycleBinExpiresAt) {
          c.recycleBinExpiresAt = new Date(expiresTime).toISOString();
        }
        result.push(c);
      }
    }

    return result;
  }

  /**
   * Periodic purge check for cases exceeding 30 days in Recycle Bin
   */
  public cleanupExpiredRecycleBinCases(): number {
    const cases = this.getCases();
    const now = Date.now();
    const remaining: ClinicalCase[] = [];
    let purgedCount = 0;

    for (const c of cases) {
      if ((c.status === 'deleted' || c.status === 'completed') && c.recycleBinExpiresAt) {
        const exp = new Date(c.recycleBinExpiresAt).getTime();
        if (now > exp) {
          purgedCount++;
          this.addAuditLog({
            userName: 'Automated Retention Engine',
            userRole: 'doctor',
            action: 'Case Permanently Purged',
            patientId: c.patientId,
            caseId: c.id,
            record: `${c.patientName} (${c.id})`,
            status: 'Warning',
            details: '30-day retention period elapsed. Case purged per healthcare data retention policy.'
          });
          continue;
        }
      }
      remaining.push(c);
    }

    if (purgedCount > 0) {
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(remaining));
      this.notify();
    }
    return purgedCount;
  }

  // Scanned Prescriptions
  public getScannedPrescriptions(patientId?: string): ScannedPrescription[] {
    try {
      const items: ScannedPrescription[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCANNED_RX) || '[]');
      if (patientId) {
        return items.filter(i => i.patientId === patientId);
      }
      return items;
    } catch {
      if (patientId) {
        return INITIAL_SCANNED_PRESCRIPTIONS.filter(i => i.patientId === patientId);
      }
      return INITIAL_SCANNED_PRESCRIPTIONS;
    }
  }

  public saveScannedPrescription(rx: ScannedPrescription): ScannedPrescription {
    const list = this.getScannedPrescriptions();
    const index = list.findIndex(r => r.id === rx.id);
    if (index >= 0) {
      list[index] = rx;
    } else {
      list.unshift(rx);
    }
    localStorage.setItem(STORAGE_KEYS.SCANNED_RX, JSON.stringify(list));
    this.addToSyncQueue('Prescription', rx.id, 'Create', rx);
    this.notify();
    return rx;
  }

  // Templates
  public getTemplates(): CaseTemplate[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '[]');
    } catch {
      return INITIAL_TEMPLATES;
    }
  }

  public saveTemplate(template: CaseTemplate): CaseTemplate {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    this.notify();
    return template;
  }

  // Follow Ups
  public getFollowUps(): FollowUpInfo[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS) || '[]');
    } catch {
      return [];
    }
  }

  public saveFollowUp(followUp: FollowUpInfo): FollowUpInfo {
    const list = this.getFollowUps();
    const index = list.findIndex(f => f.id === followUp.id);
    if (index >= 0) {
      list[index] = followUp;
    } else {
      list.unshift(followUp);
    }
    localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(list));
    this.addToSyncQueue('FollowUp', followUp.id, 'Create', followUp);

    this.addTimelineEvent({
      patientId: followUp.patientId,
      date: followUp.scheduledDate,
      time: '09:00 AM',
      type: 'follow_up',
      title: `Follow-up Scheduled (${followUp.reason})`,
      description: `Instructions: ${followUp.instructions}`,
      actor: followUp.doctorName
    });

    this.notify();
    return followUp;
  }

  public updateFollowUpStatus(id: string, status: FollowUpInfo['status']) {
    const list = this.getFollowUps();
    const item = list.find(f => f.id === id);
    if (item) {
      item.status = status;
      localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(list));
      this.notify();
    }
  }

  // Timeline
  public getTimelineEvents(patientId?: string): PatientTimelineEvent[] {
    try {
      const events: PatientTimelineEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIMELINE) || '[]');
      if (patientId) {
        return events.filter(e => e.patientId === patientId);
      }
      return events;
    } catch {
      return INITIAL_TIMELINE_EVENTS;
    }
  }

  public addTimelineEvent(event: Omit<PatientTimelineEvent, 'id'>): PatientTimelineEvent {
    const events = this.getTimelineEvents();
    const newEvent: PatientTimelineEvent = {
      ...event,
      id: `TL-${Date.now()}`
    };
    events.unshift(newEvent);
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(events));
    this.notify();
    return newEvent;
  }

  // Audit Logs
  public getAuditLogs(): AuditLogEntry[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress'> & { ipAddress?: string }) {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: entry.ipAddress || '192.168.1.45 (Local Node)',
      ...entry
    };
    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
    this.notify();
  }

  // Integrations
  public getIntegrations(): IntegrationCard[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.INTEGRATIONS) || '[]');
    } catch {
      return INITIAL_INTEGRATIONS;
    }
  }

  public toggleIntegrationStatus(id: string): IntegrationCard | undefined {
    const list = this.getIntegrations();
    const item = list.find(i => i.id === id);
    if (item) {
      item.status = item.status === 'Connected' ? 'Disconnected' : 'Connected';
      item.lastPing = item.status === 'Connected' ? 'Just now' : item.lastPing;
      localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(list));
      this.notify();
    }
    return item;
  }

  // Patient Intake Queue (from kiosk)
  public getPatientIntakeQueue(): any[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENT_INTAKE_QUEUE) || '[]');
    } catch {
      return [];
    }
  }

  public getPatientIntakes(): any[] {
    return this.getPatientIntakeQueue();
  }

  public addPatientIntake(intake: any) {
    const queue = this.getPatientIntakeQueue();
    queue.unshift({
      ...intake,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.PATIENT_INTAKE_QUEUE, JSON.stringify(queue));
    this.notify();
  }

  // Convenient helper queries
  public getCasesByPatient(patientId: string): ClinicalCase[] {
    return this.getCasesByPatientId(patientId);
  }

  public getPrescriptionsByPatient(patientId: string): any[] {
    return this.getScannedPrescriptions(patientId);
  }

  public savePrescription(prescription: any) {
    this.saveScannedPrescription(prescription);
  }

  public getInvestigationsByPatient(patientId: string): any[] {
    const cases = this.getCasesByPatientId(patientId);
    return cases.flatMap(c => c.investigations || []);
  }

  public getFollowUpsByPatient(patientId: string): any[] {
    const all = this.getFollowUps();
    return all.filter(f => f.patientId === patientId);
  }

  public getTimelineByPatient(patientId: string): any[] {
    return this.getTimelineEvents(patientId);
  }

  public saveIntegration(integration: any) {
    const list = this.getIntegrations();
    const idx = list.findIndex(i => i.id === integration.id);
    if (idx >= 0) {
      list[idx] = integration;
    } else {
      list.push(integration);
    }
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(list));
    this.notify();
  }

  public async synchronizeAll(): Promise<number> {
    const queue = this.getSyncQueue();
    const pending = queue.filter(q => q.status === 'Pending');
    for (const item of pending) {
      item.status = 'Synced';
    }
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    this.notify();
    return pending.length;
  }
}

export const storageService = new StorageService();

