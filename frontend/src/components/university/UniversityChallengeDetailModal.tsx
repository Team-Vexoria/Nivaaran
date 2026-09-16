import React, { useState } from 'react';
import { 
  X, MapPin, Building2, CheckCircle2, ShieldCheck, 
  ArrowRight, FileText, Printer, Sparkles, 
  Layers
} from 'lucide-react';
import { ChallengeDoc, updateChallengeUniversityAcceptance } from '../../services/firebaseService';
import { UniversityDoc, DepartmentInfo } from '../../services/universityData';
import { HEIMatchResult } from '../../services/heiMatchingEngine';
import { getStatusPillClass } from '../../services/mapDataService';

export interface UniversityChallengeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeDoc | null;
  match?: HEIMatchResult | null;
  university: UniversityDoc;
  onAcceptAndProceedToTeam: (challenge: ChallengeDoc, selectedDept: DepartmentInfo) => void;
}

export const UniversityChallengeDetailModal: React.FC<UniversityChallengeDetailModalProps> = ({
  isOpen,
  onClose,
  challenge,
  match,
  university,
  onAcceptAndProceedToTeam,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  if (!isOpen || !challenge) return null;

  const isAcceptedByThisUni = challenge.assignedHEI === university.name;
  const isAcceptedByOther = challenge.assignedHEI && challenge.assignedHEI !== university.name;

  const defaultDept = match?.recommendedDepartment || university.departments[0];
  const chosenDept = university.departments.find(d => d.id === selectedDeptId) || defaultDept;

  const handlePrint = () => {
    window.print();
  };

  const handleProceed = async () => {
    if (!isAcceptedByThisUni) {
      await updateChallengeUniversityAcceptance(
        challenge.id || challenge.reportId,
        university.name,
        chosenDept.name
      );
    }
    onAcceptAndProceedToTeam(challenge, chosenDept);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
      
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-[#D5CDBF] overflow-hidden flex flex-col my-4 max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Modal Header */}
        <div className="bg-[#FAF8F4] border-b border-[#E4DDD1] px-6 py-4 flex items-center justify-between shrink-0 print:border-b-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#2C6E49]/10 border border-[#2C6E49]/20 flex items-center justify-center text-[#2C6E49] shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-[#6A6155] bg-[#EAE4D8] px-2 py-0.5 rounded">
                  {challenge.reportId || challenge.id}
                </span>
                <span className="text-xs font-bold text-[#2C6E49] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {challenge.category}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusPillClass(challenge.status)}`}>
                  {challenge.status}
                </span>
              </div>
              <h3 className="text-base font-black text-[#201C18] mt-1 font-heading line-clamp-1">
                {challenge.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-[#6A6155] hover:text-[#201C18] rounded-xl hover:bg-[#EAE4D8] transition-colors print:hidden"
              title="Print Challenge Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-[#8A7F72] hover:text-[#201C18] rounded-xl hover:bg-[#EAE4D8] transition-colors print:hidden"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-5 text-xs text-[#201C18] print:overflow-visible">
          
          {/* Visual Evidence Banner if Present */}
          {(challenge.evidenceUrl || (challenge.evidenceUrls && challenge.evidenceUrls[0])) && (
            <div className="rounded-2xl overflow-hidden border border-[#E4DDD1] bg-black/5 max-h-72 flex items-center justify-center relative shadow-2xs">
              <img 
                src={challenge.evidenceUrl || challenge.evidenceUrls![0]} 
                alt="On-ground incident evidence" 
                className="w-full max-h-72 object-cover"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                Citizen Uploaded Visual Evidence • Geotagged Ground Truth
              </div>
            </div>
          )}

          {/* Location & Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FAF8F4] border border-[#E4DDD1] p-3 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#8A7F72] uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C98A2C]" /> Incident Location
              </span>
              <p className="font-extrabold text-[#201C18]">
                {[challenge.village, challenge.block, challenge.district].filter(Boolean).join(', ') || challenge.district}
              </p>
              {challenge.locationCoords && (
                <p className="font-mono text-[10px] text-[#6A6155]">
                  GPS: {challenge.locationCoords.lat.toFixed(4)}, {challenge.locationCoords.lng.toFixed(4)}
                </p>
              )}
            </div>

            <div className="bg-[#FAF8F4] border border-[#E4DDD1] p-3 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#8A7F72] uppercase flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#2C6E49]" /> HEI Capability Fit
              </span>
              <p className="text-base font-black text-[#2C6E49] font-heading">
                {match ? `${match.matchScore}% Match` : 'Matched'}
              </p>
              <p className="text-[10px] text-[#5A5247]">
                {university.shortName} Specialized Lab Roster
              </p>
            </div>

            <div className="bg-[#FFF8EC] border border-[#F0D99A] p-3 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#C98A2C] uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C98A2C]" /> Priority & Risk Rating
              </span>
              <p className="text-base font-black text-[#C98A2C] font-heading">
                {challenge.priorityScore !== undefined ? `${challenge.priorityScore.toFixed(1)} / 10` : '7.8 / 10'}
              </p>
              <p className="text-[10px] text-[#8A7F72]">
                Severity: {challenge.riskLevel || 'HIGH'}
              </p>
            </div>
          </div>

          {/* Problem Statement & Ground Description */}
          <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-2 shadow-2xs">
            <h4 className="font-black text-[#201C18] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#2C6E49]" />
              <span>Full Problem Description & Ground Reality</span>
            </h4>
            <p className="text-xs text-[#4A433B] leading-relaxed whitespace-pre-line">
              {challenge.summary || challenge.title}
            </p>
          </div>

          {/* Deterministic Matching & Lab Roster */}
          {match && (
            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-[#201C18] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2C6E49]" />
                  <span>University Matching Rationales ({university.name})</span>
                </h4>
                <span className="text-[10px] font-bold text-[#2C6E49] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Automated HEI Match Engine
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 text-xs text-[#4A433B]">
                {match.matchingReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start space-x-2 bg-white p-2.5 rounded-xl border border-[#E4DDD1]">
                    <CheckCircle2 className="w-4 h-4 text-[#2C6E49] shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Department Assignment Selection */}
          <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-3 shadow-2xs">
            <h4 className="font-black text-[#201C18] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#2C6E49]" />
              <span>Assigned Academic Engineering Department</span>
            </h4>
            <p className="text-xs text-[#6A6155]">
              Select which specialized faculty and student laboratory unit will take ownership of field telemetry and prototyping:
            </p>
            <select
              value={selectedDeptId || defaultDept.id}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs font-bold text-[#201C18] focus:outline-none focus:border-[#2C6E49]"
            >
              {university.departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code}, {dept.activeLabs?.length || 0} Testbed Labs)
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="bg-[#FAF8F4] border-t border-[#E4DDD1] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden">
          <span className="text-[11px] text-[#8A7F72]">
            University R&D grant milestone release eligible upon stage acceptance.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E4DDD1] text-[#6A6155] hover:text-[#201C18] rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close Dossier
            </button>

            {isAcceptedByThisUni ? (
              <button
                onClick={handleProceed}
                className="px-5 py-2 bg-[#2C6E49] hover:bg-[#23583a] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Accepted • Open Multidisciplinary Workspace →</span>
              </button>
            ) : isAcceptedByOther ? (
              <span className="px-4 py-2 bg-[#EAE4D8] text-[#6A6155] rounded-xl text-xs font-bold border border-[#E4DDD1]">
                Allocated to {challenge.assignedHEI}
              </span>
            ) : (
              <button
                onClick={handleProceed}
                className="px-5 py-2 bg-[#2C6E49] hover:bg-[#23583a] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span>Accept Challenge & Form Student Team</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
