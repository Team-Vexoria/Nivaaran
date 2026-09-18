import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Pause, Play, Eye, ArrowRight, Search, 
  MapPin, Building2, Award, ShieldAlert, Cpu,
  Activity, CheckCircle2
} from 'lucide-react';

export interface HeroShowcaseSlideshowProps {
  onOpenAuth: () => void;
  onOpenTracking: (reportId?: string) => void;
  onNavigatePortal?: (portal: string) => void;
  liveStats?: {
    verifiedDistricts: number;
    verificationRate: number;
    total: number;
    resolved: number;
  };
}

interface CaseStudySlide {
  id: string;
  reportId: string;
  tabLabel: string;
  district: string;
  locationName: string;
  category: string;
  stageName: string;
  stageColor: string;
  problem: {
    title: string;
    description: string;
    image: string;
    severityBadge: string;
    keyMetric: string;
  };
  solution: {
    title: string;
    description: string;
    image: string;
    statusBadge: string;
    heiLead: string;
    csrPartner: string;
    grantAmount: string;
  };
}

const CASE_STUDIES: CaseStudySlide[] = [
  {
    id: 'CASE-01',
    reportId: 'JH-2026-DHN-002',
    tabLabel: 'Jharia Coalfire',
    district: 'Dhanbad',
    locationName: 'Lodna Colliery, Jharia Coalfield',
    category: 'Subterranean Coalfire & Ground Subsidence',
    stageName: 'Stage 11: Prototype Active',
    stageColor: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
    problem: {
      title: 'Subterranean Coalfire & 1.2m Subsidence Fissures',
      description: 'Underground coal seam combustion venting carbon monoxide and sulfur dioxide at 56°C ground temperature. Structural sinkholes threaten 3,400 colliery township residents.',
      image: '/images/showcase/jharia-coalfield.jpg',
      severityBadge: '🔴 CRITICAL INDUSTRIAL HAZARD',
      keyMetric: '56°C Ground Temp · 3,400 Residents at Risk',
    },
    solution: {
      title: 'Subsurface Seismograph & Borehole DTS Telemetry',
      description: 'IIT (ISM) Dhanbad deployed Kinemetrics seismic telemetry and fiber-optic Distributed Temperature Sensing (DTS) in deep boreholes, triggering automatic nitrogen foam slurry suppression.',
      image: '/images/showcase/jharia-solution.jpg',
      statusBadge: '🚀 PROTOTYPE ACTIVE',
      heiLead: 'IIT (ISM) Dhanbad (Rock Mechanics & Safety Lab)',
      csrPartner: 'BCCL CSR Foundation',
      grantAmount: '₹6.5 Lakhs Grant',
    },
  },
  {
    id: 'CASE-02',
    reportId: 'JH-2026-GRD-004',
    tabLabel: 'Giridih Water',
    district: 'Giridih',
    locationName: 'Tisri Block (Lokai & Baramasia)',
    category: 'Drinking Water Quality & Toxic Contamination',
    stageName: 'Stage 11: Prototype Active',
    stageColor: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
    problem: {
      title: 'Handpump Arsenic (8x WHO) & Fluoride Toxicity',
      description: 'Aquifer hydrogeological tests revealed arsenic at 0.08 mg/L and fluoride at 3.6 mg/L across 42 handpumps. Over 6,200 Santhal villagers suffering dental/skeletal fluorosis and skin lesions.',
      image: '/images/showcase/giridih-handpump.jpg',
      severityBadge: '🔴 CRITICAL HEALTH RISK',
      keyMetric: '0.08 mg/L Arsenic · 6,200 Villagers Impacted',
    },
    solution: {
      title: 'Zero-Power FeOOH Nanoadsorbent Filter Retrofit',
      description: 'Zero-power dual-cylinder ceramic and graphene/iron-oxide filtration unit clamped directly onto manual handpumps, removing >98% of arsenic and fluoride with zero electric grid requirement.',
      image: '/images/showcase/giridih-solution.jpg',
      statusBadge: '🔬 LAB PROTO TESTING',
      heiLead: 'IIT (ISM) Dhanbad (Environmental Engineering)',
      csrPartner: 'Tata Steel Foundation',
      grantAmount: '₹5.2 Lakhs Grant',
    },
  },
  {
    id: 'CASE-03',
    reportId: 'JH-2026-PLM-005',
    tabLabel: 'Palamu Drought',
    district: 'Palamu',
    locationName: 'Chhatarpur Block (Mahugawan)',
    category: 'Rain-Shadow Drought & Aquifer Drawdown',
    stageName: 'Stage 12: Panchayat Field Trial',
    stageColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
    problem: {
      title: '45-Day Monsoon Deficit & Sub-42m Water Table Collapse',
      description: 'Severe rain-shadow drought led to total aquifer drawdown across 1,800 hectares of paddy land. Deep community tubewells dried up, leaving 940 tribal farming families with zero irrigation.',
      image: '/images/showcase/palamu-drought.jpg',
      severityBadge: '🟠 SEVERE AGRICULTURAL CRISIS',
      keyMetric: 'Water Table >42m Deep · 1,800 Hectares Wilted',
    },
    solution: {
      title: 'Solar LoRa Piezometers & Automated Precision Drip',
      description: 'Birsa Agricultural University deployed LoRa deep-aquifer piezometers and MultiSense soil tension transmitters to automate low-pressure micro-drip emitters, cutting water usage by 72%.',
      image: '/images/showcase/palamu-solution.jpg',
      statusBadge: '🌾 PILOT ACTIVE',
      heiLead: 'Birsa Agricultural University (BAU Ranchi)',
      csrPartner: 'NTPC Rural Energy Fund',
      grantAmount: '₹4.8 Lakhs Grant',
    },
  },
  {
    id: 'CASE-04',
    reportId: 'JH-2026-RNC-001',
    tabLabel: 'Kanke Flooding',
    district: 'Ranchi',
    locationName: 'Hutup Panchayat, Kanke Block',
    category: 'Monsoon Infrastructure & Road Cutoff',
    stageName: 'Stage 14: Deployed & Resolved',
    stageColor: 'bg-green-500/10 text-green-700 border-green-500/30',
    problem: {
      title: 'Kanke Spillway Overflow Inundating School Road (3.5ft)',
      description: 'Storm backwater accumulation in Hutup Panchayat submerged the main arterial access road under 3.5ft of stagnant runoff, cutting off 450 students from Government High School Hutup.',
      image: '/images/showcase/kanke-flood.jpg',
      severityBadge: '🟠 CIVIC ACCESS SEVERED',
      keyMetric: '3.5ft Deep Waterlogging · 450 Students Cut Off',
    },
    solution: {
      title: 'Solar Radar Telemetry & Automated Flood Pumping',
      description: 'BIT Mesra deployed an autonomous solar millimeter-wave water level radar with self-priming siphon pumps and automated sluice gates, keeping the school route completely clear 24/7.',
      image: '/images/showcase/kanke-solution.jpg',
      statusBadge: '✅ SOLVED & DEPLOYED',
      heiLead: 'BIT Mesra (Civil & IoT Engineering Lab)',
      csrPartner: 'Central Coalfields Ltd (CCL CSR)',
      grantAmount: '₹4.5 Lakhs Grant',
    },
  },
  {
    id: 'CASE-05',
    reportId: 'JH-2026-LTH-006',
    tabLabel: 'Betla Elephants',
    district: 'Latehar',
    locationName: 'Barwadih Block (Betla Buffer Zone)',
    category: 'Wildlife Migration & Agrarian Conflict',
    stageName: 'Stage 11: Prototype Active',
    stageColor: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30',
    problem: {
      title: 'Corridor Fragmentation & Nocturnal Crop Raiding',
      description: 'Displaced by railway barrier works, a herd of 16 Asiatic elephants entered agricultural settlements nightly. 120 farming families lost ₹22 Lakhs of standing paddy crops in a single season.',
      image: '/images/showcase/betla-elephants.jpg',
      severityBadge: '🟠 HUMAN-WILDLIFE CONFLICT',
      keyMetric: '16 Elephants in Farmland · ₹22L Crops Damaged',
    },
    solution: {
      title: 'Buried Seismic Geophone Grid & Early Warning Mast',
      description: 'BIT Sindri deployed buried solar seismic geophones to detect pachyderm footstep tremors 800m away, auto-alerting villagers via SMS/IVR and activating non-harmful acoustic deterrents.',
      image: '/images/showcase/betla-solution.jpg',
      statusBadge: '🐘 FIELD PROTOTYPE',
      heiLead: 'BIT Sindri (Forestry & Wildlife IoT Lab)',
      csrPartner: 'Jharkhand Forest Dev & Adani CSR',
      grantAmount: '₹4.2 Lakhs Grant',
    },
  },
];

const AUTO_PLAY_INTERVAL_MS = 6000;

export const HeroShowcaseSlideshow: React.FC<HeroShowcaseSlideshowProps> = ({
  onOpenAuth,
  onOpenTracking,
  liveStats = { verifiedDistricts: 24, verificationRate: 94, total: 1284, resolved: 860 },
}) => {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [trackInput, setTrackInput] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = 1 + CASE_STUDIES.length; // Slide 0 = Overview, Slides 1-5 = Cases

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, AUTO_PLAY_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides, activeSlide]);

  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenTracking(trackInput.trim() || 'JH-2026-RNC-001');
  };

  const activeCase = activeSlide > 0 ? CASE_STUDIES[activeSlide - 1] : null;

  return (
    <section 
      aria-label="NIVAARAN Showcase Carousel"
      className="relative w-full bg-[#FAF8F4] text-[#201C18] border-b border-[#E4DDD1] overflow-hidden py-4 sm:py-6 px-3 sm:px-6"
    >
      {/* Subtle National Ribbon at Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2C6E49] via-[#C98A2C] to-[#B5502D]" />

      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Top Controls Bar: Play/Pause Toggle & Next/Prev Navigation */}
        <div className="flex items-center justify-end gap-1.5 pt-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="p-1.5 rounded-lg bg-white border border-[#E4DDD1] text-[#6A6155] hover:text-[#201C18] hover:bg-[#F3EDE2] text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title={isPaused ? 'Resume Slideshow' : 'Pause Slideshow'}
              aria-label={isPaused ? 'Resume Slideshow' : 'Pause Slideshow'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-700" /> : <Pause className="w-3.5 h-3.5" />}
              <span className="text-[10px] uppercase font-mono tracking-wider">{isPaused ? 'Paused' : 'Auto'}</span>
            </button>

            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-white border border-[#E4DDD1] text-[#6A6155] hover:text-[#201C18] hover:bg-[#F3EDE2] shadow-2xs transition-colors cursor-pointer"
              title="Previous Slide"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-white border border-[#E4DDD1] text-[#6A6155] hover:text-[#201C18] hover:bg-[#F3EDE2] shadow-2xs transition-colors cursor-pointer"
              title="Next Slide"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* SLIDE CONTENT AREA (Height-matched 16:9 responsive presentation stage) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div className="relative min-h-[500px] sm:min-h-[560px] lg:min-h-[580px] flex flex-col justify-center">

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* SLIDE 0: OFFICIAL INSTITUTIONAL IDENTITY CANVAS                   */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {activeSlide === 0 && (
            <div className="w-full space-y-4 animate-fadeIn">
              
              {/* Graphic Hero Card */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-[#E4DDD1] shadow-lg bg-white group">
                <img
                  src="/images/showcase/hero.jpeg"
                  alt="NIVAARAN - Jharkhand's Institutional Problem-to-Solution Engine (Government of Jharkhand & Government of India)"
                  className="w-full h-auto max-h-[380px] sm:max-h-[440px] md:max-h-[480px] object-cover sm:object-contain mx-auto transition-transform duration-700 group-hover:scale-[1.01]"
                  loading="eager"
                />

                {/* Floating "Next Slide" Interactive Cue */}
                <button
                  onClick={handleNext}
                  className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-slate-950/80 hover:bg-slate-900 text-amber-400 border border-amber-500/40 text-xs sm:text-sm font-extrabold px-3 sm:px-4 py-2 rounded-xl backdrop-blur-md shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Explore 5 Live Ground Cases</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* 4-Pillar Civic Metric Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-left">
                <div className="bg-white border border-[#E4DDD1] p-3 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between text-[#6A6155] text-[11px] font-semibold">
                    <span>Active Coverage</span>
                    <Activity className="w-3.5 h-3.5 text-[#2C6E49]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#201C18] font-heading mt-0.5">{liveStats.verifiedDistricts} / 24 Districts</p>
                  <p className="text-[10px] text-[#2C6E49] font-bold">100% State Coverage</p>
                </div>

                <div className="bg-white border border-[#E4DDD1] p-3 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between text-[#6A6155] text-[11px] font-semibold">
                    <span>Engineering Labs</span>
                    <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#201C18] font-heading mt-0.5">48+ HEI Labs</p>
                  <p className="text-[10px] text-emerald-800 font-bold">IIT, BIT, NIT & BAU</p>
                </div>

                <div className="bg-white border border-[#E4DDD1] p-3 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between text-[#6A6155] text-[11px] font-semibold">
                    <span>Verification Rate</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#201C18] font-heading mt-0.5">{liveStats.verificationRate}%</p>
                  <p className="text-[10px] text-emerald-700 font-bold">Geotagged & Audited</p>
                </div>

                <div className="bg-white border border-[#E4DDD1] p-3 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between text-[#6A6155] text-[11px] font-semibold">
                    <span>Resolution Time</span>
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#201C18] font-heading mt-0.5">14 Days</p>
                  <p className="text-[10px] text-amber-700 font-bold">Down from 180+ Days</p>
                </div>
              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* SLIDES 1 to 5: SPLIT METHOD A CASE STUDY CARDS                     */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {activeCase && (
            <div className="w-full space-y-3 animate-fadeIn">
              
              {/* Case Study Meta Header */}
              <div className="bg-white border border-[#E4DDD1] rounded-xl px-4 py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 font-mono text-xs font-bold text-[#2C6E49] bg-[#2C6E49]/10 px-2.5 py-0.5 rounded-md">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activeCase.district.toUpperCase()} · {activeCase.locationName}</span>
                  </span>
                  <span className="text-xs font-semibold text-[#6A6155]">
                    {activeCase.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${activeCase.stageColor}`}>
                    {activeCase.stageName}
                  </span>
                  <span className="font-mono text-[11px] text-[#8A7F72] font-semibold">
                    ID: {activeCase.reportId}
                  </span>
                </div>
              </div>

              {/* 50/50 Side-by-Side Split Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* ── LEFT CARD: THE GROUND PROBLEM ─────────────────────────── */}
                <div className="bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-sm flex flex-col hover:border-[#C4BDB0] transition-all group">
                  
                  {/* Image Zone (100% Unobstructed Photo) */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-900">
                    <img
                      src={activeCase.problem.image}
                      alt={activeCase.problem.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Floating Top Badge */}
                    <div className="absolute top-3 left-3 bg-red-600/90 text-white font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md backdrop-blur-xs shadow-md flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>{activeCase.problem.severityBadge}</span>
                    </div>

                    <div className="absolute bottom-2 left-2 bg-black/75 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                      {activeCase.problem.keyMetric}
                    </div>
                  </div>

                  {/* Caption Scorecard Below */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5 bg-gradient-to-b from-white to-[#FAF8F4]/80">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-red-700">
                        The Ground Problem
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold font-heading text-[#201C18] leading-snug">
                        {activeCase.problem.title}
                      </h3>
                      <p className="text-xs text-[#524B42] leading-relaxed line-clamp-3">
                        {activeCase.problem.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E4DDD1] text-[11px] font-semibold text-[#8A7F72] flex items-center justify-between">
                      <span>Source: Citizen & DC Ground Triage</span>
                      <span className="text-red-700 font-bold">Unresolved Prior to Intervention</span>
                    </div>
                  </div>
                </div>

                {/* ── RIGHT CARD: THE NIVAARAN INTERVENTION ─────────────────── */}
                <div className="bg-white border-2 border-emerald-600/30 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:border-emerald-600/60 transition-all group">
                  
                  {/* Image Zone (100% Unobstructed Photo) */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-900">
                    <img
                      src={activeCase.solution.image}
                      alt={activeCase.solution.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Floating Top Badge */}
                    <div className="absolute top-3 left-3 bg-[#2C6E49] text-white font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md backdrop-blur-xs shadow-md flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      <span>{activeCase.solution.statusBadge}</span>
                    </div>

                    <div className="absolute bottom-2 right-2 bg-emerald-950/85 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs font-bold">
                      {activeCase.solution.grantAmount}
                    </div>
                  </div>

                  {/* Caption Scorecard Below */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5 bg-gradient-to-b from-white to-emerald-50/40">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-[#2C6E49]">
                        Verified University & Government Intervention
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold font-heading text-[#201C18] leading-snug">
                        {activeCase.solution.title}
                      </h3>
                      <p className="text-xs text-[#524B42] leading-relaxed line-clamp-3">
                        {activeCase.solution.description}
                      </p>
                    </div>

                    {/* Stakeholder Pill Strip */}
                    <div className="pt-2 border-t border-[#E4DDD1] flex items-center justify-between text-[11px] flex-wrap gap-1">
                      <div className="flex items-center gap-1 text-[#2C6E49] font-bold">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{activeCase.solution.heiLead}</span>
                      </div>
                      <div className="text-[#6A6155] font-semibold text-[10px]">
                        {activeCase.solution.csrPartner}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Action Footer: Track Dossier Button */}
              <div className="bg-white border border-[#E4DDD1] rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
                <div className="text-xs text-[#524B42]">
                  <span className="font-bold text-[#201C18]">Audited Lifecycle:</span> Real-time telemetry, stage progression & panchayat signoff available for this challenge.
                </div>

                <button
                  onClick={() => onOpenTracking(activeCase.reportId)}
                  className="w-full sm:w-auto px-4 py-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-extrabold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect 16-Stage Audit Dossier ({activeCase.reportId})</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Integrated Interactive Action Bar and Live Search persistent across all slides */}
        <div className="bg-white border border-[#E4DDD1] rounded-xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={onOpenAuth}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#2C6E49] hover:bg-[#23583a] text-white font-extrabold text-xs sm:text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Report Problem</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenTracking('JH-2026-RNC-001')}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white hover:bg-[#F3EDE2] border border-[#E4DDD1] text-[#201C18] font-bold text-xs sm:text-sm rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              Track Challenge
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8A7F72] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Report ID (e.g. JH-2026-RNC-001)"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                className="w-full bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg pl-9 pr-3 py-2 text-xs text-[#201C18] focus:outline-none focus:border-[#2C6E49]"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-[#2C6E49] hover:bg-[#23583a] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* CAROUSEL NAVIGATION STRIP & PROGRESS LINE                             */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div className="space-y-2 pt-1">
          
          {/* Active Auto-Play Progress Bar */}
          <div className="w-full h-1 bg-[#E4DDD1] rounded-full overflow-hidden">
            <div
              key={activeSlide}
              className={`h-full bg-[#2C6E49] transition-all duration-300 ${isPaused ? 'opacity-40' : 'animate-progressFill'}`}
              style={{ animationDuration: `${AUTO_PLAY_INTERVAL_MS}ms` }}
            />
          </div>

          {/* 6 Clickable Slide Indicator Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            
            {/* Tab 0: Overview */}
            <button
              onClick={() => setActiveSlide(0)}
              className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                activeSlide === 0
                  ? 'bg-white border-[#2C6E49] shadow-xs text-[#201C18] font-bold'
                  : 'bg-white/60 hover:bg-white border-[#E4DDD1] text-[#6A6155]'
              }`}
            >
              <span className="text-[10px] font-mono block text-[#8A7F72]">01 · IDENTITY</span>
              <span className="text-xs font-extrabold truncate block">State Overview</span>
            </button>

            {/* Tabs 1 to 5: Cases */}
            {CASE_STUDIES.map((c, idx) => {
              const slideNum = idx + 1;
              const isSelected = activeSlide === slideNum;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveSlide(slideNum)}
                  className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#2C6E49] shadow-xs text-[#201C18] font-bold'
                      : 'bg-white/60 hover:bg-white border-[#E4DDD1] text-[#6A6155]'
                  }`}
                >
                  <span className="text-[10px] font-mono block text-[#8A7F72]">0{slideNum + 1} · {c.district}</span>
                  <span className="text-xs font-extrabold truncate block">{c.tabLabel}</span>
                </button>
              );
            })}

          </div>

        </div>

      </div>
    </section>
  );
};
