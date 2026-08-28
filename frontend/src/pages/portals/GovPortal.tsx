import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Building2, 
  MapPin, 
  FileText, 
  Send, 
  RefreshCw, 
  Search, 
  Clock, 
  Users, 
  Check, 
  X, 
  ChevronRight, 
  Sparkles, 
  Plus, 
  Download, 
  Info,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { JHARKHAND_UNIVERSITIES } from '../../services/universityData';
import { rankUniversitiesForChallenge, HEIMatchResult } from '../../services/heiMatchingEngine';
import { ChallengeDoc } from '../../services/firebaseService';
import { CertificateModal } from '../../components/CertificateModal';

interface GovChallengeItem extends ChallengeDoc {
  urgencyScore: number;
  populationAffected: string;
  infrastructureRisk: string;
  matchedHEIs?: HEIMatchResult[];
  lastUpdated?: string;
}

const INITIAL_CHALLENGES: GovChallengeItem[] = [
  {
    reportId: 'CH-JH-2026-0814',
    title: 'Ranchi School Flood Risk Triage & IoT Early Warning',
    district: 'Ranchi',
    block: 'Kanke',
    village: 'Arsande',
    category: 'Flood & Inundation Risk',
    status: 'Under Review',
    summary: 'Heavy monsoon runoff inundates Government Middle School and adjacent agricultural culverts, stranding 450+ students and damaging village transit links.',
    urgencyScore: 9.2,
    priorityScore: 92,
    populationAffected: '1,450 Citizens & Students',
    infrastructureRisk: 'Submerged school access road, culvert structural erosion',
    aiReasoning: 'Critical educational infrastructure barrier with repetitive seasonal flash flooding. High student population density requires automated IoT water-level telemetry.',
    needsHumanVerification: true,
    lastUpdated: '10 mins ago',
  },
  {
    reportId: 'CH-JH-2026-0815',
    title: 'Dhanbad Jharia Coalfield Land Subsidence & Gas Seepage',
    district: 'Dhanbad',
    block: 'Jharia',
    village: 'Bhowra Sector 4',
    category: 'Mining Subsidence & Fire',
    status: 'Under Review',
    summary: 'Subterranean fire induced ground fissures with elevated carbon monoxide emissions near residential settlement clusters.',
    urgencyScore: 9.5,
    priorityScore: 95,
    populationAffected: '3,800 Residents',
    infrastructureRisk: 'Cracking foundation on SH-12 link, high toxicity risk',
    aiReasoning: 'Imminent thermal subsidence hazard. Recommends thermal drone mapping and subsurface borehole temperature monitoring array.',
    needsHumanVerification: true,
    lastUpdated: '25 mins ago',
  },
  {
    reportId: 'CH-JH-2026-0816',
    title: 'Palamu Agricultural Drought & Groundwater Depletion Telemetry',
    district: 'Palamu',
    block: 'Daltonganj',
    village: 'Satbarwa',
    category: 'Drought & Water Crisis',
    status: 'Government Validated',
    assignedHEI: 'Birsa Agricultural University (BAU), Ranchi',
    assignedDept: 'Department of Agricultural Engineering & Water Tech',
    summary: 'Successive erratic rainfall causing 78% tube well drying. Farmers face severe crop loss requiring low-cost soil moisture IoT network.',
    urgencyScore: 8.4,
    priorityScore: 84,
    populationAffected: '5,200 Farmers',
    infrastructureRisk: 'Groundwater table dropped 14 meters, reservoir drying',
    aiReasoning: 'High socio-economic vulnerability. Optimal for localized solar drip scheduling and aquifer recharge modeling.',
    needsHumanVerification: false,
    lastUpdated: '1 hour ago',
  },
  {
    reportId: 'CH-JH-2026-0817',
    title: 'Hazaribagh Wildlife Corridor Human-Elephant Conflict Early Warning',
    district: 'Hazaribagh',
    block: 'Barkagaon',
    village: 'Urimari Border',
    category: 'Wildlife Conflict & Forestry',
    status: 'In Progress',
    assignedHEI: 'Birsa Institute of Technology (BIT Mesra), Ranchi',
    assignedDept: 'Department of Remote Sensing & Geoinformatics',
    summary: 'Migratory elephant herd incursions during harvest cycle resulting in crop damage and human casualty risk along forest fringes.',
    urgencyScore: 8.8,
    priorityScore: 88,
    populationAffected: '2,100 Villagers',
    infrastructureRisk: 'Village boundary fencing damage, solar streetlamp destruction',
    aiReasoning: 'Predictive acoustic and thermal PIR sensor tripwires integrated with automated SMS broadcast to local forest guards and PRIs.',
    needsHumanVerification: false,
    lastUpdated: '3 hours ago',
  },
  {
    reportId: 'CH-JH-2026-0818',
    title: 'East Singhbhum Subarnarekha River Industrial Effluent Monitoring',
    district: 'East Singhbhum',
    block: 'Ghatshila',
    village: 'Mouhanda',
    category: 'Water Quality & Environment',
    status: 'Government Validated',
    assignedHEI: 'National Institute of Technology (NIT), Jamshedpur',
    assignedDept: 'Department of Civil & Environmental Engineering',
    summary: 'Downstream pH anomalies and heavy metal run-off detected affecting downstream drinking water filtration intake points.',
    urgencyScore: 8.1,
    priorityScore: 81,
    populationAffected: '8,400 Beneficiaries',
    infrastructureRisk: 'Municipal water intake contamination, aquatic habitat loss',
    aiReasoning: 'Continuous spectro-photometric water sensing probe deployment matched with NIT Jamshedpur Water Tech Lab.',
    needsHumanVerification: false,
    lastUpdated: '5 hours ago',
  },
  {
    reportId: 'CH-JH-2026-0819',
    title: 'Bokaro Thermal Power Plant Fly Ash Dispersion Early Alert',
    district: 'Bokaro',
    block: 'Bermo',
    village: 'Jaridih',
    category: 'Air Quality & Industrial Hazard',
    status: 'Resolved',
    assignedHEI: 'IIT (ISM) Dhanbad',
    assignedDept: 'Department of Environmental Science & Engineering',
    summary: 'High particulate PM2.5/PM10 spikes during thermal inversion mitigated through AI misting canon automation pilot.',
    urgencyScore: 7.9,
    priorityScore: 79,
    populationAffected: '11,000 Citizens',
    infrastructureRisk: 'Respiratory health hazards, school playground visibility drop',
    aiReasoning: 'Pilot successful. IoT PM2.5 triggers automated misting towers when air quality index drops below 220.',
    needsHumanVerification: false,
    lastUpdated: '1 day ago',
  },
];

export const GovPortal: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const [challenges, setChallenges] = useState<GovChallengeItem[]>(() => {
    const saved = localStorage.getItem('nivaaran_gov_challenges');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CHALLENGES;
      }
    }
    return INITIAL_CHALLENGES;
  });

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [allocatingChallenge, setAllocatingChallenge] = useState<GovChallengeItem | null>(null);
  const [evidenceRequestChallenge, setEvidenceRequestChallenge] = useState<GovChallengeItem | null>(null);
  const [deepDiveChallenge, setDeepDiveChallenge] = useState<GovChallengeItem | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [certificateData, setCertificateData] = useState<{
    recipientName: string;
    institutionName: string;
    projectTitle: string;
    voucherCode: string;
    issueDate: string;
    role: string;
  }>({
    recipientName: 'Dr. Alok Sharma & Student Research Team',
    institutionName: 'Birsa Institute of Technology (BIT Mesra), Ranchi',
    projectTitle: 'Ranchi School Flood Risk Triage & IoT Early Warning System',
    voucherCode: 'JH-HEI-REWARD-9482',
    issueDate: '28th August 2026',
    role: 'Societal Challenge Innovator & Lead Researcher',
  });

  // Allocation Form State
  const [selectedUniId, setSelectedUniId] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [sanctionNote, setSanctionNote] = useState<string>('');

  // Evidence Request Form State
  const [evidenceNotes, setEvidenceNotes] = useState<string>('Please upload high-resolution geotagged drone/field imagery and signed PRI Gram Panchayat verification form.');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nivaaran_gov_challenges', JSON.stringify(challenges));
  }, [challenges]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Metrics computation
  const pendingTriageCount = challenges.filter(c => c.status === 'Under Review').length;
  const validatedCount = challenges.filter(c => c.status === 'Government Validated').length;
  const universityActiveCount = challenges.filter(c => c.status === 'In Progress').length;
  const resolvedCount = challenges.filter(c => c.status === 'Resolved').length;

  // Filtered challenges
  const filteredChallenges = challenges.filter((item) => {
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'Under Review' && item.status !== 'Under Review') return false;
      if (selectedStatus === 'Government Validated' && item.status !== 'Government Validated') return false;
      if (selectedStatus === 'In Progress' && item.status !== 'In Progress') return false;
      if (selectedStatus === 'Resolved' && item.status !== 'Resolved') return false;
    }
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedDistrict !== 'ALL' && item.district !== selectedDistrict) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = item.title.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.reportId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Open Allocation Modal
  const handleOpenAllocation = (challenge: GovChallengeItem) => {
    const matches = rankUniversitiesForChallenge(challenge);
    const topMatch = matches[0];
    setAllocatingChallenge({ ...challenge, matchedHEIs: matches });
    if (topMatch) {
      setSelectedUniId(topMatch.university.id);
      setSelectedDeptId(topMatch.recommendedDepartment?.id || topMatch.university.departments[0]?.id || '');
    }
    setSanctionNote(`Sanction approved by State Department of Higher & Technical Education under SIH Societal R&D Scheme. Priority tier allocated.`);
  };

  // Confirm University Allocation
  const handleConfirmAllocation = () => {
    if (!allocatingChallenge || !selectedUniId) return;
    const selectedUni = JHARKHAND_UNIVERSITIES.find(u => u.id === selectedUniId);
    const selectedDept = selectedUni?.departments.find(d => d.id === selectedDeptId);

    const updated = challenges.map((item) => {
      if (item.reportId === allocatingChallenge.reportId) {
        return {
          ...item,
          status: 'In Progress' as const,
          assignedHEI: selectedUni?.name || 'Selected University',
          assignedDept: selectedDept?.name || 'Multidisciplinary Engineering Department',
          needsHumanVerification: false,
          lastUpdated: 'Just now',
        };
      }
      return item;
    });

    setChallenges(updated);
    showToast(`✅ Successfully validated & routed "${allocatingChallenge.title}" to ${selectedUni?.shortName || 'University'}!`);
    setAllocatingChallenge(null);
  };

  // Confirm Evidence Request
  const handleConfirmEvidenceRequest = () => {
    if (!evidenceRequestChallenge) return;
    const updated = challenges.map((item) => {
      if (item.reportId === evidenceRequestChallenge.reportId) {
        return {
          ...item,
          status: 'Under Review' as const,
          summary: `${item.summary} [Officer Note: ${evidenceNotes}]`,
          lastUpdated: 'Just now',
        };
      }
      return item;
    });

    setChallenges(updated);
    showToast(`📋 Evidence request dispatched to field PRI officers for #${evidenceRequestChallenge.reportId}.`);
    setEvidenceRequestChallenge(null);
  };

  // Simulate new incoming citizen report
  const handleSimulateReport = () => {
    const randomIncidents: GovChallengeItem[] = [
      {
        reportId: `CH-JH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'West Singhbhum Gua Iron Ore Tailings Dam Overflow Alert',
        district: 'West Singhbhum',
        block: 'Noamundi',
        village: 'Gua Basti',
        category: 'Mining Subsidence & Fire',
        status: 'Under Review',
        summary: 'Monsoon saturation of red mud slurry tailings pond creates acute collapse hazard for adjacent 300 tribal households.',
        urgencyScore: 9.6,
        priorityScore: 96,
        populationAffected: '1,800 Villagers',
        infrastructureRisk: 'Slurry breach into Karo river tributary',
        aiReasoning: 'Emergency geotechnical risk. Urgent drone LiDAR and structural embankment sensor matching required.',
        needsHumanVerification: true,
        lastUpdated: 'Just now',
      },
      {
        reportId: `CH-JH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Deoghar Babadham Pilgrimage Heatwave & Water Hydration Hotspot',
        district: 'Deoghar',
        block: 'Deoghar Urban',
        village: 'Shivganga Ghat',
        category: 'Infrastructure & Public Safety',
        status: 'Under Review',
        summary: 'Severe summer heat stress and dehydration queues detected along 4km pilgrim queuing route.',
        urgencyScore: 8.6,
        priorityScore: 86,
        populationAffected: '25,000 Daily Devotees',
        infrastructureRisk: 'Crowd surge hazard under extreme 44°C ambient temperatures',
        aiReasoning: 'Smart IoT misting fans and automated real-time water kiosk telemetry match recommended.',
        needsHumanVerification: true,
        lastUpdated: 'Just now',
      }
    ];

    const newReport = randomIncidents[Math.floor(Math.random() * randomIncidents.length)];
    setChallenges([newReport, ...challenges]);
    showToast(`🚨 New Live Incident Triage Ingested: "${newReport.title}" (${newReport.district} District)!`);
  };

  // Calculate Category Breakdown for Charts
  const categoryCounts: Record<string, number> = {};
  challenges.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  // Calculate District Urgency for Charts
  const districtData: Record<string, { count: number; avgUrgency: number; totalScore: number }> = {};
  challenges.forEach(c => {
    if (!districtData[c.district]) {
      districtData[c.district] = { count: 0, avgUrgency: 0, totalScore: 0 };
    }
    districtData[c.district].count += 1;
    districtData[c.district].totalScore += c.urgencyScore;
  });
  Object.keys(districtData).forEach(d => {
    districtData[d].avgUrgency = Number((districtData[d].totalScore / districtData[d].count).toFixed(1));
  });

  // Distinct categories and districts for filtering
  const allCategories = ['ALL', ...Array.from(new Set(challenges.map(c => c.category)))];
  const allDistricts = ['ALL', ...Array.from(new Set(challenges.map(c => c.district)))];

  return (
    <div className="min-h-screen bg-nivaaran-bg flex flex-col font-sans">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16293F] text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/30 flex items-center space-x-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="bg-[#16293F] text-white px-6 py-4 border-b border-nivaaran-border shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nivaaran-accent rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-md">
              🏛️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold">Government Officer Portal</h1>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                  SIH 26043 Triage Console
                </span>
              </div>
              <p className="text-xs text-nivaaran-muted">Department of Higher & Technical Education, Government of Jharkhand</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSimulateReport}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Citizen Report</span>
            </button>

            <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg text-nivaaran-bg font-medium">
              {currentUser?.displayName || 'State Nodal Officer'}
            </span>

            <button 
              onClick={logout} 
              className="text-xs bg-nivaaran-danger hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 space-y-6">
        
        {/* Title & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-nivaaran-primary flex items-center">
              <span>State Challenge Triage & Validation</span>
              <span className="ml-3 text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                Live Sync Active
              </span>
            </h2>
            <p className="text-sm text-nivaaran-text-secondary mt-0.5">
              Review AI problem priority scores, validate reports, and allocate to matched Jharkhand Universities with multidisciplinary teams.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                setChallenges(INITIAL_CHALLENGES);
                showToast('State challenge queue reset to original benchmark data.');
              }}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-nivaaran-border rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
              title="Reload initial seed datasets"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Data</span>
            </button>

            <button 
              onClick={() => {
                const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(challenges, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", jsonContent);
                downloadAnchor.setAttribute("download", `nivaaran_triage_export_${Date.now()}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
                showToast('Exported state challenge dataset (JSON).');
              }}
              className="px-3 py-2 bg-nivaaran-primary hover:bg-nivaaran-primary-hover text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Triage Report</span>
            </button>

            <button 
              onClick={() => {
                setCertificateData({
                  recipientName: 'Dr. Alok Sharma & BIT Mesra Multidisciplinary Team',
                  institutionName: 'Birsa Institute of Technology (BIT Mesra), Ranchi',
                  projectTitle: 'Ranchi School Flood Risk Triage & IoT Early Warning System',
                  voucherCode: 'JH-HEI-REWARD-9482',
                  issueDate: '28th August 2026',
                  role: 'Societal Challenge Innovator & Lead Researcher',
                });
                setIsCertificateOpen(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Award className="w-3.5 h-3.5 text-amber-200" />
              <span>Official R&D Certificate</span>
            </button>
          </div>
        </div>

        {/* 4 Key KPI Metrics Cards (Interactive Filter) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button 
            onClick={() => setSelectedStatus(selectedStatus === 'Under Review' ? 'ALL' : 'Under Review')}
            className={`text-left p-5 rounded-xl border transition-all shadow-sm ${
              selectedStatus === 'Under Review' 
                ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/40' 
                : 'bg-white border-nivaaran-border hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-nivaaran-text-secondary font-bold uppercase tracking-wider">Pending Triage</span>
              <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg"><Clock className="w-4 h-4" /></span>
            </div>
            <p className="text-3xl font-extrabold text-amber-600 mt-2">{pendingTriageCount}</p>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center">
              <span>Requires validation review</span>
              <ChevronRight className="w-3 h-3 ml-auto text-amber-500" />
            </p>
          </button>

          <button 
            onClick={() => setSelectedStatus(selectedStatus === 'Government Validated' ? 'ALL' : 'Government Validated')}
            className={`text-left p-5 rounded-xl border transition-all shadow-sm ${
              selectedStatus === 'Government Validated' 
                ? 'bg-teal-50/80 border-teal-400 ring-2 ring-teal-400/40' 
                : 'bg-white border-nivaaran-border hover:border-teal-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-nivaaran-text-secondary font-bold uppercase tracking-wider">Validated & Prioritized</span>
              <span className="p-1.5 bg-teal-100 text-teal-700 rounded-lg"><ShieldCheck className="w-4 h-4" /></span>
            </div>
            <p className="text-3xl font-extrabold text-nivaaran-secondary mt-2">{validatedCount}</p>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center">
              <span>Ready for university routing</span>
              <ChevronRight className="w-3 h-3 ml-auto text-teal-500" />
            </p>
          </button>

          <button 
            onClick={() => setSelectedStatus(selectedStatus === 'In Progress' ? 'ALL' : 'In Progress')}
            className={`text-left p-5 rounded-xl border transition-all shadow-sm ${
              selectedStatus === 'In Progress' 
                ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/40' 
                : 'bg-white border-nivaaran-border hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-nivaaran-text-secondary font-bold uppercase tracking-wider">University Active</span>
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg"><Building2 className="w-4 h-4" /></span>
            </div>
            <p className="text-3xl font-extrabold text-blue-700 mt-2">{universityActiveCount}</p>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center">
              <span>Multidisciplinary R&D active</span>
              <ChevronRight className="w-3 h-3 ml-auto text-blue-500" />
            </p>
          </button>

          <button 
            onClick={() => setSelectedStatus(selectedStatus === 'Resolved' ? 'ALL' : 'Resolved')}
            className={`text-left p-5 rounded-xl border transition-all shadow-sm ${
              selectedStatus === 'Resolved' 
                ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/40' 
                : 'bg-white border-nivaaran-border hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-nivaaran-text-secondary font-bold uppercase tracking-wider">Verified Social Impact</span>
              <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg"><CheckCircle2 className="w-4 h-4" /></span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">{resolvedCount}</p>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center">
              <span>Field deployment successful</span>
              <ChevronRight className="w-3 h-3 ml-auto text-emerald-500" />
            </p>
          </button>

        </div>

        {/* Visual Charts & State Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Disaster & Challenge Domain Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nivaaran-border">
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-nivaaran-secondary" />
                <h3 className="font-bold text-sm text-nivaaran-primary">Domain & Disaster Breakdown</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">{challenges.length} Total Cases</span>
            </div>

            <div className="space-y-3 pt-1">
              {Object.entries(categoryCounts).map(([category, count]) => {
                const percentage = Math.round((count / challenges.length) * 100);
                const isSelected = selectedCategory === category;
                return (
                  <div 
                    key={category}
                    onClick={() => setSelectedCategory(isSelected ? 'ALL' : category)}
                    className={`cursor-pointer p-2 rounded-lg transition-all ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span className="truncate pr-2">{category}</span>
                      <span className="text-slate-600 shrink-0 font-mono">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          category.includes('Flood') ? 'bg-blue-500' :
                          category.includes('Mining') ? 'bg-amber-600' :
                          category.includes('Drought') ? 'bg-orange-500' :
                          category.includes('Wildlife') ? 'bg-emerald-600' :
                          category.includes('Water') ? 'bg-cyan-600' : 'bg-purple-600'
                        }`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedCategory !== 'ALL' && (
              <button 
                onClick={() => setSelectedCategory('ALL')}
                className="w-full text-center text-xs text-blue-600 hover:underline pt-2 font-medium"
              >
                Clear category filter (Show All)
              </button>
            )}
          </div>

          {/* Chart 2: District Urgency & Severity Index */}
          <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nivaaran-border">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-nivaaran-accent" />
                <h3 className="font-bold text-sm text-nivaaran-primary">District Urgency Severity Heatmap</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Avg Severity</span>
            </div>

            <div className="space-y-2.5 pt-1">
              {Object.entries(districtData).map(([district, data]) => {
                const isSelected = selectedDistrict === district;
                return (
                  <div 
                    key={district}
                    onClick={() => setSelectedDistrict(isSelected ? 'ALL' : district)}
                    className={`cursor-pointer p-2 rounded-lg transition-all ${isSelected ? 'bg-amber-50 border border-amber-200' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-800 flex items-center">
                        <MapPin className="w-3 h-3 text-red-500 mr-1" />
                        {district} District
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        data.avgUrgency >= 9.0 ? 'bg-red-100 text-red-700' :
                        data.avgUrgency >= 8.0 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {data.avgUrgency} / 10 Urgency
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          data.avgUrgency >= 9.0 ? 'bg-red-500' :
                          data.avgUrgency >= 8.0 ? 'bg-amber-500' : 'bg-blue-500'
                        }`} 
                        style={{ width: `${(data.avgUrgency / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedDistrict !== 'ALL' && (
              <button 
                onClick={() => setSelectedDistrict('ALL')}
                className="w-full text-center text-xs text-amber-600 hover:underline pt-2 font-medium"
              >
                Clear district filter (Show All)
              </button>
            )}
          </div>

          {/* Chart 3: 16-Stage Lifecycle Pipeline Funnel */}
          <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nivaaran-border">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-nivaaran-primary">16-Stage Lifecycle Flow</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Pipeline Status</span>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center font-semibold text-slate-800">
                  <span>1. Ingestion & AI Triage (Stages 1-5)</span>
                  <span className="font-bold text-amber-600">{pendingTriageCount} In Triage</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Automated NLP categorization & GIS geotag validation</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center font-semibold text-slate-800">
                  <span>2. HEI Matching & Allocation (Stages 6-8)</span>
                  <span className="font-bold text-teal-600">{validatedCount} Validated</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Deterministic 4-factor capability and lab matching</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center font-semibold text-slate-800">
                  <span>3. Prototype & Field Pilot (Stages 9-13)</span>
                  <span className="font-bold text-blue-600">{universityActiveCount} Active R&D</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Faculty mentorship, IoT lab testbeds & field trials</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center font-semibold text-slate-800">
                  <span>4. Deployment & Verified Impact (Stages 14-16)</span>
                  <span className="font-bold text-emerald-600">{resolvedCount} Verified</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Government audit signoff, citizen feedback & telemetry</p>
              </div>

            </div>
          </div>

        </div>

        {/* Flagship Disaster Challenge Review Banner (Featured Case) */}
        {challenges.length > 0 && challenges[0].status === 'Under Review' && (
          <div className="bg-gradient-to-r from-slate-900 to-[#16293F] text-white p-6 rounded-xl border border-slate-700 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700 gap-2">
              <h3 className="font-bold text-white flex items-center text-base">
                <ShieldCheck className="w-5 h-5 mr-2 text-emerald-400" /> 
                <span>Flagship Disaster Challenge Review</span>
              </h3>
              <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 font-bold px-3 py-1 rounded-full self-start sm:self-auto">
                High Urgency Score: {challenges[0].urgencyScore}/10
              </span>
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-bold text-white">
                    {challenges[0].title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                    <span>📍 {challenges[0].village}, {challenges[0].block} Block ({challenges[0].district} District)</span>
                    <span>•</span>
                    <span>👥 {challenges[0].populationAffected}</span>
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-400/20 text-amber-300 text-xs font-semibold rounded-lg border border-amber-400/30 shrink-0">
                  {challenges[0].category}
                </span>
              </div>

              <p className="text-xs text-slate-300 bg-black/20 p-3 rounded-lg border border-white/5">
                <strong className="text-emerald-400">AI Recommendation:</strong> {challenges[0].aiReasoning}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button 
                  onClick={() => handleOpenAllocation(challenges[0])}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> 
                  Approve Validation & Route to University
                </button>
                
                <button 
                  onClick={() => setEvidenceRequestChallenge(challenges[0])}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 transition-colors flex items-center"
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  Request Additional Evidence
                </button>

                <button 
                  onClick={() => setDeepDiveChallenge(challenges[0])}
                  className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 font-semibold text-xs rounded-lg border border-blue-400/30 transition-colors ml-auto"
                >
                  View Full AI Triage Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-nivaaran-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by title, district, report ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-nivaaran-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nivaaran-primary bg-slate-50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status filter dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-nivaaran-border rounded-lg bg-white font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses ({challenges.length})</option>
              <option value="Under Review">Pending Triage ({pendingTriageCount})</option>
              <option value="Government Validated">Validated & Prioritized ({validatedCount})</option>
              <option value="In Progress">University Active ({universityActiveCount})</option>
              <option value="Resolved">Resolved ({resolvedCount})</option>
            </select>

            {/* Category filter dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs border border-nivaaran-border rounded-lg bg-white font-medium text-slate-700 focus:outline-none"
            >
              {allCategories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>

            {/* District filter dropdown */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2 text-xs border border-nivaaran-border rounded-lg bg-white font-medium text-slate-700 focus:outline-none"
            >
              {allDistricts.map(d => (
                <option key={d} value={d}>{d === 'ALL' ? 'All Districts' : `${d} District`}</option>
              ))}
            </select>

            {/* Reset Filters button */}
            {(selectedStatus !== 'ALL' || selectedCategory !== 'ALL' || selectedDistrict !== 'ALL' || searchQuery) && (
              <button 
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSelectedCategory('ALL');
                  setSelectedDistrict('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-red-600 hover:underline px-2 py-1 font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>

        </div>

        {/* State Challenge Triage Queue List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-nivaaran-primary flex items-center">
              <span>Active Challenge Triage Queue</span>
              <span className="ml-2 text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                {filteredChallenges.length} cases shown
              </span>
            </h3>
          </div>

          {filteredChallenges.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-nivaaran-border space-y-3">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-700">No challenges match your selected filters.</h4>
              <p className="text-xs text-slate-500">Try adjusting your search query, status, or district filters.</p>
              <button 
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSelectedCategory('ALL');
                  setSelectedDistrict('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-nivaaran-primary text-white rounded-lg text-xs font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChallenges.map((challenge) => {
                const isUnderReview = challenge.status === 'Under Review';
                const isValidated = challenge.status === 'Government Validated';
                const isInProgress = challenge.status === 'In Progress';

                return (
                  <div 
                    key={challenge.reportId}
                    className="bg-white p-5 rounded-xl border border-nivaaran-border hover:border-slate-300 shadow-sm transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          #{challenge.reportId}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isUnderReview ? 'bg-amber-100 text-amber-800' :
                          isValidated ? 'bg-teal-100 text-teal-800' :
                          isInProgress ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {challenge.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {challenge.category}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          challenge.urgencyScore >= 9.0 ? 'bg-red-50 text-red-700 border border-red-200' :
                          challenge.urgencyScore >= 8.0 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          Urgency: {challenge.urgencyScore}/10
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-nivaaran-primary hover:text-blue-700 transition-colors">
                        {challenge.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {challenge.summary}
                      </p>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 text-red-500 mr-1" />
                        {challenge.village}, {challenge.block}, {challenge.district} District
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 text-slate-400 mr-1" />
                        Affected: {challenge.populationAffected}
                      </span>
                      {challenge.assignedHEI && (
                        <>
                          <span>•</span>
                          <span className="flex items-center font-semibold text-blue-700">
                            <Building2 className="w-3 h-3 text-blue-600 mr-1" />
                            Allocated: {challenge.assignedHEI}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-2">
                        {isUnderReview && (
                          <>
                            <button
                              onClick={() => handleOpenAllocation(challenge)}
                              className="px-3 py-1.5 bg-nivaaran-secondary hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Approve & Allocate HEI
                            </button>
                            <button
                              onClick={() => setEvidenceRequestChallenge(challenge)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition-colors"
                            >
                              Request Evidence
                            </button>
                          </>
                        )}

                        {isValidated && (
                          <button
                            onClick={() => handleOpenAllocation(challenge)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center shadow-sm"
                          >
                            <Building2 className="w-3.5 h-3.5 mr-1" />
                            Route to University R&D
                          </button>
                        )}

                        {isInProgress && (
                          <>
                            <button
                              onClick={() => {
                                const updated = challenges.map(c => c.reportId === challenge.reportId ? { ...c, status: 'Resolved' as const, lastUpdated: 'Just now' } : c);
                                setChallenges(updated);
                                showToast(`🎉 Verified final social impact & closed #${challenge.reportId}!`);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Verify Final Social Impact
                            </button>
                            <button
                              onClick={() => {
                                setCertificateData({
                                  recipientName: currentUser?.displayName || 'Dr. Alok Sharma & Research Team',
                                  institutionName: challenge.assignedHEI || 'Birsa Institute of Technology (BIT Mesra), Ranchi',
                                  projectTitle: challenge.title,
                                  voucherCode: 'JH-HEI-REWARD-9482',
                                  issueDate: '28th August 2026',
                                  role: 'Societal Challenge Innovator & Lead Researcher',
                                });
                                setIsCertificateOpen(true);
                              }}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs rounded-lg transition-colors flex items-center shadow-sm"
                            >
                              <Award className="w-3.5 h-3.5 mr-1 text-amber-700" />
                              Certificate
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => setDeepDiveChallenge(challenge)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                      >
                        <span>Full AI Triage Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </main>

      {/* MODAL 1: HEI Matching & Allocation Modal */}
      {allocatingChallenge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-fade-in my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-nivaaran-primary">
                    State HEI Capability Matching & Allocation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Allocating Challenge #{allocatingChallenge.reportId}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setAllocatingChallenge(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Challenge Mini Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                {allocatingChallenge.category}
              </span>
              <h4 className="font-bold text-sm text-slate-900 pt-1">
                {allocatingChallenge.title}
              </h4>
              <p className="text-xs text-slate-600">
                📍 {allocatingChallenge.village}, {allocatingChallenge.block} ({allocatingChallenge.district} District)
              </p>
            </div>

            {/* AI Ranked Recommendations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
                  Deterministic HEI Capability Ranking (Top Matches):
                </label>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {allocatingChallenge.matchedHEIs?.map((match, idx) => {
                  const isSelected = selectedUniId === match.university.id;
                  return (
                    <div 
                      key={match.university.id}
                      onClick={() => {
                        setSelectedUniId(match.university.id);
                        setSelectedDeptId(match.recommendedDepartment?.id || match.university.departments[0]?.id || '');
                      }}
                      className={`cursor-pointer p-3 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/30' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-900">
                            {match.university.name}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          {match.matchScore}% Match
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 mt-1.5 pl-7 space-y-0.5">
                        <p className="font-medium text-blue-700">
                          Recommended Dept: {match.recommendedDepartment?.name || 'Multidisciplinary Engineering'}
                        </p>
                        {match.matchingReasons.map((r, i) => (
                          <p key={i} className="text-slate-500 text-[10px]">• {r}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Selection */}
            {selectedUniId && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900">
                  Target Department / Research Lab:
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {JHARKHAND_UNIVERSITIES.find(u => u.id === selectedUniId)?.departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} (Code: {d.code})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Official Sanction Note */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900">
                Official Sanction Order & Directives:
              </label>
              <textarea
                rows={2}
                value={sanctionNote}
                onChange={(e) => setSanctionNote(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAllocatingChallenge(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAllocation}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-md transition-colors flex items-center"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Confirm University Allocation
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Evidence Request Modal */}
      {evidenceRequestChallenge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-base text-nivaaran-primary flex items-center">
                <FileText className="w-5 h-5 text-amber-500 mr-2" />
                Request Field Evidence from Submitter
              </h3>
              <button 
                onClick={() => setEvidenceRequestChallenge(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Specify what additional physical evidence or drone telemetry is required before formal validation:
            </p>

            <textarea
              rows={4}
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
              className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setEvidenceRequestChallenge(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEvidenceRequest}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Dispatch Request Notice
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: Full AI Triage Deep Dive Modal */}
      {deepDiveChallenge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-fade-in my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase">
                  #{deepDiveChallenge.reportId}
                </span>
                <h3 className="font-bold text-base text-nivaaran-primary mt-1">
                  {deepDiveChallenge.title}
                </h3>
              </div>
              <button 
                onClick={() => setDeepDiveChallenge(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Location Coordinates</span>
                <span className="font-semibold text-slate-900">{deepDiveChallenge.village}, {deepDiveChallenge.block} ({deepDiveChallenge.district})</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Severity Urgency Score</span>
                <span className="font-bold text-red-600 font-mono text-sm">{deepDiveChallenge.urgencyScore} / 10.0</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Population Impact</span>
                <span className="font-semibold text-slate-900">{deepDiveChallenge.populationAffected}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Infrastructure Vulnerability</span>
                <span className="font-semibold text-slate-900">{deepDiveChallenge.infrastructureRisk}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1.5">
              <span className="font-bold text-emerald-900 flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                AI Triage Diagnostic Rationale:
              </span>
              <p className="text-emerald-800 leading-relaxed">
                {deepDiveChallenge.aiReasoning}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeepDiveChallenge(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg"
              >
                Close Diagnostic View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Official Government of Jharkhand Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        recipientName={certificateData.recipientName}
        institutionName={certificateData.institutionName}
        projectTitle={certificateData.projectTitle}
        voucherCode={certificateData.voucherCode}
        issueDate={certificateData.issueDate}
        role={certificateData.role}
      />

    </div>
  );
};
