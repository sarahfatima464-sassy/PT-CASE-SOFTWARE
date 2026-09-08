import React, { useState } from 'react';
import { Stethoscope, Lock, Mail, Shield, Check, ArrowRight, UserCheck, HeartHandshake, Tablet } from 'lucide-react';
import { User, UserRole } from '../../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('sarah.fatima@careflow.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const demoAccounts: Record<UserRole, { name: string; email: string; specialty?: string; clinic: string }> = {
    doctor: {
      name: 'Sarah Fatima',
      email: 'sarah.fatima@careflow.ai',
      specialty: 'Internal & General Medicine',
      clinic: 'CareFlow Specialty Clinic'
    },
    nurse: {
      name: 'Nurse Sunita Verma, RN',
      email: 'nurse.sunita@careflow.ai',
      specialty: 'Triage & Clinical Intake',
      clinic: 'CareFlow Specialty Clinic'
    },
    reception: {
      name: 'Pooja Nair',
      email: 'pooja.reception@careflow.ai',
      specialty: 'Registration & Queue Desk',
      clinic: 'CareFlow Specialty Clinic'
    },
    patient: {
      name: 'Arjun Rao (Self-Service Kiosk)',
      email: 'arjun.rao.sample@careflow-demo.io',
      specialty: 'Patient Self-Service',
      clinic: 'Patient Check-In Lobby'
    }
  };

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(demoAccounts[role].email);
    setPassword('demoPass2026!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = demoAccounts[selectedRole];
    const user: User = {
      id: `USR-${selectedRole.toUpperCase()}-01`,
      name: account.name,
      email: email || account.email,
      role: selectedRole,
      specialty: account.specialty,
      clinicName: account.clinic
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-indigo-600 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">CareFlow AI</h1>
          <p className="text-xs text-indigo-100 mt-1">
            Intelligent, Multilingual, Offline-First Case Taking Platform
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/50 text-indigo-100 text-[11px]">
            <Shield className="w-3 h-3" />
            <span>Designed for healthcare compliance standards</span>
          </div>
        </div>

        {/* Demo Role Selector Pills */}
        <div className="p-6 pb-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
            Select Demo Role (1-Click Switch)
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              id="demo-role-doctor"
              onClick={() => handleSelectRole('doctor')}
              className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                selectedRole === 'doctor'
                  ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${selectedRole === 'doctor' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Doctor</div>
                <div className="text-[10px] text-slate-500">Full clinical workflow</div>
              </div>
            </button>

            <button
              type="button"
              id="demo-role-nurse"
              onClick={() => handleSelectRole('nurse')}
              className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                selectedRole === 'nurse'
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${selectedRole === 'nurse' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Nurse / Staff</div>
                <div className="text-[10px] text-slate-500">Intake & vitals</div>
              </div>
            </button>

            <button
              type="button"
              id="demo-role-reception"
              onClick={() => handleSelectRole('reception')}
              className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                selectedRole === 'reception'
                  ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 text-amber-950'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${selectedRole === 'reception' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Reception</div>
                <div className="text-[10px] text-slate-500">Patient registration</div>
              </div>
            </button>

            <button
              type="button"
              id="demo-role-patient"
              onClick={() => handleSelectRole('patient')}
              className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                selectedRole === 'patient'
                  ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 text-teal-950'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${selectedRole === 'patient' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Tablet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Patient Kiosk</div>
                <div className="text-[10px] text-slate-500">Multilingual intake</div>
              </div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username / Clinical Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="clinician@careflow.ai"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotNotice(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {showForgotNotice && (
            <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-600">
              <strong>Demo Environment:</strong> You can sign in using any mock password or switch roles above to test different permissions.
            </div>
          )}

          <button
            type="submit"
            id="login-submit-btn"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span>Sign In to {selectedRole === 'patient' ? 'Patient Kiosk' : 'Clinical Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            CareFlow AI Clinical Prototype • Offline-first enabled
          </p>
        </div>
      </div>
    </div>
  );
};
