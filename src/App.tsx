import React, { useState } from 'react';
import { User, UserRole } from './types';
import { Header } from './components/common/Header';
import { Sidebar, NavItemKey } from './components/common/Sidebar';
import { LoginView } from './components/auth/LoginView';
import { Dashboard } from './components/dashboard/Dashboard';
import { PatientList } from './components/patients/PatientList';
import { PatientProfile } from './components/patients/PatientProfile';
import { PatientRegistration } from './components/patients/PatientRegistration';
import { NewCaseWorkflow } from './components/cases/NewCaseWorkflow';
import { CaseHistory } from './components/cases/CaseHistory';
import { PrescriptionScanner } from './components/scanner/PrescriptionScanner';
import { TemplatesView } from './components/templates/TemplatesView';
import { AIInsightsView } from './components/ai/AIInsightsView';
import { FollowUpManager } from './components/followup/FollowUpManager';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { SyncCenter } from './components/sync/SyncCenter';
import { SettingsView } from './components/settings/SettingsView';
import { AuditLogView } from './components/audit/AuditLogView';
import { PatientKiosk } from './components/patient-mode/PatientKiosk';
import { RecycleBin } from './components/admin/RecycleBin';
import { SupportedLanguage } from './i18n/translations';

type ActiveView =
  | NavItemKey
  | 'patient_profile'
  | 'patient_registration'
  | 'kiosk';

export default function App() {
  // Default logged in as Dr. Ramesh Reddy for instantaneous demo testing
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-1',
    name: 'Dr. Ramesh Reddy, MD',
    email: 'dr.ramesh.reddy@careflow.ai',
    role: 'doctor',
    specialty: 'Internal & General Medicine',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  });

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('CF-1001'); // Arjun Rao
  const [newCasePatientId, setNewCasePatientId] = useState<string | undefined>('CF-1001');
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');

  // Handle Role Change
  const handleRoleChange = (newRole: UserRole) => {
    if (!currentUser) return;
    const names: Record<UserRole, string> = {
      doctor: 'Dr. Ramesh Reddy, MD',
      nurse: 'Nurse Sunita Verma, RN',
      reception: 'Pooja Nair (Front Desk)',
      patient: 'Arjun Rao (Patient Portal)'
    };
    setCurrentUser({
      ...currentUser,
      role: newRole,
      name: names[newRole] || currentUser.name
    });
  };

  // If user logs out
  if (!currentUser) {
    return (
      <LoginView
        onLogin={(user) => {
          setCurrentUser(user);
          setActiveView('dashboard');
        }}
      />
    );
  }

  // Full-screen Patient Kiosk Mode
  if (activeView === 'kiosk') {
    return (
      <PatientKiosk
        onExitKiosk={(authStaff) => {
          if (authStaff) setCurrentUser(authStaff);
          setActiveView('dashboard');
        }}
        onOpenDoctorCaseForPatient={(pid, authStaff) => {
          if (authStaff) setCurrentUser(authStaff);
          setSelectedPatientId(pid);
          setNewCasePatientId(pid);
          setActiveView('new_case');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={activeView as NavItemKey}
        onSelectTab={(tab) => setActiveView(tab)}
        onOpenPatientMode={() => setActiveView('kiosk')}
        userRole={currentUser.role}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Header */}
        <Header
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          onLogout={() => setCurrentUser(null)}
          onNavigateToPatient={(pid) => {
            setSelectedPatientId(pid);
            setActiveView('patient_profile');
          }}
          onOpenPatientMode={() => setActiveView('kiosk')}
          currentLang={currentLang}
          onLanguageChange={(lang) => setCurrentLang(lang)}
          onNavigateToSync={() => setActiveView('sync_center')}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {/* DASHBOARD */}
          {activeView === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              onNavigateToNewCase={(pid) => {
                setNewCasePatientId(pid || 'CF-1001');
                setActiveView('new_case');
              }}
              onNavigateToNewPatient={() => setActiveView('patient_registration')}
              onNavigateToPatientProfile={(pid) => {
                setSelectedPatientId(pid);
                setActiveView('patient_profile');
              }}
              onNavigateToScanner={() => setActiveView('prescription_scanner')}
              onNavigateToHistory={() => setActiveView('case_history')}
              onNavigateToAIInsights={() => setActiveView('ai_insights')}
              onOpenPatientMode={() => setActiveView('kiosk')}
            />
          )}

          {/* PATIENTS DIRECTORY */}
          {activeView === 'patients' && (
            <PatientList
              currentUser={currentUser}
              onSelectPatient={(pid) => {
                setSelectedPatientId(pid);
                setActiveView('patient_profile');
              }}
              onRegisterPatient={() => setActiveView('patient_registration')}
              onStartNewCase={(pid) => {
                setNewCasePatientId(pid);
                setActiveView('new_case');
              }}
            />
          )}

          {/* PATIENT PROFILE */}
          {activeView === 'patient_profile' && (
            <PatientProfile
              currentUser={currentUser}
              patientId={selectedPatientId}
              onBack={() => setActiveView('patients')}
              onStartNewCase={(pid) => {
                setNewCasePatientId(pid);
                setActiveView('new_case');
              }}
              onScanPrescription={(pid) => {
                setSelectedPatientId(pid);
                setActiveView('prescription_scanner');
              }}
            />
          )}

          {/* PATIENT REGISTRATION */}
          {activeView === 'patient_registration' && (
            <PatientRegistration
              onCancel={() => setActiveView('patients')}
              onSaved={(patient, startCaseNow) => {
                setSelectedPatientId(patient.id);
                if (startCaseNow) {
                  setNewCasePatientId(patient.id);
                  setActiveView('new_case');
                } else {
                  setActiveView('patient_profile');
                }
              }}
            />
          )}

          {/* 11-STEP CLINICAL CASE WORKFLOW */}
          {activeView === 'new_case' && (
            <NewCaseWorkflow
              currentUser={currentUser}
              initialPatientId={newCasePatientId}
              onCancel={() => setActiveView('dashboard')}
              onCaseCompleted={(caseId) => {
                setActiveView('case_history');
              }}
            />
          )}

          {/* PRESCRIPTION SCANNER (OCR) */}
          {activeView === 'prescription_scanner' && (
            <PrescriptionScanner
              initialPatientId={selectedPatientId}
              onPrescriptionAdded={(pid) => {
                setSelectedPatientId(pid);
                setActiveView('patient_profile');
              }}
            />
          )}

          {/* CASE HISTORY & ARCHIVE */}
          {activeView === 'case_history' && (
            <CaseHistory
              currentUser={currentUser}
              onOpenPatient={(pid) => {
                setSelectedPatientId(pid);
                setActiveView('patient_profile');
              }}
              onNavigateToRecycleBin={() => setActiveView('recycle_bin')}
            />
          )}

          {/* 30-DAY RECYCLE BIN & SOFT-DELETE ARCHIVE */}
          {activeView === 'recycle_bin' && (
            <RecycleBin
              currentUser={currentUser}
              onOpenPatient={(pid) => {
                setSelectedPatientId(pid);
                setActiveView('patient_profile');
              }}
              onOpenCase={(caseId) => {
                setActiveView('case_history');
              }}
            />
          )}

          {/* SMART TEMPLATES */}
          {activeView === 'templates' && <TemplatesView />}

          {/* AI INSIGHTS & DECISION SUPPORT */}
          {activeView === 'ai_insights' && (
            <AIInsightsView
              onOpenCase={(pid) => {
                setNewCasePatientId(pid);
                setActiveView('new_case');
              }}
            />
          )}

          {/* FOLLOW-UP MANAGER */}
          {activeView === 'followups' && (
            <FollowUpManager
              onOpenPatient={(pid) => {
                setSelectedPatientId(pid);
                setActiveView('patient_profile');
              }}
            />
          )}

          {/* INTEGRATIONS */}
          {activeView === 'integrations' && <IntegrationsView />}

          {/* SYNC CENTER */}
          {activeView === 'sync_center' && <SyncCenter />}

          {/* SETTINGS */}
          {activeView === 'settings' && (
            <SettingsView
              currentLang={currentLang}
              onLanguageChange={(lang) => setCurrentLang(lang)}
            />
          )}

          {/* AUDIT LOG */}
          {activeView === 'audit_log' && <AuditLogView />}
        </main>
      </div>
    </div>
  );
}
