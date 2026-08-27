import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const GovPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-nivaaran-bg flex flex-col">
      <header className="bg-[#16293F] text-white px-6 py-4 border-b border-nivaaran-border shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nivaaran-accent rounded-lg flex items-center justify-center font-bold text-xl text-white">G</div>
            <div>
              <h1 className="text-lg font-bold">Government Officer Portal</h1>
              <p className="text-xs text-nivaaran-muted">Department of Higher & Technical Education, Government of Jharkhand</p>
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
            <h2 className="text-2xl font-bold text-nivaaran-primary">State Challenge Triage & Validation</h2>
            <p className="text-sm text-nivaaran-text-secondary">Review AI problem priority scores, validate reports, and allocate to matched Jharkhand Universities.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-nivaaran-border shadow-sm">
            <span className="text-xs text-nivaaran-text-secondary font-medium">Pending Triage</span>
            <p className="text-3xl font-extrabold text-nivaaran-primary mt-1">24</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-nivaaran-border shadow-sm">
            <span className="text-xs text-nivaaran-text-secondary font-medium">Validated & Prioritized</span>
            <p className="text-3xl font-extrabold text-nivaaran-secondary mt-1">118</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-nivaaran-border shadow-sm">
            <span className="text-xs text-nivaaran-text-secondary font-medium">University Active</span>
            <p className="text-3xl font-extrabold text-nivaaran-accent mt-1">45</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-nivaaran-border shadow-sm">
            <span className="text-xs text-nivaaran-text-secondary font-medium">Verified Social Impact</span>
            <p className="text-3xl font-extrabold text-nivaaran-primary mt-1">12</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-nivaaran-border">
            <h3 className="font-bold text-nivaaran-primary flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-nivaaran-secondary" /> Flagship Disaster Challenge Review</h3>
            <span className="text-xs bg-nivaaran-danger/10 text-nivaaran-danger font-semibold px-2.5 py-1 rounded-full">High Urgency Score: 9.2/10</span>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-nivaaran-text-primary"><strong>Title:</strong> Ranchi School Flood Risk Triage & IoT Early Warning</p>
            <p className="text-nivaaran-text-secondary"><strong>AI Recommendation:</strong> Match with BIT Mesra (IoT/Civil Dept) & NIT Jamshedpur (GIS/ML Dept).</p>
            <div className="flex items-center space-x-3 pt-3">
              <button className="px-4 py-2 bg-nivaaran-secondary hover:bg-teal-700 text-white font-medium text-xs rounded-md transition-colors flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Validation & Route to University</button>
              <button className="px-4 py-2 bg-nivaaran-surface hover:bg-nivaaran-muted text-nivaaran-primary font-medium text-xs rounded-md border border-nivaaran-border transition-colors">Request Additional Evidence</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
