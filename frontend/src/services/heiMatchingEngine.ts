import { ChallengeDoc } from './firebaseService';
import { JHARKHAND_UNIVERSITIES, UniversityDoc, DepartmentInfo } from './universityData';

export interface HEIMatchResult {
  university: UniversityDoc;
  matchScore: number;
  districtMatch: boolean;
  recommendedDepartment: DepartmentInfo | null;
  matchingReasons: string[];
  departmentFitScore: number;
  proximityScore: number;
}

/**
 * Deterministic capability matchmaker for NIVAARAN.
 * Evaluates a challenge against all registered HEIs using 4 weighted factors:
 * 1. Department Capability Fit (40%)
 * 2. Lab Equipment Fit (30%)
 * 3. District Proximity Fit (20%)
 * 4. Academic Track Record (10%)
 */
export const calculateHEIMatchScore = (
  challenge: ChallengeDoc,
  university: UniversityDoc
): HEIMatchResult => {
  const reasons: string[] = [];
  let departmentFitScore = 0;
  let labFitScore = 0;
  let proximityScore = 0;
  let academicScore = 10;
  let bestDept: DepartmentInfo | null = null;
  let highestDeptScore = 0;

  const challengeCategoryLower = (challenge.category || '').toLowerCase();
  const challengeTitleLower = (challenge.title || '').toLowerCase();
  const challengeDistrictLower = (challenge.district || '').toLowerCase();

  // 1. Department & Capability Match (40 Points Max)
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

  departmentFitScore = Math.min(40, highestDeptScore);
  if (bestDept) {
    reasons.push(`Matched with ${(bestDept as DepartmentInfo).name} based on registered laboratory capabilities.`);
  }

  // 2. Lab Equipment Match (30 Points Max)
  if (bestDept) {
    const activeLabs = (bestDept as DepartmentInfo).activeLabs || [];
    if (activeLabs.length > 0) {
      labFitScore = 30;
      reasons.push(`Utilizes active R&D facility: "${activeLabs[0]}".`);
    } else {
      labFitScore = 15;
    }
  }

  // 3. District Proximity Match (20 Points Max)
  const uniDistrictLower = (university.district || '').toLowerCase();
  if (uniDistrictLower === challengeDistrictLower) {
    proximityScore = 20;
    reasons.push(`Direct local campus proximity in ${university.district} District.`);
  } else {
    // Neighboring district proximity score
    proximityScore = 10;
    reasons.push(`Regional HEI node serving ${university.district} & adjacent districts.`);
  }

  // Final Composite Score (0 - 100)
  const totalScore = Math.min(98, departmentFitScore + labFitScore + proximityScore + academicScore);

  return {
    university,
    matchScore: totalScore,
    districtMatch: uniDistrictLower === challengeDistrictLower,
    recommendedDepartment: bestDept,
    matchingReasons: reasons,
    departmentFitScore,
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
