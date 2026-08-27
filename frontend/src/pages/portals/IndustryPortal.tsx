import React from 'react';
import { Handshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const IndustryPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-nivaaran-bg flex flex-col">
      <header className="bg-nivaaran-primary text-white px-6 py-4 border-b border-nivaaran-primary-hover shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nivaaran-accent rounded-lg flex items-center justify-center font-bold text-xl text-white">I</div>
            <div>
              <h1 className="text-lg font-bold">Industry & CSR Collaboration Marketplace</h1>
              <p className="text-xs text-nivaaran-muted">NIVAARAN — Industry, MSME, CSR & Innovation Hub Marketplace</p>
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
            <h2 className="text-2xl font-bold text-nivaaran-primary">Collaboration Requests & CSR Funding Needs</h2>
            <p className="text-sm text-nivaaran-text-secondary">Discover validated university prototypes needing industry mentorship, hardware testing labs, CSR grants, or field deployment.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-nivaaran-border">
            <span className="text-xs font-semibold text-nivaaran-secondary bg-nivaaran-secondary/10 px-2.5 py-1 rounded">Needs: Hardware Mentorship & Prototype Funding</span>
            <span className="text-xs text-nivaaran-text-secondary">Project ID: PRJ-BIT-2026-004</span>
          </div>

          <h3 className="text-lg font-bold text-nivaaran-primary">Low-Cost Ultrasonic Water Level Sensors for Disaster Mitigation</h3>
          <p className="text-xs text-nivaaran-text-secondary leading-relaxed">
            University team has completed circuit design & algorithm. Seeking industry partner for sensor enclosure fabrication, cloud telemetry credits, and pilot deployment in flood-prone blocks.
          </p>

          <div className="flex items-center space-x-3 pt-2">
            <button className="px-4 py-2 bg-nivaaran-accent hover:bg-[#a66308] text-white text-xs font-medium rounded-md transition-colors flex items-center"><Handshake className="w-4 h-4 mr-1.5" /> Offer Mentorship & Sponsorship</button>
            <button className="px-4 py-2 bg-nivaaran-surface hover:bg-nivaaran-muted text-nivaaran-primary text-xs font-medium rounded-md border border-nivaaran-border transition-colors">Request Technical Details</button>
          </div>
        </div>
      </main>
    </div>
  );
};
