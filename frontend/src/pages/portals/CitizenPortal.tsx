import React from 'react';
import { MapPin, PlusCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CitizenPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-nivaaran-bg flex flex-col">
      <header className="bg-nivaaran-primary text-white px-6 py-4 border-b border-nivaaran-primary-hover shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nivaaran-secondary rounded-lg flex items-center justify-center font-bold text-xl">N</div>
            <div>
              <h1 className="text-lg font-bold">Citizen & Community Portal</h1>
              <p className="text-xs text-nivaaran-muted">NIVAARAN — Jharkhand Societal Challenge Network</p>
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
            <h2 className="text-2xl font-bold text-nivaaran-primary">Reported Local Challenges</h2>
            <p className="text-sm text-nivaaran-text-secondary">Submit evidence & GPS location to connect with university research teams & government validation.</p>
          </div>
          <button className="px-4 py-2.5 bg-nivaaran-secondary hover:bg-teal-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center space-x-2">
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Challenge</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold bg-nivaaran-warning/10 text-nivaaran-warning px-2 py-0.5 rounded">FLOOD-RANCHI-001</span>
              <span className="text-xs text-nivaaran-text-secondary flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Under Review</span>
            </div>
            <h3 className="font-bold text-nivaaran-primary">Ranchi School River Flooding Risk</h3>
            <p className="text-xs text-nivaaran-text-secondary leading-relaxed">Monsoon water accumulation near Government School, Kanke block. High risk for 400+ students.</p>
            <div className="text-xs text-nivaaran-text-secondary flex items-center space-x-1 pt-2">
              <MapPin className="w-3.5 h-3.5 text-nivaaran-accent" />
              <span>Kanke, District Ranchi, Jharkhand</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold bg-nivaaran-secondary/10 text-nivaaran-secondary px-2 py-0.5 rounded">DROUGHT-PALAMU-042</span>
              <span className="text-xs text-nivaaran-secondary flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> University Accepted</span>
            </div>
            <h3 className="font-bold text-nivaaran-primary">Solar Groundwater Sensor Needs</h3>
            <p className="text-xs text-nivaaran-text-secondary leading-relaxed">Palamu village faces seasonal groundwater table drop. Needs IoT sensor monitoring system.</p>
            <div className="text-xs text-nivaaran-text-secondary flex items-center space-x-1 pt-2">
              <MapPin className="w-3.5 h-3.5 text-nivaaran-accent" />
              <span>Daltonganj, District Palamu, Jharkhand</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
