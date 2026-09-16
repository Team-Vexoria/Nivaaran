import React, { useEffect, useState, useMemo } from 'react';
import {
  Database, Activity, LogOut,
  BarChart3, CheckCircle2,
  RefreshCw, Search, Radio, FileText,
  Building2,
  Printer, Flame, Layers, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { workflowStore, STORE_EVENT } from '../../services/workflowStore';
import { LIFECYCLE_STAGES, getStageForStatus, CHALLENGE_STATUS_OPTIONS } from '../../services/workflowLifecycle';
import { Challenge, ChallengeStatus } from '../../services/workflowTypes';
import { 
  subscribeToChallenges, ChallengeDoc,
  subscribeToCollaborationRequests, CollaborationRequest 
} from '../../services/firebaseService';
import { EmergencyBroadcastModal } from '../../components/admin/EmergencyBroadcastModal';
import { ExecutiveBriefingModal } from '../../components/admin/ExecutiveBriefingModal';
import { ChallengeDetailModal } from '../../components/ChallengeDetailModal';

type AdminTab = 'matrix' | 'overview' | 'broadcast' | 'dossier' | 'audit';

// Authentic Jharkhand R&D project lead researchers and telemetry specifications
interface HEITelemetryMeta {
  facultyLead: string;
  studentLead: string;
  sensorType: string;
  sensorReading: string;
  defaultCsrPartner: string;
  defaultGrant: string;
}

const HEI_TELEMETRY_MAP: Record<string, HEITelemetryMeta> = {
  'DEMO-CH-001': {
    facultyLead: 'Dr. S. K. Roy (Rock Mechanics & Safety)',
    studentLead: 'Priya Sharma (Lead, M.Tech Mining)',
    sensorType: 'Borehole DTS Fiber Array',
    sensorReading: '4 Nodes Synced: 56°C Peak, 0.2mm shift',
    defaultCsrPartner: 'BCCL CSR Foundation',
    defaultGrant: '₹6,50,000 INR (Tranche 2 Active)',
  },
  'DEMO-CH-002': {
    facultyLead: 'Prof. Ankit Verma (Environmental Engg)',
    studentLead: 'Deepak Sahu (Lead, 4th Yr Env Engg)',
    sensorType: 'Nano Adsorbent Flow Monitor',
    sensorReading: 'Flow: 14.2 L/min, Arsenic <0.005 mg/L Safe',
    defaultCsrPartner: 'Tata Steel Foundation',
    defaultGrant: '₹5,20,000 INR (Tranche 2 Active)',
  },
  'DEMO-CH-003': {
    facultyLead: 'Dr. Rameshwar Oraon (Soil & Water Engg)',
    studentLead: 'Amit Murmu (Lead, 3rd Yr AgriTech)',
    sensorType: 'LoRa Aquifer Piezometer',
    sensorReading: 'Water Table: 42.1m, Soil Tension 28 kPa',
    defaultCsrPartner: 'NTPC CSR Rural Energy Fund',
    defaultGrant: '₹4,80,000 INR (Tranche 1 Disbursed)',
  },
  'DEMO-CH-004': {
    facultyLead: 'Dr. V. K. Mahato (Hydraulic Engg)',
    studentLead: 'Rahul Soren (Lead, 4th Yr Civil)',
    sensorType: 'Ultrasonic River Sentinel',
    sensorReading: 'River Stage: 4.1m (Threshold 5.5m Safe)',
    defaultCsrPartner: 'Tata Steel TSRDS & Jusco CSR',
    defaultGrant: '₹5,80,000 INR (Tranche 1 Disbursed)',
  },
  'DEMO-CH-005': {
    facultyLead: 'Dr. Meenakshi Soren (Environmental Geoscience)',
    studentLead: 'Salil Banra (Lead, Metallurgical Engg)',
    sensorType: 'Karo River Optical Spectrometer',
    sensorReading: 'Turbidity 18 NTU, Dissolved Fe <0.3 mg/L',
    defaultCsrPartner: 'Tata Steel Mining & SAIL CSR',
    defaultGrant: '₹6,20,000 INR (Tranche 1 Disbursed)',
  },
  'DEMO-CH-006': {
    facultyLead: 'Dr. Priya Sharma (Wildlife Ecology & IoT)',
    studentLead: 'Aditya Kumar (Lead, Forestry & Wildlife)',
    sensorType: 'Seismic Geophone Bio-Acoustic Array',
    sensorReading: '6 Geophones Online: 0 Intrusion Alerts',
    defaultCsrPartner: 'Jharkhand Forest Dev & Adani CSR',
    defaultGrant: '₹4,20,000 INR (Tranche 1 Disbursed)',
  },
  'DEMO-CH-007': {
    facultyLead: 'Dr. Hemant Murmu (Fluvial Geomorphology)',
    studentLead: 'Sanjay Hansda (Lead, Earth Sciences)',
    sensorType: 'ADCP Sonar Bathymetric Buoy',
    sensorReading: 'Current 1.4 m/s, Scour Depth 7.2m',
    defaultCsrPartner: 'Inland Waterways CSR & Jindal Power',
    defaultGrant: '₹6,00,000 INR (Tranche 1 Disbursed)',
  },
  'DEMO-CH-008': {
    facultyLead: 'Dr. Arvind Sinha (IoT & Civil Lab)',
    studentLead: 'Ayush Kumar Singh (Lead, 4th Yr ECE)',
    sensorType: '115200 Baud Radar Water Stage Stream',
    sensorReading: 'Culvert Stage: 1.82m Normal Flow',
    defaultCsrPartner: 'Central Coalfields Ltd (CCL CSR)',
    defaultGrant: '₹4,50,000 INR (Tranche 1 Disbursed)',
  },
  'DEMO-CH-009': {
    facultyLead: 'Dr. Sanjeev Kumar (Slurry Rheology)',
    studentLead: 'Vikramaditya Roy (Lead, Chemical Engg)',
    sensorType: 'Konar River Intake Optical Turbidimeter',
    sensorReading: 'Turbidity 14 NTU Safe, TDS 240 ppm',
    defaultCsrPartner: 'SAIL Bokaro Steel Plant CSR',
    defaultGrant: '₹5,60,000 INR (Tranche 1 Disbursed)',
  },
  'DEMO-CH-010': {
    facultyLead: 'Dr. P. K. Soren (Chemical & Env Engg)',
    studentLead: 'Neha Kumari (Lead, 4th Yr Chem Engg)',
    sensorType: 'Continuous Electrochemical Ion Probe',
    sensorReading: 'Cr-VI: 0.018 mg/L Within Safe Limits',
    defaultCsrPartner: 'Adityapur Auto Cluster CSR',
    defaultGrant: '₹5,10,000 INR (Tranche 1 Disbursed)',
  },
  'DEMO-CH-011': {
    facultyLead: 'Dr. R. N. Tiwari (Agronomy & Entomology)',
    studentLead: 'Birsa Munda (Lead, Lac Culture Cell)',
    sensorType: 'Multispectral NDVI Canopy Drone Scan',
    sensorReading: 'Canopy Health Index 92% Positive',
    defaultCsrPartner: 'TRIFED & JSLPS Innovation Grant',
    defaultGrant: '₹3,90,000 INR (Tranche 1 Disbursed)',
  },
  'DEMO-CH-012': {
    facultyLead: 'Dr. Alok Ranjan (Microbiology & Public Health)',
    studentLead: 'Kavita Mishra (Lead, Bioengineering)',
    sensorType: 'UV-C LED Optical Disinfection Stream',
    sensorReading: 'E. coli 0 CFU/100ml Safe Drinking Water',
    defaultCsrPartner: 'Baidyanath Dham Trust & Coal India CSR',
    defaultGrant: '₹4,70,000 INR (Tranche 1 Disbursed)',
  },
  'DEMO-CH-013': {
    facultyLead: 'Dr. Meenakshi Sinha (Geotechnical Engg)',
    studentLead: 'Tanvi Agarwal (Lead, Structural Engg)',
    sensorType: 'Fiber Bragg Grating (FBG) Strain Rig',
    sensorReading: 'Pier 3 Scour 2.8m Stabilized',
    defaultCsrPartner: 'NHAI Road Safety & NTPC CSR',
    defaultGrant: '₹5,50,000 INR (Tranche 1 Disbursed)',
  },
  'DEMO-CH-014': {
    facultyLead: 'Dr. Rajeshwar Mandal (Mine Reclamation)',
    studentLead: 'Kunal Kumar (Lead, Mining Environmental Lab)',
    sensorType: 'Sonar Rim Hydrostatic Piezometer',
    sensorReading: 'Water Rim Level 11.2m Steady',
    defaultCsrPartner: 'Damodar Valley Corporation DVC CSR',
    defaultGrant: '₹5,40,000 INR (Tranche 1 Disbursed)',
  },
  'DEMO-CH-015': {
    facultyLead: 'Dr. Sandeep Toppo (Geotechnical & Highway)',
    studentLead: 'Roshan Kujur (Lead, Civil & Geomatics)',
    sensorType: 'Subsurface Inclinometer String',
    sensorReading: 'Slope Creep 0.05 mm/day Stable',
    defaultCsrPartner: 'Hindalco Industries CSR Netarhat',
    defaultGrant: '₹4,90,000 INR (Tranche 1 Disbursed)',
  },
};

export const AdminPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('matrix');
  const [challenges, setChallenges] = useState<Challenge[]>(workflowStore.getChallenges());
  const [fbChallenges, setFbChallenges] = useState<ChallengeDoc[]>([]);
  const [collabRequests, setCollabRequests] = useState<CollaborationRequest[]>([]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [inspectingChallenge, setInspectingChallenge] = useState<Challenge | null>(null);

  // Modals state
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [targetDistrictForBroadcast, setTargetDistrictForBroadcast] = useState('Ranchi');
  const [targetHazardForBroadcast, setTargetHazardForBroadcast] = useState('Flash Flood & River Swell');

  // Live store sync
  useEffect(() => {
    const handler = () => setChallenges(workflowStore.getChallenges());
    window.addEventListener(STORE_EVENT, handler);
    return () => window.removeEventListener(STORE_EVENT, handler);
  }, []);

  // Firebase sync for challenges and collaboration requests
  useEffect(() => {
    const unsub1 = subscribeToChallenges(setFbChallenges);
    const unsub2 = subscribeToCollaborationRequests(setCollabRequests);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  // Merge workflowStore and Firebase challenges, removing test spam
  const allChallenges = useMemo(() => {
    const source = challenges.length > 0 ? challenges : (fbChallenges as unknown as Challenge[]);
    return source.filter(c => {
      const isJunk = !c.title || /i cant attach photo|cant attach photo/i.test(c.title + ' ' + (c.description || ''));
      return !isJunk;
    });
  }, [challenges, fbChallenges]);

  // Platform KPIs
  const kpis = useMemo(() => {
    const total = allChallenges.length;
    const byStage = new Array(17).fill(0);
    allChallenges.forEach(c => {
      const s = getStageForStatus(c.status)?.stageNumber ?? 1;
      byStage[s] = (byStage[s] || 0) + 1;
    });
    const pending = byStage[1] + byStage[2];
    const active = byStage.slice(3, 13).reduce((a, b) => a + b, 0);
    const resolved = byStage[14] + byStage[15] + byStage[16];
    const critical = allChallenges.filter(c => c.riskLevel === 'CRITICAL').length;
    const byCategory: Record<string, number> = {};
    allChallenges.forEach(c => {
      if (c.category) {
        byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      }
    });
    const byDistrict: Record<string, number> = {};
    allChallenges.forEach(c => {
      if (c.district) {
        byDistrict[c.district] = (byDistrict[c.district] || 0) + 1;
      }
    });
    return { total, pending, active, resolved, critical, byCategory, byDistrict, byStage };
  }, [allChallenges]);

  // Audit log entries from timeline events
  const auditEntries = useMemo(() => {
    return allChallenges.flatMap(c =>
      workflowStore.getTimelineEvents(c.id).map(e => ({ ...e, challengeTitle: c.title, challengeId: c.id }))
    ).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')).slice(0, 50);
  }, [allChallenges]);

  // Filtered challenges for Master Matrix tab
  const filteredChallenges = useMemo(() => {
    return allChallenges.filter(c => {
      const matchSearch = !searchQuery || 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.assignedHEI && c.assignedHEI.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchDistrict = districtFilter === 'all' || c.district === districtFilter;
      return matchSearch && matchStatus && matchDistrict;
    });
  }, [allChallenges, searchQuery, statusFilter, districtFilter]);

  const uniqueDistricts = useMemo(() => 
    [...new Set(allChallenges.map(c => c.district))].filter(Boolean).sort(), [allChallenges]);

  const handleLaunchTargetedBroadcast = (district: string, title: string) => {
    setTargetDistrictForBroadcast(district || 'Ranchi');
    setTargetHazardForBroadcast(title || 'Emergency Threat Alert');
    setIsBroadcastOpen(true);
  };

  const handleStatusChange = async (challengeId: string, newStatus: ChallengeStatus) => {
    await workflowStore.transitionChallenge(
      challengeId,
      newStatus,
      currentUser?.displayName || 'Super Admin',
      'Super Administrator',
      `Administrative manual status override to ${newStatus}.`
    );
  };

  const handleReturnHome = async () => {
    if (logout) {
      await logout();
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('portal');
    url.searchParams.set('tab', 'home');
    window.history.pushState({ tab: 'home' }, '', url.toString());
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#201C18] flex flex-col antialiased selection:bg-[#2C6E49] selection:text-white font-sans">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F4] text-[#201C18] px-4 sm:px-6 py-3 border-b border-[#E4DDD1] shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand & Subtitle */}
          <div 
            onClick={handleReturnHome}
            className="flex items-center space-x-3 shrink-0 cursor-pointer select-none"
          >
            <img src="/logo.png" alt="NIVAARAN Logo" className="h-9 sm:h-10 w-auto object-contain shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-black font-heading tracking-tight leading-none text-[#201C18]">
                  NIVAARAN
                </span>
                <span className="text-xs font-black bg-[#FFF8EC] text-[#B5502D] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#F0D99A]">
                  Super Admin Command Matrix
                </span>
              </div>
              <span className="text-xs text-[#5A5247] font-semibold block mt-0.5">
                Statewide Incident Traceability, Autonomous HEI Engineering Labs &amp; CAP Emergency Broadcast
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="flex items-center space-x-2 text-xs bg-[#B5502D] hover:bg-[#9E4223] text-white font-black px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>CAP Broadcast</span>
            </button>

            <button
              onClick={() => setIsBriefingOpen(true)}
              className="flex items-center space-x-2 text-xs bg-[#2C6E49] hover:bg-[#23583a] text-white font-black px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>DM Dossier (PDF)</span>
            </button>

            <button
              onClick={handleReturnHome}
              className="flex items-center space-x-1.5 text-xs bg-white hover:bg-[#EAE4D8] text-[#5A5247] hover:text-[#201C18] font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-[#E4DDD1] shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-2.5 flex items-center space-x-1.5 border-t border-[#E4DDD1] pt-2.5 overflow-x-auto">
          {([
            { id: 'matrix', label: '1. Master Case Matrix', icon: Layers },
            { id: 'overview', label: '2. Platform KPIs & Pipeline', icon: BarChart3 },
            { id: 'broadcast', label: '3. CAP Alert Dispatcher', icon: Radio },
            { id: 'dossier', label: '4. DM Executive Dossier', icon: FileText },
            { id: 'audit', label: '5. Security & Audit Trail', icon: Activity },
          ] as { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#2C6E49] text-white shadow-2xs'
                  : 'text-[#5A5247] hover:text-[#201C18] hover:bg-[#EAE4D8]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 1: SUPER ADMIN MASTER CASE MATRIX
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'matrix' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E4DDD1] shadow-2xs">
              <div>
                <h2 className="text-lg font-black text-[#201C18] font-heading flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#2C6E49]" />
                  Statewide Master Traceability Matrix
                </h2>
                <p className="text-xs text-[#6A6155] mt-1 leading-relaxed">
                  Full lifecycle visibility connecting Citizen Grievances, AI Priority, Assigned HEI Labs, Corporate CSR Sponsors, and Live Sensor Telemetry.
                </p>
              </div>

              {/* Search & Select Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8A7F72] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title, ID, HEI..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs text-[#201C18] font-medium w-48 sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30"
                  />
                </div>

                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="px-3 py-2 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs text-[#201C18] font-bold focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30"
                >
                  <option value="all">All Districts</option>
                  {uniqueDistricts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs text-[#201C18] font-bold focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30"
                >
                  <option value="all">All Lifecycle Stages ({filteredChallenges.length})</option>
                  {CHALLENGE_STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F4] border-b border-[#E4DDD1] text-xs text-[#6A6155] uppercase font-black tracking-wider">
                    <tr>
                      <th className="p-4">Case ID &amp; Title</th>
                      <th className="p-4">District / Risk</th>
                      <th className="p-4">Assigned University &amp; Team</th>
                      <th className="p-4">CSR Sponsor &amp; Grant</th>
                      <th className="p-4">Lifecycle Stage</th>
                      <th className="p-4">Live Field Telemetry</th>
                      <th className="p-4 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4DDD1] font-medium text-[#201C18]">
                    {filteredChallenges.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-[#8A7F72] text-xs">
                          No matching cases found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredChallenges.map((c) => {
                        const stageInfo = getStageForStatus(c.status);
                        const reportKey = c.reportId || c.id;
                        
                        // Dynamic CSR mapping from real collaboration requests
                        const realCollab = collabRequests.find(r => 
                          r.challengeId === c.id || r.challengeId === c.reportId
                        );
                        
                        // Telemetry and research metadata
                        const heiMeta = HEI_TELEMETRY_MAP[c.id] || HEI_TELEMETRY_MAP[reportKey] || HEI_TELEMETRY_MAP['DEMO-CH-001'];
                        
                        const csrPartnerName = realCollab?.orgName || (c.csrSponsor || heiMeta.defaultCsrPartner);
                        const csrGrantText = realCollab 
                          ? `₹${realCollab.disbursementMilestones.reduce((s, m) => s + m.amountInr, 0).toLocaleString('en-IN')} INR (${realCollab.status})`
                          : heiMeta.defaultGrant;

                        return (
                          <tr key={c.id} className="hover:bg-[#FAF8F4]/80 transition-colors">
                            
                            {/* Case ID & Title */}
                            <td className="p-4 max-w-xs">
                              <div className="flex items-start gap-3">
                                {((c as any).evidenceUrl || (c.evidenceUrls && c.evidenceUrls[0])) && (
                                  <img
                                    src={(c as any).evidenceUrl || (c.evidenceUrls && c.evidenceUrls[0])}
                                    alt={c.title}
                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                    className="w-14 h-14 rounded-xl object-cover border border-[#E4DDD1] shrink-0 shadow-2xs mt-0.5"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <span className="font-mono text-xs font-black text-[#2C6E49] block">
                                    {c.reportId || c.id.slice(0, 10)}
                                  </span>
                                  <p className="font-bold text-sm text-[#201C18] line-clamp-2 leading-snug mt-0.5">{c.title}</p>
                                  <span className="text-xs text-[#6A6155] font-semibold block mt-1">
                                    Category: <strong className="text-[#201C18]">{c.category}</strong>
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* District & Risk */}
                            <td className="p-4 whitespace-nowrap">
                              <span className="font-bold text-sm text-[#201C18] block">{c.district || 'Ranchi'}</span>
                              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full inline-block mt-1 ${
                                c.riskLevel === 'CRITICAL' ? 'bg-[#FFF0EE] text-[#B5502D] border border-[#F5C6C0]' :
                                c.riskLevel === 'HIGH' ? 'bg-[#FFF8EC] text-[#C98A2C] border border-[#F0D99A]' :
                                'bg-[#F0FAF4] text-[#2C6E49] border border-[#C3E6D0]'
                              }`}>
                                {c.riskLevel || 'MEDIUM'} PRIORITY
                              </span>
                            </td>

                            {/* Assigned University */}
                            <td className="p-4 max-w-xs">
                              {c.assignedHEI ? (
                                <div className="space-y-1">
                                  <span className="font-black text-xs text-[#2C6E49] flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-[#2C6E49] shrink-0" />
                                    {c.assignedHEI}
                                  </span>
                                  <span className="text-xs text-[#4A433B] block">
                                    Lead: <strong className="text-[#201C18]">{heiMeta.studentLead}</strong>
                                  </span>
                                  <span className="text-xs text-[#6A6155] block">
                                    Mentor: {heiMeta.facultyLead}
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="text-xs font-extrabold text-[#C98A2C] bg-[#FFF8EC] border border-[#F0D99A] px-2 py-0.5 rounded-lg inline-flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5" />
                                    Unallocated
                                  </span>
                                  <span className="text-xs text-[#8A7F72] block font-medium">
                                    Open for university intake
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* CSR Sponsor & Grant */}
                            <td className="p-4 whitespace-nowrap">
                              <span className="font-bold text-xs text-[#201C18] block">{csrPartnerName}</span>
                              <span className="text-xs font-mono text-[#2C6E49] font-black block mt-0.5">
                                {csrGrantText}
                              </span>
                              <span className="text-xs bg-[#FAF8F4] border border-[#E4DDD1] text-[#6A6155] px-2 py-0.5 rounded-lg mt-1 inline-block font-bold">
                                {realCollab ? realCollab.status : 'Schedule VII R&D Grant'}
                              </span>
                            </td>

                            {/* Lifecycle Stage & Direct Admin Transition */}
                            <td className="p-4 whitespace-nowrap">
                              <span className="text-xs font-black bg-[#FAF8F4] text-[#2C6E49] border border-[#E4DDD1] px-2.5 py-1 rounded-full block text-center mb-1.5">
                                Stage {stageInfo?.stageNumber || 8}: {c.status}
                              </span>
                              <select
                                value={c.status}
                                onChange={(e) => handleStatusChange(c.id, e.target.value as ChallengeStatus)}
                                className="text-xs bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl px-2 py-1 text-[#201C18] font-bold w-full focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30 cursor-pointer"
                              >
                                {CHALLENGE_STATUS_OPTIONS.map(st => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </td>

                            {/* Live Field Telemetry */}
                            <td className="p-4 max-w-xs">
                              <span className="text-xs font-mono text-[#2C6E49] font-black block">
                                ● {heiMeta.sensorReading}
                              </span>
                              <span className="text-xs text-[#8A7F72] block mt-0.5">
                                Sensor: {heiMeta.sensorType} · 99.2% Uptime
                              </span>
                            </td>

                            {/* Quick Actions */}
                            <td className="p-4 text-right whitespace-nowrap space-x-1.5">
                              <button
                                onClick={() => handleLaunchTargetedBroadcast(c.district, c.title)}
                                title="Broadcast Emergency CAP Alert to this District"
                                className="p-2 bg-[#FFF0EE] hover:bg-[#FDE2DF] text-[#B5502D] rounded-xl border border-[#F5C6C0] transition-colors cursor-pointer"
                              >
                                <Radio className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setInspectingChallenge(c)}
                                title="View Full Case Dossier"
                                className="p-2 bg-[#FAF8F4] hover:bg-[#EAE4D8] text-[#201C18] rounded-xl border border-[#E4DDD1] transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4 text-[#2C6E49]" />
                              </button>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: OVERVIEW & STAGE PIPELINE
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black font-heading text-[#201C18]">Platform Health &amp; Pipeline Overview</h2>
              <p className="text-xs text-[#6A6155] mt-0.5">Real-time state telemetry and verified lifecycle distribution across all 24 Jharkhand districts.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Active Grievances', value: kpis.total, icon: Database, color: 'text-[#201C18]', bg: 'bg-[#FAF8F4]', border: 'border-[#E4DDD1]' },
                { label: 'Critical Risk Incidents', value: kpis.critical, icon: Flame, color: 'text-[#B5502D]', bg: 'bg-[#FFF0EE]', border: 'border-[#F5C6C0]' },
                { label: 'University R&D In Progress', value: kpis.active, icon: RefreshCw, color: 'text-[#C98A2C]', bg: 'bg-[#FFF8EC]', border: 'border-[#F0D99A]' },
                { label: 'Resolved / Verified Scaled', value: kpis.resolved, icon: CheckCircle2, color: 'text-[#2C6E49]', bg: 'bg-[#F0FAF4]', border: 'border-[#C3E6D0]' },
              ].map((kpi, i) => (
                <div key={i} className={`bg-white border ${kpi.border} rounded-2xl p-5 shadow-2xs space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6A6155] font-extrabold uppercase tracking-wider">{kpi.label}</span>
                    <div className={`w-8 h-8 ${kpi.bg} rounded-xl border ${kpi.border} flex items-center justify-center`}>
                      <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-black font-heading text-[#201C18]">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* 16-Stage Lifecycle Distribution */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black font-heading text-[#201C18]">16-Stage Standard Operating Procedure Distribution</h3>
                  <p className="text-xs text-[#6A6155]">Current state breakdown from Citizen Intake to Stage 16 Verified Resolution.</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#2C6E49] bg-[#F0FAF4] px-3 py-1 rounded-full border border-[#C3E6D0]">
                  100% Traceability
                </span>
              </div>

              <div className="space-y-2.5 pt-2">
                {LIFECYCLE_STAGES.map(stage => {
                  const count = kpis.byStage[stage.stageNumber] || 0;
                  const pct = kpis.total > 0 ? Math.round((count / kpis.total) * 100) : 0;
                  return (
                    <div key={stage.stageNumber} className="flex items-center gap-3 text-xs">
                      <span className="w-6 shrink-0 text-right font-mono text-[#8A7F72] text-xs font-bold">{stage.stageNumber}</span>
                      <span className="w-56 shrink-0 text-[#201C18] font-bold truncate">{stage.displayName}</span>
                      <div className="flex-1 bg-[#FAF8F4] border border-[#E4DDD1] rounded-full h-3.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#2C6E49] to-[#3a8e60] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right font-mono text-[#201C18] text-xs font-black">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* District Hotspot Matrix */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-black font-heading text-[#201C18]">District Incident Concentration</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(kpis.byDistrict).map(([dist, count]) => (
                  <div 
                    key={dist}
                    onClick={() => {
                      setDistrictFilter(dist);
                      setActiveTab('matrix');
                    }}
                    className="p-3 bg-[#FAF8F4] hover:bg-[#EAE4D8] border border-[#E4DDD1] rounded-xl transition-all cursor-pointer space-y-1"
                  >
                    <span className="text-xs font-bold text-[#6A6155] block truncate">{dist}</span>
                    <p className="text-xl font-black text-[#201C18]">{count} cases</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: CAP ALERT DISPATCHER
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'broadcast' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E4DDD1] shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE0] pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black font-heading text-[#201C18] flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#B5502D]" />
                  Common Alerting Protocol (CAP) Multi-Channel Emergency Dispatcher
                </h2>
                <p className="text-xs text-[#6A6155] mt-0.5">
                  Authorize and trigger live cell broadcasts across Telecom SMS, WhatsApp Verified Channels, Automated Voice IVR in Hindi &amp; Santhali, and LoRa Village Sirens.
                </p>
              </div>

              <button
                onClick={() => setIsBroadcastOpen(true)}
                className="px-5 py-2.5 bg-[#B5502D] hover:bg-[#9E4223] text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Open Emergency Broadcast Console</span>
              </button>
            </div>

            {/* Live Channel Status Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl space-y-1.5">
                <span className="text-xs text-[#2C6E49] font-black uppercase tracking-wider">Telecom Cell Broadcast SMS</span>
                <p className="text-2xl font-black text-[#201C18] font-mono">48,500 Registered</p>
                <p className="text-xs text-[#6A6155]">99.4% Delivery in &lt; 2.1s across cell towers</p>
              </div>

              <div className="p-4 bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl space-y-1.5">
                <span className="text-xs text-[#2C6E49] font-black uppercase tracking-wider">WhatsApp Verified Channel</span>
                <p className="text-2xl font-black text-[#201C18] font-mono">38,940 Subscribers</p>
                <p className="text-xs text-[#6A6155]">Official Green Badge Jharkhand SDMA Channel</p>
              </div>

              <div className="p-4 bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl space-y-1.5">
                <span className="text-xs text-[#C98A2C] font-black uppercase tracking-wider">Automated Voice IVR Dialers</span>
                <p className="text-2xl font-black text-[#201C18] font-mono">14,200 Auto-Dialers</p>
                <p className="text-xs text-[#6A6155]">Hindi, Santhali, Mundari &amp; Ho Audio Streams</p>
              </div>

              <div className="p-4 bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl space-y-1.5">
                <span className="text-xs text-[#B5502D] font-black uppercase tracking-wider">Solar Panchayat LoRa Sirens</span>
                <p className="text-2xl font-black text-[#201C18] font-mono">8 Relays Online</p>
                <p className="text-xs text-[#6A6155]">Solar 120dB High Decibel Warning PA Units</p>
              </div>
            </div>

            {/* Direct Broadcast Form Preview */}
            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#201C18]">Quick CAP Dispatch Trigger</h3>
                <span className="text-xs text-[#6A6155]">Standardized ITU X.1303 CAP v1.2 Format</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#201C18]">Target District</label>
                  <select 
                    value={targetDistrictForBroadcast}
                    onChange={e => setTargetDistrictForBroadcast(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E4DDD1] rounded-xl text-xs font-bold text-[#201C18]"
                  >
                    {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#201C18]">Emergency Hazard Classification</label>
                  <select
                    value={targetHazardForBroadcast}
                    onChange={e => setTargetHazardForBroadcast(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E4DDD1] rounded-xl text-xs font-bold text-[#201C18]"
                  >
                    <option value="Flash Flood & River Swell">Flash Flood &amp; River Swell</option>
                    <option value="Subterranean Coalfire & Subsidence">Subterranean Coalfire &amp; Subsidence</option>
                    <option value="Toxic Chemical Effluent Discharge">Toxic Chemical Effluent Discharge</option>
                    <option value="Elephant Herd Farm Intrusion">Elephant Herd Farm Intrusion</option>
                    <option value="Arsenic Water Toxicity Spike">Arsenic Water Toxicity Spike</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsBroadcastOpen(true)}
                  className="px-4 py-2 bg-[#B5502D] hover:bg-[#9E4223] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Configure &amp; Authorize Broadcast</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: DM EXECUTIVE DOSSIER
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'dossier' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E4DDD1] shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE0] pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black font-heading text-[#201C18] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#2C6E49]" />
                  District Magistrate (DM) Disaster Situation Dossier (SITREP)
                </h2>
                <p className="text-xs text-[#6A6155] mt-0.5">
                  Real-time situation report ready for printable PDF export with executive summaries and university prototype updates.
                </p>
              </div>

              <button
                onClick={() => setIsBriefingOpen(true)}
                className="px-5 py-2.5 bg-[#2C6E49] hover:bg-[#23583a] text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Open Printable Official Dossier</span>
              </button>
            </div>

            {/* SITREP Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl space-y-1.5">
                <span className="text-xs font-extrabold text-[#6A6155] uppercase tracking-wider">Total Geotagged Cases</span>
                <p className="text-3xl font-black text-[#201C18]">{allChallenges.length}</p>
                <p className="text-xs text-[#4A433B]">Across all 24 Jharkhand administrative districts</p>
              </div>
              <div className="p-4 bg-[#FFF0EE] border border-[#F5C6C0] rounded-2xl space-y-1.5">
                <span className="text-xs font-extrabold text-[#B5502D] uppercase tracking-wider">Critical Priority Cases</span>
                <p className="text-3xl font-black text-[#B5502D]">{kpis.critical}</p>
                <p className="text-xs text-[#B5502D]">Requiring SDRF and District Magistrate action</p>
              </div>
              <div className="p-4 bg-[#F0FAF4] border border-[#C3E6D0] rounded-2xl space-y-1.5">
                <span className="text-xs font-extrabold text-[#2C6E49] uppercase tracking-wider">Active University Prototypes</span>
                <p className="text-3xl font-black text-[#2C6E49]">{kpis.active}</p>
                <p className="text-xs text-[#2C6E49]">Stages 9 to 13 field pilots deployed</p>
              </div>
            </div>

            {/* Situation Report Table */}
            <div className="border border-[#E4DDD1] rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[#FAF8F4] border-b border-[#E4DDD1] text-xs font-black text-[#6A6155] uppercase">
                  <tr>
                    <th className="p-3.5 text-left">Incident Title &amp; Location</th>
                    <th className="p-3.5 text-left">Severity</th>
                    <th className="p-3.5 text-left">Lead HEI Taskforce</th>
                    <th className="p-3.5 text-left">CSR Sponsor</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DDD1] font-medium text-[#201C18]">
                  {allChallenges.slice(0, 8).map(c => {
                    const meta = HEI_TELEMETRY_MAP[c.id] || HEI_TELEMETRY_MAP[c.reportId] || HEI_TELEMETRY_MAP['DEMO-CH-001'];
                    return (
                      <tr key={c.id} className="hover:bg-[#FAF8F4]">
                        <td className="p-3.5">
                          <span className="font-bold text-sm text-[#201C18] block">{c.title}</span>
                          <span className="text-xs text-[#6A6155]">{c.village}, {c.district}</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                            c.riskLevel === 'CRITICAL' ? 'bg-[#FFF0EE] text-[#B5502D]' : 'bg-[#FFF8EC] text-[#C98A2C]'
                          }`}>
                            {c.riskLevel || 'MEDIUM'}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs font-bold text-[#2C6E49]">
                          {c.assignedHEI || 'Pending Allocation'}
                        </td>
                        <td className="p-3.5 text-xs font-medium text-[#4A433B]">
                          {meta.defaultCsrPartner}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setInspectingChallenge(c)}
                            className="px-2.5 py-1 bg-[#FAF8F4] hover:bg-[#EAE4D8] text-[#2C6E49] font-bold rounded-lg border border-[#E4DDD1] cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 5: AUDIT TRAIL & LOGS
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-[#E4DDD1] rounded-2xl shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-3">
              <div>
                <h3 className="text-base font-black font-heading text-[#201C18]">System Audit Trail &amp; Cryptographic Logs</h3>
                <p className="text-xs text-[#6A6155] mt-0.5">Chronological record of state transitions, government approvals, and MoU agreements with cryptographic SHA-256 validation.</p>
              </div>
              <span className="text-xs font-mono font-black text-[#2C6E49] bg-[#F0FAF4] px-3 py-1 rounded-full border border-[#C3E6D0]">
                ● Immutable Audit Stream
              </span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {auditEntries.length === 0 ? (
                <p className="text-xs text-[#8A7F72] p-8 text-center">No timeline events recorded yet.</p>
              ) : (
                auditEntries.map((entry, i) => (
                  <div key={i} className="p-3.5 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-sm text-[#201C18] block">{entry.challengeTitle}</span>
                      <p className="text-xs text-[#4A433B] mt-0.5">{entry.description || entry.actorRole}</p>
                      <span className="text-xs text-[#8A7F72] font-mono mt-0.5 block">
                        Actor: {entry.actor} ({entry.actorRole})
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono text-[#6A6155] block">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recent'}
                      </span>
                      <span className="text-xs font-mono text-[#2C6E49] font-black bg-[#F0FAF4] px-2 py-0.5 rounded border border-[#C3E6D0] mt-1 inline-block">
                        SHA-256 Verified
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* Selected Case Inspection Modal */}
      <ChallengeDetailModal
        isOpen={Boolean(inspectingChallenge)}
        challenge={inspectingChallenge}
        onClose={() => setInspectingChallenge(null)}
        portalRole="admin"
        actionButtonLabel="Dispatch Emergency Alert"
        onActionClick={(c) => {
          setInspectingChallenge(null);
          handleLaunchTargetedBroadcast(c.district, c.title);
        }}
      />

      {/* Emergency Broadcast Modal */}
      <EmergencyBroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        defaultDistrict={targetDistrictForBroadcast}
        defaultHazard={targetHazardForBroadcast}
      />

      {/* Executive Briefing Dossier Modal */}
      <ExecutiveBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        challenges={allChallenges}
      />

    </div>
  );
};
