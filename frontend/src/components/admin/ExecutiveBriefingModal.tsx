import React from 'react';
import { 
  X, Printer, FileText, ShieldCheck, 
  Building2, Flame
} from 'lucide-react';
import { Challenge } from '../../services/workflowTypes';

interface ExecutiveBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: Challenge[];
  activeDistrict?: string;
}

export const ExecutiveBriefingModal: React.FC<ExecutiveBriefingModalProps> = ({
  isOpen,
  onClose,
  challenges,
  activeDistrict = 'All Districts (State Overview)'
}) => {
  if (!isOpen) return null;

  const totalIncidents = challenges.length;
  const criticalCount = challenges.filter(c => c.riskLevel === 'CRITICAL').length;
  const highCount = challenges.filter(c => c.riskLevel === 'HIGH').length;
  const prototypeCount = challenges.filter(c => c.status === 'Prototype Active' || c.status === 'Pilot Active').length;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white text-[#201C18] rounded-3xl w-full max-w-4xl max-h-[94vh] overflow-y-auto shadow-2xl flex flex-col border border-[#E4DDD1]">
        
        {/* Action Toolbar */}
        <div className="p-4 border-b border-[#E4DDD1] bg-[#FAF8F4] flex items-center justify-between sticky top-0 z-10 print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#2C6E49]" />
            <span className="text-sm font-black text-[#201C18] font-heading">
              Official DM Situation Dossier (SITREP)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#2C6E49] hover:bg-[#23583a] text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-[#EAE4D8] text-[#8A7F72] hover:text-[#201C18] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Executive Document Body */}
        <div className="p-8 sm:p-10 space-y-6 text-[#201C18] print:p-0">
          
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-[#201C18] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <img 
                  src="/jharkhand_govt_seal.png" 
                  alt="Government of Jharkhand" 
                  className="w-10 h-10 object-contain shrink-0" 
                />
                <div>
                  <h1 className="text-lg font-black tracking-tight text-[#201C18] uppercase font-heading">
                    Government of Jharkhand · Disaster Management Authority
                  </h1>
                  <p className="text-xs text-[#6A6155] font-semibold">
                    State Emergency Operation Centre (SEOC) · NIVAARAN Command Matrix
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs font-mono">
              <p className="font-bold text-[#201C18]">DOC REF: <span className="text-[#2C6E49]">JH-SITREP-2026-09</span></p>
              <p className="text-[#8A7F72]">Date: {todayStr}</p>
              <p className="text-[#2C6E49] font-bold">STATUS: CONFIDENTIAL / OFFICIAL</p>
            </div>
          </div>

          {/* Dossier Title */}
          <div className="bg-[#FAF8F4] text-[#201C18] border border-[#E4DDD1] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-[#2C6E49] font-bold uppercase tracking-wider block">
                Executive Situation Briefing
              </span>
              <h2 className="text-base font-black font-heading text-[#201C18]">
                Comprehensive Disaster Triage & HEI R&D Deployment Status
              </h2>
            </div>
            <span className="text-xs font-bold bg-[#EAE4D8] text-[#201C18] px-3 py-1 rounded-xl border border-[#E4DDD1] self-start sm:self-auto">
              Coverage: {activeDistrict}
            </span>
          </div>

          {/* Key Executive Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Total Incidents</span>
              <span className="text-2xl font-black text-slate-900 block font-heading">{totalIncidents}</span>
              <span className="text-[10px] text-slate-500 font-medium">100% Geotagged</span>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-center space-y-0.5">
              <span className="text-[10px] text-red-700 font-bold uppercase">Critical Priority</span>
              <span className="text-2xl font-black text-red-700 block font-heading">{criticalCount}</span>
              <span className="text-[10px] text-red-600 font-medium">Immediate SDRF Alert</span>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-0.5">
              <span className="text-[10px] text-amber-700 font-bold uppercase">High Urgency</span>
              <span className="text-2xl font-black text-amber-700 block font-heading">{highCount}</span>
              <span className="text-[10px] text-amber-600 font-medium">Prioritized Triage</span>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-0.5">
              <span className="text-[10px] text-emerald-800 font-bold uppercase">Active HEI Solutions</span>
              <span className="text-2xl font-black text-emerald-700 block font-heading">{prototypeCount}</span>
              <span className="text-[10px] text-emerald-700 font-medium">Stage 11–13 Field Trials</span>
            </div>
          </div>

          {/* Section 1: Situation Appraisal */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Flame className="w-4 h-4 text-red-600" />
              1. Ground Situation & Vulnerability Appraisal
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Monsoon precipitation anomalies in the Subarnarekha and Damodar river catchments have generated localized culvert overflows and urban waterlogging across Ranchi, East Singhbhum, and Dhanbad districts. AI multi-factor triage has categorized <strong>{criticalCount} critical incidents</strong> requiring immediate inter-agency synchronization between the District Administration, ULBs, PRIs, and Higher Education Institutions.
            </p>
          </div>

          {/* Section 2: Active University Interventions */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#201C18] flex items-center gap-1.5 border-b border-[#E4DDD1] pb-1">
              <Building2 className="w-4 h-4 text-[#2C6E49]" />
              2. Higher Education Institution (HEI) Active Deployments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-[#E4DDD1] rounded-xl">
                <thead className="bg-[#FAF8F4] text-[#5A5247] text-[10px] uppercase font-bold">
                  <tr>
                    <th className="p-2.5">Institution</th>
                    <th className="p-2.5">Project Title</th>
                    <th className="p-2.5">Stage</th>
                    <th className="p-2.5">CSR Sponsor</th>
                    <th className="p-2.5 text-right">Field Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DDD1] font-medium">
                  <tr>
                    <td className="p-2.5 font-bold text-[#201C18]">BIT Mesra</td>
                    <td className="p-2.5">IoT LoRaWAN Flood Warning Node</td>
                    <td className="p-2.5"><span className="bg-[#F0FAF4] text-[#2C6E49] border border-[#C3E6D0] px-2 py-0.5 rounded text-[10px] font-bold">Stage 11: Prototype</span></td>
                    <td className="p-2.5 text-[#5A5247]">Tata Steel TSRDS (₹2.5L)</td>
                    <td className="p-2.5 text-right text-[#2C6E49] font-bold">● Active 115200 Baud Stream</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#201C18]">IIT ISM Dhanbad</td>
                    <td className="p-2.5">Mining Subsidence Sensor Grid</td>
                    <td className="p-2.5"><span className="bg-[#FFF8EC] text-[#C98A2C] border border-[#F0D99A] px-2 py-0.5 rounded text-[10px] font-bold">Stage 12: Pilot</span></td>
                    <td className="p-2.5 text-[#5A5247]">BCCL CSR (₹3.0L)</td>
                    <td className="p-2.5 text-right text-[#C98A2C] font-bold">● 4 Boreholes Monitored</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#201C18]">NIT Jamshedpur</td>
                    <td className="p-2.5">Industrial Effluent & Turbidity Node</td>
                    <td className="p-2.5"><span className="bg-[#FFF8EC] text-[#C98A2C] border border-[#F0D99A] px-2 py-0.5 rounded text-[10px] font-bold">Stage 10: CSR Grant</span></td>
                    <td className="p-2.5 text-[#5A5247]">Jusco CSR (₹2.0L)</td>
                    <td className="p-2.5 text-right text-[#C98A2C] font-bold">● Lab Calibration Complete</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Recommended Resource Mobilization */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#201C18] flex items-center gap-1.5 border-b border-[#E4DDD1] pb-1">
              <ShieldCheck className="w-4 h-4 text-[#2C6E49]" />
              3. Recommended Resource Mobilization & Directives
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl space-y-1">
                <span className="font-bold text-[#201C18] block">SDRF Quick Response Deployment</span>
                <p className="text-[#6A6155] text-[11px]">
                  Pre-position 2 SDRF teams with inflatable motorized boats at Namkum Block & Hesag culvert junctions.
                </p>
              </div>
              <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl space-y-1">
                <span className="font-bold text-[#201C18] block">Relief Shelter Activation</span>
                <p className="text-[#6A6155] text-[11px]">
                  Keep 4 designated community school cyclone shelters stocked with potable water and emergency dry rations.
                </p>
              </div>
            </div>
          </div>

          {/* Official Sign-off Block */}
          <div className="pt-6 border-t-2 border-[#201C18] flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-[#201C18]">Generated via NIVAARAN Central AI Engine</p>
              <p className="text-[10px] text-[#8A7F72]">Smart India Hackathon 2026 · Problem Statement SIH 26043</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-[#8A7F72]">DIGITAL AUDIT HASH: 0x98F4E2A17B</p>
              <p className="font-bold text-[#201C18] mt-1">State Relief Commissioner / DM Signature Block</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
