import React, { useMemo, useState } from 'react';
import { AlertCircle, Bell, Clock3, CheckCircle2, ChevronRight, Pill, RefreshCw, SkipForward, XCircle } from 'lucide-react';
import { storageService } from '../../services/storage';
import { MedicationReminderRecord } from '../../types';

interface MedicationReminderViewProps {
  patientId?: string;
  onClose?: () => void;
}

export const MedicationReminderView: React.FC<MedicationReminderViewProps> = ({ patientId, onClose }) => {
  const activePatientId = patientId || storageService.getPatients()[0]?.id || 'CF-1001';
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const patient = storageService.getPatientById(activePatientId);

  const reminders = useMemo(() => {
    const all = storageService.generateMedicationRemindersForPatient(
      activePatientId,
      patient?.currentMedications?.map((med) => ({ name: med })) || []
    );
    return all
      .filter((r: MedicationReminderRecord) => r.status !== 'Taken')
      .sort((a, b) => new Date(a.scheduledDate + 'T' + a.scheduledTime).getTime() - new Date(b.scheduledDate + 'T' + b.scheduledTime).getTime());
  }, [activePatientId, patient?.currentMedications?.join('|'), refreshKey]);

  const handleStatus = (id: string, status: 'Taken' | 'Skipped' | 'Snoozed') => {
    const reminder = storageService.getMedicationReminders(activePatientId).find((r: MedicationReminderRecord) => r.id === id);
    if (!reminder) return;

    const updated = { ...reminder, status, updatedAt: new Date().toISOString() };
    if (status === 'Taken') {
      updated.takenAt = new Date().toISOString();
      storageService.saveMedicationHistory({
        id: `H-${Date.now()}`,
        patientId: activePatientId,
        reminderId: reminder.id,
        medication: reminder.medicationName,
        dosage: reminder.dosage,
        status: 'Taken',
        date: new Date().toISOString(),
        time: reminder.scheduledTime,
        createdAt: new Date().toISOString()
      });
    }
    if (status === 'Skipped') {
      updated.status = 'Skipped';
    }
    if (status === 'Snoozed') {
      const snoozed = new Date();
      snoozed.setMinutes(snoozed.getMinutes() + 30);
      updated.status = 'Snoozed';
      updated.snoozedUntil = snoozed.toISOString();
    }

    storageService.saveMedicationReminder(updated);
    setRefreshKey((v) => v + 1);
  };

  const todays = reminders.filter((r) => new Date(r.scheduledDate).toDateString() === new Date().toDateString());

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Medication Reminders</h1>
          <p className="text-xs text-slate-500">Today's medicines are shown here with easy actions for adherence tracking.</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold">Close</button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <Bell className="w-4 h-4 text-indigo-600" />
          <span>Medication adherence</span>
        </div>

        {todays.length === 0 ? (
          <div className="mt-4 p-5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> No active reminders for today.</div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {todays.map((reminder) => (
              <div key={reminder.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center"><Pill className="w-5 h-5" /></div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">{reminder.scheduledTime}</div>
                      <div className="text-sm text-slate-700">{reminder.medicationName}</div>
                      <div className="text-xs text-slate-500">{reminder.dosage} • {reminder.route || 'Oral'} • {reminder.instructions || 'As directed'}</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800">{reminder.status}</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => handleStatus(reminder.id, 'Taken')} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Taken</button>
                  <button type="button" onClick={() => handleStatus(reminder.id, 'Snoozed')} className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"><Clock3 className="w-4 h-4" /> Snooze</button>
                  <button type="button" onClick={() => handleStatus(reminder.id, 'Skipped')} className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Skip</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
        <div className="flex items-center gap-2 font-semibold"><AlertCircle className="w-4 h-4 text-sky-600" /> Reminder tracking</div>
        <ul className="mt-3 space-y-2 text-xs text-slate-600">
          <li>• Taken records patient adherence in medication history.</li>
          <li>• Snooze postpones for 30 minutes by default.</li>
          <li>• Missed reminders are marked only when no explicit patient confirmation occurs.</li>
        </ul>
      </div>
    </div>
  );
};
