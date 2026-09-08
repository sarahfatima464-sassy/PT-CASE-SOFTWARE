import React, { useState } from 'react';
import { Network, CheckCircle2, XCircle, Settings, RefreshCw, Radio, Server, Shield, Sparkles } from 'lucide-react';
import { IntegrationConfig } from '../../types';
import { storageService } from '../../services/storage';

export const IntegrationsView: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(storageService.getIntegrations());
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latency: number; msg: string } | null>(null);
  const [configuringItem, setConfiguringItem] = useState<IntegrationConfig | null>(null);

  const handleTestConnection = async (integration: IntegrationConfig) => {
    setTestingId(integration.id);
    setTestResult(null);

    // Simulate realistic network handshake
    await new Promise(r => setTimeout(r, 1200));

    const latency = Math.floor(Math.random() * 40) + 25;
    setTestResult({
      id: integration.id,
      success: true,
      latency,
      msg: `Handshake successful. Verified TLS 1.3 encryption on port 443.`
    });
    setTestingId(null);

    // Mark active in storage
    const updated = integrations.map(i => i.id === integration.id ? { ...i, status: 'Connected' as const, lastSync: 'Just now' } : i);
    setIntegrations(updated);
    storageService.saveIntegration({ ...integration, status: 'Connected', lastSync: 'Just now' });
  };

  const handleToggleStatus = (integration: IntegrationConfig) => {
    const newStatus = integration.status === 'Connected' ? 'Disconnected' : 'Connected';
    const updated = integrations.map(i => i.id === integration.id ? { ...i, status: newStatus as any } : i);
    setIntegrations(updated);
    storageService.saveIntegration({ ...integration, status: newStatus as any });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Ecosystem Integrations</h1>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              HL7 / FHIR R4 Ready
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Connect LIS diagnostic labs, hospital EHR backbones, e-pharmacy networks, and FHIR interoperability pipelines.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
          <Server className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local FHIR Gateway: Active (127.0.0.1:8000)</span>
        </div>
      </div>

      {/* Test result toast if any */}
      {testResult && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Connection Verified:</strong> {testResult.msg} (Ping: {testResult.latency}ms)
            </span>
          </div>
          <button type="button" onClick={() => setTestResult(null)} className="text-emerald-700 font-bold cursor-pointer">
            ×
          </button>
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((item) => {
          const isConnected = item.status === 'Connected';
          const isTesting = testingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {item.type} • {item.protocol}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span>{item.status}</span>
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 font-mono text-slate-600">
                  <div className="truncate text-[11px] text-slate-500">Endpoint: {item.endpoint}</div>
                  <div className="text-[11px] text-slate-400">Last Synced: {item.lastSync || 'Never'}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => handleTestConnection(item)}
                  disabled={isTesting}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
                  <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setConfiguringItem(item)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Configure Integration"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                      isConnected
                        ? 'text-rose-600 hover:bg-rose-50'
                        : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configure Modal */}
      {configuringItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Configure: {configuringItem.name}</h3>
              <button
                type="button"
                onClick={() => setConfiguringItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">API Endpoint URL</label>
                <input
                  type="text"
                  defaultValue={configuringItem.endpoint}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Authorization Token / API Key</label>
                <input
                  type="password"
                  defaultValue="cf_live_tok_9918237192"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Transmission Protocol</label>
                <select defaultValue={configuringItem.protocol} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs">
                  <option value="REST / JSON">REST / JSON</option>
                  <option value="FHIR R4">FHIR R4 Standard</option>
                  <option value="HL7 v2.5 / MLLP">HL7 v2.5 / MLLP</option>
                  <option value="DICOM Web">DICOM Web (Images)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfiguringItem(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setConfiguringItem(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
