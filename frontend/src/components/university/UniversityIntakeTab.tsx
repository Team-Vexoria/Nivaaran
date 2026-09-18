import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, MapPin, Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { ChallengeDoc, subscribeToChallenges, updateChallengeUniversityAcceptance } from '../../services/firebaseService';
import { UniversityDoc, DepartmentInfo } from '../../services/universityData';
import { calculateHEIMatchScore, HEIMatchResult, isAssignedToUniversity } from '../../services/heiMatchingEngine';
import { getStageForStatus } from '../../services/workflowLifecycle';
import { UniversityChallengeDetailModal } from './UniversityChallengeDetailModal';

interface UniversityIntakeTabProps {
  university: UniversityDoc;
  onAcceptAndProceedToTeam: (challenge: ChallengeDoc, selectedDept: DepartmentInfo) => void;
  onNavigateToStage?: (stageNumber: number, challenge: ChallengeDoc) => void;
}

export const UniversityIntakeTab: React.FC<UniversityIntakeTabProps> = ({
  university,
  onAcceptAndProceedToTeam,
  onNavigateToStage,
}) => {
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  const [selectedChallengeMatch, setSelectedChallengeMatch] = useState<{ challenge: ChallengeDoc; match: HEIMatchResult; isDirectlyAssigned?: boolean } | null>(null);
  const [inspectingItem, setInspectingItem] = useState<{ challenge: ChallengeDoc; match: HEIMatchResult; isDirectlyAssigned?: boolean } | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [acceptanceError, setAcceptanceError] = useState<string>('');

  useEffect(() => {
    const unsubscribe = subscribeToChallenges((docs) => {
      setChallenges(docs);
    });
    return () => unsubscribe();
  }, []);

  // Filter challenges matched against this specific university:
  // Strict rule: ONLY show challenges if matchScore >= 80%
  // Officially allotted challenges score 100%, and open challenges must achieve >= 80% via the deterministic 5:factor AI engine.
  const matchedChallenges = React.useMemo(() => {
    const allStage3Plus = challenges.filter(
      (challenge) => (getStageForStatus(challenge.status)?.stageNumber || 0) >= 3
    );

    const scored = allStage3Plus.map((challenge) => {
      const match = calculateHEIMatchScore(challenge, university);
      const isDirectlyAssigned = isAssignedToUniversity(challenge.assignedHEI, university);
      return { challenge, match, isDirectlyAssigned };
    });

    // Strictly filter for capability match score >= 80%
    const qualifiedMatches = scored.filter((item) => item.match.matchScore >= 80);

    // Sort descending: highest match scores first (100%, 90%, 85%, etc.)
    qualifiedMatches.sort((a, b) => b.match.matchScore - a.match.matchScore);

    return qualifiedMatches;
  }, [challenges, university]);

  const handleOpenAcceptModal = (item: { challenge: ChallengeDoc; match: HEIMatchResult; isDirectlyAssigned?: boolean }) => {
    setSelectedChallengeMatch(item);
    setAcceptanceError('');
    if (item.match.recommendedDepartment) {
      setSelectedDepartmentId(item.match.recommendedDepartment.id);
    } else if (university.departments.length > 0) {
      setSelectedDepartmentId(university.departments[0].id);
    }
  };

  const handleConfirmAcceptance = async () => {
    if (!selectedChallengeMatch) return;
    const { challenge } = selectedChallengeMatch;
    const targetDept = university.departments.find(d => d.id === selectedDepartmentId) || university.departments[0];
    
    if (challenge.id || challenge.reportId) {
      const accepted = await updateChallengeUniversityAcceptance(
        challenge.id || challenge.reportId,
        university.name,
        targetDept.name
      );
      if (!accepted) {
        setAcceptanceError('This challenge could not be accepted. Please refresh the queue and try again.');
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
        {matchedChallenges.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-800 font-heading">
              No Current Challenges Above 80% AI Match
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              The AI Matching Engine only allocates challenges when departmental capability, specialized laboratory equipment, and faculty research depth exceed the strict 80% affinity threshold.
            </p>
          </div>
        ) : (
          matchedChallenges.map(({ challenge, match, isDirectlyAssigned }) => {
            const stageNum = getStageForStatus(challenge.status)?.stageNumber || (challenge.assignedHEI ? 8 : 7);

          return (
            <div 
              key={challenge.id || challenge.reportId}
              onClick={() => setInspectingItem({ challenge, match, isDirectlyAssigned })}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs space-y-4 cursor-pointer hover:border-emerald-400 hover:shadow-md ${
                stageNum >= 8
                  ? 'border-emerald-300 bg-emerald-50/20' 
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
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-200">
                        Stage {stageNum}: {challenge.status}
                      </span>
                      {isDirectlyAssigned ? (
                        <span className="text-xs font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded border border-amber-300">
                          🏛️ Designated Allotment
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-200">
                          ⚡ AI Capability Fit
                        </span>
                      )}
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

                <div className="flex items-center gap-2 flex-wrap">
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

                  {stageNum < 8 ? (
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
                  ) : stageNum === 8 ? (
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
                  ) : stageNum === 9 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateToStage) {
                          onNavigateToStage(9, challenge);
                        } else {
                          onAcceptAndProceedToTeam(challenge, match.recommendedDepartment || university.departments[0]);
                        }
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Proposal Phase · View Proposal →</span>
                    </button>
                  ) : stageNum === 10 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateToStage) {
                          onNavigateToStage(10, challenge);
                        } else {
                          onAcceptAndProceedToTeam(challenge, match.recommendedDepartment || university.departments[0]);
                        }
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>CSR Phase · View Collab →</span>
                    </button>
                  ) : stageNum >= 11 && stageNum <= 13 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateToStage) {
                          onNavigateToStage(11, challenge);
                        } else {
                          onAcceptAndProceedToTeam(challenge, match.recommendedDepartment || university.departments[0]);
                        }
                      }}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>R&D Lab · Student Workspace →</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
                      ✓ Solution Deployed
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })
      )}
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
