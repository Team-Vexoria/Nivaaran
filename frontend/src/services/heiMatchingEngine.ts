import { ChallengeDoc } from './firebaseService';
import { JHARKHAND_UNIVERSITIES, UniversityDoc, DepartmentInfo } from './universityData';

export interface HEIMatchResult {
  university: UniversityDoc;
  matchScore: number;
  districtMatch: boolean;
  recommendedDepartment: DepartmentInfo | null;
  matchingReasons: string[];
  departmentFitScore: number;
  expertiseScore: number;
  labFitScore: number;
  achievementsScore: number;
  proximityScore: number;
}

/**
 * Deterministic capability matchmaker for NIVAARAN.
 * Evaluates a challenge against all registered HEIs using 4 weighted factors:
 * 1. Department Capability Fit (30%)
 * 2. Field Expertise Depth (20%)
 * 3. Lab Equipment Fit (20%)
 * 4. Achievements / Research Track (10%)
 * 5. District Proximity Fit (20%)
 */
export const calculateHEIMatchScore = (
  challenge: ChallengeDoc,
  university: UniversityDoc
): HEIMatchResult => {
  const reasons: string[] = [];
  let departmentFitScore = 0; // 30 pts
  let expertiseScore = 0;     // 20 pts
  let labFitScore = 0;        // 20 pts
  let achievementsScore = 0;  // 10 pts
  let proximityScore = 0;     // 20 pts
  let bestDept: DepartmentInfo | null = null;
  let highestDeptScore = 0;

  const challengeCategoryLower = (challenge.category || '').toLowerCase();
  const challengeTitleLower = (challenge.title || '').toLowerCase();
  const challengeDistrictLower = (challenge.district || '').toLowerCase();

  // 1. Department & Capability Match (30 Points Max)
  university.departments.forEach((dept) => {
    let deptScore = 0;
    
    // Domain match
    const deptNameLower = dept.name.toLowerCase();
    dept.capabilities.forEach((cap) => {
      const capLower = cap.toLowerCase();
      if (challengeCategoryLower.includes(capLower) || capLower.includes(challengeCategoryLower)) {
        deptScore += 20;
      }
      if (challengeTitleLower.includes(capLower)) {
        deptScore += 10;
      }
    });

    if (challengeCategoryLower.includes('flood') || challengeCategoryLower.includes('drainage') || challengeCategoryLower.includes('water')) {
      if (deptNameLower.includes('environmental') || deptNameLower.includes('remote sensing') || deptNameLower.includes('gis') || deptNameLower.includes('civil')) {
        deptScore += 20;
      }
    } else if (challengeCategoryLower.includes('wildlife') || challengeCategoryLower.includes('elephant') || challengeCategoryLower.includes('forestry')) {
      if (deptNameLower.includes('forestry') || deptNameLower.includes('wildlife') || deptNameLower.includes('agronomy')) {
        deptScore += 25;
      }
    } else if (challengeCategoryLower.includes('mining') || challengeCategoryLower.includes('geology')) {
      if (deptNameLower.includes('mining') || deptNameLower.includes('geology')) {
        deptScore += 25;
      }
    } else if (challengeCategoryLower.includes('road') || challengeCategoryLower.includes('bridge') || challengeCategoryLower.includes('infra')) {
      if (deptNameLower.includes('civil') || deptNameLower.includes('structural')) {
        deptScore += 25;
      }
    }

    if (deptScore > highestDeptScore) {
      highestDeptScore = deptScore;
      bestDept = dept;
    }
  });

  // 1. Department Capability Fit (30 pts max — scaled from deptScore / max possible)
  departmentFitScore = Math.min(30, Math.round((highestDeptScore / 40) * 30));

  // 2. Field Expertise Depth (20 pts) — match challenge category to dept.fieldExpertise
  if (bestDept) {
    const expertiseArr = bestDept.fieldExpertise || [];
    const expertMatch = expertiseArr.some((ex) => {
      const exL = ex.toLowerCase();
      return challengeCategoryLower.includes(exL) || exL.includes(challengeCategoryLower);
    });
    expertiseScore = expertMatch ? 20 : 8; // 20 if expert field matches
    if (expertMatch) reasons.push(`Field expertise match: ${bestDept.name} specializes in ${expertiseArr.slice(0,2).join(', ')}.`);
  }

  // 3. Lab Equipment Fit (20 pts) — match challenge to activeLabs + lab tags
  if (bestDept) {
    const labs = bestDept.activeLabs || [];
    const labTagMatch = labs.some((lab) => {
      const labL = lab.toLowerCase();
      return challengeCategoryLower.includes(labL) || challengeTitleLower.includes(labL) || labL.includes('lab');
    });
    labFitScore = labTagMatch ? 20 : (labs.length > 0 ? 12 : 5);
    if (labTagMatch) reasons.push(`Lab equipment alignment: "${labs[0]}" supports this challenge domain.`);
  }

  // 4. Achievements / Research Track (10 pts) — institution achievements + dept research count
  const uniAch = university.institutionAchievements || [];
  const deptPub = bestDept ? (bestDept.researchPubCount || 0) : 0;
  const hasAwards = uniAch.length > 0;
  const hasResearch = deptPub > 50 || (university.notableResearchAreas || []).length > 0;
  achievementsScore = (hasAwards ? 5 : 0) + (hasResearch ? 5 : 0);
  if (hasAwards) reasons.push(`Institution achievements: ${uniAch.slice(0,2).join(', ')}.`);
  if (hasResearch) reasons.push(`Research track: dept publications ~${deptPub}, notables: ${(university.notableResearchAreas||[]).slice(0,2).map(r=>r.field).join(', ')}.`);

  // 5. District Proximity Match (20 Points Max)
  const uniDistrictLower = (university.district || '').toLowerCase();
  if (uniDistrictLower === challengeDistrictLower) {
    proximityScore = 20;
    reasons.push(`Direct local campus proximity in ${university.district} District.`);
  } else {
    proximityScore = 10;
    reasons.push(`Regional HEI node serving ${university.district} & adjacent districts.`);
  }

  // Composite Score (0-100) using new weights: 30 + 20 + 20 + 10 + 20 = 100
  const totalScore = Math.min(100, departmentFitScore + expertiseScore + labFitScore + achievementsScore + proximityScore);

  return {
    university,
    matchScore: totalScore,
    districtMatch: uniDistrictLower === challengeDistrictLower,
    recommendedDepartment: bestDept,
    matchingReasons: reasons,
    departmentFitScore,
    expertiseScore,
    labFitScore,
    achievementsScore,
    proximityScore,
  };
};

/**
 * Returns ranked list of all Jharkhand universities matched against a challenge.
 */
export const rankUniversitiesForChallenge = (challenge: ChallengeDoc): HEIMatchResult[] => {
  const matches = JHARKHAND_UNIVERSITIES.map((uni) => calculateHEIMatchScore(challenge, uni));
  return matches.sort((a, b) => b.matchScore - a.matchScore);
};
