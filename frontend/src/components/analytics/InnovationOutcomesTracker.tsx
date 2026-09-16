import React, { useState } from 'react';
import { 
  Lightbulb, Award, Rocket, FileCheck, ExternalLink, 
  Plus, Download, Printer, X, CheckCircle2, ShieldCheck, 
  Building2
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

import { ChallengeDoc } from '../../services/firebaseService';

export interface InnovationOutcomesTrackerProps {
  userRole?: 'gov' | 'university' | 'industry';
  defaultHEI?: string;
  activeChallenge?: ChallengeDoc | null;
}

export const InnovationOutcomesTracker: React.FC<InnovationOutcomesTrackerProps> = ({
  userRole: _userRole,
  defaultHEI = 'BIT Mesra',
  activeChallenge,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'patents' | 'startups' | 'transfers'>('all');
  const [patents, setPatents] = useState<PatentRecord[]>(SEED_PATENTS);
  const [startups] = useState<StartupRecord[]>(SEED_STARTUPS);
  const [transfers] = useState<TechTransferRecord[]>(SEED_TRANSFERS);
  const [showAddModal, setShowAddModal] = useState(false);

  const effectivePatents = React.useMemo(() => {
    if (!activeChallenge) return patents;
    const hasMatch = patents.some(p => p.challengeReportId === activeChallenge.reportId || p.title === activeChallenge.title);
    if (hasMatch) return patents;

    const isAgri = /agri|lac|kusum|crop|tree/i.test(activeChallenge.title + ' ' + (activeChallenge.summary || ''));
    const isMining = /mine|mining|coal/i.test(activeChallenge.title + ' ' + (activeChallenge.summary || ''));

    const dynamicPatent: PatentRecord = {
      id: `PAT-${activeChallenge.reportId}`,
      applicationNumber: `2026310${Math.floor(10000 + Math.random() * 90000)} (IPO Kolkata)`,
      title: isAgri
        ? 'Eco Friendly Botanical Nanofluid Formulation & Canopy Telemetry for Kusum Tree Lac Protection'
        : isMining
        ? 'Geotechnical Borehole Thermal Venting & Subsidence Telemetry Sensor Core'
        : `Autonomous Low Power Civic Early Warning Telemetry Node: ${activeChallenge.title}`,
      hei: defaultHEI,
      department: isAgri ? 'Department of Agricultural Entomology and Agro Forestry' : isMining ? 'Department of Mining Engineering' : 'Department of Electronics and Communication',
      inventors: ['Faculty Research Lead', 'Student Project Lead', 'Field Technical Officer'],
      filingDate: '12 March 2026',
      status: 'Provisional Filed',
      domain: isAgri ? 'Agro Forestry and Tribal Livelihoods' : isMining ? 'Mining Safety' : 'Civic Disaster Telemetry',
      challengeReportId: activeChallenge.reportId,
      abstract: `Provisional patent docket generated following Stage 11 to 13 prototyping, lab calibration and field trial in ${activeChallenge.district} district.`,
    };

    return [dynamicPatent, ...patents];
  }, [patents, activeChallenge, defaultHEI]);

  const effectiveStartups = React.useMemo(() => {
    if (!activeChallenge) return startups;
    const hasMatch = startups.some(s => s.derivedChallengeId === activeChallenge.reportId);
    if (hasMatch) return startups;

    const isAgri = /agri|lac|kusum|crop|tree/i.test(activeChallenge.title + ' ' + (activeChallenge.summary || ''));

    const dynamicStartup: StartupRecord = {
      id: `ST-${activeChallenge.reportId}`,
      name: isAgri ? 'Jharkhand LacTech BioSolutions' : `${defaultHEI.split(' ')[0]} CivicTech Innovations`,
      incubator: isAgri ? 'Agri Business Incubation Centre, Birsa Agricultural University' : `Technology Business Incubator, ${defaultHEI}`,
      foundingTeam: ['Lead Student Researcher', 'Co-Founder Technical Lead'],
      incorporationYear: '2026',
      domain: isAgri ? 'Agri Biotechnology & Organic Pest Defense' : 'Civic Disaster Automation',
      valuationOrFunding: '₹15,00,000 DST NIDHI PRAYAS Grant',
      stage: 'Prototype Deployed',
      derivedChallengeId: activeChallenge.reportId,
      description: `Student founded deep tech venture incubated to scale solutions for ${activeChallenge.title}.`,
    };

    return [dynamicStartup, ...startups];
  }, [startups, activeChallenge, defaultHEI]);

  // Selected records for official modals
  const [viewingTransfer, setViewingTransfer] = useState<TechTransferRecord | null>(null);
  const [viewingPatent, setViewingPatent] = useState<PatentRecord | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

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

  const handleDownloadTransferDoc = (tt: TechTransferRecord) => {
    const docText = [
      "==========================================================================",
      "OFFICIAL MEMORANDUM OF TECHNOLOGY TRANSFER & INDUSTRIAL COMMERCIALIZATION",
      "GOVERNMENT OF JHARKHAND : DEPARTMENT OF HIGHER & TECHNICAL EDUCATION",
      "==========================================================================",
      `Agreement Docket ID: ${tt.id}`,
      `Technology: ${tt.technologyTitle}`,
      `Originating Institute: ${tt.originatingHEI}`,
      `Industry Licensee Partner: ${tt.industryLicensee}`,
      `License Classification: ${tt.transferType}`,
      `Commercial & Royalty Terms: ${tt.royaltyOrGrant}`,
      `Execution Date: ${tt.agreementDate}`,
      `Sign-off Statutory Body: ${tt.signoffAuthority}`,
      "",
      "TERMS OF TECHNOLOGY COMMERCIALIZATION:",
      "1. The originating HEI grants non-exclusive deployment rights to the industry partner.",
      "2. Field installations must service designated rural Gram Panchayats across Jharkhand.",
      "3. 70% of ongoing commercial royalties shall be credited directly to the student innovator research pool.",
      "4. Compliant with Government Financial Rules (GFR 2017) and Startup India Guidelines.",
      "",
      "Digitally Certified by Director of Technical Education, Govt of Jharkhand.",
      "SHA-256 Audit Hash: 0x88B12C44901EEA820194881A2D09FE",
      "==========================================================================",
    ].join('\n');

    const blob = new Blob([docText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Tech_Transfer_Agreement_${tt.id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice(`Agreement ${tt.id} downloaded successfully.`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  const handleDownloadPatentDoc = (p: PatentRecord) => {
    const docText = [
      "==========================================================================",
      "PATENT APPLICATION FORM 1 (FIRST SCHEDULE)",
      "INDIAN PATENT OFFICE (IPO), GOVERNMENT OF INDIA",
      "==========================================================================",
      `Application Number: ${p.applicationNumber}`,
      `Title of Invention: ${p.title}`,
      `Applicant Institute: ${p.hei}`,
      `Academic Department: ${p.department}`,
      `Inventors Roster: ${p.inventors.join(', ')}`,
      `Official Filing Date: ${p.filingDate}`,
      `Statutory Status: ${p.status}`,
      `Technical Domain: ${p.domain}`,
      `Linked Civic Docket: ${p.challengeReportId}`,
      "",
      "ABSTRACT & DISCLOSURE OF INVENTION:",
      p.abstract,
      "",
      "Certified as verified under Jharkhand State Innovation & IP Gateway.",
      "Controller General of Patents, Designs and Trade Marks Reference: IN-IP-2026-JH",
      "==========================================================================",
    ].join('\n');

    const blob = new Blob([docText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Patent_Form1_${p.id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice(`Patent filing docket for ${p.applicationNumber} downloaded.`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Download Alert Notice */}
      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
          <button onClick={() => setDownloadNotice(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Active Problem Innovation & IP Docket Banner */}
      {activeChallenge && (
        <div className="bg-gradient-to-r from-[#FDFBF7] via-[#F7F2E8] to-[#EFE7D8] border-2 border-[#D8C7B0] p-5 rounded-2xl shadow-xs space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#2C6E49] text-white px-2.5 py-0.5 rounded-full">
                {activeChallenge.reportId}
              </span>
              <span className="text-xs font-black text-[#201C18] uppercase tracking-wider">
                Active Problem Innovation & IP Docket
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#2C6E49] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              {defaultHEI} · {activeChallenge.district}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-black text-[#201C18]">{activeChallenge.title}</h3>
            <p className="text-xs text-[#5C5549] mt-1 line-clamp-2">{activeChallenge.summary}</p>
          </div>
          <div className="flex items-center gap-4 pt-2 border-t border-[#D8C7B0] text-[11px] text-[#5C5549] flex-wrap">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2C6E49]" />
              Provisional Patent Status: <strong className="text-[#2C6E49]">Draft Filed (IPO Kolkata)</strong>
            </span>
            <span>·</span>
            <span>Incubator: <strong className="text-[#201C18]">Agri Business Incubation Centre</strong></span>
          </div>
        </div>
      )}

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
              <span>DeepTech Startups</span>
              <Rocket className="w-4 h-4 text-[#C98A2C]" />
            </div>
            <p className="text-2xl font-black text-[#201C18] font-heading mt-1">{startups.length}</p>
            <p className="text-[10px] text-[#C98A2C] font-bold">Active in State Incubators</p>
          </div>

          <div className="bg-white border border-[#E4DDD1] p-3.5 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-[#6A6155] text-[11px] font-semibold">
              <span>Tech Transfers</span>
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-[#201C18] font-heading mt-1">{transfers.length}</p>
            <p className="text-[10px] text-blue-700 font-bold">Corporate Licensors Active</p>
          </div>

          <div className="bg-white border border-[#E4DDD1] p-3.5 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-[#6A6155] text-[11px] font-semibold">
              <span>Committed Grants</span>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-[#201C18] font-heading mt-1">₹84.5 L</p>
            <p className="text-[10px] text-purple-700 font-bold">R&D & Royalty Outlay</p>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1.5 border-b border-[#E4DDD1] pb-2 text-xs">
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
          IPO Patents ({patents.length})
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
            <span className="text-[11px] text-[#8A7F72] font-semibold">{effectivePatents.length} filings recorded</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {effectivePatents.map((p) => (
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
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
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
                    onClick={() => setViewingPatent(p)}
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
            <span className="text-[11px] text-[#8A7F72] font-semibold">{effectiveStartups.length} ventures active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {effectiveStartups.map((st) => (
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
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
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
              <FileCheck className="w-3.5 h-3.5 text-[#2C6E49]" />
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
                    onClick={() => setViewingTransfer(tt)}
                    className="px-3 py-2 rounded-xl bg-[#FAF8F4] hover:bg-[#EAE4D8] text-[#201C18] border border-[#E4DDD1] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="View & Download Official Transfer Memorandum"
                  >
                    <Download className="w-3.5 h-3.5 text-[#2C6E49]" />
                    <span>Transfer Memo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Tech Transfer Agreement Memorandum Modal */}
      {viewingTransfer && (
        <div className="fixed inset-0 z-[350] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#D5CDBF] overflow-hidden flex flex-col my-4 max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full">
            
            {/* Header : Hidden in Print */}
            <div className="bg-[#1C2C24] text-white px-6 py-4 flex items-center justify-between print:hidden border-b border-[#2C4236]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#A3E635]" />
                <h3 className="font-black text-sm">Official Technology Commercialization Memorandum</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadTransferDoc(viewingTransfer)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/10 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#A3E635]" />
                  <span>Download Text Docket</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Agreement (PDF)</span>
                </button>
                <button
                  onClick={() => setViewingTransfer(null)}
                  className="p-1 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-6 sm:p-8 space-y-5 text-xs text-[#201C18] overflow-y-auto print:overflow-visible">
              
              {/* Document Header */}
              <div className="border-b-2 border-[#201C18] pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#5A5247]">GOVERNMENT OF JHARKHAND</span>
                  <h2 className="text-base font-black font-heading text-[#201C18]">DEPARTMENT OF HIGHER & TECHNICAL EDUCATION</h2>
                  <p className="text-xs font-bold text-[#2C6E49]">State Intellectual Property & University Commercialization Directorate</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#8A7F72] block">MEMORANDUM REF:</span>
                  <span className="font-mono text-xs font-black text-[#201C18]">{viewingTransfer.id}-EXEC-2026</span>
                  <span className="text-[10px] text-[#5A5247] block">Signed: {viewingTransfer.agreementDate}</span>
                </div>
              </div>

              {/* Title & Terms Card */}
              <div className="bg-[#FAF8F4] border border-[#E4DDD1] p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-black uppercase text-[#2C6E49] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {viewingTransfer.transferType}
                </span>
                <h3 className="text-sm font-black text-[#201C18]">{viewingTransfer.technologyTitle}</h3>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#E4DDD1]">
                  <div>
                    <span className="text-[#8A7F72] block">Originating HEI Research Team:</span>
                    <strong className="text-[#201C18]">{viewingTransfer.originatingHEI}</strong>
                  </div>
                  <div>
                    <span className="text-[#8A7F72] block">Industrial CSR / Licensee Partner:</span>
                    <strong className="text-[#201C18]">{viewingTransfer.industryLicensee}</strong>
                  </div>
                </div>
              </div>

              {/* Financial & Royalty Structure */}
              <div className="border border-[#E4DDD1] rounded-xl p-4 bg-white space-y-2">
                <span className="text-[10px] font-black uppercase text-[#5A5247] block tracking-wider">
                  Commercial Royalty & Fabrication Outlay Structure
                </span>
                <div className="text-sm font-black text-[#2C6E49] font-mono">
                  {viewingTransfer.royaltyOrGrant}
                </div>
                <p className="text-[11px] text-[#6A6155] leading-relaxed">
                  The commercialization grant is disbursed in accordance with GFR 2017 norms to fund continuous manufacturing of field prototypes, testbed calibrations, and long-term community maintenance across 82 target Gram Panchayats.
                </p>
              </div>

              {/* Statutory Sign-off Details */}
              <div className="border-t border-[#E4DDD1] pt-4 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-[#8A7F72] block">Approving Authority:</span>
                  <strong className="text-[#201C18]">{viewingTransfer.signoffAuthority}</strong>
                  <span className="text-[9px] font-mono text-[#2C6E49] block">Status: Legally Executed on State Blockchain</span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[#2C6E49] font-bold justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>GFR 2017 Certified</span>
                  </div>
                  <span className="text-[9px] font-mono text-[#8A7F72]">SHA: 0x88B12C44901EEA82019488</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#FAF8F4] border-t border-[#E4DDD1] px-6 py-3 flex justify-end print:hidden">
              <button
                onClick={() => setViewingTransfer(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#2C6E49] hover:bg-[#23583a] rounded-xl cursor-pointer"
              >
                Close Memorandum
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Official IPO Patent Application Form 1 Modal */}
      {viewingPatent && (
        <div className="fixed inset-0 z-[350] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#D5CDBF] overflow-hidden flex flex-col my-4 max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full">
            
            {/* Header : Hidden in Print */}
            <div className="bg-[#1C2C24] text-white px-6 py-4 flex items-center justify-between print:hidden border-b border-[#2C4236]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#A3E635]" />
                <h3 className="font-black text-sm">Indian Patent Office (IPO) Form 1 Application</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPatentDoc(viewingPatent)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/10 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#A3E635]" />
                  <span>Download Filing Docket</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Form 1 (PDF)</span>
                </button>
                <button
                  onClick={() => setViewingPatent(null)}
                  className="p-1 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-6 sm:p-8 space-y-5 text-xs text-[#201C18] overflow-y-auto print:overflow-visible">
              
              {/* IPO Header */}
              <div className="border-b-2 border-[#201C18] pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#5A5247]">THE PATENTS ACT 1970 (39 OF 1970)</span>
                  <h2 className="text-base font-black font-heading text-[#201C18]">PATENT APPLICATION FORM 1 (RULE 8)</h2>
                  <p className="text-xs font-bold text-[#2C6E49]">Controller General of Patents, Designs & Trade Marks (IPO Kolkata)</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#8A7F72] block">APPLICATION NUMBER:</span>
                  <span className="font-mono text-xs font-black text-[#201C18]">{viewingPatent.applicationNumber}</span>
                  <span className="text-[10px] text-[#5A5247] block">Date: {viewingPatent.filingDate}</span>
                </div>
              </div>

              {/* Title & Status */}
              <div className="bg-[#FAF8F4] border border-[#E4DDD1] p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] font-black uppercase text-[#2C6E49] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Status: {viewingPatent.status}
                </span>
                <h3 className="text-sm font-black text-[#201C18]">{viewingPatent.title}</h3>
                <p className="text-[11px] text-[#5A5247]">Domain: <strong>{viewingPatent.domain}</strong> • Linked Challenge: <strong className="font-mono text-[#2C6E49]">{viewingPatent.challengeReportId}</strong></p>
              </div>

              {/* Applicant & Inventors Roster */}
              <div className="grid grid-cols-2 gap-3 text-[11px] border border-[#E4DDD1] p-3.5 rounded-xl bg-white">
                <div>
                  <span className="text-[#8A7F72] block font-bold">Applicant Institution:</span>
                  <strong className="text-[#201C18]">{viewingPatent.hei}</strong>
                  <span className="text-[10px] text-[#5A5247] block">{viewingPatent.department}</span>
                </div>
                <div>
                  <span className="text-[#8A7F72] block font-bold">Registered Inventors:</span>
                  <strong className="text-[#201C18]">{viewingPatent.inventors.join(', ')}</strong>
                </div>
              </div>

              {/* Abstract */}
              <div className="border border-[#E4DDD1] rounded-xl p-4 bg-white space-y-1.5">
                <span className="text-[10px] font-black uppercase text-[#5A5247] block tracking-wider">
                  Technical Abstract & Novelty Claims (Section 10)
                </span>
                <p className="text-xs text-[#4A433B] leading-relaxed">
                  {viewingPatent.abstract}
                </p>
              </div>

              {/* Statutory Sign-off */}
              <div className="border-t border-[#E4DDD1] pt-3 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-[#8A7F72]">Filing Registry: Kolkata Patent Office (Eastern Zone)</span>
                  <span className="text-[9px] font-mono text-[#2C6E49] block">IP India Digital Application Hash: 0x948201AB9894220</span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[#2C6E49] font-bold justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>IPO Verified</span>
                  </div>
                  <span className="text-[9px] text-[#8A7F72]">Digitally Endorsed by GoJ R&D Cell</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#FAF8F4] border-t border-[#E4DDD1] px-6 py-3 flex justify-end print:hidden">
              <button
                onClick={() => setViewingPatent(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#2C6E49] hover:bg-[#23583a] rounded-xl cursor-pointer"
              >
                Close Form 1
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Patent Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[350] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4DDD1] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 text-left">
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
