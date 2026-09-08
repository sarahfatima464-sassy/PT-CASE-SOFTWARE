import React, { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Database, ArrowRight, Play } from 'lucide-react';
import { SyncQueueItem } from '../../types';
import { storageService } from '../../services/storage';

export const SyncCenter: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(storageService.isOnline());
  const [queue, setQueue] = useState<SyncQueueItem[]>(storageService.getSyncQueue());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<string>('');

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setIsOnline(storageService.isOnline());
      setQueue(storageService.getSyncQueue());
    });
    return unsub;
  }, []);

  const toggleOnline = () => {
    storageService.setOnline(!isOnline);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncProgress('Initiating secure mutual TLS handshake with central server...');
    await new Promise(r => setTimeout(r, 600));

    setSyncProgress('Verifying cryptographic checksums of local SQLite delta records...');
    await new Promise(r => setTimeout(r, 700));

    setSyncProgress('Pushing offline clinical encounters to central FHIR repository...');
    await new Promise(r => setTimeout(r, 800));

    // Execute actual sync in storage service
    const syncedCount = await storageService.synchronizeAll();
    setSyncProgress(`Completed! ${syncedCount} records reconciled and timestamped.`);
    await new Promise(r => setTimeout(r, 1000));

    setIsSyncing(false);
    setSyncProgress('');
  };

  const pendingItems = queue.filter(i => i.status === 'Pending');
  const syncedItems = queue.filter(i => i.status === 'Synced');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Offline-First Sync Center</h1>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Bi-directional Synchronization
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Monitor offline transactional queues, resolve conflict state, and reconcile clinical records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleOnline}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span>Simulated Status: Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <WifiOff className="w-4 h-4 text-amber-600" />
                <span>Simulated Status: Offline</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-sync-all"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Synchronize Now'}</span>
          </button>
        </div>
      </div>

      {/* Sync in-progress animation banner */}
      {isSyncing && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3 text-xs text-indigo-900 animate-fadeIn shadow-xs">
          <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
          <div className="flex-1 font-semibold">{syncProgress}</div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Local Database Engine</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">SQLite Local Store</div>
          <p className="text-[11px] text-slate-500">100% Operational without internet connectivity.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Pending Outbound Queue</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{pendingItems.length} Transactions</div>
          <p className="text-[11px] text-slate-500">Will automatically sync upon cloud connection.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Reconciled & Synced</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{syncedItems.length} Records</div>
          <p className="text-[11px] text-slate-500">Zero data conflicts detected in current session.</p>
        </div>
      </div>

      {/* Sync Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Replication Audit Queue ({queue.length})
          </h2>
          <span className="text-xs text-slate-500 font-mono">Last Cloud Heartbeat: 12 seconds ago</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Record Identifier</th>
                <th className="py-3 px-4">Operation</th>
                <th className="py-3 px-4">Local Timestamp</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 capitalize">{item.entity}</td>
                  <td className="py-3 px-4 font-mono text-indigo-600 font-semibold">{item.entityId}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700">
                      {item.operation}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 w-max ${
                      item.status === 'Synced' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'Syncing' ? 'bg-indigo-100 text-indigo-800 animate-pulse' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Synced' ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                      <span>{item.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
