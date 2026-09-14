import React from 'react';
import { 
  X, MapPin, Building2, ShieldCheck, 
  ArrowRight, FileText, Printer, 
  Users, Cpu
} from 'lucide-react';
import { getStatusPillClass, getSeverityBg } from '../services/mapDataService';

export interface ChallengeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: any | null;
  portalRole?: 'university' | 'pri' | 'ulb' | 'industry' | 'community' | 'admin' | 'gov';
  actionButtonLabel?: string;
  onActionClick?: (challenge: any) => void;
}

export const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({
  isOpen,
  onClose,
  challenge,
  portalRole = 'university',
  actionButtonLabel,
  onActionClick,
}) => {
  if (!isOpen || !challenge) return null;

  const handlePrint = () => {
    window.print();
  };

  const docketId = challenge.reportId || challenge.id || 'INCIDENT-2026';
  const category = challenge.category || 'Public Infrastructure & Safety';
  const status = challenge.status || 'Under Review';
  const district = challenge.district || 'Ranchi';
  const block = challenge.block || 'Sadar';
  const village = challenge.village || 'Ward';
  const priorityScore = challenge.priorityScore !== undefined ? challenge.priorityScore : 7.5;
  const riskLevel = challenge.riskLevel || 'HIGH';
  const evidenceUrl = challenge.evidenceUrl || (challenge.evidenceUrls && challenge.evidenceUrls[0]);

  return (
    <div className="fixed inset-0 z-[300] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
      
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-[#D5CDBF] overflow-hidden flex flex-col my-4 max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full text-left">
        
        {/* Modal Header */}
        <div className="bg-[#FAF8F4] border-b border-[#E4DDD1] px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 print:border-b-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#2C6E49]/10 border border-[#2C6E49]/20 flex items-center justify-center text-[#2C6E49] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-[#6A6155] bg-[#EAE4D8] px-2 py-0.5 rounded">
                  {docketId}
                </span>
                <span className="text-xs font-bold text-[#2C6E49] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {category}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusPillClass(status)}`}>
                  {status}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white ${getSeverityBg(riskLevel)}`}>
                  {riskLevel} SEVERITY
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C98A2C] bg-[#FFF8EC] border border-[#F0D99A] px-2 py-0.5 rounded">
                  {portalRole} Portal Docket
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#201C18] mt-1 font-heading line-clamp-1">
                {challenge.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="p-2 text-[#6A6155] hover:text-[#201C18] rounded-xl hover:bg-[#EAE4D8] transition-colors print:hidden cursor-pointer"
              title="Print Challenge Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-[#8A7F72] hover:text-[#201C18] rounded-xl hover:bg-[#EAE4D8] transition-colors print:hidden cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-5 text-xs text-[#201C18] print:overflow-visible">
          
          {/* Visual Evidence Photo */}
          {evidenceUrl && (
            <div className="rounded-2xl overflow-hidden border border-[#E4DDD1] bg-black/5 max-h-72 flex items-center justify-center relative shadow-2xs">
              <img 
                src={evidenceUrl} 
                alt="On ground incident evidence" 
                className="w-full max-h-72 object-cover"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                Citizen Geotagged Ground Evidence • Timestamped
              </div>
            </div>
          )}

          {/* Location & Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FAF8F4] border border-[#E4DDD1] p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#8A7F72] uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C98A2C]" /> Incident Location
              </span>
              <p className="font-extrabold text-[#201C18]">
                {[village, block, district].filter(Boolean).join(', ')}
              </p>
              {challenge.locationCoords && (
                <p className="font-mono text-[10px] text-[#6A6155]">
                  GPS: {challenge.locationCoords.lat.toFixed(4)}, {challenge.locationCoords.lng.toFixed(4)}
                </p>
              )}
            </div>

            <div className="bg-[#FAF8F4] border border-[#E4DDD1] p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#8A7F72] uppercase flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#2C6E49]" /> Assigned Institution
              </span>
              <p className="font-extrabold text-[#201C18] truncate">
                {challenge.assignedHEI || 'Pending Academic Matching'}
              </p>
              <p className="text-[10px] text-[#5A5247]">
                {challenge.assignedDept || 'State Higher Education R&D Network'}
              </p>
            </div>

            <div className="bg-[#FFF8EC] border border-[#F0D99A] p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#C98A2C] uppercase flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-[#C98A2C]" /> AI Impact Priority Score
              </span>
              <p className="text-base font-black text-[#C98A2C] font-heading">
                {typeof priorityScore === 'number' ? priorityScore.toFixed(1) : priorityScore} / 10
              </p>
              <p className="text-[10px] text-[#8A7F72]">
                Automated NLP, Weather & Spatial Density Rating
              </p>
            </div>
          </div>

          {/* Full Problem Description */}
          <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-2 shadow-2xs">
            <h4 className="font-black text-[#201C18] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#2C6E49]" />
              <span>Problem Statement & Ground Reality</span>
            </h4>
            <p className="text-xs text-[#4A433B] leading-relaxed whitespace-pre-line">
              {challenge.description || challenge.summary || challenge.title}
            </p>
          </div>

          {/* Consolidated Report & Community Urgency */}
          {challenge.citizenReportCount && challenge.citizenReportCount > 1 && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-amber-950">
                    High Community Urgency: {challenge.citizenReportCount} Citizens Reported This Hazard
                  </span>
                  <p className="text-[10px] text-amber-800">
                    Consolidated by AI spatial deduplication engine into unified operational docket.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-900 rounded-lg">
                Merged Docket
              </span>
            </div>
          )}

          {/* AI Reasoning & Factors If Available */}
          {challenge.aiReasoning && (
            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl p-4 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-[#2C6E49] tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2C6E49]" />
                <span>AI Automated Triage Assessment</span>
              </span>
              <p className="text-xs text-[#5A5247] leading-relaxed">
                {challenge.aiReasoning}
              </p>
            </div>
          )}

          {/* Lifecycle Stage Progress */}
          <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">
                Current Workflow Stage
              </span>
              <span className="text-xs font-black text-[#201C18]">
                Stage {challenge.stageNumber || 2} : {challenge.stageName || status}
              </span>
            </div>
            <div className="text-[10px] text-[#5A5247]">
              Tracked live on Jharkhand State Innovation Ledger
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-[#FAF8F4] border-t border-[#E4DDD1] px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <span className="text-[11px] text-[#8A7F72]">
            Docket {docketId} • Digital Public Good Infrastructure
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E4DDD1] text-[#6A6155] hover:text-[#201C18] rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>

            {actionButtonLabel && onActionClick && (
              <button
                onClick={() => onActionClick(challenge)}
                className="px-5 py-2 bg-[#2C6E49] hover:bg-[#23583a] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span>{actionButtonLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
