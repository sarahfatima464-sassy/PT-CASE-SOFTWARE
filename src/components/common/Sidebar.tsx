import React from 'react';
import {
  LayoutDashboard,
  Users,
  FolderPlus,
  History,
  FileText,
  Sparkles,
  CalendarClock,
  ScanLine,
  Network,
  RefreshCw,
  Settings,
  ShieldCheck,
  Tablet,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { storageService } from '../../services/storage';

export type NavItemKey =
  | 'dashboard'
  | 'patients'
  | 'new_case'
  | 'case_history'
  | 'recycle_bin'
  | 'templates'
  | 'ai_insights'
  | 'followups'
  | 'prescription_scanner'
  | 'integrations'
  | 'sync_center'
  | 'settings'
  | 'audit_log';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  onOpenPatientMode: () => void;
  userRole: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenPatientMode,
  userRole
}) => {
  const syncQueue = storageService.getSyncQueue();
  const pendingSync = syncQueue.filter(i => i.status === 'Pending').length;
  const waitingPatients = storageService.getPatients().filter(p => p.status === 'Waiting').length;
  const recycleCasesCount = storageService.getRecycleBinCases().length;

  const navItems: { id: NavItemKey; label: string; icon: any; badge?: string | number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users, badge: waitingPatients > 0 ? `${waitingPatients} Wait` : undefined, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'new_case', label: 'New Case', icon: FolderPlus },
    { id: 'case_history', label: 'Case History', icon: History },
    { id: 'recycle_bin', label: 'Recycle Bin', icon: Trash2, badge: recycleCasesCount > 0 ? `${recycleCasesCount} Retained` : undefined, badgeColor: 'bg-amber-500/20 text-amber-300' },
    { id: 'templates', label: 'Smart Templates', icon: FileText },
    { id: 'ai_insights', label: 'AI Insights', icon: Sparkles, badge: 'AI', badgeColor: 'bg-indigo-100 text-indigo-800' },
    { id: 'followups', label: 'Follow-ups', icon: CalendarClock },
    { id: 'prescription_scanner', label: 'Prescription Scanner', icon: ScanLine, badge: 'OCR', badgeColor: 'bg-cyan-100 text-cyan-800' },
    { id: 'integrations', label: 'Integrations', icon: Network },
    { id: 'sync_center', label: 'Sync Center', icon: RefreshCw, badge: pendingSync > 0 ? pendingSync : undefined, badgeColor: 'bg-rose-100 text-rose-800 animate-pulse' },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'audit_log', label: 'Audit Log', icon: ShieldCheck }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Kiosk Callout Banner */}
      <div className="p-3 border-b border-slate-800">
        <button
          type="button"
          onClick={onOpenPatientMode}
          className="w-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 border border-teal-500/40 text-teal-200 rounded-xl p-2.5 flex items-center justify-between group transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 border border-teal-500/30">
              <Tablet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Patient Kiosk</span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
              </div>
              <div className="text-[10px] text-teal-300/80">Multilingual Self-Service</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Clinical Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Offline & Compliance Badge */}
      <div className="p-3 border-t border-slate-800/90 text-slate-400 text-[11px] space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Architecture</span>
          <span className="text-teal-400 font-mono text-[10px]">Offline-First</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Active Role</span>
          <span className="text-slate-200 capitalize font-medium">{userRole}</span>
        </div>
        <p className="text-[9px] text-slate-500 pt-1 leading-tight">
          Designed with future healthcare compliance requirements in mind.
        </p>
      </div>
    </aside>
  );
};
