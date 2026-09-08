import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Wifi, WifiOff, Globe, Stethoscope, ChevronDown, User as UserIcon, LogOut, CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { User, Patient } from '../../types';
import { storageService } from '../../services/storage';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n/translations';
import { RoleSwitcher } from './RoleSwitcher';

interface HeaderProps {
  currentUser: User;
  onRoleChange: (role: User['role']) => void;
  onLogout: () => void;
  onNavigateToPatient: (patientId: string) => void;
  onOpenPatientMode: () => void;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onNavigateToSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleChange,
  onLogout,
  onNavigateToPatient,
  onOpenPatientMode,
  currentLang,
  onLanguageChange,
  onNavigateToSync
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(storageService.isOnline());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setIsOnline(storageService.isOnline());
    });
    return unsub;
  }, []);

  // Global search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const patients = storageService.getPatients();
    const filtered = patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.dob.includes(q)
    );
    setSearchResults(filtered);
    setIsSearchOpen(true);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOnline = () => {
    storageService.setOnline(!isOnline);
  };

  const syncQueue = storageService.getSyncQueue();
  const pendingCount = syncQueue.filter(i => i.status === 'Pending').length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between px-4 py-2.5 gap-4">
        {/* Left: App Branding & Role Badging */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base">CareFlow AI</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/60">Clinical</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block h-5 w-px bg-slate-200 mx-1" />

          {/* Quick Demo Role Switcher */}
          <div className="hidden md:flex items-center">
            <RoleSwitcher currentRole={currentUser.role} onRoleChange={onRoleChange} />
          </div>
        </div>

        {/* Center: Global Patient Search Bar */}
        <div className="flex-1 max-w-lg relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-patient-search"
              type="text"
              placeholder="Search patients by name, CF-ID, phone, DOB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Matching Patients ({searchResults.length})</div>
                  {searchResults.map(patient => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => {
                        onNavigateToPatient(patient.id);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-indigo-50/70 flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-slate-900 flex items-center gap-1.5">
                            {patient.name}
                            <span className="text-xs text-slate-500 font-normal">({patient.gender}, {patient.age}y)</span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="font-mono text-indigo-600">{patient.id}</span>
                            <span>•</span>
                            <span>{patient.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          patient.status === 'Waiting' ? 'bg-amber-100 text-amber-800' :
                          patient.status === 'In Consultation' ? 'bg-blue-100 text-blue-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {patient.status}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                  No matching patients found for "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Controls: Online Status, Kiosk shortcut, Language, Notifications, User */}
        <div className="flex items-center gap-2">
          {/* Online/Offline Toggle Button */}
          <button
            type="button"
            id="toggle-online-btn"
            onClick={toggleOnline}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 animate-pulse'
            }`}
            title="Click to toggle Online/Offline simulation"
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline ({pendingCount} pending)</span>
              </>
            )}
          </button>

          {/* Sync status quick link */}
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={onNavigateToSync}
              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-1 rounded font-medium cursor-pointer flex items-center gap-1"
            >
              <span>Sync Now</span>
            </button>
          )}

          {/* Patient Mode Kiosk Button */}
          <button
            type="button"
            id="open-patient-kiosk-btn"
            onClick={onOpenPatientMode}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-all"
            title="Open touch-friendly multilingual Patient Kiosk"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Patient Kiosk</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="lang-selector-btn"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <span>{SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.flagEmoji}</span>
              <span className="hidden sm:inline">{SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase">Select Language</div>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-indigo-50 cursor-pointer ${
                      currentLang === lang.code ? 'font-semibold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flagEmoji}</span>
                      <span>{lang.name}</span>
                    </span>
                    <span className="text-slate-400 text-[11px]">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              id="notifications-btn"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-semibold text-xs text-slate-800">Notifications</span>
                  <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded">3 New</span>
                </div>
                <div className="space-y-2.5 mt-2">
                  <div className="text-xs p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900">Patient Intake Completed</div>
                      <div className="text-slate-600 text-[11px]">Arjun Rao submitted fever intake in Telugu from Kiosk.</div>
                    </div>
                  </div>
                  <div className="text-xs p-2 rounded-lg bg-amber-50/60 border border-amber-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900">Allergy Alert Flag</div>
                      <div className="text-slate-600 text-[11px]">Severe Penicillin allergy documented on patient profile.</div>
                    </div>
                  </div>
                  <div className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900">Lab Results Ingested</div>
                      <div className="text-slate-600 text-[11px]">CarePath LIS returned CBC panel for Vikram Singh.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              type="button"
              id="profile-menu-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                {currentUser.name.charAt(currentUser.name.indexOf(' ') + 1) || 'D'}
              </div>
              <div className="hidden xl:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 capitalize">{currentUser.role} • {currentUser.clinicName}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <span className="mt-1 inline-block text-[10px] px-2 py-0.5 font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize">
                    {currentUser.role} Access
                  </span>
                </div>
                <div className="py-1">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400">Switch Demo Role</div>
                  {(['doctor', 'nurse', 'reception', 'patient'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        onRoleChange(r);
                        setIsProfileOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs capitalize hover:bg-indigo-50 flex items-center justify-between cursor-pointer ${
                        currentUser.role === r ? 'text-indigo-600 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span>{r} Mode</span>
                      {currentUser.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
