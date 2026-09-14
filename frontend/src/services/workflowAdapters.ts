import type { Challenge, Project, TeamMember, ChallengeStatus, PriorityFactors, MilestoneStatus } from './workflowTypes';
import type { ChallengeDoc, ProjectDoc, ProjectTeamMember } from './firebaseService';
import { workflowStore } from './workflowStore';
import { formatStageName, getStageForStatus, normalizeLegacyStatus } from './workflowLifecycle';

const DEFAULT_PRIORITY_FACTORS: PriorityFactors = {
  populationImpact: { score: 0, max: 25, reason: 'Not available' },
  economicLifeSaving: { score: 0, max: 25, reason: 'Not available' },
  resolutionCostFeasibility: { score: 0, max: 25, reason: 'Not available' },
  hazardUrgency: { score: 0, max: 25, reason: 'Not available' },
};

const toChallengeStatus = (value: string | undefined): ChallengeStatus => (
  value ? normalizeLegacyStatus(value) || 'Under Review' : 'Under Review'
);

const isMilestoneStatus = (value: string): value is MilestoneStatus => (
  value === 'Completed' || value === 'In Progress' || value === 'Pending'
);

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isLegacyChallenge = (value: unknown): value is ChallengeDoc => (
  isRecord(value)
  && typeof value.reportId === 'string'
  && typeof value.title === 'string'
  && typeof value.summary === 'string'
  && typeof value.status === 'string'
);

const isLegacyProject = (value: unknown): value is ProjectDoc => (
  isRecord(value)
  && typeof value.challengeId === 'string'
  && typeof value.challengeTitle === 'string'
  && typeof value.universityId === 'string'
  && typeof value.universityName === 'string'
  && Array.isArray(value.teamMembers)
  && Array.isArray(value.milestones)
  && typeof value.status === 'string'
);

/**
 * Converts a legacy ChallengeDoc (used by Firestore and legacy UI) to the new workflow Challenge type.
 */
export function toWorkflowChallenge(doc: ChallengeDoc): Challenge {
  const status = toChallengeStatus(doc.status);
  const stage = getStageForStatus(status);
  return {
    id: doc.id || `CH-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    reportId: doc.reportId,
    title: doc.title,
    description: doc.summary,
    district: doc.district,
    block: doc.block,
    village: doc.village,
    locationCoords: doc.locationCoords,
    formattedAddress: doc.formattedAddress,
    status,
    stageNumber: stage?.stageNumber || doc.stageNumber || 1,
    stageName: stage ? formatStageName(stage.stageNumber) : (doc.stageName || 'Legacy Status'),
    category: doc.category,
    aiAnalysis: doc.aiReasoning || doc.priorityFactors ? {
      category: doc.category,
      categoryCode: '',
      confidenceScore: doc.confidenceScore || 0,
      priorityScore: doc.priorityScore || 0,
      riskLevel: doc.riskLevel || 'STANDARD',
      factors: doc.priorityFactors || DEFAULT_PRIORITY_FACTORS,
      reasoning: doc.aiReasoning || '',
      needsHumanVerification: doc.needsHumanVerification || false,
      recommendedUniversityDepts: [],
    } : undefined,
    priorityScore: doc.priorityScore,
    confidenceScore: doc.confidenceScore,
    riskLevel: doc.riskLevel,
    evidenceUrls: doc.evidenceUrls || (doc.evidenceUrl ? [doc.evidenceUrl] : []),
    videoUrl: doc.videoUrl,
    videoUrls: doc.videoUrls || (doc.videoUrl ? [doc.videoUrl] : []),
    audioUrl: doc.audioUrl,
    voiceLanguage: doc.voiceLanguage,
    evidenceType: doc.evidenceType || (doc.videoUrl ? 'video' : 'image'),
    govtOfficerNote: doc.govtOfficerNote,
    needsHumanVerification: doc.needsHumanVerification,
    govtValidatedBy: doc.govtValidatedBy,
    govtValidatedAt: doc.govtValidatedAt,
    clusterId: doc.clusterId,
    citizenReportCount: doc.citizenReportCount,
    communityUpvotes: doc.communityUpvotes,
    extractedMetadata: doc.extractedMetadata,
    affectedPopulation: doc.affectedPopulation,
    economicValueEstimate: doc.economicValueEstimate,
    estimatedResolutionCost: doc.estimatedResolutionCost,
    research: doc.research,
    assignedHEI: doc.assignedHEI,
    assignedDept: doc.assignedDept,
    csrSponsor: doc.csrSponsor,
    createdAt: doc.createdAt?.toString() || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Converts a new workflow Challenge to a legacy ChallengeDoc.
 */
export function toLegacyChallengeDoc(challenge: Challenge): ChallengeDoc {
  if (!challenge) return {} as ChallengeDoc;
  const evUrls = challenge.evidenceUrls || (challenge as any).evidenceUrls || [];
  return {
    id: challenge.id,
    reportId: challenge.reportId || challenge.id,
    title: challenge.title || 'Untitled Issue',
    district: challenge.district || 'Ranchi',
    block: challenge.block || '',
    village: challenge.village || '',
    category: challenge.category || 'General',
    status: challenge.status || 'Under Review',
    summary: challenge.description || (challenge as any).summary || '',
    evidenceUrl: Array.isArray(evUrls) && evUrls.length > 0 ? evUrls[0] : ((challenge as any).evidenceUrl || undefined),
    evidenceUrls: evUrls,
    videoUrl: challenge.videoUrl || (challenge as any).videoUrl,
    videoUrls: challenge.videoUrls || (challenge as any).videoUrls,
    audioUrl: challenge.audioUrl || (challenge as any).audioUrl,
    voiceLanguage: challenge.voiceLanguage || (challenge as any).voiceLanguage,
    evidenceType: challenge.evidenceType || (challenge as any).evidenceType,
    locationCoords: challenge.locationCoords,
    formattedAddress: challenge.formattedAddress,
    priorityScore: challenge.priorityScore ?? challenge.aiAnalysis?.priorityScore,
    confidenceScore: challenge.confidenceScore ?? challenge.aiAnalysis?.confidenceScore,
    riskLevel: challenge.riskLevel ?? challenge.aiAnalysis?.riskLevel,
    aiReasoning: challenge.aiAnalysis?.reasoning,
    priorityFactors: challenge.aiAnalysis?.factors,
    needsHumanVerification: challenge.needsHumanVerification ?? challenge.aiAnalysis?.needsHumanVerification,
    assignedHEI: challenge.assignedHEI,
    assignedDept: challenge.assignedDept,
    csrSponsor: challenge.csrSponsor,
    stageNumber: challenge.stageNumber || 2,
    stageName: challenge.stageName || 'Under Review',
    govtOfficerNote: challenge.govtOfficerNote,
    govtValidatedBy: challenge.govtValidatedBy,
    govtValidatedAt: challenge.govtValidatedAt,
    clusterId: challenge.clusterId,
    citizenReportCount: challenge.citizenReportCount,
    communityUpvotes: challenge.communityUpvotes,
    extractedMetadata: challenge.extractedMetadata,
    affectedPopulation: challenge.affectedPopulation || (challenge as any).affectedPopulation,
    economicValueEstimate: challenge.economicValueEstimate || (challenge as any).economicValueEstimate,
    estimatedResolutionCost: challenge.estimatedResolutionCost || (challenge as any).estimatedResolutionCost,
    research: challenge.research || (challenge as any).research,
    createdAt: challenge.createdAt || new Date().toISOString(),
  };
}

/**
 * Converts a legacy ProjectDoc to the new workflow Project type.
 */
export function toWorkflowProject(doc: ProjectDoc): Project {
  return {
    id: doc.id || `PRJ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    challengeId: doc.challengeId,
    challengeTitle: doc.challengeTitle,
    category: doc.category,
    district: doc.district,
    universityId: doc.universityId,
    universityName: doc.universityName,
    facultyMentorName: doc.facultyMentorName,
    facultyEmail: doc.facultyEmail,
    teamMembers: Array.isArray(doc.teamMembers) ? doc.teamMembers.map((m: ProjectTeamMember) => ({
      id: m.studentId,
      name: m.name,
      departmentName: m.departmentName,
      role: m.role,
      skills: m.skills,
    })) : [],
    status: doc.status,
    milestones: Array.isArray(doc.milestones) ? doc.milestones.map((m, index) => ({
      id: `m-${index}`,
      stageNumber: m.stageNumber,
      title: m.title,
      description: m.description,
      status: isMilestoneStatus(m.status) ? m.status : 'Pending',
      targetDays: m.targetDays,
    })) : [],
    proposals: doc.proposals || [],
    collaborationOffers: doc.collaborationOffers || [],
    prototypeUpdate: doc.prototypeUpdate,
    pilotReport: doc.pilotReport,
    outcomeAudit: doc.outcomeAudit,
    budgetEstimated: doc.budgetEstimated,
    budgetApproved: doc.budgetApproved,
    createdAt: doc.createdAt?.toString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toString() || new Date().toISOString(),
  };
}

/**
 * Converts a new workflow Project to a legacy ProjectDoc.
 */
export function toLegacyProjectDoc(project: Project): ProjectDoc {
  return {
    id: project.id,
    challengeId: project.challengeId,
    challengeTitle: project.challengeTitle,
    category: project.category,
    district: project.district,
    universityId: project.universityId,
    universityName: project.universityName,
    facultyMentorName: project.facultyMentorName,
    facultyEmail: project.facultyEmail,
    teamMembers: Array.isArray(project.teamMembers) ? project.teamMembers.map((m: TeamMember) => ({
      studentId: m.id,
      name: m.name,
      departmentName: m.departmentName,
      role: m.role,
      skills: m.skills,
    })) : [],
    status: project.status,
    milestones: Array.isArray(project.milestones) ? project.milestones.map(m => ({
      stageNumber: m.stageNumber,
      title: m.title,
      description: m.description,
      status: m.status,
      targetDays: m.targetDays,
    })) : [],
    proposals: project.proposals,
    collaborationOffers: project.collaborationOffers || [],
    prototypeUpdate: project.prototypeUpdate,
    pilotReport: project.pilotReport,
    outcomeAudit: project.outcomeAudit,
    budgetEstimated: project.budgetEstimated,
    budgetApproved: project.budgetApproved,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

/**
 * Reads nivaaran_challenges from localStorage, converts them, merges into workflowStore,
 * and clears the legacy key.
 */
export function migrateLegacyChallenges(): void {
  try {
    const legacy = JSON.parse(localStorage.getItem('nivaaran_challenges') || '[]');
    if (Array.isArray(legacy) && legacy.length > 0) {
      console.log(`Migrating ${legacy.length} legacy challenges to workflowStore`);
      legacy.filter(isLegacyChallenge).forEach((doc) => {
        const converted = toWorkflowChallenge(doc);
        workflowStore.addChallenge(converted);
      });
      localStorage.removeItem('nivaaran_challenges');
    }
  } catch (e) {
    console.warn('Failed to migrate legacy challenges', e);
  }
}

/**
 * Reads nivaaran_projects from localStorage, converts them, merges into workflowStore,
 * and clears the legacy key.
 */
export function migrateLegacyProjects(): void {
  try {
    const legacy = JSON.parse(localStorage.getItem('nivaaran_projects') || '[]');
    if (Array.isArray(legacy) && legacy.length > 0) {
      console.log(`Migrating ${legacy.length} legacy projects to workflowStore`);
      legacy.filter(isLegacyProject).forEach((doc) => {
        const converted = toWorkflowProject(doc);
        workflowStore.createProject(converted);
      });
      localStorage.removeItem('nivaaran_projects');
    }
  } catch (e) {
    console.warn('Failed to migrate legacy projects', e);
  }
}

/**
 * Converts a backend API Challenge entity (from PostgreSQL/Prisma) to the frontend Workflow Challenge type.
 */
export function toWorkflowChallengeFromApi(item: any): Challenge {
  const status = toChallengeStatus(item.status);
  const stage = getStageForStatus(status);
  return {
    id: item.id,
    reportId: item.reportId || item.id.slice(0, 8).toUpperCase(),
    title: item.title,
    description: item.description,
    district: item.district_code || item.district || 'Ranchi',
    block: item.block_code || item.block || 'Kanke',
    village: item.area_panchayat || item.village || '',
    category: item.category || 'General',
    status,
    stageNumber: stage?.stageNumber || 1,
    stageName: stage ? formatStageName(stage.stageNumber) : 'Submitted',
    priorityScore: item.priority_score ? Number(item.priority_score) : undefined,
    evidenceUrls: Array.isArray(item.evidence)
      ? item.evidence.map((e: any) => e.storage_ref).filter(Boolean)
      : (item.evidenceUrls || (item.evidenceUrl ? [item.evidenceUrl] : [])),
    videoUrl: item.videoUrl,
    videoUrls: item.videoUrls || (item.videoUrl ? [item.videoUrl] : []),
    audioUrl: item.audioUrl,
    voiceLanguage: item.voiceLanguage,
    evidenceType: item.evidenceType || (item.videoUrl ? 'video' : 'image'),
    assignedHEI: item.assigned_org_id || item.assignedHEI,
    assignedDept: item.assigned_dept || item.assignedDept,
    createdAt: item.created_at ? new Date(item.created_at).toISOString() : (item.createdAt || new Date().toISOString()),
    updatedAt: item.updated_at ? new Date(item.updated_at).toISOString() : (item.updatedAt || new Date().toISOString()),
  };
}
