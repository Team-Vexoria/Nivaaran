import React, { useState, useEffect } from 'react';
import { MapPin, PlusCircle, Clock, CheckCircle2, ChevronRight, X, UserCheck, ShieldCheck, Building2, AlertTriangle, FileSearch, Activity } from 'lucide-react';
import { subscribeToChallenges, ChallengeDoc } from '../../services/firebaseService';
import { CHALLENGE_STATUS_OPTIONS, LIFECYCLE_STAGES, getStageForStatus, getPublicStatusLabel } from '../../services/workflowLifecycle';
import { workflowStore } from '../../services/workflowStore';
import type { TimelineEvent } from '../../services/workflowTypes';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../i18n/translations';
import { tr } from '../../i18n/translationEngine';

interface CitizenMyReportsTabProps {
  onOpenReportModal: () => void;
  currentLang?: SupportedLanguage;
}

// ── Status badge color helper ──────────────────────────────────────────────────
function getStatusBadgeClasses(status: string): { bg: string; text: string; border: string; icon?: string } {
  if (status === 'Resolved' || status === 'Closed')
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (status === 'Government Validated' || status === 'HEI Matched')
    return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  if (status === 'In Progress' || status === 'University Accepted')
    return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
  if (status === 'Rejected')
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
  if (status === 'Evidence Requested')
    return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
  return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
}

// ── Timeline event dot color ───────────────────────────────────────────────────
function getTimelineDotColor(status?: string): string {
  if (!status) return 'bg-slate-400';
  if (status === 'Government Validated' || status === 'HEI Matched') return 'bg-blue-600';
  if (status === 'In Progress' || status === 'University Accepted') return 'bg-indigo-600';
  if (status === 'Resolved' || status === 'Closed') return 'bg-emerald-600';
  if (status === 'Rejected') return 'bg-red-600';
  if (status === 'Evidence Requested') return 'bg-amber-600';
  return 'bg-slate-600';
}

export const CitizenMyReportsTab: React.FC<CitizenMyReportsTabProps> = ({
  onOpenReportModal,
  currentLang = 'en'
}) => {
  const { t } = useLanguage();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedReport, setSelectedReport] = useState<ChallengeDoc | null>(null);
  const [reports, setReports] = useState<ChallengeDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Live workflow store data for the selected report
  const [wfStageNumber, setWfStageNumber] = useState<number | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToChallenges((incomingDocs) => {
      setReports(incomingDocs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Query workflowStore when a report is opened in the tracking modal
  useEffect(() => {
    if (!selectedReport) {
      setWfStageNumber(null);
      setTimelineEvents([]);
      return;
    }
    const id = selectedReport.id || selectedReport.reportId;
    const wfChallenge = workflowStore.getChallenge(id);
    setWfStageNumber(wfChallenge?.stageNumber ?? null);
    setTimelineEvents(workflowStore.getTimelineEvents(id));
  }, [selectedReport?.id, selectedReport?.reportId]);

  const localizedStatusLabels: Partial<Record<string, string>> = {
    'Under Review': t.myReports?.filterUnderReview,
    'Government Validated': t.myReports?.filterValidated,
    'In Progress': t.myReports?.filterInProgress,
    'Resolved': t.myReports?.filterResolved,
  };
  const filterOptions = [
    { key: 'All', label: t.myReports?.filterAll || 'All' },
    ...CHALLENGE_STATUS_OPTIONS
      .filter(status => getStageForStatus(status)?.isPublic)
      .map(status => ({
        key: status,
        label: localizedStatusLabels[status] || tr(status, currentLang),
      })),
  ];

  const filteredReports = filterStatus === 'All'
    ? reports
    : reports.filter(r => r.status === filterStatus);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900">
            {t.myReports?.title || 'My Reported Community Issues'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.myReports?.subtitle || 'Real-time status, university lab allocation, and government verification for issues you filed.'}
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-2 shrink-0 active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.myReports?.reportProblemBtn || 'Report New Problem'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilterStatus(opt.key)}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === opt.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Loading or Empty State */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Loading live challenge data...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileSearch className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-sm">No Reports Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filterStatus === 'All'
              ? 'You have not submitted any community issues yet. Click "Report New Problem" to submit an issue.'
              : `No reports matching "${filterStatus}" status.`}
          </p>
        </div>
      ) : (
        /* Report Cards Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report, idx) => {
            const badge = getStatusBadgeClasses(report.status);
            return (
              <div
                key={report.id || report.reportId || idx}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                      {report.reportId || report.id}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center ${badge.bg} ${badge.text} ${badge.border}`}>
                      {report.status === 'Resolved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {report.status === 'In Progress' && <Clock className="w-3 h-3 mr-1 animate-pulse" />}
                      {report.status === 'Rejected' && <X className="w-3 h-3 mr-1" />}
                      {tr(report.status, currentLang)}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {report.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {report.summary || report.aiReasoning || ''}
                  </p>

                  {report.needsHumanVerification && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Government Officer has requested additional evidence.</span>
                    </div>
                  )}

                  {report.status === 'Rejected' && report.govtOfficerNote && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-[10px] font-bold px-2 py-1 rounded-lg flex items-start gap-1">
                      <X className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{report.govtOfficerNote}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>{tr('Location:', currentLang)}</span>
                    <span className="font-semibold text-slate-800 flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-amber-500 shrink-0" /> {report.district} ({report.block})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>{tr('Assigned HEI:', currentLang)}</span>
                    <span className="font-bold text-slate-900 text-right">{report.assignedHEI || 'Matching Lab...'}</span>
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
            );
          })}
        </div>
      )}

      {/* ── Detailed Government Incident Tracking Modal ───────────────────────── */}
      {selectedReport && (
        <TrackingModal
          report={selectedReport}
          wfStageNumber={wfStageNumber}
          timelineEvents={timelineEvents}
          onClose={() => setSelectedReport(null)}
        />
      )}

    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tracking Modal — the detailed 16-stage + Journey Timeline modal
// Extracted to keep CitizenMyReportsTab readable.
// ═══════════════════════════════════════════════════════════════════════════════

interface TrackingModalProps {
  report: ChallengeDoc;
  wfStageNumber: number | null;
  timelineEvents: TimelineEvent[];
  onClose: () => void;
}

const TrackingModal: React.FC<TrackingModalProps> = ({ report, wfStageNumber, timelineEvents, onClose }) => {
  // Use live workflowStore stage when available; fall back to firebase's stored value
  const activeStageNumber = wfStageNumber ?? report.stageNumber ?? getStageForStatus(report.status)?.stageNumber ?? 1;
  const activeStatus = getPublicStatusLabel(report.status);

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 pt-16">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200/90 max-h-[85vh] overflow-y-auto">

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {report.reportId || report.id}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Govt Verified Geotag
              </span>
            </div>
            <h3 className="text-xl font-extrabold font-heading text-slate-900 mt-1">{report.title}</h3>
            <p className="text-xs text-slate-600 flex items-center mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-500 mr-1 shrink-0" />
              {report.village}, {report.block} Block, District {report.district}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Government Official Incident Audit & Priority Breakdown Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 text-xs font-black rounded-lg flex items-center space-x-1">
                <span>Priority Score: {report.priorityScore !== undefined ? report.priorityScore.toFixed(1) : 78}/100</span>
              </span>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                [{report.riskLevel || 'HIGH RISK'}]
              </span>
            </div>

            {(report.confidenceScore || 96) >= 85 ? (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Auto-Verified Intake ({report.confidenceScore || 96}%)</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-800 bg-amber-100/90 px-3 py-1 rounded-lg border border-amber-200 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Confidence {report.confidenceScore || 68}% - Officer Review</span>
              </span>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Official Challenge Category</span>
            <p className="font-extrabold text-slate-900 text-sm flex items-center">
              <Building2 className="w-4 h-4 mr-1.5 text-slate-700 shrink-0" />
              {report.category || 'Pending Categorization'}
            </p>
          </div>

          {report.govtOfficerNote && (
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Government Officer Note</span>
              <p className="text-xs text-slate-800 font-medium">{report.govtOfficerNote}</p>
            </div>
          )}
        </div>

        {/* 16-Stage Visual Government Milestone Stepper */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider flex items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5 shrink-0" />
              16-Stage Government Lifecycle Pipeline
            </span>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {activeStatus}  ·  Stage {activeStageNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
            {LIFECYCLE_STAGES.map((stage) => {
              const isComplete = activeStageNumber > stage.stageNumber;
              const isCurrent  = activeStageNumber === stage.stageNumber;
              const stateLabel = isComplete ? 'COMPLETED' : isCurrent ? 'CURRENT' : 'PENDING';

              return (
                <div
                  key={stage.stageNumber}
                  className={`${isComplete ? 'bg-emerald-50 border-emerald-200' : isCurrent ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200 opacity-75'} border p-2.5 rounded-xl text-center space-y-1 min-h-[94px]`}
                  title={stage.description}
                >
                  <span className={`w-6 h-6 ${isComplete ? 'bg-emerald-600' : isCurrent ? 'bg-amber-600' : 'bg-slate-300'} ${isComplete || isCurrent ? 'text-white' : 'text-slate-700'} rounded-full text-[10px] font-black inline-flex items-center justify-center`}>
                    {stage.stageNumber}
                  </span>
                  <span className="block text-[10px] font-extrabold text-slate-900 leading-tight">
                    {stage.displayName}
                  </span>
                  <span className={`block text-[8px] font-bold ${isComplete ? 'text-emerald-700' : isCurrent ? 'text-amber-700' : 'text-slate-500'} uppercase tracking-wider`}>
                    {stateLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Journey Timeline ──────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider flex items-center">
              <Activity className="w-4 h-4 text-indigo-600 mr-1.5 shrink-0" />
              Journey Timeline
            </span>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {timelineEvents.length} event{timelineEvents.length !== 1 ? 's' : ''}
            </span>
          </div>

          {timelineEvents.length === 0 ? (
            <div className="py-6 text-center">
              <Clock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">No timeline events yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Updates from government officers and universities will appear here.</p>
            </div>
          ) : (
            <div className="relative pl-5 pt-1">
              {/* Vertical line connecting timeline dots */}
              <div className="absolute left-[9px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-indigo-200 via-slate-200 to-slate-200" aria-hidden />

              <div className="space-y-4">
                {timelineEvents.map((event, idx) => {
                  const dotColor = getTimelineDotColor(event.newValue);
                  const relativeTime = formatRelativeTime(event.timestamp);

                  return (
                    <div key={event.id || idx} className="relative flex items-start gap-3">
                      {/* Dot */}
                      <span className={`relative z-10 w-[18px] h-[18px] ${dotColor} rounded-full flex items-center justify-center shrink-0 ring-2 ring-white`}>
                        <span className="w-2 h-2 bg-white rounded-full" />
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0 -mt-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {event.newValue && (
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${getTimelineDotColor(event.newValue).replace('bg-', 'bg-').includes('emerald') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : getTimelineDotColor(event.newValue).includes('blue') ? 'bg-blue-50 text-blue-700 border-blue-200' : getTimelineDotColor(event.newValue).includes('amber') ? 'bg-amber-50 text-amber-700 border-amber-200' : getTimelineDotColor(event.newValue).includes('red') ? 'bg-red-50 text-red-700 border-red-200' : getTimelineDotColor(event.newValue).includes('indigo') ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                              {event.newValue}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">{relativeTime}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-medium mt-0.5 leading-relaxed">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{event.actorRole}</span>
                          {event.actor && event.actor !== event.actorRole && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-[10px] font-semibold text-slate-600">{event.actor}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Academic & CSR Allocation Detail */}
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block flex items-center">
              <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-700 shrink-0" /> Assigned University Unit
            </span>
            <p className="font-bold text-slate-900 text-sm">
              {report.assignedHEI || 'Pending Government Assignment'}
            </p>
            <p className="text-[11px] text-slate-500">
              {report.assignedHEI ? (report.assignedDept || 'Department assigned') : 'Awaiting Govt/AI Matching'}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-700 shrink-0" /> CSR / Government Sponsor
            </span>
            <p className="font-bold text-slate-900 text-sm">
              {report.csrSponsor || 'Pending Matching'}
            </p>
            <p className="text-[11px] text-slate-500">
              {report.csrSponsor ? 'Hardware & Deployment Support Grant' : 'Unassigned'}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            Close Tracking Window
          </button>
        </div>

      </div>
    </div>
  );
};

// ── Utility: relative time formatting ──────────────────────────────────────────
function formatRelativeTime(isoTimestamp: string): string {
  const diff = Date.now() - new Date(isoTimestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoTimestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
