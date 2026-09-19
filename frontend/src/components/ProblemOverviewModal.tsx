import React, { useState } from 'react';
import { 
  X, ShieldAlert, Sparkles, Target, Layers 
} from 'lucide-react';

interface ProblemOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProblemOverviewModal: React.FC<ProblemOverviewModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'problem' | 'idea' | 'architecture' | 'impact'>('problem');

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn text-left my-auto"
        onClick={e => e.stopPropagation()}
      >
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-[#FAF8F4] text-[#201C18] flex items-start justify-between border-b border-[#E4DDD1]">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                    State of Jharkhand Special Initiative
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black font-heading text-[#201C18]">
                  Problem Overview: The Nivaaran Framework
                </h2>
                <p className="text-xs sm:text-sm text-[#6A6155]">
                  Multimodal Crowdsourcing, AI Triage, HEI Capability Matching & CSR Co-Financing
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-[#6A6155] hover:text-[#201C18] rounded-xl hover:bg-[#EAE4D8] transition-colors shrink-0 cursor-pointer"
                title="Close modal"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveSection('problem')}
                className={`py-3 px-4 sm:px-6 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeSection === 'problem'
                    ? 'border-emerald-600 text-emerald-800 bg-white font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>1. Problem Statement</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('idea')}
                className={`py-3 px-4 sm:px-6 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeSection === 'idea'
                    ? 'border-emerald-600 text-emerald-800 bg-white font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>2. The Complete Idea</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('architecture')}
                className={`py-3 px-4 sm:px-6 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeSection === 'architecture'
                    ? 'border-emerald-600 text-emerald-800 bg-white font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>3. 16 Stage Architecture</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('impact')}
                className={`py-3 px-4 sm:px-6 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeSection === 'impact'
                    ? 'border-emerald-600 text-emerald-800 bg-white font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Target className="w-4 h-4 text-emerald-700" />
                <span>4. Ground Impact & Feasibility</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 text-slate-800">
              
              {/* SECTION 1: PROBLEM STATEMENT */}
              {activeSection === 'problem' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                      Official SIH Challenge Definition
                    </span>
                    <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                      "Develop an integrated statewide platform enabling citizens to report societal, environmental, and infrastructure challenges, while automatically connecting validated issues with Higher Education Institutions (HEIs) for engineering solutions and industries for CSR scaling."
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-extrabold font-heading text-slate-900">
                      Core Ground Realities in Jharkhand
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3.5 text-xs">
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                        <strong className="text-slate-900 block font-bold">1. Digital & Language Divide</strong>
                        <p className="text-slate-600 leading-relaxed">
                          Rural citizens cannot navigate complex forms or type in English. Nivaaran provides bilingual conversational voice intake in Hindi and English with automatic counter questioning for missing details.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                        <strong className="text-slate-900 block font-bold">2. Disconnected Academic R&D</strong>
                        <p className="text-slate-600 leading-relaxed">
                          Engineering colleges and universities often create theoretical academic papers instead of solving local community challenges like water toxicity, coalfire subsidence, or drought management.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                        <strong className="text-slate-900 block font-bold">3. Uncoordinated Industry CSR Funds</strong>
                        <p className="text-slate-600 leading-relaxed">
                          Corporates (Tata Steel, Coal India, Vedanta) have substantial CSR allocations but lack verified, government audited ground projects with guaranteed institutional engineering partners.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                        <strong className="text-slate-900 block font-bold">4. Absence of Lifecycle Telemetry</strong>
                        <p className="text-slate-600 leading-relaxed">
                          Complaints typically disappear into black boxes. Nivaaran provides end to end tracking across 16 transparent stages with public Report IDs and direct panchayat verification.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: THE COMPLETE IDEA */}
              {activeSection === 'idea' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <h3 className="text-base font-extrabold font-heading text-emerald-950">
                      The Nivaaran Quad Helix Ecosystem
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                      Nivaaran bridges four key pillars: Citizens, Government Administration, Higher Education Institutions (HEIs), and Industry/CSR partners in a unified, automated feedback loop.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <div className="w-9 h-9 mx-auto rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">1</div>
                      <h4 className="text-xs font-black text-slate-900">Citizen Reports</h4>
                      <p className="text-[11px] text-slate-600">Voice notes, photos, and geotagged incident reporting.</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <div className="w-9 h-9 mx-auto rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">2</div>
                      <h4 className="text-xs font-black text-slate-900">Govt Validation</h4>
                      <p className="text-[11px] text-slate-600">District Collectors verify and prioritize verified issues.</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <div className="w-9 h-9 mx-auto rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">3</div>
                      <h4 className="text-xs font-black text-slate-900">HEI R&D Teams</h4>
                      <p className="text-[11px] text-slate-600">Strict 80%+ capability match assigns top university labs.</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <div className="w-9 h-9 mx-auto rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">4</div>
                      <h4 className="text-xs font-black text-slate-900">CSR Scaling</h4>
                      <p className="text-[11px] text-slate-600">Industries co finance prototypes and statewide deployment.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <strong className="text-slate-900 font-bold block">Mathematical Priority Score Formula:</strong>
                    <div className="font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800">
                      Priority Score = (0.35 * Severity) + (0.25 * Affected Population) + (0.20 * Urgency) + (0.20 * Replicability)
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Only problems reaching strict threshold metrics advance into the Higher Education Institution matching queue.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 3: 16 STAGE ARCHITECTURE */}
              {activeSection === 'architecture' && (
                <div className="space-y-4 animate-fadeIn text-xs">
                  <h3 className="text-sm font-extrabold font-heading text-slate-900">
                    Comprehensive 16 Stage Autonomous Lifecycle
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {[
                      { num: 1, name: 'Submission', desc: 'Citizen inputs problem via voice, photo, or web.' },
                      { num: 2, name: 'AI Understanding & Triage', desc: 'Language detection, counter questioning, and category inference.' },
                      { num: 3, name: 'Deduplication / Clustering', desc: 'Vector clustering combines related regional incidents.' },
                      { num: 4, name: 'Prioritization', desc: 'Calculates mathematical impact score based on official criteria.' },
                      { num: 5, name: 'Government Validation', desc: 'District Nodal Officer confirms veracity and approves queueing.' },
                      { num: 6, name: 'Institution Matching', desc: 'AI filters universities with 80%+ capability match.' },
                      { num: 7, name: 'University Acceptance', desc: 'Academic mentor and department formally accept challenge.' },
                      { num: 8, name: 'Team Formation', desc: 'Students and faculty establish multidisciplinary lab cell.' },
                      { num: 9, name: 'Proposal Submission', desc: 'Technical specifications, budget, and milestone roadmap created.' },
                      { num: 10, name: 'Industry / CSR Collaboration', desc: 'CSR partners review proposal and pledge fabrication capital.' },
                      { num: 11, name: 'Prototype Development', desc: 'Hardware bench assembly and software testing in university lab.' },
                      { num: 12, name: 'Controlled Pilot Trial', desc: 'Real world field testing at affected panchayat or urban ward.' },
                      { num: 13, name: 'Technical & Community Audit', desc: 'Panchayat validation, water testing, and performance metrics.' },
                      { num: 14, name: 'Statewide Deployment', desc: 'Government clearance, vendor procurement, and rollout.' },
                      { num: 15, name: 'Impact Measurement', desc: 'Telemetry stations track long term resolution parameters.' },
                      { num: 16, name: 'Closure & Open Learning', desc: 'IP filing, public case study publishing, and citizen eco rewards.' },
                    ].map(st => (
                      <div key={st.num} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-start gap-2.5 shadow-2xs">
                        <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {st.num}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{st.name}</p>
                          <p className="text-[11px] text-slate-500">{st.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: GROUND IMPACT & FEASIBILITY */}
              {activeSection === 'impact' && (
                <div className="space-y-4 animate-fadeIn text-xs">
                  <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#E4DDD1] text-[#201C18] space-y-2">
                    <h3 className="text-base font-extrabold font-heading text-[#201C18]">
                      Verified Field Feasibility in 24 Districts
                    </h3>
                    <p className="text-xs text-[#6A6155]">
                      Tested against active Jharkhand state priority areas including Ranchi, Dhanbad, Bokaro, Giridih, and Palamu.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <strong className="text-emerald-800 font-bold block text-sm">₹42.8 Lakhs</strong>
                      <p className="text-slate-600 font-medium">Pre allocated CSR co financing from leading regional industrial leaders.</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <strong className="text-emerald-800 font-bold block text-sm">6 Premier HEIs</strong>
                      <p className="text-slate-600 font-medium">BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, Birsa Agricultural University, and more.</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <strong className="text-emerald-800 font-bold block text-sm">100% Traceable</strong>
                      <p className="text-slate-600 font-medium">Audit logs, cryptographic hashes, and live telemetry sensor feeds.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-amber-50/60 text-slate-700 space-y-1 text-xs">
                    <strong className="text-slate-900 font-bold block">Direct Citizen Incentives:</strong>
                    <p>
                      Every validated and resolved problem earns citizens Jharkhand Green Points redeemable for free native tree saplings at official district forestry nurseries.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                Click tabs above to inspect individual architecture layers.
              </span>

              <button
                type="button"
                onClick={onClose}
                className="ml-auto px-5 py-2.5 bg-[#C98A2C] hover:bg-[#b07824] text-white rounded-xl text-xs font-black transition-colors shadow-xs cursor-pointer"
              >
                Return to Prototype
              </button>
            </div>

          </div>
        </div>
  );
};
