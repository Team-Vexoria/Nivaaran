import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, MapPin, Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { ChallengeDoc, subscribeToChallenges, updateChallengeUniversityAcceptance } from '../../services/firebaseService';
import { UniversityDoc, DepartmentInfo } from '../../services/universityData';
import { calculateHEIMatchScore, HEIMatchResult } from '../../services/heiMatchingEngine';
import { getStageForStatus } from '../../services/workflowLifecycle';
import { UniversityChallengeDetailModal } from './UniversityChallengeDetailModal';

interface UniversityIntakeTabProps {
  university: UniversityDoc;
  onAcceptAndProceedToTeam: (challenge: ChallengeDoc, selectedDept: DepartmentInfo) => void;
}

export const UniversityIntakeTab: React.FC<UniversityIntakeTabProps> = ({
  university,
  onAcceptAndProceedToTeam,
}) => {
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  const [selectedChallengeMatch, setSelectedChallengeMatch] = useState<{ challenge: ChallengeDoc; match: HEIMatchResult } | null>(null);
  const [inspectingItem, setInspectingItem] = useState<{ challenge: ChallengeDoc; match: HEIMatchResult } | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [acceptanceError, setAcceptanceError] = useState<string>('');

  useEffect(() => {
    const unsubscribe = subscribeToChallenges((docs) => {
      setChallenges(docs);
    });
    return () => unsubscribe();
  }, []);

  // Filter challenges matched against this specific university
  const matchedChallenges = challenges
    .filter((challenge) => (getStageForStatus(challenge.status)?.stageNumber || 0) >= 3)
    .map((challenge) => {
      const match = calculateHEIMatchScore(challenge, university);
      return { challenge, match };
    })
    .sort((a, b) => b.match.matchScore - a.match.matchScore);

  const handleOpenAcceptModal = (item: { challenge: ChallengeDoc; match: HEIMatchResult }) => {
    setSelectedChallengeMatch(item);
    setAcceptanceError('');
    if (item.match.recommendedDepartment) {
      setSelectedDepartmentId(item.match.recommendedDepartment.id);
    } else if (university.departments.length > 0) {
      setSelectedDepartmentId(university.departments[0].id);
    }
  };

  const handleConfirmAcceptance = () => {
    if (!selectedChallengeMatch) return;
    const { challenge } = selectedChallengeMatch;
    const targetDept = university.departments.find(d => d.id === selectedDepartmentId) || university.departments[0];
    
    if (challenge.id || challenge.reportId) {
      const accepted = updateChallengeUniversityAcceptance(
        challenge.id || challenge.reportId,
        university.name,
        targetDept.name
      );
      if (!accepted) {
        setAcceptanceError('This challenge could not be accepted because its lifecycle stage has changed. Refresh the queue and try again.');
        return;
      }
    }

    onAcceptAndProceedToTeam(challenge, targetDept);
    setAcceptanceError('');
    setSelectedChallengeMatch(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Status Overview */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-xl font-extrabold font-heading text-slate-900">{university.shortName} Intake Queue</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Review incoming citizen-reported societal challenges matched via capability graphs and district proximity.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs shrink-0">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 font-extrabold text-center">
            <span className="block text-lg leading-none font-black">{matchedChallenges.length}</span>
            <span className="text-[10px] uppercase tracking-wider">Matched Challenges</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-800 font-extrabold text-center">
            <span className="block text-lg leading-none font-black">{university.departments.length}</span>
            <span className="text-[10px] uppercase tracking-wider">Active Depts</span>
          </div>
        </div>
      </div>

      {/* Matched Challenges List */}
      <div className="grid gap-4">
        {matchedChallenges.map(({ challenge, match }) => {
          const isAcceptedByThisUni = challenge.assignedHEI === university.name;
          const isAcceptedByOther = challenge.assignedHEI && challenge.assignedHEI !== university.name;

          return (
            <div 
              key={challenge.id || challenge.reportId}
              onClick={() => setInspectingItem({ challenge, match })}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs space-y-4 cursor-pointer hover:border-emerald-400 hover:shadow-md ${
                isAcceptedByThisUni 
                  ? 'border-emerald-300 bg-emerald-50/30' 
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1 min-w-0">
                  {(challenge.evidenceUrl || (challenge.evidenceUrls && challenge.evidenceUrls[0])) && (
                    <img
                      src={challenge.evidenceUrl || (challenge.evidenceUrls && challenge.evidenceUrls[0])}
                      alt={challenge.title}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      className="w-full sm:w-44 h-28 object-cover rounded-xl border border-slate-200 shrink-0 shadow-2xs"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <span className="text-xs font-mono font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                        {challenge.reportId || challenge.id}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                        {challenge.category}
                      </span>
                      {match.districtMatch && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-200">
                          📍 Direct District Match
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1.5 font-heading hover:text-emerald-700 transition-colors">
                      {challenge.title}
                    </h3>

                    <p className="text-xs text-slate-600 flex items-center mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 mr-1 shrink-0" />
                      {challenge.village}, {challenge.block} Block, District {challenge.district}
                    </p>
                  </div>
                </div>

                {/* AI Capability Match Score Badge */}
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-extrabold block tracking-wider">
                      HEI Capability Fit
                    </span>
                    <span className="text-xl font-black text-emerald-700 font-heading">
                      {match.matchScore}% Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Factors & Reasons */}
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Deterministic Capability Matching Reasons:
                </span>
                <div className="grid sm:grid-cols-2 gap-2 text-slate-700 font-medium">
                  {match.matchingReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Recommended Department:</span>
                  <span className="text-xs font-bold text-slate-900">
                    {match.recommendedDepartment?.name || 'Department of Environmental Engineering'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingItem({ challenge, match });
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    View Details
                  </button>

                  {isAcceptedByThisUni ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcceptAndProceedToTeam(challenge, match.recommendedDepartment || university.departments[0]);
                      }}
                      className="px-4 py-2 bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-emerald-800 transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Accepted · Build Team →</span>
                    </button>
                  ) : isAcceptedByOther ? (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                      Assigned to {challenge.assignedHEI}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAcceptModal({ challenge, match });
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                    >
                      <span>Review & Accept</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Manual Human Review & Accept Modal */}
      {selectedChallengeMatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 pt-16">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {selectedChallengeMatch.challenge.reportId || selectedChallengeMatch.challenge.id}
                </span>
                <h3 className="text-lg font-extrabold font-heading text-slate-900 mt-1">
                  Evaluate & Allocate Challenge
                </h3>
              </div>
              <button
                onClick={() => setSelectedChallengeMatch(null)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Problem Title</span>
              <p className="font-extrabold text-slate-900 text-sm">{selectedChallengeMatch.challenge.title}</p>
              <p className="text-slate-600">{selectedChallengeMatch.challenge.summary}</p>
              <div className="pt-2 border-t border-slate-200 text-slate-500 flex items-center">
                <MapPin className="w-3.5 h-3.5 text-amber-500 mr-1 shrink-0" />
                {selectedChallengeMatch.challenge.village}, {selectedChallengeMatch.challenge.block} Block, District {selectedChallengeMatch.challenge.district}
              </div>
            </div>

            {/* Department Ownership Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Assign Department Ownership within {university.shortName}:
              </label>
              <select
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                {university.departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code}) — HOD: {dept.headOfDept}
                  </option>
                ))}
              </select>
            </div>

            {/* Confirmation Alert */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center space-x-2 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Accepting this challenge commits your university team to Stage 7–9 multidisciplinary team building and prototype development.
              </span>
            </div>

            {acceptanceError && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs font-semibold text-rose-800">
                {acceptanceError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedChallengeMatch(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAcceptance}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Acceptance & Build Team</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Challenge Inspection Modal */}
      <UniversityChallengeDetailModal
        isOpen={!!inspectingItem}
        onClose={() => setInspectingItem(null)}
        challenge={inspectingItem?.challenge || null}
        match={inspectingItem?.match || null}
        university={university}
        onAcceptAndProceedToTeam={onAcceptAndProceedToTeam}
      />

    </div>
  );
};
