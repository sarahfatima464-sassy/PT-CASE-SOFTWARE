import React, { useState } from 'react';
import { Search, Plus, Filter, ArrowUpDown, ChevronRight, Phone, Calendar, UserCheck, AlertCircle, Stethoscope, Lock, Eye } from 'lucide-react';
import { Patient, User } from '../../types';
import { storageService } from '../../services/storage';
import { permissionService } from '../../services/permissionService';

interface PatientListProps {
  currentUser?: User | null;
  onSelectPatient: (patientId: string) => void;
  onRegisterPatient: () => void;
  onStartNewCase: (patientId: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  currentUser,
  onSelectPatient,
  onRegisterPatient,
  onStartNewCase
}) => {
  const [patients, setPatients] = useState<Patient[]>(storageService.getPatients());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Waiting' | 'In Consultation'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'age'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const canStartCase = permissionService.canEditClinicalData(currentUser);

  React.useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setPatients(storageService.getPatients());
    });
    return unsub;
  }, []);

  const filteredPatients = patients
    .filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        p.dob.includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-500">
            Manage comprehensive clinical records, intake summaries, and patient profiles.
          </p>
        </div>

        <button
          type="button"
          id="btn-register-new-patient"
          onClick={onRegisterPatient}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ID (e.g. CF-1001), phone, DOB..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {(['All', 'Waiting', 'In Consultation', 'Active'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-hidden"
            >
              <option value="name">Name</option>
              <option value="lastVisit">Last Visit</option>
              <option value="age">Age</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Phone & Location</th>
                <th className="py-3 px-4">Blood & Allergies</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <tr
                    key={patient.id}
                    onClick={() => onSelectPatient(patient.id)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600">
                      {patient.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600">
                        {patient.name}
                      </div>
                      <div className="text-[11px] text-slate-400">DOB: {patient.dob}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {patient.age} years • {patient.gender}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{patient.address}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-[11px]">
                          {patient.bloodGroup}
                        </span>
                        {patient.allergies.length > 0 ? (
                          <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-bold border border-rose-200">
                            ⚠ {patient.allergies[0]}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No allergies</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {patient.lastVisit}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        patient.status === 'Waiting' ? 'bg-amber-100 text-amber-800' :
                        patient.status === 'In Consultation' ? 'bg-blue-100 text-blue-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      {canStartCase ? (
                        <button
                          type="button"
                          onClick={() => onStartNewCase(patient.id)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                          title="Start clinical consultation"
                        >
                          <Stethoscope className="w-3 h-3" />
                          <span>Case</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectPatient(patient.id)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                          title="View-Only Access (Reception)"
                        >
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>View Only</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onSelectPatient(patient.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="View Full Profile"
                      >
                        <ChevronRight className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-medium text-sm">No patients found matching your search.</p>
                    <p className="text-xs text-slate-400 mt-1">Try refining search criteria or register a new patient.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
