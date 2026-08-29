import React from 'react';
import { MapPin, AlertTriangle, CheckCircle2, Clock, Building2, Cpu } from 'lucide-react';
import { ChallengeDoc } from '../../services/firebaseService';
import { getPublicStatusLabel } from '../../services/workflowLifecycle';
import { getSeverityColor, getStatusPillClass, getCategoryColor } from '../../services/mapDataService';
import { useLanguage } from '../../context/LanguageContext';

interface ChallengePopupCardProps {
  challenge: ChallengeDoc;
  govtMode?: boolean;
  onValidate?: (challengeId: string) => void;
  onRequestEvidence?: (challengeId: string) => void;
}

export const ChallengePopupCard: React.FC<ChallengePopupCardProps> = ({
  challenge,
  govtMode = false,
  onValidate,
  onRequestEvidence,
}) => {
  const { t } = useLanguage();
  const severityColor = getSeverityColor(challenge.riskLevel);
  const categoryColor = getCategoryColor(challenge.category || '');

  return (
    <div className="w-72 font-sans text-[#201C18]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header strip */}
      <div
        className="h-1 w-full rounded-t-sm mb-3"
        style={{ backgroundColor: severityColor }}
      />

      {/* Title & location */}
      <div className="space-y-1 mb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-[#201C18] leading-tight line-clamp-2 flex-1">
            {challenge.title}
          </h3>
          <span
            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white shrink-0 whitespace-nowrap"
            style={{ backgroundColor: severityColor }}
          >
            {challenge.riskLevel || 'STANDARD'}
          </span>
        </div>

        <div className="flex items-center text-[11px] text-[#6A6155] space-x-1">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>{challenge.village ? `${challenge.village}, ` : ''}{challenge.block ? `${challenge.block}, ` : ''}{challenge.district}</span>
        </div>
      </div>

      {/* Status + Category */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusPillClass(challenge.status)}`}>
          {challenge.status}
        </span>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: categoryColor }}
        >
          {challenge.category || 'General'}
        </span>
      </div>

      {/* AI Priority Panel */}
      <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg p-2.5 mb-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#6A6155] uppercase tracking-wider">
            <Cpu className="w-3 h-3" />
            <span>{t.map.popupAiPriority}</span>
          </div>
          <span
            className="text-sm font-black"
            style={{ color: severityColor }}
          >
            {challenge.priorityScore !== undefined ? `${challenge.priorityScore.toFixed(1)}/10` : 'N/A'}
          </span>
        </div>

        {challenge.aiReasoning && (
          <p className="text-[10px] text-[#5A5247] leading-relaxed line-clamp-3">
            {challenge.aiReasoning}
          </p>
        )}

        <p className="text-[9px] text-[#8A7F72] italic">
          {t.map.popupAdvisory}
        </p>
      </div>

      {/* Assigned HEI */}
      {challenge.assignedHEI && (
        <div className="flex items-center gap-1.5 mb-3 bg-[#EAE4D8] border border-[#E4DDD1] rounded-lg px-2.5 py-2">
          <Building2 className="w-3.5 h-3.5 text-[#2C6E49] shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-[#4A433B] font-bold truncate">{challenge.assignedHEI}</p>
            {challenge.assignedDept && (
              <p className="text-[9px] text-[#6A6155] truncate">{challenge.assignedDept}</p>
            )}
          </div>
          <span className="ml-auto text-[9px] font-bold text-[#2C6E49] shrink-0">{t.map.popupAssigned}</span>
        </div>
      )}

      {/* Govt action buttons */}
      {govtMode && challenge.status === 'Under Review' && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onValidate?.(challenge.id || challenge.reportId)}
            className="flex-1 flex items-center justify-center gap-1 bg-[#2C6E49] hover:bg-[#23583a] text-white text-[10px] font-extrabold py-1.5 px-2 rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-3 h-3" />
            {t.map.popupValidateAssign}
          </button>
          <button
            onClick={() => onRequestEvidence?.(challenge.id || challenge.reportId)}
            className="flex-1 flex items-center justify-center gap-1 bg-[#EAE4D8] hover:bg-[#DFD8CA] text-[#4A433B] text-[10px] font-extrabold py-1.5 px-2 rounded-lg border border-[#E4DDD1] transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-[#C98A2C]" />
            {t.map.popupRequestEvidence}
          </button>
        </div>
      )}

      {/* Stage info */}
      <div className="flex items-center gap-1 mt-2 text-[10px] text-[#8A7F72]">
        <Clock className="w-3 h-3 shrink-0" />
        <span>{getPublicStatusLabel(challenge.status)}</span>
      </div>

      {/* Evidence image */}
      {challenge.evidenceUrl && (
        <div className="mt-2">
          <img
            src={challenge.evidenceUrl}
            alt={t.map.popupEvidenceAlt}
            className="w-full h-24 object-cover rounded-lg border border-[#E4DDD1]"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  );
};
