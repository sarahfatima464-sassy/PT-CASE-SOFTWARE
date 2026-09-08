import React from 'react';
import { UserRole } from '../../types';
import { Stethoscope, UserCheck, ShieldAlert, HeartHandshake } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  className?: string;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange, className = '' }) => {
  const roles: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-indigo-600' },
    { role: 'nurse', label: 'Nurse', icon: HeartHandshake, color: 'text-emerald-600' },
    { role: 'reception', label: 'Reception', icon: UserCheck, color: 'text-amber-600' },
    { role: 'patient', label: 'Patient Kiosk', icon: ShieldAlert, color: 'text-cyan-600' }
  ];

  return (
    <div className={`flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 ${className}`}>
      {roles.map(({ role, label, icon: Icon, color }) => {
        const isActive = currentRole === role;
        return (
          <button
            key={role}
            id={`role-btn-${role}`}
            type="button"
            onClick={() => onRoleChange(role)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? color : 'text-slate-400'}`} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
