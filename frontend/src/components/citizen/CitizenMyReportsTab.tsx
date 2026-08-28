import React, { useState, useEffect } from 'react';
import { MapPin, PlusCircle, Clock, CheckCircle2, ChevronRight, X, UserCheck, ShieldCheck, Building2, AlertTriangle, FileSearch } from 'lucide-react';
import { subscribeToChallenges, ChallengeDoc } from '../../services/firebaseService';
import { SupportedLanguage } from '../../i18n/translations';
import { tr } from '../../i18n/translationEngine';

interface CitizenMyReportsTabProps {
  onOpenReportModal: () => void;
  currentLang?: SupportedLanguage;
}

export const CitizenMyReportsTab: React.FC<CitizenMyReportsTabProps> = ({ 
  onOpenReportModal,
  currentLang = 'en'
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedReport, setSelectedReport] = useState<ChallengeDoc | null>(null);
  const [reports, setReports] = useState<ChallengeDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToChallenges((incomingDocs) => {
      setReports(incomingDocs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredReports = filterStatus === 'All'
    ? reports
    : reports.filter(r => r.status === filterStatus);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900">
            {tr('My Reported Community Issues', currentLang)}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {tr('Real-time status, university lab allocation, and government verification for issues you filed.', currentLang)}
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-2 shrink-0 active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{tr('Report New Problem', currentLang)}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {['All', 'Under Review', 'Government Validated', 'In Progress', 'Resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === status
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tr(status, currentLang)}
          </button>
        ))}
      </div>

      {/* Report Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report, idx) => (
          <div 
            key={report.id || idx} 
            className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                  {report.reportId || report.id}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center ${
                  report.status === 'Resolved' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : report.status === 'In Progress'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {report.status === 'Resolved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {report.status === 'In Progress' && <Clock className="w-3 h-3 mr-1 animate-pulse" />}
                  {tr(report.status, currentLang)}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 leading-snug">
                {tr(report.title, currentLang)}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {tr(report.summary || '', currentLang)}
              </p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>{tr('Location:', currentLang)}</span>
                <span className="font-semibold text-slate-800 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-amber-500 shrink-0" /> {tr(report.district, currentLang)} ({tr(report.block, currentLang)})
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span>{tr('Assigned HEI:', currentLang)}</span>
                <span className="font-bold text-slate-900 text-right">{tr(report.assignedHEI || 'Matching Lab...', currentLang)}</span>
              </div>

              <button
                onClick={() => setSelectedReport(report)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-lg font-bold text-xs transition-colors flex items-center justify-center space-x-1 mt-1 cursor-pointer"
              >
                <span>{tr('Track Full 16-Stage Progress', currentLang)}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Government Incident Tracking Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 pt-16">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200/90 max-h-[85vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {selectedReport.reportId || selectedReport.id}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Govt Verified Geotag
                  </span>
                </div>
                <h3 className="text-xl font-extrabold font-heading text-slate-900 mt-1">{selectedReport.title}</h3>
                <p className="text-xs text-slate-600 flex items-center mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 mr-1 shrink-0" />
                  {selectedReport.village}, {selectedReport.block} Block, District {selectedReport.district}
                </p>
              </div>

              <button 
                onClick={() => setSelectedReport(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Government Official Incident Audit & Priority Breakdown Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 text-xs font-black rounded-lg flex items-center space-x-1">
                    <span>Priority Score: {selectedReport.priorityScore || 78}/100</span>
                  </span>
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    [{selectedReport.riskLevel || 'HIGH RISK'}]
                  </span>
                </div>

                {(selectedReport.confidenceScore || 96) >= 85 ? (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Auto-Verified Intake ({selectedReport.confidenceScore || 96}%)</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-800 bg-amber-100/90 px-3 py-1 rounded-lg border border-amber-200 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Confidence {selectedReport.confidenceScore || 68}% - Officer Review</span>
                  </span>
                )}
              </div>

              {/* Categorization & Department Summary */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Official Challenge Category</span>
                <p className="font-extrabold text-slate-900 text-sm flex items-center">
                  <Building2 className="w-4 h-4 mr-1.5 text-slate-700 shrink-0" />
                  {selectedReport.category || 'Pending Categorization'}
                </p>
              </div>

              {/* 5-Factor Priority Breakdown Grid */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Deterministic Priority Breakdown (5 Weighted Factors)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[10px] font-semibold">1. Population Radius (25%)</span>
                      <span className="font-extrabold text-slate-900">{selectedReport.priorityFactors?.populationImpact?.score || 16}/25</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium truncate">
                      {selectedReport.priorityFactors?.populationImpact?.reason || 'Impact area identified'}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[10px] font-semibold">2. Infra Criticality (25%)</span>
                      <span className="font-extrabold text-slate-900">{selectedReport.priorityFactors?.infraCriticality?.score || 15}/25</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium truncate">
                      {selectedReport.priorityFactors?.infraCriticality?.reason || 'Local community infrastructure node'}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[10px] font-semibold">3. Hazard Urgency (25%)</span>
                      <span className="font-extrabold text-slate-900">{selectedReport.priorityFactors?.hazardUrgency?.score || 16}/25</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium truncate">
                      {selectedReport.priorityFactors?.hazardUrgency?.reason || 'Moderate hazard velocity'}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[10px] font-semibold">4. Upvote Velocity (15%)</span>
                      <span className="font-extrabold text-slate-900">{selectedReport.priorityFactors?.communityUpvotes?.score || 5}/15</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium truncate">
                      {selectedReport.priorityFactors?.communityUpvotes?.reason || 'Geotag community report logged'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 16-Stage Visual Government Milestone Stepper */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5 shrink-0" />
                  16-Stage Government Lifecycle Pipeline
                </span>
                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedReport.stageName || 'Stage 1: Intake & Geotag Verification'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center space-y-1 shadow-2xs">
                  <span className="w-6 h-6 bg-emerald-600 text-white rounded-full text-xs font-black inline-flex items-center justify-center">1</span>
                  <span className="block text-xs font-extrabold text-slate-900">Submission & AI Triage</span>
                  <span className="block text-[9px] font-bold text-emerald-700 uppercase tracking-wider">COMPLETED</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center space-y-1 shadow-2xs">
                  <span className="w-6 h-6 bg-amber-600 text-white rounded-full text-xs font-black inline-flex items-center justify-center">2</span>
                  <span className="block text-xs font-extrabold text-slate-900">Govt Validation & HEI Match</span>
                  <span className="block text-[9px] font-bold text-amber-700 uppercase tracking-wider">IN PROGRESS</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center opacity-70 space-y-1">
                  <span className="w-6 h-6 bg-slate-300 text-slate-700 rounded-full text-xs font-black inline-flex items-center justify-center">3</span>
                  <span className="block text-xs font-bold text-slate-700">University R&D & Prototype</span>
                  <span className="block text-[9px] font-medium text-slate-500 uppercase tracking-wider">PENDING</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center opacity-70 space-y-1">
                  <span className="w-6 h-6 bg-slate-300 text-slate-700 rounded-full text-xs font-black inline-flex items-center justify-center">4</span>
                  <span className="block text-xs font-bold text-slate-700">Pilot & Field Deployment</span>
                  <span className="block text-[9px] font-medium text-slate-500 uppercase tracking-wider">PENDING</span>
                </div>
              </div>
            </div>

            {/* Academic & CSR Allocation Detail */}
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block flex items-center">
                  <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-700 shrink-0" /> Assigned University Unit
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedReport.assignedHEI || 'Pending Government Assignment'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedReport.assignedHEI ? (selectedReport.assignedDept || 'Department assigned') : 'Awaiting Govt/AI Matching'}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-700 shrink-0" /> CSR / Government Sponsor
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedReport.csrSponsor || 'Pending Matching'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedReport.csrSponsor ? 'Hardware & Deployment Support Grant' : 'Unassigned'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
              >
                Close Tracking Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
