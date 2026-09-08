import React, { useState } from 'react';
import { Settings, Shield, Globe, Bell, Lock, Database, Sparkles, Check, Save } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n/translations';

interface SettingsViewProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentLang, onLanguageChange }) => {
  const [clinicName, setClinicName] = useState('CareFlow Specialty Health Clinic');
  const [doctorName, setDoctorName] = useState('Dr. Ramesh Reddy, MD');
  const [specialty, setSpecialty] = useState('Internal & General Medicine');
  const [aiAssistanceLevel, setAiAssistanceLevel] = useState('Standard Clinical Decision Support');
  const [autoSyncInterval, setAutoSyncInterval] = useState('5 Minutes');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Clinical Settings</h1>
          <p className="text-xs text-slate-500">Configure clinic metadata, language preferences, AI features, and compliance policies.</p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-900 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Settings successfully updated.</span>
        </div>
      )}

      {/* Settings Cards */}
      <div className="space-y-5">
        {/* Clinic & Clinician Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-600" />
            <span>Clinic & Provider Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinic Name</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Attending Clinician</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Primary Specialty Designation</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Multilingual & Kiosk Default */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-600" />
            <span>Default Language & Localization</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Interface Language</label>
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium"
              >
                {SUPPORTED_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.flagEmoji} {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Patient Kiosk Default Language</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium">
                <option value="te">🇮🇳 Telugu (తెలుగు) - Regional Default</option>
                <option value="en">🇬🇧 English</option>
                <option value="hi">🇮🇳 Hindi (हिन्दी)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Privacy & Compliance Statement */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Security, Data Governance & Compliance</span>
          </h2>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-slate-900">
              Designed with future healthcare compliance requirements in mind.
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              CareFlow AI implements zero-knowledge local storage encryption, role-based access control (RBAC), immutable audit logging, and TLS 1.3 encrypted data transfers for compliance with standards including HIPAA, GDPR, and Indian ABDM (Ayushman Bharat Digital Mission) health data security guidelines.
            </p>
          </div>
        </div>

        {/* AI Decision Support Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Clinical Decision Support Configuration</span>
          </h2>

          <div className="text-xs space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">AI CDS Sensitivity Level</label>
              <select
                value={aiAssistanceLevel}
                onChange={(e) => setAiAssistanceLevel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value="High Sensitivity">High Sensitivity (Flag all possible cross-reactive drug allergies)</option>
                <option value="Standard Clinical Decision Support">Standard Clinical Decision Support (Balanced alerts)</option>
                <option value="Minimal">Minimal (Direct contraindications only)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
              <span>Display mandatory clinician verification disclaimer banner on all AI summaries</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
