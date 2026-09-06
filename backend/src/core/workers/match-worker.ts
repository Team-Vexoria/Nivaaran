import { matchQueue, QueueJob, matchResultsStore } from './index';

// Replicated 5-factor scoring from frontend/src/services/heiMatchingEngine.ts (port to server-side, no DOM dependency)
// Evidence chain: keyword → dept cap → expertise[] → lab[] → achievements → proximity (see plan file + engine comments lines 4-43)

export interface HEIMatchCandidate {
  universityId: string;
  universityName: string;
  matchScore: number;
  districtMatch: boolean;
  recommendedDepartment: { name: string; capabilities: string[]; keyAchievements: string[]; researchPubCount: number; activeLabs: string[]; fieldExpertise: string[] } | null;
  departmentFitScore: number;
  expertiseScore: number;
  labFitScore: number;
  achievementsScore: number;
  proximityScore: number;
  matchingReasons: string[];
  reasoningChain: string[]; // deep reasoning: why each factor scored this way (matches engine comment block)
}

// Server-side lightweight replication of calculateHEIMatchScore (deterministic, no ML)
function scoreChallenge(challengeData: any, universityDoc: any): HEIMatchCandidate {
  const challengeCategoryLower = (challengeData.category || '').toLowerCase();
  const challengeTitleLower = (challengeData.title || '').toLowerCase();
  const challengeDistrictLower = (challengeData.district || '').toLowerCase();

  const reasoningChain: string[] = [];
  reasoningChain.push('DEEP REASONING: 5-factor evidence chain (see heiMatchingEngine.ts lines 4-43)');

  let departmentFitScore = 0;
  let expertiseScore = 0;
  let labFitScore = 0;
  let achievementsScore = 0;
  let proximityScore = 0;
  let bestDept: any = null;
  let highestDeptScore = 0;

  // 1. Department & Capability (30 pts max)
  (universityDoc.departments || []).forEach((dept: any) => {
    let deptScore = 0;
    const deptNameLower = (dept.name || '').toLowerCase();
    (dept.capabilities || []).forEach((cap: string) => {
      const capLower = cap.toLowerCase();
      if (challengeCategoryLower.includes(capLower) || capLower.includes(challengeCategoryLower)) deptScore += 20;
      if (challengeTitleLower.includes(capLower)) deptScore += 10;
    });
    // Domain-specific bonuses (same logic as engine)
    if (challengeCategoryLower.includes('flood') || challengeCategoryLower.includes('drainage') || challengeCategoryLower.includes('water')) {
      if (deptNameLower.includes('environmental') || deptNameLower.includes('remote sensing') || deptNameLower.includes('gis') || deptNameLower.includes('civil')) deptScore += 20;
    } else if (challengeCategoryLower.includes('wildlife') || challengeCategoryLower.includes('elephant') || challengeCategoryLower.includes('forestry')) {
      if (deptNameLower.includes('forestry') || deptNameLower.includes('wildlife') || deptNameLower.includes('agronomy')) deptScore += 25;
    } else if (challengeCategoryLower.includes('mining') || challengeCategoryLower.includes('geology')) {
      if (deptNameLower.includes('mining') || deptNameLower.includes('geology')) deptScore += 25;
    } else if (challengeCategoryLower.includes('road') || challengeCategoryLower.includes('bridge') || challengeCategoryLower.includes('infra')) {
      if (deptNameLower.includes('civil') || deptNameLower.includes('structural')) deptScore += 25;
    }
    if (deptScore > highestDeptScore) { highestDeptScore = deptScore; bestDept = dept; }
  });
  departmentFitScore = Math.min(30, Math.round((highestDeptScore / 40) * 30));
  reasoningChain.push(`Dept capability: challenge("${challengeData.category||''}") → best dept "${bestDept?.name||'none'}" score=${highestDeptScore} → scaled ${(highestDeptScore/40*30).toFixed(1)} → capped ${departmentFitScore}/30`);

  // 2. Field Expertise (20 pts)
  if (bestDept) {
    const expertiseArr: string[] = bestDept.fieldExpertise || [];
    const expertMatch = expertiseArr.some((ex: string) => {
      const exL = ex.toLowerCase();
      return challengeCategoryLower.includes(exL) || exL.includes(challengeCategoryLower);
    });
    expertiseScore = expertMatch ? 20 : 8;
    reasoningChain.push(`Expertise: ${expertMatch ? 'MATCH' : 'PARTIAL'} → ${bestDept.name} specializes in ${expertiseArr.slice(0, 2).join(', ')} → ${expertiseScore}/20`);
  } else {
    reasoningChain.push('Expertise: no best dept → 0/20');
  }

  // 3. Lab Equipment (20 pts)
  if (bestDept) {
    const labs: string[] = bestDept.activeLabs || [];
    const labTagMatch = labs.some((lab: string) => {
      const labL = lab.toLowerCase();
      return challengeCategoryLower.includes(labL) || challengeTitleLower.includes(labL) || labL.includes('lab');
    });
    labFitScore = labTagMatch ? 20 : (labs.length > 0 ? 12 : 5);
    reasoningChain.push(`Lab: tagMatch=${labTagMatch} labs=[${labs.slice(0,2).join(', ')}] → ${labFitScore}/20`);
  } else {
    reasoningChain.push('Lab: no dept → 5/20');
  }

  // 4. Achievements / Research Track (10 pts)
  const uniAch: string[] = universityDoc.institutionAchievements || [];
  const deptPub = bestDept ? (bestDept.researchPubCount || 0) : 0;
  const hasAwards = uniAch.length > 0;
  const hasResearch = deptPub > 50 || ((universityDoc.notableResearchAreas || []).length > 0);
  achievementsScore = (hasAwards ? 5 : 0) + (hasResearch ? 5 : 0);
  reasoningChain.push(`Achievements: awards=${hasAwards}(${uniAch.slice(0,1).join(', ')||'none'}) pubCount≈${deptPub} notables=${(universityDoc.notableResearchAreas||[]).length} → ${achievementsScore}/10`);

  // 5. District Proximity (20 pts)
  const uniDistrictLower = (universityDoc.district || '').toLowerCase();
  proximityScore = (uniDistrictLower === challengeDistrictLower) ? 20 : 10;
  reasoningChain.push(`Proximity: uniDistrict="${universityDoc.district}" challengeDistrict="${challengeData.district}" → ${proximityScore}/20`);

  const totalScore = Math.min(100, departmentFitScore + expertiseScore + labFitScore + achievementsScore + proximityScore);
  reasoningChain.push(`COMPOSITE = ${departmentFitScore}+${expertiseScore}+${labFitScore}+${achievementsScore}+${proximityScore} = ${totalScore}`);
  reasoningChain.push('ALTERNATIVE: if lab tag added to runner-up → lab +8 pts; if district changed → proximity -10 pts; ranking remains reproducible');

  const reasons: string[] = [];
  if (bestDept) reasons.push(`Department match: ${bestDept.name}`);
  if (expertiseScore === 20) reasons.push(`Field expertise match: ${bestDept?.fieldExpertise?.slice(0,2).join(', ')}`);
  if (labFitScore === 20) reasons.push(`Lab alignment: ${bestDept?.activeLabs?.[0]}`);
  if (hasAwards) reasons.push(`Institution achievements: ${uniAch.slice(0,1).join(', ')}`);
  if (proximityScore === 20) reasons.push(`Direct local proximity in ${universityDoc.district}`);
  else reasons.push(`Regional HEI serving ${universityDoc.district}`);

  return {
    universityId: universityDoc.id,
    universityName: universityDoc.name || universityDoc.shortName || 'Unknown',
    matchScore: totalScore,
    districtMatch: uniDistrictLower === challengeDistrictLower,
    recommendedDepartment: bestDept ? {
      name: bestDept.name,
      capabilities: bestDept.capabilities || [],
      keyAchievements: bestDept.keyAchievements || [],
      researchPubCount: bestDept.researchPubCount || 0,
      activeLabs: bestDept.activeLabs || [],
      fieldExpertise: bestDept.fieldExpertise || [],
    } : null,
    departmentFitScore,
    expertiseScore,
    labFitScore,
    achievementsScore,
    proximityScore,
    matchingReasons: reasons,
    reasoningChain,
  };
}

matchQueue.process(async (job: QueueJob) => {
  const { challengeData, universityDataArray } = job.data || {};
  if (!challengeData) return { candidates: [], error: 'No challenge data', jobId: job.id };
  // If full 30-uni array passed; otherwise load default (server-side stub uses minimal seed — full array should be imported from data layer)
  const unis = universityDataArray || [];
  if (unis.length === 0) return { candidates: [], error: 'No university array', jobId: job.id };

  const results: HEIMatchCandidate[] = unis.map((uni: any) => scoreChallenge(challengeData, uni));
  results.sort((a, b) => b.matchScore - a.matchScore);

  // Deep reasoning preserved in results[0].reasoningChain for government officer defensibility
  const top = results[0];
  const resultPayload = {
    candidates: results,
    topAllocation: top ? {
      universityId: top.universityId,
      universityName: top.universityName,
      matchScore: top.matchScore,
      recommendedDepartment: top.recommendedDepartment,
      reasoningChain: top.reasoningChain,
      districtMatch: top.districtMatch,
    } : null,
    jobId: job.id,
    createdAt: new Date().toISOString(),
  };
  matchResultsStore.set(job.id, resultPayload);
  return resultPayload;
});
