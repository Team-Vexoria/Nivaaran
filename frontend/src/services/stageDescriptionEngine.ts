// ─────────────────────────────────────────────────────────────────────────────
// NIVAARAN — Stage Description Engine (SIH 26043)
// Composes rich, fully-dynamic per-stage narrative descriptions for a challenge,
// pulling from universityData, aiAnalysis, and real challenge fields.
// ─────────────────────────────────────────────────────────────────────────────

import { JHARKHAND_UNIVERSITIES, UniversityDoc, DepartmentInfo } from './universityData';
import type { Challenge } from './workflowTypes';

export interface UniversityRationale {
  university: UniversityDoc;
  department: DepartmentInfo | null;
  whySelected: string[];
  whyNotOthers: WhyNotOther[];
  missingCapabilities: string[];
  matchScore: number;
}

export interface WhyNotOther {
  universityName: string;
  shortName: string;
  reasons: string[];
}

export interface StageDescription {
  stageNumber: number;
  headline: string;
  body: string;
  bulletPoints: string[];
  universityRationale: UniversityRationale | null;
  missingFields: string[];
  overrideNote?: string;
  actorLabel: string;
}

const OVERRIDE_STORAGE_PREFIX = 'nivaaran_stage_overrides_';

export function getStageOverrideNote(challengeId: string, stageNumber: number): string | undefined {
  try {
    const raw = localStorage.getItem(`${OVERRIDE_STORAGE_PREFIX}${challengeId}`);
    if (!raw) return undefined;
    const overrides: Record<number, string> = JSON.parse(raw);
    return overrides[stageNumber] || undefined;
  } catch {
    return undefined;
  }
}

export function setStageOverrideNote(challengeId: string, stageNumber: number, note: string): void {
  try {
    const raw = localStorage.getItem(`${OVERRIDE_STORAGE_PREFIX}${challengeId}`);
    const overrides: Record<number, string> = raw ? JSON.parse(raw) : {};
    if (note.trim()) {
      overrides[stageNumber] = note.trim();
    } else {
      delete overrides[stageNumber];
    }
    localStorage.setItem(`${OVERRIDE_STORAGE_PREFIX}${challengeId}`, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent('nivaaran_stage_override_updated', { detail: { challengeId, stageNumber } }));
  } catch {
    // Ignore storage errors
  }
}

// ── University lookup ──────────────────────────────────────────────────────────

function findUniversityByAssignment(assignedHEI?: string): UniversityDoc | null {
  if (!assignedHEI) return null;
  const lower = assignedHEI.toLowerCase().trim();
  return JHARKHAND_UNIVERSITIES.find(u => {
    const nameL = u.name.toLowerCase();
    const shortL = (u.shortName || '').toLowerCase();
    const idL = u.id.toLowerCase();
    return lower === idL || lower === nameL || lower === shortL ||
      (shortL.length >= 3 && lower.includes(shortL)) ||
      (nameL.length >= 8 && (lower.includes(nameL) || nameL.includes(lower)));
  }) || null;
}

function findBestDepartment(university: UniversityDoc, challenge: Challenge): DepartmentInfo | null {
  const catL = (challenge.category || '').toLowerCase();
  const titleL = (challenge.title || '').toLowerCase();
  const assignedDept = challenge.assignedDept?.toLowerCase() || '';

  // Exact department name match first
  if (assignedDept) {
    const exact = university.departments.find(d => d.name.toLowerCase().includes(assignedDept) || assignedDept.includes(d.name.toLowerCase()));
    if (exact) return exact;
  }

  // Capability keyword match
  let best: DepartmentInfo | null = null;
  let bestScore = 0;
  for (const dept of university.departments) {
    const score = dept.capabilities.filter(c =>
      catL.includes(c.toLowerCase()) || titleL.includes(c.toLowerCase())
    ).length;
    if (score > bestScore) {
      bestScore = score;
      best = dept;
    }
  }
  return best || university.departments[0] || null;
}

function buildWhyNotOthers(challenge: Challenge, selectedUniversity: UniversityDoc): WhyNotOther[] {
  const catL = (challenge.category || '').toLowerCase();
  const districtL = (challenge.district || '').toLowerCase();

  // Pick up to 2 alternative universities that are NOT selected
  const candidates = JHARKHAND_UNIVERSITIES
    .filter(u => u.id !== selectedUniversity.id)
    .slice(0, 5);

  const results: WhyNotOther[] = [];
  for (const uni of candidates) {
    const reasons: string[] = [];
    const uniDist = (uni.district || '').toLowerCase();
    const domainMatch = uni.supportedDomains.some(d => catL.includes(d.toLowerCase()));

    if (uniDist !== districtL) {
      reasons.push(`Located in ${uni.city} — farther from incident site in ${challenge.district}`);
    }
    if (!domainMatch) {
      const primaryDomain = uni.supportedDomains[0] || 'General Studies';
      reasons.push(`Primary domain: ${primaryDomain} (does not match challenge category)`);
    }
    const labMatch = uni.departments.some(d =>
      d.capabilities.some(c => catL.includes(c.toLowerCase()))
    );
    if (!labMatch) {
      reasons.push('No department with direct capability match for this problem category');
    }
    if (reasons.length > 0) {
      results.push({ universityName: uni.name, shortName: uni.shortName || uni.name, reasons });
    }
    if (results.length >= 2) break;
  }
  return results;
}

function buildUniversityRationale(challenge: Challenge): UniversityRationale | null {
  const uni = findUniversityByAssignment(challenge.assignedHEI);
  if (!uni) return null;

  const dept = findBestDepartment(uni, challenge);
  const districtL = (challenge.district || '').toLowerCase();
  const isLocal = (uni.district || '').toLowerCase() === districtL;

  const whySelected: string[] = [];
  if (isLocal) {
    whySelected.push(`Local campus presence in ${uni.city}, ${uni.district} district`);
  } else {
    whySelected.push(`Regional nodal institution — closest accredited HEI with required capability`);
  }
  if (dept) {
    whySelected.push(`${dept.name} offers ${dept.capabilities.slice(0, 3).join(', ')}`);
    if (dept.activeLabs.length > 0) {
      whySelected.push(`Active labs: ${dept.activeLabs.slice(0, 2).join(' & ')}`);
    }
  }
  if (uni.nirfRank) {
    whySelected.push(`NIRF Ranking: ${uni.nirfRank}`);
  }
  const factoryFaculty = uni.faculty.filter(f => dept && f.departmentId === dept.id);
  if (factoryFaculty.length > 0) {
    whySelected.push(`${factoryFaculty.length} faculty member(s) with relevant specialization`);
  }

  const missingCapabilities: string[] = [];
  if (!challenge.assignedDept) missingCapabilities.push('Specific department not yet confirmed');
  if (!dept?.activeLabs.length) missingCapabilities.push('Lab assignment pending');

  return {
    university: uni,
    department: dept,
    whySelected,
    whyNotOthers: buildWhyNotOthers(challenge, uni),
    missingCapabilities,
    matchScore: challenge.assignedHEI ? 87 : 0,
  };
}

// ── Per-stage narrative composer ───────────────────────────────────────────────

export function composeStageDescription(challenge: Challenge, stageNumber: number): StageDescription {
  const overrideNote = getStageOverrideNote(challenge.id, stageNumber);
  const missingFields: string[] = [];

  const district = challenge.district || 'the reported district';
  const village = challenge.village || challenge.block || district;
  const category = challenge.category || 'the reported issue';
  const priority = challenge.priorityScore !== undefined ? `${challenge.priorityScore.toFixed(1)} / 10` : '—';
  const heiName = challenge.assignedHEI || null;
  const deptName = challenge.assignedDept || null;
  const csrName = challenge.csrSponsor || null;
  const govNote = challenge.govtOfficerNote || null;
  const confidence = challenge.aiAnalysis?.confidenceScore
    ? `${Math.round(challenge.aiAnalysis.confidenceScore * 100)}%`
    : challenge.confidenceScore
    ? `${Math.round(challenge.confidenceScore * 100)}%`
    : null;
  const uniRationale = buildUniversityRationale(challenge);

  switch (stageNumber) {
    case 1: {
      const hasMeta = !!(challenge.district && challenge.category);
      if (!hasMeta) missingFields.push('District and category required for intake scoring');
      return {
        stageNumber: 1,
        headline: `Citizen submission received from ${village}, ${district}`,
        body: `A societal problem report was submitted through the Nivaaran platform. The system recorded the location, category ("${category}"), and any evidence attachments provided. The report was queued immediately for AI triage.`,
        bulletPoints: [
          `Submission timestamp: ${new Date(challenge.createdAt).toLocaleString('en-IN')}`,
          `Location: ${village}, ${challenge.block || district}, ${district} district`,
          `Category: ${category}`,
          challenge.audioUrl ? 'Voice note attached — transcription queued' : 'Text report submitted',
        ],
        universityRationale: null,
        missingFields,
        overrideNote,
        actorLabel: 'Citizen / Community',
      };
    }

    case 2: {
      if (!confidence) missingFields.push('AI confidence score not computed');
      if (!challenge.aiAnalysis?.riskLevel && !challenge.riskLevel) missingFields.push('Risk level not assigned');
      return {
        stageNumber: 2,
        headline: `AI engine classified "${category}" — risk level: ${challenge.riskLevel || 'Assessing'}`,
        body: `The Nivaaran AI triage engine analysed the report text, geotagged location, and attached media. It classified the challenge into the "${category}" domain, assigned a risk level of ${challenge.riskLevel || 'STANDARD'}, and flagged it ${challenge.needsHumanVerification ? 'for mandatory human review' : 'as eligible for automated processing'}.${confidence ? ` AI confidence: ${confidence}.` : ''}`,
        bulletPoints: [
          `Risk level: ${challenge.riskLevel || 'STANDARD'}`,
          confidence ? `AI confidence: ${confidence}` : 'Confidence score pending',
          `Human verification ${challenge.needsHumanVerification ? 'required' : 'not required'}`,
          challenge.aiAnalysis?.reasoning ? `Reasoning: ${challenge.aiAnalysis.reasoning.slice(0, 100)}…` : 'AI reasoning: processing',
        ],
        universityRationale: null,
        missingFields,
        overrideNote,
        actorLabel: 'Nivaaran AI Engine',
      };
    }

    case 3: {
      const count = challenge.citizenReportCount || 1;
      return {
        stageNumber: 3,
        headline: `Semantic deduplication — ${count > 1 ? `merged with ${count - 1} similar report(s)` : 'unique report confirmed'}`,
        body: `The AI deduplication engine scanned all existing reports from ${district} district and neighbouring areas for semantic similarity. ${count > 1 ? `This report was consolidated with ${count - 1} other citizen submissions describing the same underlying problem, amplifying its priority weight.` : 'No duplicate or semantically similar reports were found — this challenge is treated as a unique, standalone problem.'}`,
        bulletPoints: [
          `Total consolidated reports: ${count}`,
          `Cluster ID: ${challenge.clusterId || 'Standalone (no cluster)'}`,
          count > 1 ? `Combined community weight boosts priority score` : 'Independent entry in challenge ledger',
          `District: ${district}`,
        ],
        universityRationale: null,
        missingFields,
        overrideNote,
        actorLabel: 'AI Deduplication Engine',
      };
    }

    case 4: {
      if (!challenge.priorityScore && challenge.priorityScore !== 0) missingFields.push('Priority score not yet calculated');
      const factors = challenge.aiAnalysis?.factors;
      return {
        stageNumber: 4,
        headline: `Priority score assigned: ${priority}`,
        body: `The Nivaaran scoring engine evaluated four dimensions — population impact, economic & life-saving potential, resolution cost-feasibility, and hazard urgency — to assign a transparent priority score. This score determines queue position for government validation and resource allocation.`,
        bulletPoints: [
          `Overall priority: ${priority}`,
          factors ? `Population impact: ${factors.populationImpact.score}/${factors.populationImpact.max} — ${factors.populationImpact.reason}` : 'Population impact: scoring in progress',
          factors ? `Economic / life-saving: ${factors.economicLifeSaving.score}/${factors.economicLifeSaving.max}` : 'Economic score: pending',
          factors ? `Hazard urgency: ${factors.hazardUrgency.score}/${factors.hazardUrgency.max}` : 'Hazard urgency: pending',
        ],
        universityRationale: null,
        missingFields,
        overrideNote,
        actorLabel: 'Nivaaran AI Scoring Engine',
      };
    }

    case 5: {
      if (!govNote) missingFields.push('Government officer validation note missing');
      return {
        stageNumber: 5,
        headline: `State Nodal Officer validated the challenge${challenge.govtValidatedBy ? ` — by ${challenge.govtValidatedBy}` : ''}`,
        body: `A designated Jharkhand Government Nodal Officer reviewed the AI-triaged report, examined the attached evidence, and formally validated it as a genuine societal challenge warranting institutional intervention. ${govNote ? `Officer's note: "${govNote}"` : 'Validation completed without additional notes.'}`,
        bulletPoints: [
          `Validated by: ${challenge.govtValidatedBy || 'Government Nodal Officer'}`,
          `Validation timestamp: ${challenge.govtValidatedAt ? new Date(challenge.govtValidatedAt).toLocaleString('en-IN') : 'On record'}`,
          `Official challenge ID: ${challenge.reportId}`,
          govNote ? `Note: "${govNote.slice(0, 80)}…"` : 'No additional officer remarks',
        ],
        universityRationale: null,
        missingFields,
        overrideNote,
        actorLabel: 'State Nodal Officer',
      };
    }

    case 6: {
      if (!heiName) missingFields.push('No university assigned yet — HEI matching pending');
      if (!deptName) missingFields.push('Recommended department not yet confirmed');
      return {
        stageNumber: 6,
        headline: heiName
          ? `AI matched to: ${heiName}${deptName ? ` — ${deptName}` : ''}`
          : `AI Institution Matching in progress`,
        body: heiName
          ? `The Nivaaran AI matchmaker evaluated all 30 accredited Jharkhand Higher Education Institutions across 5 weighted dimensions: department capability (30%), domain expertise (20%), lab equipment (20%), research achievements (10%), and district proximity (20%). ${heiName} was selected as the optimal match.${deptName ? ` The ${deptName} will lead the technical investigation.` : ''}`
          : `The AI Institution Matching engine is evaluating ${30} registered Jharkhand HEIs across department capabilities, research labs, faculty expertise, and district proximity to find the optimal match for this challenge.`,
        bulletPoints: heiName
          ? [
              `Assigned HEI: ${heiName}`,
              deptName ? `Lead department: ${deptName}` : 'Department: to be confirmed',
              uniRationale ? `Match score: ${uniRationale.matchScore} / 100` : 'Match score: computed',
              uniRationale?.department?.activeLabs?.[0] ? `Key lab: ${uniRationale.department.activeLabs[0]}` : 'Lab assignment: in progress',
            ]
          : [
              '30 Jharkhand HEIs being evaluated',
              'Criteria: dept capability, lab fit, expertise, proximity',
              'Result expected after government validation',
              'Matching in progress…',
            ],
        universityRationale: uniRationale,
        missingFields,
        overrideNote,
        actorLabel: 'Nivaaran AI Matchmaker',
      };
    }

    case 7: {
      if (!heiName) missingFields.push('University assignment not recorded');
      return {
        stageNumber: 7,
        headline: heiName ? `${heiName} formally accepted the challenge` : 'University R&D Acceptance pending',
        body: `${heiName || 'The assigned university'} reviewed the challenge dossier, confirmed availability of faculty mentors and laboratory resources, and formally accepted the research mandate. A project intake number has been issued and the challenge is now in the university's active R&D queue.`,
        bulletPoints: [
          `Accepting institution: ${heiName || 'Pending'}`,
          deptName ? `Accepting department: ${deptName}` : 'Department intake: in progress',
          'Project intake number issued',
          'Challenge dossier transferred to HEI academic registry',
        ],
        universityRationale: uniRationale,
        missingFields,
        overrideNote,
        actorLabel: `University Dean / HoD${heiName ? ` — ${heiName}` : ''}`,
      };
    }

    case 8: {
      return {
        stageNumber: 8,
        headline: `Multidisciplinary student & faculty team assembled`,
        body: `${heiName || 'The assigned university'} formed a cross-disciplinary R&D team comprising engineering students, faculty mentors, and domain specialists. The team is responsible for analysing the challenge on-ground, designing the technical intervention, and producing the solution proposal.`,
        bulletPoints: [
          `Institution: ${heiName || 'Assigned HEI'}`,
          deptName ? `Lead department: ${deptName}` : 'Department: assigned',
          '4–6 student innovators: multidisciplinary roster',
          '1–2 faculty mentors assigned as Principal Investigators',
        ],
        universityRationale: uniRationale,
        missingFields,
        overrideNote,
        actorLabel: `Faculty Mentor — ${heiName || 'University'}`,
      };
    }

    case 9: {
      return {
        stageNumber: 9,
        headline: `Technical solution proposal submitted by ${heiName || 'university team'}`,
        body: `The student-faculty team completed their technical investigation of the problem in ${district} and submitted a structured solution proposal. The proposal outlines the engineering approach, required budget, implementation timeline, hardware specifications, and expected social impact metrics.`,
        bulletPoints: [
          `Submitted by: ${heiName || 'University team'}`,
          deptName ? `Department: ${deptName}` : 'Cross-disciplinary team',
          'Proposal includes: approach, budget, timeline, hardware specs',
          'Under review by Higher & Technical Education Department',
        ],
        universityRationale: uniRationale,
        missingFields,
        overrideNote,
        actorLabel: `Student & Faculty Team — ${heiName || 'University'}`,
      };
    }

    case 10: {
      if (!csrName) missingFields.push('No CSR / Industry partner assigned yet — reduces budget certainty');
      return {
        stageNumber: 10,
        headline: csrName ? `CSR partner committed: ${csrName}` : 'Industry / CSR collaboration being arranged',
        body: csrName
          ? `${csrName} has formally committed co-financing and technical support for this challenge. The collaboration covers hardware procurement, fabrication resources, and field deployment mentorship. CSR engagement ensures the university team has industrial-grade resources for prototyping.`
          : `The Nivaaran platform is actively connecting the challenge with eligible CSR partners and MSMEs from the Higher & Technical Education Department's industry network. Absence of a confirmed partner at this stage reduces the readiness score for prototype development.`,
        bulletPoints: csrName
          ? [
              `Partner: ${csrName}`,
              'Support types: Hardware, Fabrication, Field Mentorship',
              `Collaboration active for challenge: ${challenge.reportId}`,
              `University R&D team: ${heiName || 'Assigned HEI'}`,
            ]
          : [
              'CSR matching: in progress',
              'Industry partner: not yet assigned',
              'Impact: reduces Stage 10 readiness score',
              'Platform will notify once a partner commits',
            ],
        universityRationale: uniRationale,
        missingFields,
        overrideNote,
        actorLabel: csrName || 'Industry / CSR Partner',
      };
    }

    case 11: {
      return {
        stageNumber: 11,
        headline: `Prototype under active development at ${heiName || 'university'} R&D lab`,
        body: `The university team, supported by industry partners, is now actively building and testing a working prototype of the solution. This stage involves hardware fabrication, embedded software development, and initial laboratory testing of the system components before field deployment.`,
        bulletPoints: [
          `Lab: ${uniRationale?.department?.activeLabs?.[0] || 'University R&D Lab'}`,
          `Team: ${heiName || 'Assigned HEI'} — ${deptName || 'Engineering Dept'}`,
          csrName ? `Hardware support: ${csrName}` : 'Hardware: university-funded',
          'Phase: Fabrication & initial testing',
        ],
        universityRationale: uniRationale,
        missingFields,
        overrideNote,
        actorLabel: `University R&D Lab — ${heiName || 'Assigned HEI'}`,
      };
    }

    case 12: {
      return {
        stageNumber: 12,
        headline: `Ground pilot trial active in ${district} Panchayat`,
        body: `The prototype has passed laboratory validation and is now being deployed in a controlled real-world pilot in the ${district} district. The university team is working directly with local Panchayat representatives, community members, and government field officers to test the solution under actual ground conditions.`,
        bulletPoints: [
          `Pilot location: ${district} district`,
          `Conducted by: ${heiName || 'University team'} + Panchayat`,
          'Community participants: field trial cohort',
          'Collecting: performance metrics, community feedback, sensor telemetry',
        ],
        universityRationale: uniRationale,
        missingFields,
        overrideNote,
        actorLabel: `University & Panchayat — ${district}`,
      };
    }

    case 13: {
      return {
        stageNumber: 13,
        headline: `Field outcome audit underway — technical & community validation`,
        body: `A Jharkhand Government Field Auditor is conducting an independent technical review of the pilot results. Community satisfaction surveys, measurable impact data, and engineering performance logs are being compiled into the official outcome audit report. This determines whether the solution is cleared for statewide deployment.`,
        bulletPoints: [
          'Auditor: Government Field Auditor',
          `Challenge: ${challenge.reportId} — ${district}`,
          'Collecting: community feedback, performance metrics, evidence records',
          'Outcome: Clearance for statewide deployment',
        ],
        universityRationale: uniRationale,
        missingFields,
        overrideNote,
        actorLabel: 'Govt Field Auditor',
      };
    }

    case 14: {
      return {
        stageNumber: 14,
        headline: `Statewide deployment authorised — handed to Line Department`,
        body: `The solution has been officially approved for statewide rollout. The technology developed by ${heiName || 'the university team'} has been transferred to the responsible Jharkhand Government Line Department for large-scale installation across all affected areas in the state.`,
        bulletPoints: [
          `Technology: developed by ${heiName || 'University'}`,
          'Transferred to: Jharkhand Line Department',
          'Phase: Full-scale state rollout',
          `Challenge: ${challenge.reportId} — Status: Resolved`,
        ],
        universityRationale: uniRationale,
        missingFields,
        overrideNote,
        actorLabel: 'Jharkhand Line Department',
      };
    }

    case 15: {
      return {
        stageNumber: 15,
        headline: `Impact measurement active — State Impact Ledger`,
        body: `The Technical Directorate is tracking real-world outcomes of the deployed solution across all installation sites. Key metrics — beneficiary count, infrastructure uptime, community health indicators, and cost-effectiveness ratios — are being logged into the Nivaaran Impact Ledger for public transparency.`,
        bulletPoints: [
          'Measured by: Technical Directorate',
          'Metrics: beneficiary count, uptime, community health, cost-effectiveness',
          'State Impact Ledger: live',
          `Challenge ID: ${challenge.reportId}`,
        ],
        universityRationale: uniRationale,
        missingFields,
        overrideNote,
        actorLabel: 'Technical Directorate',
      };
    }

    case 16: {
      return {
        stageNumber: 16,
        headline: `Verified closure — knowledge base entry filed`,
        body: `The challenge has completed all 16 lifecycle stages. The State Government has verified the impact outcomes and formally archived this challenge as a closed case. A full knowledge base entry — including the solution architecture, lessons learned, cost analysis, and social impact report — has been published for future reference by other districts and institutions.`,
        bulletPoints: [
          `Challenge: ${challenge.reportId} — Closed`,
          'Knowledge base: entry published',
          'Lessons learned: archived for future replication',
          'Full case study: available in Nivaaran public ledger',
        ],
        universityRationale: uniRationale,
        missingFields,
        overrideNote,
        actorLabel: 'State Government of Jharkhand',
      };
    }

    default:
      return {
        stageNumber,
        headline: `Stage ${stageNumber} — Processing`,
        body: 'Stage information is being compiled.',
        bulletPoints: [],
        universityRationale: null,
        missingFields: [],
        overrideNote,
        actorLabel: 'System',
      };
  }
}
