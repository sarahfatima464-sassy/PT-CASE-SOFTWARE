import React, { useState } from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, Search, ArrowRight, UserCheck, Stethoscope } from 'lucide-react';
import { storageService } from '../../services/storage';

interface AIInsightsViewProps {
  onOpenCase: (patientId: string) => void;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({ onOpenCase }) => {
  const [filterType, setFilterType] = useState<'all' | 'risk_flag' | 'missing_info' | 'possible_condition'>('all');
  const patients = storageService.getPatients();

  const insightsList = [
    {
      id: 'ins-1',
      patientId: 'CF-1001',
      patientName: 'Arjun Rao',
      type: 'risk_flag',
      title: 'Severe Drug Allergy Warning: Penicillin & Beta-lactams',
      description: 'Patient has documented Penicillin allergy. Beta-lactam antibiotics (e.g. Amoxicillin, Augmentin, Piperacillin) are strictly contraindicated due to risk of anaphylaxis.',
      severity: 'high',
      status: 'Active Alert',
      recommendation: 'Use Macrolides (Azithromycin) or Fluoroquinolones if antibiotic therapy is clinically indicated.'
    },
    {
      id: 'ins-2',
      patientId: 'CF-1002',
      patientName: 'Priya Sharma',
      type: 'possible_condition',
      title: 'Elevated Glycemic Trend: Sub-optimal T2D Control',
      description: 'Recent HbA1c is 7.4% with Fasting Blood Glucose of 142 mg/dL. Current Metformin 500mg BD may benefit from dose adjustment or lifestyle re-evaluation.',
      severity: 'medium',
      status: 'Review Recommended',
      recommendation: 'Evaluate renal function (eGFR) and consider escalating Metformin to 1000mg BD or adding SGLT2 inhibitor.'
    },
    {
      id: 'ins-3',
      patientId: 'CF-1003',
      patientName: 'Rahul Kumar',
      type: 'missing_info',
      title: 'Missing Baseline Cardiovascular History',
      description: 'Patient is a 48-year-old male with borderline BP (134/88 mmHg). Family history of premature coronary artery disease is unrecorded.',
      severity: 'low',
      status: 'Actionable',
      recommendation: 'Administer family history questionnaire during next clinical consultation.'
    },
    {
      id: 'ins-4',
      patientId: 'CF-1004',
      patientName: 'Lakshmi Devi',
      type: 'risk_flag',
      title: 'Allergy Alert: Sulfa Drugs (Sulfonamides)',
      description: 'Severe hypersensitivity rash documented with Sulfamethoxazole. Avoid Bactrim / Septra.',
      severity: 'high',
      status: 'Active Alert',
      recommendation: 'Flag active electronic prescription engine against all sulfonamide compounds.'
    },
    {
      id: 'ins-5',
      patientId: 'CF-1005',
      patientName: 'Vikram Singh',
      type: 'possible_condition',
      title: 'Acute Bronchospasm vs Viral Exacerbation',
      description: 'Voice intake indicates wheezing and tight cough for 4 days. Peak Expiratory Flow rate evaluation advised.',
      severity: 'medium',
      status: 'Evaluation Required',
      recommendation: 'Consider short-acting bronchodilator nebulization and pulse oximetry monitoring.'
    }
  ];

  const filtered = insightsList.filter(i => filterType === 'all' || i.type === filterType);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Clinical Insights & Decision Support</h1>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              CDSS Engine
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Algorithmic patient safety flags, drug-allergy contraindications, and missing clinical data detections.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {[
            { id: 'all', label: 'All Insights' },
            { id: 'risk_flag', label: 'Risk Flags' },
            { id: 'possible_condition', label: 'Possible Conditions' },
            { id: 'missing_info', label: 'Missing Info' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                filterType === tab.id ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Clinician Verification Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-start gap-3 shadow-md">
        <ShieldCheck className="w-6 h-6 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-teal-300">
            AI Decision Support — Clinician verification required.
          </div>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            CareFlow AI Decision Support models synthesize intake transcriptions, allergy profiles, and lab values to assist medical practitioners. These outputs do not constitute a medical diagnosis and require independent clinician validation before clinical orders are issued.
          </p>
        </div>
      </div>

      {/* Insights Cards List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all ${
              item.severity === 'high'
                ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                : item.severity === 'medium'
                ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                : 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                  item.severity === 'high' ? 'bg-rose-600 text-white' : item.severity === 'medium' ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'
                }`}>
                  {item.severity} Priority
                </span>
                <span className="text-xs font-bold text-slate-900">
                  Patient: {item.patientName} ({item.patientId})
                </span>
              </div>
              <span className="text-xs font-medium text-slate-500">{item.status}</span>
            </div>

            <div className="pt-3 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${item.severity === 'high' ? 'text-rose-600' : 'text-amber-600'}`} />
                <span>{item.title}</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{item.description}</p>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1 mt-2">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                  Clinical Action Recommendation:
                </span>
                <p className="text-slate-600">{item.recommendation}</p>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => onOpenCase(item.patientId)}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                <span>Open Case for {item.patientName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
