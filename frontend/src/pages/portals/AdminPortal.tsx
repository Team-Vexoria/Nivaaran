import React from 'react';
import { Users, Database, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-nivaaran-bg flex flex-col">
      <header className="bg-nivaaran-primary text-white px-6 py-4 border-b border-nivaaran-primary-hover shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nivaaran-danger rounded-lg flex items-center justify-center font-bold text-xl text-white">A</div>
            <div>
              <h1 className="text-lg font-bold">Platform Super Admin Portal</h1>
              <p className="text-xs text-nivaaran-muted">NIVAARAN — Platform Governance, Audit & RBAC Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-nivaaran-bg">{currentUser?.displayName} ({currentUser?.role})</span>
            <button onClick={logout} className="text-xs bg-nivaaran-danger hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-nivaaran-primary">System Administration & Audit Logs</h2>
            <p className="text-sm text-nivaaran-text-secondary">Enforce RBAC permissions, manage taxonomy, inspect AI decision logs (`audit_logs`), and perform platform moderation.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-2">
            <h3 className="font-bold text-nivaaran-primary flex items-center"><Users className="w-4 h-4 mr-2 text-nivaaran-primary" /> User RBAC & Roles</h3>
            <p className="text-xs text-nivaaran-text-secondary">Manage 12 roles across Citizens, Gov Departments, Universities, Industry, and Admins.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-2">
            <h3 className="font-bold text-nivaaran-primary flex items-center"><Activity className="w-4 h-4 mr-2 text-nivaaran-secondary" /> AI Audit Logs</h3>
            <p className="text-xs text-nivaaran-text-secondary">Review stored AI suggestion + human override decision pairs in `audit_logs` for compliance.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-2">
            <h3 className="font-bold text-nivaaran-primary flex items-center"><Database className="w-4 h-4 mr-2 text-nivaaran-accent" /> Domain Taxonomy</h3>
            <p className="text-xs text-nivaaran-text-secondary">Configure disaster categories (flood, drought, landslide, heatwave, infrastructure).</p>
          </div>
        </div>
      </main>
    </div>
  );
};
