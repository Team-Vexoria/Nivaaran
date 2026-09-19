import { ChallengeDoc } from './firebaseService';
import { JHARKHAND_UNIVERSITIES, UniversityDoc, DepartmentInfo, NotableResearchArea } from './universityData';

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
 * Robust check to determine whether a challenge is officially assigned to a university.
 * Handles exact matches, short acronyms, and compound partner allocations.
 */
export const isAssignedToUniversity = (
  assignedHEI: string | undefined,
  university: UniversityDoc
): boolean => {
  if (!assignedHEI || !university) return false;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const assignedNorm = normalize(assignedHEI);
  const uniNameNorm = normalize(university.name);
  const uniShortNorm = normalize(university.shortName || '');
  const uniIdNorm = normalize(university.id);

  if (
    assignedNorm === uniIdNorm ||
    assignedNorm === uniNameNorm ||
    assignedNorm === uniShortNorm
  ) {
    return true;
  }

  // Explicit institution alias map to ensure 100% reliable matching across all views
  const KNOWN_ALIASES: Record<string, string[]> = {
    'UNI-CUJ-RANCHI': [
      'cuj',
      'central university of jharkhand',
      'central university jharkhand',
      'cuj ranchi',
      'cuj brambe',
      'brambe',
    ],
    'UNI-BIT-MESRA': [
      'bit mesra',
      'birla institute of technology',
      'bitmesra',
      'bit ranchi',
    ],
    'UNI-IIT-ISM-DHANBAD': [
      'iit ism',
      'ism dhanbad',
      'iitism',
      'indian school of mines',
    ],
    'UNI-NIT-JAMSHEDPUR': [
      'nit jamshedpur',
      'nit jsr',
      'nitjsr',
      'national institute of technology',
    ],
    'UNI-BAU-RANCHI': [
      'bau',
      'birsa agricultural university',
      'bau ranchi',
    ],
    'UNI-DSPMU-RANCHI': [
      'dspmu',
      'dr shyama prasad mukherjee university',
      'shyama prasad mukherjee',
    ],
  };

  const aliases = KNOWN_ALIASES[university.id] || [];
  for (const alias of aliases) {
    if (assignedNorm.includes(alias) || alias.includes(assignedNorm)) {
      return true;
    }
  }

  if (uniShortNorm.length >= 3 && assignedNorm.includes(uniShortNorm)) {
    return true;
  }
  if (uniNameNorm.length >= 6 && (assignedNorm.includes(uniNameNorm) || uniNameNorm.includes(assignedNorm))) {
    return true;
  }
  // Check key identifying tokens (e.g. ['bit', 'mesra'], ['iit', 'ism'], ['nit', 'jamshedpur'])
  const shortTokens = uniShortNorm.split(' ').filter(t => t.length >= 3);
  if (shortTokens.length > 0 && shortTokens.every(t => assignedNorm.includes(t))) {
    return true;
  }
  return false;
};

/**
 * Deterministic capability matchmaker for NIVAARAN.
 * Evaluates a challenge against an HEI using the 5 weighted factors:
 * 1. Department Capability Fit (30%)
 * 2. Field Expertise Depth (20%)
 * 3. Lab Equipment Fit (20%)
 * 4. Achievements / Research Track (10%)
 * 5. District Proximity Fit (20%)
 * Total = 100%
 */
export const calculateHEIMatchScore = (
  challenge: ChallengeDoc,
  university: UniversityDoc
): HEIMatchResult => {
  const reasons: string[] = [];
  let departmentFitScore = 0;
  let expertiseScore = 0;
  let labFitScore = 0;
  let achievementsScore = 0;
  let proximityScore = 0;
  let bestDept: DepartmentInfo | null = null;
  let highestDeptScore = 0;

  const challengeCategoryLower = (challenge.category || '').toLowerCase();
  const challengeTitleLower = (challenge.title || '').toLowerCase();
  const challengeDistrictLower = (challenge.district || '').toLowerCase();
  const uniDistrictLower = (university.district || '').toLowerCase();
  const isDirectDistrict = uniDistrictLower === challengeDistrictLower;

  const isAssigned = isAssignedToUniversity(challenge.assignedHEI, university);

  if (isAssigned) {
    // If officially assigned by Government or AI framework, HEI receives 100% allotment match
    const candidateDept = (university.departments || []).find((d) => {
      const nameL = d.name.toLowerCase();
      return (
        d.capabilities.some((c) => challengeCategoryLower.includes(c.toLowerCase())) ||
        nameL.includes('engineering') ||
        nameL.includes('science') ||
        nameL.includes('agronomy')
      );
    }) || (university.departments && university.departments[0]) || null;

    return {
      university,
      matchScore: 100,
      districtMatch: isDirectDistrict,
      recommendedDepartment: candidateDept,
      matchingReasons: [
        'Officially assigned to this HEI by Government / AI framework.',
        `Dedicated intake queue authorization for ${university.shortName || university.name}.`,
        isDirectDistrict ? `Local district presence in ${university.district}.` : `Regional nodal HEI deployment.`
      ],
      departmentFitScore: 30,
      expertiseScore: 20,
      labFitScore: 20,
      achievementsScore: 10,
      proximityScore: isDirectDistrict ? 20 : 10,
    };
  }

  // 1. Department & Capability Match (30 Points Max)
  for (const dept of university.departments || []) {
    let deptScore = 0;
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

    if (
      challengeCategoryLower.includes('flood') ||
      challengeCategoryLower.includes('drainage') ||
      challengeCategoryLower.includes('water') ||
      challengeCategoryLower.includes('filtration') ||
      challengeCategoryLower.includes('spring') ||
      challengeCategoryLower.includes('aquifer')
    ) {
      if (
        deptNameLower.includes('environmental') ||
        deptNameLower.includes('remote sensing') ||
        deptNameLower.includes('gis') ||
        deptNameLower.includes('civil') ||
        deptNameLower.includes('water')
      ) {
        deptScore += 25;
      }
    } else if (
      challengeCategoryLower.includes('wildlife') ||
      challengeCategoryLower.includes('elephant') ||
      challengeCategoryLower.includes('forestry') ||
      challengeCategoryLower.includes('silk')
    ) {
      if (
        deptNameLower.includes('forestry') ||
        deptNameLower.includes('wildlife') ||
        deptNameLower.includes('agronomy') ||
        deptNameLower.includes('biology') ||
        deptNameLower.includes('botany')
      ) {
        deptScore += 25;
      }
    } else if (
      challengeCategoryLower.includes('mining') ||
      challengeCategoryLower.includes('geology') ||
      challengeCategoryLower.includes('coalfire') ||
      challengeCategoryLower.includes('subsidence')
    ) {
      if (
        deptNameLower.includes('mining') ||
        deptNameLower.includes('geology') ||
        deptNameLower.includes('geo')
      ) {
        deptScore += 25;
      }
    } else if (
      challengeCategoryLower.includes('road') ||
      challengeCategoryLower.includes('bridge') ||
      challengeCategoryLower.includes('infra') ||
      challengeCategoryLower.includes('transport')
    ) {
      if (deptNameLower.includes('civil') || deptNameLower.includes('structural')) {
        deptScore += 25;
      }
    } else if (
      challengeCategoryLower.includes('agri') ||
      challengeCategoryLower.includes('soil') ||
      challengeCategoryLower.includes('crop') ||
      challengeCategoryLower.includes('horticulture') ||
      challengeCategoryLower.includes('hydrogel')
    ) {
      if (
        deptNameLower.includes('agronomy') ||
        deptNameLower.includes('agriculture') ||
        deptNameLower.includes('soil') ||
        deptNameLower.includes('horticulture') ||
        deptNameLower.includes('botany')
      ) {
        deptScore += 25;
      }
    } else if (
      challengeCategoryLower.includes('waste') ||
      challengeCategoryLower.includes('biomethanation') ||
      challengeCategoryLower.includes('energy') ||
      challengeCategoryLower.includes('solar')
    ) {
      if (
        deptNameLower.includes('environmental') ||
        deptNameLower.includes('biotech') ||
        deptNameLower.includes('energy') ||
        deptNameLower.includes('electrical') ||
        deptNameLower.includes('mechanical')
      ) {
        deptScore += 25;
      }
    } else if (
      challengeCategoryLower.includes('health') ||
      challengeCategoryLower.includes('toxicity') ||
      challengeCategoryLower.includes('fluorosis') ||
      challengeCategoryLower.includes('arsenic')
    ) {
      if (
        deptNameLower.includes('health') ||
        deptNameLower.includes('medicine') ||
        deptNameLower.includes('biochem') ||
        deptNameLower.includes('pharmacy') ||
        deptNameLower.includes('allied')
      ) {
        deptScore += 25;
      }
    }

    if (deptScore > highestDeptScore) {
      highestDeptScore = deptScore;
      bestDept = dept;
    }
  }

  // If no department fits at all, score is 0
  if (highestDeptScore === 0 || !bestDept) {
    return {
      university,
      matchScore: 0,
      districtMatch: isDirectDistrict,
      recommendedDepartment: null,
      matchingReasons: ['No matching departmental capability found for this challenge domain.'],
      departmentFitScore: 0,
      expertiseScore: 0,
      labFitScore: 0,
      achievementsScore: 0,
      proximityScore: 0,
    };
  }

  // 1. Department Capability Fit (30 pts max)
  departmentFitScore = Math.min(30, Math.round((highestDeptScore / 35) * 30));
  reasons.push(`Department capability alignment: ${bestDept.name} matched with ${departmentFitScore}/30 pts.`);

  // 2. Field Expertise Depth (20 pts)
  const currentDept = bestDept;
  const expertiseArr: string[] = currentDept.fieldExpertise || [];
  const expertMatch = expertiseArr.some((ex: string) => {
    const exL = ex.toLowerCase();
    return (
      challengeCategoryLower.includes(exL) ||
      exL.includes(challengeCategoryLower) ||
      challengeTitleLower.includes(exL)
    );
  });
  expertiseScore = expertMatch ? 20 : 10;
  if (expertMatch) {
    reasons.push(`Field expertise match: ${currentDept.name} specializes in ${expertiseArr.slice(0, 2).join(', ')}.`);
  }

  // 3. Lab Equipment Fit (20 pts)
  const labs: string[] = currentDept.activeLabs || [];
  const labTagMatch = labs.some((lab: string) => {
    const labL = lab.toLowerCase();
    return (
      challengeCategoryLower.split(' ').some((w) => w.length > 3 && labL.includes(w)) ||
      challengeTitleLower.split(' ').some((w) => w.length > 4 && labL.includes(w))
    );
  });
  labFitScore = labTagMatch ? 20 : (labs.length > 0 ? 12 : 5);
  if (labTagMatch && labs.length > 0) {
    reasons.push(`Specialized laboratory equipment: "${labs[0]}" directly supports this crisis domain.`);
  }

  // 4. Achievements / Research Track (10 pts)
  const uniAch: string[] = university.institutionAchievements || [];
  const deptPub = currentDept.researchPubCount || 0;
  const hasAwards = uniAch.length > 0;
  const hasResearch = deptPub > 30 || ((university.notableResearchAreas || []).length > 0);
  achievementsScore = (hasAwards ? 5 : 0) + (hasResearch ? 5 : 0);
  if (hasAwards) {
    reasons.push(`Institutional track record: ${uniAch.slice(0, 2).join(', ')}.`);
  }
  if (hasResearch) {
    reasons.push(`Research depth: publications ~${deptPub}, areas: ${(university.notableResearchAreas || []).slice(0, 2).map((r: NotableResearchArea) => r.field).join(', ')}.`);
  }

  // 5. District Proximity Match (20 pts)
  if (isDirectDistrict) {
    proximityScore = 20;
    reasons.push(`Direct local campus proximity in ${university.district} District.`);
  } else {
    proximityScore = 10;
    reasons.push(`Regional HEI node serving ${university.district} and adjacent Jharkhand districts.`);
  }

  // Composite Score (0 to 100)
  const totalScore = Math.min(100, departmentFitScore + expertiseScore + labFitScore + achievementsScore + proximityScore);

  return {
    university,
    matchScore: totalScore,
    districtMatch: isDirectDistrict,
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
