import React from 'react';
import { Users, FolderGit2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UnivPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-nivaaran-bg flex flex-col">
      <header className="bg-nivaaran-primary text-white px-6 py-4 border-b border-nivaaran-primary-hover shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nivaaran-secondary rounded-lg flex items-center justify-center font-bold text-xl">U</div>
            <div>
              <h1 className="text-lg font-bold">University & Academic Portal</h1>
              <p className="text-xs text-nivaaran-muted">NIVAARAN — Higher Education Institution Hub</p>
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
            <h2 className="text-2xl font-bold text-nivaaran-primary">Matched Challenges & Team Workspace</h2>
            <p className="text-sm text-nivaaran-text-secondary">Discover AI-recommended societal problems matching your departments, faculty mentors & student skill graph.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-nivaaran-border">
            <span className="text-xs font-semibold text-nivaaran-accent flex items-center"><Sparkles className="w-4 h-4 mr-1" /> AI Match Score: 94% Match</span>
            <span className="text-xs bg-nivaaran-surface text-nivaaran-primary font-mono px-2.5 py-1 rounded border border-nivaaran-border">BIT Mesra / NIT Jamshedpur Target</span>
          </div>

          <h3 className="text-lg font-bold text-nivaaran-primary">Flood Monitoring & Early Warning Sensors for Kanke School</h3>
          <p className="text-xs text-nivaaran-text-secondary leading-relaxed">
            Multidisciplinary requirement: IoT Sensor Design (Electronics), Hydrological GIS Mapping (Civil), and Alert Prediction (Computer Science).
          </p>

          <div className="flex items-center space-x-3 pt-2">
            <button className="px-4 py-2 bg-nivaaran-primary hover:bg-nivaaran-primary-hover text-white text-xs font-medium rounded-md transition-colors flex items-center"><Users className="w-4 h-4 mr-1.5" /> Accept & Form Multidisciplinary Team</button>
            <button className="px-4 py-2 bg-nivaaran-surface hover:bg-nivaaran-muted text-nivaaran-primary text-xs font-medium rounded-md border border-nivaaran-border transition-colors flex items-center"><FolderGit2 className="w-4 h-4 mr-1.5" /> View Proposal Template</button>
          </div>
        </div>
      </main>
    </div>
  );
};
