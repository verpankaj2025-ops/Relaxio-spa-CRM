import React, { useState } from 'react';
import { DatabaseBackup, Download, Upload, ShieldAlert, Sparkles, FileCode2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSpaData } from '../context/SpaDataContext';

export const BackupRestoreView: React.FC = () => {
  const { canExport, user } = useAuth();
  const { restoreBackup, settings } = useSpaData();
  const [restoredSuccess, setRestoredSuccess] = useState(false);

  if (!canExport) {
    return (
      <div className="p-12 text-center glass-panel rounded-3xl border border-red-500/30 max-w-md mx-auto my-12 space-y-3">
        <ShieldAlert className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="font-serif-luxury text-lg font-bold text-white">Backup Access Restricted</h2>
        <p className="text-xs text-gray-400">
          Only Super Admin accounts have authorization to download full database backups or restore system snapshots.
        </p>
      </div>
    );
  }

  const handleDownloadBackup = async () => {
    if (!user) return;
    const backup = await import('../services/api').then(m => m.apiService.getBackupData(user));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Relaxio_Spa_Database_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('Restoring this backup snapshot will replace current customer and user records. Continue?')) {
          await restoreBackup(json);
          setRestoredSuccess(true);
          setTimeout(() => setRestoredSuccess(false), 5000);
        }
      } catch {
        alert('Invalid JSON backup file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      <div>
        <h2 className="font-serif-luxury text-xl font-bold text-white flex items-center gap-2">
          <DatabaseBackup className="h-6 w-6 text-[#D4AF37]" />
          <span>Automated Database Backup & Snapshot Recovery</span>
        </h2>
        <p className="text-xs text-gray-400">
          Super Admin backup tools, JSON snapshot exports, and Supabase SQL migration script.
        </p>
      </div>

      {restoredSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <Check className="h-5 w-5 text-emerald-400" />
          <span>System state and database records successfully restored from backup snapshot!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Download Snapshot Box */}
        <div className="p-6 rounded-3xl glass-panel border border-[#D4AF37]/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37]">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-sm font-bold text-white">Download Full System Snapshot</h3>
              <p className="text-xs text-gray-400">Export all customers, therapists, rooms, agents, and audit logs.</p>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
            Generates a complete time-stamped JSON backup file containing all spa operational records, user security roles, and business configuration settings.
          </p>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 rounded-xl gold-button-gradient text-xs font-bold shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download Database JSON Backup</span>
          </button>
        </div>

        {/* Restore Snapshot Box */}
        <div className="p-6 rounded-3xl glass-panel border border-[#D4AF37]/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-sm font-bold text-white">Restore Database From Snapshot</h3>
              <p className="text-xs text-gray-400">Select a previously saved JSON snapshot file.</p>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
            Upload your `.json` backup file to restore spa state. All restored actions will be logged in the security audit trail.
          </p>

          <label className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all">
            <Upload className="h-4 w-4 text-[#D4AF37]" />
            <span>Choose Backup File To Restore</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* SQL Script Information */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-sm">
          <FileCode2 className="h-5 w-5" />
          <span>Production Supabase PostgreSQL Schema</span>
        </div>
        <p className="text-xs text-gray-300">
          The production Supabase schema script is generated in <code className="text-[#D4AF37] bg-black/50 px-2 py-0.5 rounded">/supabase/schema.sql</code> featuring automated invoice sequences, triggers, and Row Level Security (RLS) policies.
        </p>
      </div>
    </div>
  );
};
