import React, { useState } from 'react';
import { 
  Lightbulb, Award, Rocket, FileCheck, ExternalLink, 
  Plus, Download, Sparkles 
} from 'lucide-react';

export interface PatentRecord {
  id: string;
  applicationNumber: string;
  title: string;
  hei: string;
  department: string;
  inventors: string[];
  filingDate: string;
  status: 'Provisional Filed' | 'Published' | 'Examination' | 'Granted';
  domain: string;
  challengeReportId: string;
  abstract: string;
}

export interface StartupRecord {
  id: string;
  name: string;
  incubator: string;
  foundingTeam: string[];
  incorporationYear: string;
  domain: string;
  valuationOrFunding: string;
  stage: 'Idea Validation' | 'Prototype Deployed' | 'Pre-Seed Funded' | 'Commercial Scaling';
  derivedChallengeId: string;
  description: string;
}

export interface TechTransferRecord {
  id: string;
  technologyTitle: string;
  originatingHEI: string;
  industryLicensee: string;
  transferType: 'Exclusive License' | 'Non-Exclusive License' | 'Public Good Open Hardware';
  royaltyOrGrant: string;
  agreementDate: string;
  signoffAuthority: string;
}

const SEED_PATENTS: PatentRecord[] = [
  {
    id: 'PAT-01',
    applicationNumber: '202631008492 (IPO Kolkata)',
    title: 'Solar Powered IoT Ultrasonic Hydro Early Warning Station with LoRaWAN Mesh',
    hei: 'BIT Mesra',
    department: 'Department of Electronics & Communication Engineering',
    inventors: ['Prof. Alok Sharma', 'Pooja Kumari', 'Rahul Verma'],
    filingDate: '14 January 2026',
    status: 'Published',
    domain: 'Water Resources & Disaster Telemetry',
    challengeReportId: 'JH-2026-RNC-001',
    abstract: 'Autonomous solar powered hydrostatic water level monitoring node operating on 865MHz sub-gigahertz ISM band with edge trigger anomaly detection for flash floods.',
  },
  {
    id: 'PAT-02',
    applicationNumber: '202631009114 (IPO Kolkata)',
    title: 'Low Cost Arsenic Phytoremediation Adsorption Core using Waste Slag and Biochar',
    hei: 'IIT (ISM) Dhanbad',
    department: 'Department of Environmental Science & Engineering',
    inventors: ['Dr. Ramesh Chandra', 'Aniket Sinha'],
    filingDate: '02 February 2026',
    status: 'Provisional Filed',
    domain: 'Public Health & Potable Water',
    challengeReportId: 'JH-2026-GRD-003',
    abstract: 'Novel filtration matrix utilizing high surface area metallurgical blast furnace slag composite for 99.4% arsenic ion sequestration in rural tube-wells.',
  },
  {
    id: 'PAT-03',
    applicationNumber: '202631009855 (IPO Kolkata)',
    title: 'Geotechnical Borehole Thermal Venting Cap with Catalytic Carbon Monoxide Oxidizer',
    hei: 'IIT (ISM) Dhanbad',
    department: 'Department of Mining Engineering',
    inventors: ['Prof. Sudhir Sen', 'Kavita Das'],
    filingDate: '18 February 2026',
    status: 'Examination',
    domain: 'Mining & Coalfire Safety',
    challengeReportId: 'JH-2026-DHN-002',
    abstract: 'Modular surface seal unit with passive honeycomb catalyst that converts noxious subsurface mine gases into harmless vapor before ambient atmosphere release.',
  },
  {
    id: 'PAT-04',
    applicationNumber: '202631010419 (IPO Kolkata)',
    title: 'Modular Siphon Check Dam Micro Hydro Assembly for Tribal Undulating Terrains',
    hei: 'Central University of Jharkhand',
    department: 'Centre for Water Engineering & Management',
    inventors: ['Dr. Manisha Munda', 'Bikash Oraon'],
    filingDate: '01 March 2026',
    status: 'Provisional Filed',
    domain: 'Irrigation & Rural Energy',
    challengeReportId: 'JH-2026-PLM-005',
    abstract: 'Rapid deployable bamboo composite gravity siphon system ensuring round the year micro check dam retention in drought prone plateau blocks.',
  },
];

const SEED_STARTUPS: StartupRecord[] = [
  {
    id: 'ST-01',
    name: 'HydroSense Jharkhand Pvt Ltd',
    incubator: 'Science & Technology Entrepreneurs Park (STEP), BIT Mesra',
    foundingTeam: ['Pooja Kumari (B.Tech ECE)', 'Sandeep Murmu (M.Tech)'],
    incorporationYear: '2026',
    domain: 'Civic IoT & River Basin Telemetry',
    valuationOrFunding: '₹25,00,000 Seed Grant (Startup Jharkhand)',
    stage: 'Prototype Deployed',
    derivedChallengeId: 'JH-2026-RNC-001',
    description: 'Indigenous IoT hardware manufacturing focused on flood sensors and panchayat level early warning sirens.',
  },
  {
    id: 'ST-02',
    name: 'GeoJharia Aerial Safety Labs',
    incubator: 'Centre for Innovation, Incubation & Entrepreneurship, IIT (ISM) Dhanbad',
    foundingTeam: ['Rohit Anand (Ph.D Mining)', 'Vikram Sahay'],
    incorporationYear: '2026',
    domain: 'Drone Thermal Mapping & Mine Subsidence',
    valuationOrFunding: '₹15,00,000 DST NIDHI PRAYAS Grant',
    stage: 'Pre-Seed Funded',
    derivedChallengeId: 'JH-2026-DHN-002',
    description: 'Thermal drone inspection and subsidence prediction analytics for colliery townships.',
  },
  {
    id: 'ST-03',
    name: 'Birsa Rural Bio-Solutions',
    incubator: 'Agri-Business Incubation Centre, Birsa Agricultural University',
    foundingTeam: ['Anita Soren (Ph.D Soil Science)', 'Dr. R. K. Jha'],
    incorporationYear: '2025',
    domain: 'Soil Remediation & Natural Water Purifiers',
    valuationOrFunding: '₹12,00,000 RKVY-RAFTAAR Seed',
    stage: 'Commercial Scaling',
    derivedChallengeId: 'JH-2026-GRD-003',
    description: 'Community scale biochar filtration units fabricated by local women self help groups.',
  },
];

const SEED_TRANSFERS: TechTransferRecord[] = [
  {
    id: 'TT-01',
    technologyTitle: 'LoRaWAN Flood Early Warning Station Architecture',
    originatingHEI: 'BIT Mesra',
    industryLicensee: 'Tata Steel CSR Foundation & Mecon Limited',
    transferType: 'Non-Exclusive License',
    royaltyOrGrant: '₹18,50,000 Fabrication Grant + 3% Ongoing Maintenance Royalty',
    agreementDate: '28 February 2026',
    signoffAuthority: 'Dept of Higher & Technical Education, GoJ',
  },
  {
    id: 'TT-02',
    technologyTitle: 'Blast Furnace Slag Arsenic Adsorption Biofilter',
    originatingHEI: 'IIT (ISM) Dhanbad',
    industryLicensee: 'Jindal Steel & Power CSR & Drinking Water Sanitation Dept',
    transferType: 'Public Good Open Hardware',
    royaltyOrGrant: '₹14,00,000 Demonstration Grant (Zero License Fee for Panchayats)',
    agreementDate: '06 March 2026',
    signoffAuthority: 'Jharkhand State Pollution Control Board',
  },
];

export interface InnovationOutcomesTrackerProps {
  userRole?: string;
  defaultHEI?: string;
}

export const InnovationOutcomesTracker: React.FC<InnovationOutcomesTrackerProps> = ({
  userRole: _userRole,
  defaultHEI = 'BIT Mesra',
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'patents' | 'startups' | 'transfers'>('all');
  const [patents, setPatents] = useState<PatentRecord[]>(SEED_PATENTS);
  const [startups] = useState<StartupRecord[]>(SEED_STARTUPS);
  const [transfers] = useState<TechTransferRecord[]>(SEED_TRANSFERS);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Patent Form State
  const [newTitle, setNewTitle] = useState('');
  const [newHEI, setNewHEI] = useState(defaultHEI);
  const [newDomain, setNewDomain] = useState('Clean Water & Sanitation');
  const [newInventors, setNewInventors] = useState('');
  const [newAbstract, setNewAbstract] = useState('');

  const handleCreatePatent = (e: React.FormEvent) => {
    e.preventDefault();
    const created: PatentRecord = {
      id: `PAT-0${patents.length + 1}`,
      applicationNumber: `2026310${Math.floor(10000 + Math.random() * 90000)} (IPO Kolkata)`,
      title: newTitle.trim() || 'Novel Indigenous Civic Technology Assembly',
      hei: newHEI,
      department: 'Faculty of Engineering & Technology',
      inventors: newInventors ? newInventors.split(',').map(s => s.trim()) : ['Lead University Researcher'],
      filingDate: 'Just now',
      status: 'Provisional Filed',
      domain: newDomain,
      challengeReportId: 'JH-2026-GEN-009',
      abstract: newAbstract.trim() || 'Intellectual property filed following successful field trial and Panchayati Raj validation.',
    };
    setPatents([created, ...patents]);
    setShowAddModal(false);
    setNewTitle('');
    setNewInventors('');
    setNewAbstract('');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Banner & KPI Strip */}
      <div className="bg-gradient-to-br from-[#2C6E49]/10 via-[#FAF8F4] to-[#C98A2C]/10 border border-[#E4DDD1] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#2C6E49] text-white rounded-lg">
                <Lightbulb className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-black font-heading text-[#201C18]">
                Innovation Outcomes & Intellectual Property Registry
              </h2>
              <span className="text-[10px] font-black uppercase bg-[#2C6E49]/10 text-[#2C6E49] px-2 py-0.5 rounded-full border border-[#2C6E49]/20">
                Gov Verified IP
              </span>
            </div>
            <p className="text-xs text-[#5A5247] leading-relaxed max-w-2xl">
              Official ledger of patents filed, deeptech startups incubated, and industrial technology transfer agreements originating from citizen reported challenges across Jharkhand.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#2C6E49] hover:bg-[#23583a] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Patent</span>
          </button>
        </div>

        {/* 4 Outcome Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="bg-white border border-[#E4DDD1] p-3.5 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-[#6A6155] text-[11px] font-semibold">
              <span>Patents Filed</span>
              <Award className="w-4 h-4 text-[#2C6E49]" />
            </div>
            <p className="text-2xl font-black text-[#201C18] font-heading mt-1">{patents.length}</p>
            <p className="text-[10px] text-[#2C6E49] font-bold">100% Indian Patent Office Filed</p>
          </div>

          <div className="bg-white border border-[#E4DDD1] p-3.5 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-[#6A6155] text-[11px] font-semibold">
              <span>Startups Incubated</span>
              <Rocket className="w-4 h-4 text-[#C98A2C]" />
            </div>
            <p className="text-2xl font-black text-[#201C18] font-heading mt-1">{startups.length}</p>
            <p className="text-[10px] text-[#C98A2C] font-bold">HEI Incubators in Ranchi & Dhanbad</p>
          </div>

          <div className="bg-white border border-[#E4DDD1] p-3.5 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-[#6A6155] text-[11px] font-semibold">
              <span>Tech Transfers</span>
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-[#201C18] font-heading mt-1">{transfers.length}</p>
            <p className="text-[10px] text-blue-700 font-bold">Tata Steel & JSP CSR Licensed</p>
          </div>

          <div className="bg-white border border-[#E4DDD1] p-3.5 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-[#6A6155] text-[11px] font-semibold">
              <span>Commercial Value</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-[#201C18] font-heading mt-1">₹69.5 L</p>
            <p className="text-[10px] text-purple-700 font-bold">Grants & Co-Financing Mobilized</p>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E4DDD1] pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#2C6E49] text-white shadow-2xs'
              : 'text-[#6A6155] hover:text-[#201C18] hover:bg-[#EAE4D8]'
          }`}
        >
          All Outcomes ({patents.length + startups.length + transfers.length})
        </button>

        <button
          onClick={() => setActiveTab('patents')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'patents'
              ? 'bg-[#2C6E49] text-white shadow-2xs'
              : 'text-[#6A6155] hover:text-[#201C18] hover:bg-[#EAE4D8]'
          }`}
        >
          Patents & IP Filings ({patents.length})
        </button>

        <button
          onClick={() => setActiveTab('startups')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'startups'
              ? 'bg-[#2C6E49] text-white shadow-2xs'
              : 'text-[#6A6155] hover:text-[#201C18] hover:bg-[#EAE4D8]'
          }`}
        >
          Incubated Startups ({startups.length})
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'transfers'
              ? 'bg-[#2C6E49] text-white shadow-2xs'
              : 'text-[#6A6155] hover:text-[#201C18] hover:bg-[#EAE4D8]'
          }`}
        >
          Technology Transfers ({transfers.length})
        </button>
      </div>

      {/* 1. PATENTS SECTION */}
      {(activeTab === 'all' || activeTab === 'patents') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#6A6155] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#2C6E49]" />
              <span>Patents Filed with Indian Patent Office (IPO)</span>
            </h3>
            <span className="text-[11px] text-[#8A7F72] font-semibold">{patents.length} filings recorded</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {patents.map((p) => (
              <div key={p.id} className="bg-white border border-[#E4DDD1] rounded-xl p-4 space-y-3 shadow-2xs hover:border-[#C4BDB0] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-[#8A7F72] block">
                      App No: {p.applicationNumber}
                    </span>
                    <h4 className="text-sm font-extrabold text-[#201C18] leading-snug">
                      {p.title}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 border ${
                    p.status === 'Published' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : p.status === 'Examination'
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <p className="text-xs text-[#5A5247] leading-relaxed line-clamp-2">
                  {p.abstract}
                </p>

                <div className="bg-[#FAF8F4] p-2.5 rounded-lg border border-[#E4DDD1]/80 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A7F72] font-medium">Originating HEI:</span>
                    <span className="font-bold text-[#201C18]">{p.hei}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A7F72] font-medium">Inventors:</span>
                    <span className="font-semibold text-[#4A433B] truncate max-w-[200px]">{p.inventors.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A7F72] font-medium">Linked Challenge:</span>
                    <span className="font-mono font-bold text-[#2C6E49]">{p.challengeReportId}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#E4DDD1]/60 text-[11px]">
                  <span className="text-[#8A7F72]">Filing Date: {p.filingDate}</span>
                  <button
                    type="button"
                    onClick={() => alert(`Patent Application Dossier (${p.applicationNumber}) verified under Department of Higher & Technical Education repository.`)}
                    className="text-[#2C6E49] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View IPO Filing Form 1</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. STARTUPS SECTION */}
      {(activeTab === 'all' || activeTab === 'startups') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#6A6155] flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5 text-[#C98A2C]" />
              <span>DeepTech Startups Incubated from Student Prototypes</span>
            </h3>
            <span className="text-[11px] text-[#8A7F72] font-semibold">{startups.length} ventures active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {startups.map((st) => (
              <div key={st.id} className="bg-white border border-[#E4DDD1] rounded-xl p-4 space-y-3 shadow-2xs hover:border-[#C4BDB0] transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-mono font-bold bg-[#FAF8F4] border border-[#E4DDD1] text-[#6A6155] px-1.5 py-0.2 rounded">
                        Inc. {st.incorporationYear}
                      </span>
                      <h4 className="text-sm font-black text-[#201C18] mt-1 font-heading">
                        {st.name}
                      </h4>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                      {st.stage}
                    </span>
                  </div>

                  <p className="text-xs text-[#5A5247] leading-relaxed">
                    {st.description}
                  </p>

                  <div className="bg-[#FAF8F4] p-2 rounded-lg border border-[#E4DDD1]/80 text-[11px] space-y-1">
                    <div className="text-[#8A7F72]">
                      <span className="font-semibold text-[#4A433B]">Incubator:</span> {st.incubator}
                    </div>
                    <div className="text-[#8A7F72]">
                      <span className="font-semibold text-[#4A433B]">Founders:</span> {st.foundingTeam.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E4DDD1]/60 flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-[#2C6E49]">{st.valuationOrFunding}</span>
                  <span className="font-mono text-[#8A7F72] text-[10px]">Challenge: {st.derivedChallengeId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TECHNOLOGY TRANSFERS */}
      {(activeTab === 'all' || activeTab === 'transfers') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#6A6155] flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Technology Transfer & Industrial Commercialization Agreements</span>
            </h3>
            <span className="text-[11px] text-[#8A7F72] font-semibold">{transfers.length} executed agreements</span>
          </div>

          <div className="space-y-2.5">
            {transfers.map((tt) => (
              <div key={tt.id} className="bg-white border border-[#E4DDD1] rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-[#201C18]">{tt.technologyTitle}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {tt.transferType}
                    </span>
                  </div>
                  <div className="text-xs text-[#5A5247] flex items-center gap-3 flex-wrap">
                    <span><strong>Originating HEI:</strong> {tt.originatingHEI}</span>
                    <span><strong>Industry Partner:</strong> {tt.industryLicensee}</span>
                    <span><strong>Signoff:</strong> {tt.signoffAuthority}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 self-end md:self-auto">
                  <div className="text-right">
                    <p className="text-xs font-black text-[#2C6E49]">{tt.royaltyOrGrant}</p>
                    <p className="text-[10px] text-[#8A7F72]">Signed {tt.agreementDate}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Technology Transfer Agreement ${tt.id} confirmed on State Blockchain Ledger.`)}
                    className="p-2 rounded-lg bg-[#FAF8F4] hover:bg-[#EAE4D8] text-[#201C18] border border-[#E4DDD1] text-xs font-bold transition-colors cursor-pointer"
                    title="Download Transfer Memorandum"
                  >
                    <Download className="w-4 h-4 text-[#2C6E49]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patent Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[350] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4DDD1] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#2C6E49]" />
                <h3 className="font-heading font-black text-sm text-[#201C18]">Register New Patent / IP Filing</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#8A7F72] hover:text-[#201C18] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePatent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4A433B] mb-1">Invention Title</label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous Arsenic Adsorption Bio-Core"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg p-2 text-xs focus:outline-none focus:border-[#2C6E49]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#4A433B] mb-1">Originating HEI</label>
                  <select
                    value={newHEI}
                    onChange={(e) => setNewHEI(e.target.value)}
                    className="w-full bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg p-2 text-xs focus:outline-none focus:border-[#2C6E49]"
                  >
                    <option value="BIT Mesra">BIT Mesra</option>
                    <option value="IIT (ISM) Dhanbad">IIT (ISM) Dhanbad</option>
                    <option value="NIT Jamshedpur">NIT Jamshedpur</option>
                    <option value="Central University of Jharkhand">Central University of Jharkhand</option>
                    <option value="Birsa Agricultural University">Birsa Agricultural University</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4A433B] mb-1">Domain</label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg p-2 text-xs focus:outline-none focus:border-[#2C6E49]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A433B] mb-1">Inventors (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="Prof. S. Sen, Rahul Verma, Pooja Kumari"
                  value={newInventors}
                  onChange={(e) => setNewInventors(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg p-2 text-xs focus:outline-none focus:border-[#2C6E49]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A433B] mb-1">Abstract & Novelty Statement</label>
                <textarea
                  rows={3}
                  placeholder="Summarize the core technical innovation, working prototype results, and civic societal utility..."
                  value={newAbstract}
                  onChange={(e) => setNewAbstract(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg p-2 text-xs focus:outline-none focus:border-[#2C6E49]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E4DDD1] text-[#6A6155] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#2C6E49] text-white font-bold hover:bg-[#23583a] shadow-xs"
                >
                  Save & Record Filing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
