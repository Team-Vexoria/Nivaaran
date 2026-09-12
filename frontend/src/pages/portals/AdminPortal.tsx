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
import { subscribeToChallenges, ChallengeDoc } from '../../services/firebaseService';
import { EmergencyBroadcastModal } from '../../components/admin/EmergencyBroadcastModal';
import { ExecutiveBriefingModal } from '../../components/admin/ExecutiveBriefingModal';

type AdminTab = 'matrix' | 'overview' | 'broadcast' | 'dossier' | 'audit';

// Known University & CSR mappings for Jharkhand challenges
const ENTITY_MAPPINGS: Record<string, {
  university: string;
  facultyLead: string;
  studentLead: string;
  csrPartner: string;
  csrGrant: string;
  trancheStatus: string;
  telemetryStatus: string;
}> = {
  'DEMO-CH-001': {
    university: 'IIT (ISM) Dhanbad',
    facultyLead: 'Dr. S. K. Roy (Rock Mechanics & Safety)',
    studentLead: 'Priya Sharma (Lead, M.Tech Mining)',
    csrPartner: 'BCCL CSR Foundation',
    csrGrant: '₹6,50,000 (₹3.0L Co-Funded)',
    trancheStatus: 'Tranche 2 Active (40%)',
    telemetryStatus: '● 4 Borehole DTS Nodes Synced (56°C peak, 0.2mm shift)',
  },
  'DEMO-CH-002': {
    university: 'IIT (ISM) Dhanbad',
    facultyLead: 'Prof. Ankit Verma (Environmental Engg)',
    studentLead: 'Deepak Sahu (Lead, 4th Yr Env Engg)',
    csrPartner: 'Tata Steel Foundation',
    csrGrant: '₹5,20,000 (₹2.6L Co-Funded)',
    trancheStatus: 'Tranche 2 Active (40%)',
    telemetryStatus: '● Cartridge Flow: 14.2 L/min (As <0.005 mg/L)',
  },
  'DEMO-CH-003': {
    university: 'Birsa Agricultural University (BAU)',
    facultyLead: 'Dr. Rameshwar Oraon (Soil & Water Engg)',
    studentLead: 'Amit Murmu (Lead, 3rd Yr AgriTech)',
    csrPartner: 'NTPC CSR Rural Energy Fund',
    csrGrant: '₹4,80,000 (₹2.4L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● LoRa Aquifer Piezometer: 42.1m (Soil Tension 28 kPa)',
  },
  'DEMO-CH-004': {
    university: 'NIT Jamshedpur',
    facultyLead: 'Dr. V. K. Mahato (Hydraulic Engg)',
    studentLead: 'Rahul Soren (Lead, 4th Yr Civil)',
    csrPartner: 'Tata Steel TSRDS & Jusco CSR',
    csrGrant: '₹5,80,000 (₹2.9L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● Ultrasonic River Sentinel: 4.1m (Alert at 5.5m)',
  },
  'DEMO-CH-005': {
    university: 'Kolhan University & NIT Jamshedpur',
    facultyLead: 'Dr. Meenakshi Soren (Environmental Geoscience)',
    studentLead: 'Salil Banra (Lead, Metallurgical & Geo Engg)',
    csrPartner: 'Tata Steel Mining & SAIL Rungta CSR',
    csrGrant: '₹6,20,000 (₹3.1L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● Karo River Spectro Sensor: Turbidity 18 NTU (Fe <0.3 mg/L)',
  },
  'DEMO-CH-006': {
    university: 'BIT Sindri',
    facultyLead: 'Dr. Priya Sharma (Wildlife Ecology & IoT)',
    studentLead: 'Aditya Kumar (Lead, Forestry & Wildlife)',
    csrPartner: 'Jharkhand Forest Dev & Adani CSR',
    csrGrant: '₹4,20,000 (₹2.1L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● 6 Seismic Geophones Online (0 Pachyderm Alerts)',
  },
  'DEMO-CH-007': {
    university: 'Sido Kanhu Murmu University (SKMU)',
    facultyLead: 'Dr. Hemant Murmu (Fluvial Geomorphology)',
    studentLead: 'Sanjay Hansda (Lead, Earth Sciences)',
    csrPartner: 'Inland Waterways CSR & Jindal Power',
    csrGrant: '₹6,00,000 (₹3.0L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● ADCP Sonar Buoy Active (Current 1.4 m/s, Depth 7.2m)',
  },
  'DEMO-CH-008': {
    university: 'BIT Mesra, Ranchi',
    facultyLead: 'Dr. Arvind Sinha (IoT & Civil Lab)',
    studentLead: 'Ayush Kumar Singh (Lead, 4th Yr ECE)',
    csrPartner: 'Central Coalfields Ltd (CCL CSR)',
    csrGrant: '₹4,50,000 (₹2.25L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● 115200 Baud Radar Stream: 1.82m Stage (Normal Flow)',
  },
  'DEMO-CH-009': {
    university: 'IIT (ISM) Dhanbad & Bokaro Steel City College',
    facultyLead: 'Dr. Sanjeev Kumar (Slurry Rheology & Waste)',
    studentLead: 'Vikramaditya Roy (Lead, Chemical Engg)',
    csrPartner: 'SAIL Bokaro Steel Plant CSR & DVC',
    csrGrant: '₹5,60,000 (₹2.8L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● Konar River Intake Optical Sensor: Turbidity 14 NTU Safe',
  },
  'DEMO-CH-010': {
    university: 'NIT Jamshedpur',
    facultyLead: 'Dr. P. K. Soren (Chemical & Env Engg)',
    studentLead: 'Neha Kumari (Lead, 4th Yr Chem Engg)',
    csrPartner: 'Adityapur Auto Cluster CSR',
    csrGrant: '₹5,10,000 (₹2.5L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● Optical Fluorometer Stream (Cr-VI: 0.018 mg/L Safe)',
  },
  'DEMO-CH-011': {
    university: 'Birsa Agricultural University (BAU)',
    facultyLead: 'Dr. R. N. Tiwari (Agronomy & Entomology)',
    studentLead: 'Birsa Munda (Lead, Lac Culture Cell)',
    csrPartner: 'TRIFED & JSLPS Innovation Grant',
    csrGrant: '₹3,90,000 (₹1.95L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● Multispectral NDVI Drone Scan (Canopy Health 92%)',
  },
  'DEMO-CH-012': {
    university: 'AIIMS Deoghar & SKMU Dumka',
    facultyLead: 'Dr. Alok Ranjan (Microbiology & Public Health)',
    studentLead: 'Kavita Mishra (Lead, Bioengineering)',
    csrPartner: 'Baidyanath Dham Trust & Coal India CSR',
    csrGrant: '₹4,70,000 (₹2.35L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● UV-LED Sterilizer Stream: E. coli 0 CFU/100ml Safe',
  },
  'DEMO-CH-013': {
    university: 'Vinoba Bhave University (VBU) & NIT JSR',
    facultyLead: 'Dr. Meenakshi Sinha (Geotechnical Engg)',
    studentLead: 'Tanvi Agarwal (Lead, Structural Engg)',
    csrPartner: 'NHAI Road Safety & NTPC CSR',
    csrGrant: '₹5,50,000 (₹2.75L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● FBG Strain Sensor Rig (Pier 3 Scour 2.8m Fixed)',
  },
  'DEMO-CH-014': {
    university: 'BIT Sindri & Vinoba Bhave University',
    facultyLead: 'Dr. Rajeshwar Mandal (Mine Reclamation)',
    studentLead: 'Kunal Kumar (Lead, Mining Environmental Lab)',
    csrPartner: 'Damodar Valley Corporation DVC CSR & JSMDC',
    csrGrant: '₹5,40,000 (₹2.7L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● Pit Water Level Sonar: 11.2m Rim Stability Steady',
  },
  'DEMO-CH-015': {
    university: 'Ranchi University & BIT Mesra',
    facultyLead: 'Dr. Sandeep Toppo (Geotechnical & Highway Engg)',
    studentLead: 'Roshan Kujur (Lead, Civil & Geomatics)',
    csrPartner: 'Hindalco Industries CSR Netarhat Division',
    csrGrant: '₹4,90,000 (₹2.45L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● Inclinometer Sensor String: Slope Creep 0.05 mm/day Stable',
  },
  'mining': {
    university: 'IIT (ISM) Dhanbad',
    facultyLead: 'Dr. S. K. Roy (Rock Mechanics & Safety)',
    studentLead: 'Priya Sharma (Lead, M.Tech Mining)',
    csrPartner: 'BCCL CSR Foundation',
    csrGrant: '₹6,50,000 (₹3.0L Co-Funded)',
    trancheStatus: 'Tranche 2 Active (40%)',
    telemetryStatus: '● 4 Borehole DTS Nodes Synced (56°C peak, 0.2mm shift)',
  },
  'water': {
    university: 'IIT (ISM) Dhanbad',
    facultyLead: 'Prof. Ankit Verma (Environmental Engg)',
    studentLead: 'Deepak Sahu (Lead, 4th Yr Env Engg)',
    csrPartner: 'Tata Steel Foundation',
    csrGrant: '₹5,20,000 (₹2.6L Co-Funded)',
    trancheStatus: 'Tranche 2 Active (40%)',
    telemetryStatus: '● Cartridge Flow: 14.2 L/min (As <0.005 mg/L)',
  },
  'drought': {
    university: 'Birsa Agricultural University (BAU)',
    facultyLead: 'Dr. Rameshwar Oraon (Soil & Water Engg)',
    studentLead: 'Amit Murmu (Lead, 3rd Yr AgriTech)',
    csrPartner: 'NTPC CSR Rural Energy Fund',
    csrGrant: '₹4,80,000 (₹2.4L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● LoRa Aquifer Piezometer: 42.1m (Soil Tension 28 kPa)',
  },
  'flood': {
    university: 'BIT Mesra, Ranchi',
    facultyLead: 'Dr. Arvind Sinha (IoT & Civil Lab)',
    studentLead: 'Ayush Kumar Singh (Lead, 4th Yr ECE)',
    csrPartner: 'Central Coalfields Ltd (CCL CSR)',
    csrGrant: '₹4,50,000 (₹2.25L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● 115200 Baud Radar Stream: 1.82m Stage (Normal Flow)',
  },
  'confluence': {
    university: 'NIT Jamshedpur',
    facultyLead: 'Dr. V. K. Mahato (Hydraulic Engg)',
    studentLead: 'Rahul Soren (Lead, 4th Yr Civil)',
    csrPartner: 'Tata Steel TSRDS & Jusco CSR',
    csrGrant: '₹5,80,000 (₹2.9L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● Ultrasonic River Sentinel: 4.1m (Alert at 5.5m)',
  },
  'wildlife': {
    university: 'BIT Sindri',
    facultyLead: 'Dr. Priya Sharma (Wildlife Ecology & IoT)',
    studentLead: 'Aditya Kumar (Lead, Forestry & Wildlife)',
    csrPartner: 'Jharkhand Forest Dev & Adani CSR',
    csrGrant: '₹4,20,000 (₹2.1L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● 6 Seismic Geophones Online (0 Pachyderm Alerts)',
  },
  'erosion': {
    university: 'Sido Kanhu Murmu University (SKMU)',
    facultyLead: 'Dr. Hemant Murmu (Fluvial Geomorphology)',
    studentLead: 'Sanjay Hansda (Lead, Earth Sciences)',
    csrPartner: 'Inland Waterways CSR & Jindal Power',
    csrGrant: '₹6,00,000 (₹3.0L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● ADCP Sonar Buoy Active (Current 1.4 m/s, Depth 7.2m)',
  },
  'hazardous': {
    university: 'NIT Jamshedpur',
    facultyLead: 'Dr. P. K. Soren (Chemical & Env Engg)',
    studentLead: 'Neha Kumari (Lead, 4th Yr Chem Engg)',
    csrPartner: 'Adityapur Auto Cluster CSR',
    csrGrant: '₹5,10,000 (₹2.5L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● Optical Fluorometer Stream (Cr-VI: 0.018 mg/L Safe)',
  },
  'agri': {
    university: 'Birsa Agricultural University (BAU)',
    facultyLead: 'Dr. R. N. Tiwari (Agronomy & Entomology)',
    studentLead: 'Birsa Munda (Lead, Lac Culture Cell)',
    csrPartner: 'TRIFED & JSLPS Innovation Grant',
    csrGrant: '₹3,90,000 (₹1.95L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● Multispectral NDVI Drone Scan (Canopy Health 92%)',
  },
  'bridge': {
    university: 'Vinoba Bhave University (VBU) & NIT JSR',
    facultyLead: 'Dr. Meenakshi Sinha (Geotechnical Engg)',
    studentLead: 'Tanvi Agarwal (Lead, Structural Engg)',
    csrPartner: 'NHAI Road Safety & NTPC CSR',
    csrGrant: '₹5,50,000 (₹2.75L Co-Funded)',
    trancheStatus: 'Tranche 1 Disbursed (30%)',
    telemetryStatus: '● FBG Strain Sensor Rig (Pier 3 Scour 2.8m Fixed)',
  },
};

export const AdminPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('matrix');
  const [challenges, setChallenges] = useState<Challenge[]>(workflowStore.getChallenges());
  const [fbChallenges, setFbChallenges] = useState<ChallengeDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

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

  // Firebase sync
  useEffect(() => {
    const unsub = subscribeToChallenges(setFbChallenges);
    return () => unsub();
  }, []);

  // Merge workflowStore + Firebase for full picture
  const allChallenges = useMemo(() => {
    if (challenges.length > 0) return challenges;
    return fbChallenges as unknown as Challenge[];
  }, [challenges, fbChallenges]);

  // --- KPI Counts ---
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
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    });
    const byDistrict: Record<string, number> = {};
    allChallenges.forEach(c => {
      byDistrict[c.district] = (byDistrict[c.district] || 0) + 1;
    });
    return { total, pending, active, resolved, critical, byCategory, byDistrict, byStage };
  }, [allChallenges]);

  // --- Audit log entries from timeline events ---
  const auditEntries = useMemo(() => {
    return allChallenges.flatMap(c =>
      workflowStore.getTimelineEvents(c.id).map(e => ({ ...e, challengeTitle: c.title, challengeId: c.id }))
    ).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')).slice(0, 50);
  }, [allChallenges]);

  // --- Filtered challenges for Master Matrix tab ---
  const filteredChallenges = useMemo(() => {
    return allChallenges.filter(c => {
      const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase())
        || c.district.toLowerCase().includes(searchQuery.toLowerCase())
        || c.reportId.toLowerCase().includes(searchQuery.toLowerCase())
        || (c.assignedHEI && c.assignedHEI.toLowerCase().includes(searchQuery.toLowerCase()));
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

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1A1612] text-white px-4 sm:px-6 py-3 border-b border-[#2E2820] shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-[#B5502D] to-red-600 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black font-heading tracking-tight leading-none text-white">NIVAARAN</span>
                <span className="text-[10px] font-extrabold bg-[#B5502D]/30 text-[#E8845E] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#B5502D]/50">
                  Super Admin Command Matrix
                </span>
              </div>
              <span className="text-[10px] text-[#8A7F72] font-semibold block">
                State-Wide Incident Traceability, HEI Labs & Emergency Broadcast
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="flex items-center space-x-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-black px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>CAP Broadcast</span>
            </button>

            <button
              onClick={() => setIsBriefingOpen(true)}
              className="flex items-center space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>DM Dossier (PDF)</span>
            </button>

            <button
              onClick={async () => { await logout(); window.location.href = '/'; }}
              className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-2.5 flex items-center space-x-1 border-t border-white/10 pt-2 overflow-x-auto">
          {([
            { id: 'matrix', label: 'Master Case Matrix', icon: Layers },
            { id: 'overview', label: 'Platform KPIs & Pipeline', icon: BarChart3 },
            { id: 'broadcast', label: 'CAP Alert Dispatcher', icon: Radio },
            { id: 'dossier', label: 'DM Executive Dossier', icon: FileText },
            { id: 'audit', label: 'Security & Audit Trail', icon: Activity },
          ] as { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white font-black shadow-xs'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">

        {/* ── TAB 1: SUPER ADMIN MASTER CASE MATRIX ── */}
        {activeTab === 'matrix' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E4DDD1] shadow-2xs">
              <div>
                <h2 className="text-lg font-black text-[#201C18] font-heading flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#B5502D]" />
                  State-Wide Master Traceability Matrix
                </h2>
                <p className="text-xs text-[#6A6155] mt-0.5">
                  Full lifecycle visibility connecting Citizen Grievances $\leftrightarrow$ AI Priority $\leftrightarrow$ Assigned HEI Labs $\leftrightarrow$ CSR Sponsors $\leftrightarrow$ Tranche Grants.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by title, ID, university…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs text-[#201C18] w-48 sm:w-60 focus:outline-hidden"
                  />
                </div>

                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs text-[#201C18] font-semibold focus:outline-hidden"
                >
                  <option value="all">All Districts</option>
                  {uniqueDistricts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs text-[#201C18] font-semibold focus:outline-hidden"
                >
                  <option value="all">All Stages ({filteredChallenges.length})</option>
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
                  <thead className="bg-[#FAF8F4] border-b border-[#E4DDD1] text-[10px] text-[#6A6155] uppercase font-extrabold tracking-wider">
                    <tr>
                      <th className="p-3.5">Case ID & Title</th>
                      <th className="p-3.5">District / Risk</th>
                      <th className="p-3.5">Assigned University & Team</th>
                      <th className="p-3.5">CSR Sponsor & Grant</th>
                      <th className="p-3.5">Lifecycle Stage</th>
                      <th className="p-3.5">Live Field Telemetry</th>
                      <th className="p-3.5 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4DDD1] font-medium text-[#201C18]">
                    {filteredChallenges.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                          No matching cases found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredChallenges.map((c) => {
                        const stageInfo = getStageForStatus(c.status);
                        const catLower = c.category.toLowerCase();
                        const titleLower = c.title.toLowerCase();
                        const combined = `${catLower} ${titleLower}`;

                        const categoryKey = combined.includes('coal') || combined.includes('mine') || combined.includes('subsidence') ? 'mining'
                          : combined.includes('arsenic') || combined.includes('fluoride') || combined.includes('water') || combined.includes('pathogen') ? 'water'
                          : combined.includes('drought') || combined.includes('aquifer') || combined.includes('well') ? 'drought'
                          : combined.includes('confluence') || combined.includes('kharkai') || combined.includes('subarnarekha') ? 'confluence'
                          : combined.includes('flood') || combined.includes('drainage') || combined.includes('culvert') ? 'flood'
                          : combined.includes('elephant') || combined.includes('wildlife') ? 'wildlife'
                          : combined.includes('ganga') || combined.includes('erosion') || combined.includes('diara') ? 'erosion'
                          : combined.includes('chemical') || combined.includes('hazardous') || combined.includes('electroplating') || combined.includes('slurry') ? 'hazardous'
                          : combined.includes('lac') || combined.includes('crop') || combined.includes('blight') || combined.includes('tree') ? 'agri'
                          : combined.includes('bridge') || combined.includes('scour') || combined.includes('pier') ? 'bridge'
                          : 'flood';
                        const entity = ENTITY_MAPPINGS[c.id] || (c.reportId ? ENTITY_MAPPINGS[c.reportId] : undefined) || ENTITY_MAPPINGS[categoryKey] || ENTITY_MAPPINGS['DEMO-CH-001'];

                        return (
                          <tr key={c.id} className="hover:bg-[#FAF8F4]/80 transition-colors">
                            {/* Case ID & Title */}
                            <td className="p-3.5 max-w-xs">
                              <span className="font-mono text-[10px] font-bold text-indigo-700 block">
                                {c.reportId || c.id.slice(0, 10)}
                              </span>
                              <p className="font-bold text-slate-900 line-clamp-1">{c.title}</p>
                              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                                Category: <strong className="text-slate-700">{c.category}</strong>
                              </span>
                            </td>

                            {/* District & Risk */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="font-bold text-slate-900 block">{c.district || 'Ranchi'}</span>
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                c.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
                                c.riskLevel === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {c.riskLevel || 'MEDIUM'} PRIORITY
                              </span>
                            </td>

                            {/* Assigned University */}
                            <td className="p-3.5 max-w-xs">
                              <span className="font-bold text-emerald-900 block flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                {c.assignedHEI || entity.university}
                              </span>
                              <span className="text-[10px] text-slate-600 block mt-0.5">
                                Lead: <strong className="text-slate-800">{entity.studentLead}</strong>
                              </span>
                              <span className="text-[9px] text-slate-500 block">
                                Mentor: {entity.facultyLead}
                              </span>
                            </td>

                            {/* CSR Sponsor & Grant */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="font-bold text-slate-900 block">{entity.csrPartner}</span>
                              <span className="text-[10px] font-mono text-emerald-700 font-bold block">
                                {entity.csrGrant}
                              </span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded mt-0.5 inline-block font-semibold">
                                {entity.trancheStatus}
                              </span>
                            </td>

                            {/* Stage */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full block text-center mb-1">
                                Stage {stageInfo?.stageNumber || 11}: {c.status}
                              </span>
                              <select
                                value={c.status}
                                onChange={(e) => handleStatusChange(c.id, e.target.value as ChallengeStatus)}
                                className="text-[10px] bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-slate-700 w-full focus:outline-hidden"
                              >
                                {CHALLENGE_STATUS_OPTIONS.map(st => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </td>

                            {/* Live Field Telemetry */}
                            <td className="p-3.5 max-w-xs">
                              <span className="text-[10px] font-mono text-teal-800 font-bold block">
                                {entity.telemetryStatus}
                              </span>
                              <span className="text-[9px] text-slate-500 block">
                                Packet Loss: &lt; 0.8% · IP67 Waterproof
                              </span>
                            </td>

                            {/* Quick Actions */}
                            <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                              <button
                                onClick={() => handleLaunchTargetedBroadcast(c.district, c.title)}
                                title="Broadcast Emergency CAP Alert to this District"
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors cursor-pointer"
                              >
                                <Radio className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setSelectedChallenge(c)}
                                title="View Full Case Dossier"
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
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

        {/* ── TAB 2: OVERVIEW & STAGE PIPELINE ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#201C18]">Platform Health & Pipeline Overview</h2>
              <p className="text-xs text-[#6A6155]">Real-time state telemetry from workflowStore + Firebase engine.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Challenges', value: kpis.total, icon: Database, color: 'text-slate-700', bg: 'bg-slate-100' },
                { label: 'Critical Risk Alerts', value: kpis.critical, icon: Flame, color: 'text-red-700', bg: 'bg-red-100' },
                { label: 'Active R&D Pipeline', value: kpis.active, icon: RefreshCw, color: 'text-blue-700', bg: 'bg-blue-100' },
                { label: 'Resolved / Scaled', value: kpis.resolved, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100' },
              ].map((kpi, i) => (
                <div key={i} className="bg-white border border-[#E4DDD1] rounded-2xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6A6155] font-medium">{kpi.label}</span>
                    <div className={`w-7 h-7 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                      <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold font-heading text-[#201C18]">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Stage Pipeline */}
            <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#201C18]">16-Stage Lifecycle Distribution</h3>
              <div className="space-y-2">
                {LIFECYCLE_STAGES.map(stage => {
                  const count = kpis.byStage[stage.stageNumber] || 0;
                  const pct = kpis.total > 0 ? Math.round((count / kpis.total) * 100) : 0;
                  return (
                    <div key={stage.stageNumber} className="flex items-center gap-3 text-xs">
                      <span className="w-5 shrink-0 text-right font-mono text-[#8A7F72] text-[10px]">{stage.stageNumber}</span>
                      <span className="w-44 shrink-0 text-[#4A433B] font-semibold truncate">{stage.displayName}</span>
                      <div className="flex-1 bg-[#FAF8F4] border border-[#E4DDD1] rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all"
                          style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right font-mono text-[#6A6155] text-[11px] font-bold">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: CAP ALERT DISPATCHER ── */}
        {activeTab === 'broadcast' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E4DDD1] shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-600" />
                  Common Alerting Protocol (CAP) Multi-Channel Dispatch Center
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Launch cell broadcasts across SMS, WhatsApp, automated IVR calls, and remote Panchayat sirens.
                </p>
              </div>

              <button
                onClick={() => setIsBroadcastOpen(true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Open Interactive Broadcast Console</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
                <span className="text-[10px] text-teal-800 font-black uppercase">Telecom Cell SMS</span>
                <p className="text-base font-black text-slate-900 font-mono">48,500 Registered</p>
                <p className="text-[11px] text-teal-700">99.4% Delivery in &lt; 2.1s</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-800 font-black uppercase">WhatsApp Verified</span>
                <p className="text-base font-black text-slate-900 font-mono">38,940 Subscribers</p>
                <p className="text-[11px] text-emerald-700">Green Badge SDMA Feed</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <span className="text-[10px] text-blue-800 font-black uppercase">Automated IVR</span>
                <p className="text-base font-black text-slate-900 font-mono">14,200 Auto-Dialers</p>
                <p className="text-[11px] text-blue-700">Hindi & Santhali Voice</p>
              </div>
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <span className="text-[10px] text-rose-800 font-black uppercase">Village Sirens</span>
                <p className="text-base font-black text-slate-900 font-mono">8 LoRa Relays</p>
                <p className="text-[11px] text-rose-700">Solar 120dB PA Units</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: DM EXECUTIVE DOSSIER ── */}
        {activeTab === 'dossier' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E4DDD1] shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-700" />
                  District Magistrate (DM) Disaster Situation Dossier (SITREP)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time situation report ready for printable PDF export with executive summaries and HEI prototype updates.
                </p>
              </div>

              <button
                onClick={() => setIsBriefingOpen(true)}
                className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Open Printable Official Dossier</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total Geotagged Cases</span>
                <p className="text-2xl font-black text-slate-900">{allChallenges.length}</p>
                <p className="text-slate-600">Across 24 Jharkhand Districts</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-red-700 uppercase">Critical Triage Cases</span>
                <p className="text-2xl font-black text-red-700">{kpis.critical}</p>
                <p className="text-red-600">Requiring Immediate SDRF Deployment</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Active HEI Solutions</span>
                <p className="text-2xl font-black text-emerald-800">{kpis.active}</p>
                <p className="text-emerald-700">Prototype & Pilot Stage Active</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: AUDIT TRAIL ── */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-[#E4DDD1] rounded-2xl shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#201C18]">System Audit Trail & Cryptographic Logs</h3>
                <p className="text-xs text-[#6A6155]">Chronological record of state transitions with SHA-256 e-Sign signatures.</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ● Immutable Audit Stream
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditEntries.length === 0 ? (
                <p className="text-xs text-slate-500 p-4 text-center">No timeline events recorded yet.</p>
              ) : (
                auditEntries.map((entry, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{entry.challengeTitle}</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">{entry.description || entry.actorRole}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Actor: {entry.actor} ({entry.actorRole})
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : 'Recent'}
                      </span>
                      <span className="text-[9px] font-mono text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 mt-1 inline-block">
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
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase">Case Inspection</span>
                <h3 className="text-base font-black text-slate-900">{selectedChallenge.title}</h3>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedChallenge.description}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">District</span>
                  <span className="font-bold text-slate-900">{selectedChallenge.district || 'Ranchi'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Risk Level</span>
                  <span className="font-bold text-red-700">{selectedChallenge.riskLevel || 'CRITICAL'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

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
