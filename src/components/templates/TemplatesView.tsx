import React, { useState } from 'react';
import { FileText, Plus, Edit2, Trash2, Check, ArrowUpDown, Sparkles, Mic, Layers } from 'lucide-react';
import { SpecialtyTemplate, TemplateField } from '../../types';
import { storageService } from '../../services/storage';

export const TemplatesView: React.FC = () => {
  const [templates, setTemplates] = useState<SpecialtyTemplate[]>(storageService.getTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [isBuildingNew, setIsBuildingNew] = useState(false);

  // Template Builder state
  const [builderName, setBuilderName] = useState('');
  const [builderSpecialty, setBuilderSpecialty] = useState('General Medicine');
  const [builderFields, setBuilderFields] = useState<TemplateField[]>([
    { id: 'f1', label: 'Chief Complaint', type: 'voice_text', required: true },
    { id: 'f2', label: 'Duration of Symptoms', type: 'text', required: true },
    { id: 'f3', label: 'Severity Scale (1-10)', type: 'number', required: false },
    { id: 'f4', label: 'Associated Comorbidities', type: 'dropdown', options: ['Diabetes', 'Hypertension', 'Asthma', 'None'], required: false }
  ]);

  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleAddField = () => {
    const newField: TemplateField = {
      id: `f-${Date.now()}`,
      label: 'New Clinical Observation',
      type: 'text',
      required: false
    };
    setBuilderFields([...builderFields, newField]);
  };

  const handleRemoveField = (id: string) => {
    setBuilderFields(builderFields.filter(f => f.id !== id));
  };

  const handleSaveNewTemplate = () => {
    if (!builderName.trim()) return;

    const newTemplate: SpecialtyTemplate = {
      id: `tpl-${Date.now()}`,
      name: builderName,
      specialty: builderSpecialty,
      description: `${builderSpecialty} clinical observation template`,
      fields: builderFields,
      lastUpdated: new Date().toISOString().split('T')[0],
      isActive: true,
      isCustom: true
    };

    storageService.saveTemplate(newTemplate);
    setTemplates(storageService.getTemplates());
    setSelectedTemplateId(newTemplate.id);
    setIsBuildingNew(false);
    setBuilderName('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Clinical Templates</h1>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              Specialty Customized
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Configure dynamic case-taking schemas tailored to clinical departments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsBuildingNew(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Template</span>
        </button>
      </div>

      {/* MODAL: TEMPLATE BUILDER */}
      {isBuildingNew && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Custom Clinical Template Builder</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsBuildingNew(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. Diabetology Intake & Vitals"
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialty</label>
                <select
                  value={builderSpecialty}
                  onChange={(e) => setBuilderSpecialty(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Gynecology">Gynecology</option>
                </select>
              </div>
            </div>

            {/* Field list */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">Schema Fields</span>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Field</span>
                </button>
              </div>

              <div className="space-y-2">
                {builderFields.map((field, idx) => (
                  <div key={field.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 text-xs">
                    <span className="text-slate-400 font-mono text-[10px] w-4">{idx + 1}</span>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBuilderFields(fields => fields.map(f => f.id === field.id ? { ...f, label: val } : f));
                      }}
                      className="flex-1 bg-white px-2 py-1 border border-slate-200 rounded"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setBuilderFields(fields => fields.map(f => f.id === field.id ? { ...f, type: val } : f));
                      }}
                      className="bg-white px-2 py-1 border border-slate-200 rounded text-xs"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="voice_text">Voice + Text</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="date">Date</option>
                    </select>
                    <label className="flex items-center gap-1 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setBuilderFields(fields => fields.map(f => f.id === field.id ? { ...f, required: val } : f));
                        }}
                        className="rounded"
                      />
                      <span>Req</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveField(field.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBuildingNew(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewTemplate}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column View: Template Selector + Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Template Cards */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Templates</div>
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setSelectedTemplateId(tpl.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedTemplateId === tpl.id
                  ? 'bg-indigo-50/80 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-900">{tpl.name}</div>
                {tpl.isCustom && (
                  <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                    Custom
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{tpl.specialty} • {tpl.fields.length} Fields</div>
            </div>
          ))}
        </div>

        {/* Right: Template Preview */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">{activeTemplate?.name}</h2>
              <p className="text-xs text-slate-500">{activeTemplate?.specialty} Department Standard Template</p>
            </div>
            <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {activeTemplate?.fields.length} Configured Fields
            </span>
          </div>

          <div className="space-y-3">
            {activeTemplate?.fields.map((field) => (
              <div key={field.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{field.label}</span>
                    {field.required && <span className="text-rose-500 text-xs">*</span>}
                    {field.type === 'voice_text' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                        <Mic className="w-2.5 h-2.5" />
                        <span>Voice Enabled</span>
                      </span>
                    )}
                  </label>
                  <span className="text-[10px] font-mono text-slate-400 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                    {field.type}
                  </span>
                </div>

                {field.type === 'voice_text' || field.type === 'text' ? (
                  <input
                    type="text"
                    disabled
                    placeholder={`Input for ${field.label}...`}
                    className="w-full bg-white px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                ) : field.type === 'dropdown' ? (
                  <select disabled className="w-full bg-white px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed">
                    {field.options?.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    disabled
                    placeholder="0.0"
                    className="w-32 bg-white px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
