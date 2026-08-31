import { 
  collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, where, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { workflowStore, STORE_EVENT } from './workflowStore';
import { toWorkflowChallenge, toLegacyChallengeDoc, toWorkflowProject, toLegacyProjectDoc } from './workflowAdapters';
import type {
  ChallengeStatus,
  CollaborationOffer,
  MilestoneStatus,
  OutcomeAudit,
  PilotReport,
  PriorityFactors,
  ProjectStatus,
  Proposal,
  PrototypeUpdate,
} from './workflowTypes';
import { getStageForStatus, formatStageName } from './workflowLifecycle';
import { rankUniversitiesForChallenge } from './heiMatchingEngine';

// Helper: Upload photo/video file to Firebase Storage
export const uploadEvidenceImage = async (file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `evidence_photos/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('[Firebase Storage] Image upload error, using object URL fallback:', error);
    return URL.createObjectURL(file);
  }
};

// 1. Challenges / Reports Persistence
export interface ChallengeDoc {
  id?: string;
  reportId: string;
  title: string;
  district: string;
  block: string;
  village: string;
  category: string;
  status: ChallengeStatus;
  summary: string;
  evidenceUrl?: string;
  locationCoords?: { lat: number; lng: number };
  formattedAddress?: string;
  priorityScore?: number;
  confidenceScore?: number;
  riskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';
  aiReasoning?: string;
  priorityFactors?: PriorityFactors;
  needsHumanVerification?: boolean;
  assignedHEI?: string;
  assignedDept?: string;
  csrSponsor?: string;
  stageNumber?: number;
  stageName?: string;
  govtOfficerNote?: string;
  govtValidatedBy?: string;
  govtValidatedAt?: string;
  clusterId?: string;
  createdAt?: any;
}

export const submitChallengeToFirestore = async (challenge: Omit<ChallengeDoc, 'id'>) => {
  // 1. Add to workflowStore as primary source of truth
  const legacyChallenge: ChallengeDoc = { ...challenge };
  const result = workflowStore.addChallenge(toWorkflowChallenge(legacyChallenge));
  const newId = result.created?.id || result.existing?.id || `CH-${Date.now()}`;

  // 2. Attempt Firestore write as optional secondary persistence.
  // Never create a second remote record for a duplicate report.
  if (result.created) {
    try {
      await addDoc(collection(db, 'challenges'), {
        ...challenge,
        id: newId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('[Firestore] Falling back to workflowStore only:', error);
    }
  }
  return newId;
};

export const subscribeToChallenges = (callback: (challenges: ChallengeDoc[]) => void) => {
  const notifyStore = () => {
    callback(workflowStore.getChallenges().map(toLegacyChallengeDoc));
  };

  // Immediate callback
  notifyStore();

  // Listen to workflowStore updates
  window.addEventListener(STORE_EVENT, notifyStore);

  // Firestore (optional secondary)
  let unsubscribeFirestore = () => {};
  try {
    const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
    unsubscribeFirestore = onSnapshot(q, () => {
      // For the demo, workflowStore is the primary source of truth so we don't overwrite it here.
    }, (error) => {
      console.warn('[Firestore] Not available, relying on workflowStore:', error);
    });
  } catch (error) {
    console.warn('[Firestore] Initialization failed:', error);
  }

  return () => {
    window.removeEventListener(STORE_EVENT, notifyStore);
    unsubscribeFirestore();
  };
};

// 2. Community Feed Persistence
export interface FeedPostDoc {
  id?: string;
  author: string;
  district: string;
  block: string;
  title: string;
  content: string;
  upvotes: number;
  category: string;
  status: string;
  createdAt?: any;
}

export interface FeedCommentDoc {
  id?: string;
  postId: string;
  author: string;
  role: 'Citizen' | 'Government Admin' | 'University Student';
  text: string;
  isVerifiedGovt?: boolean;
  beforeImg?: string;
  afterImg?: string;
  createdAt?: any;
}

export const submitFeedPostToFirestore = async (post: Omit<FeedPostDoc, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'community_posts'), {
      ...post,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.warn('[Firestore] Falling back to local storage for feed posts:', error);
    const existing = JSON.parse(localStorage.getItem('nivaaran_feed_posts') || '[]');
    const newDoc = { ...post, id: `LOCAL-POST-${Date.now()}` };
    localStorage.setItem('nivaaran_feed_posts', JSON.stringify([newDoc, ...existing]));
    return newDoc.id;
  }
};

export const subscribeToFeedPosts = (callback: (posts: FeedPostDoc[]) => void) => {
  try {
    const q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const docs: FeedPostDoc[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as FeedPostDoc[];
      callback(docs);
    }, (error) => {
      console.warn('[Firestore] Using local storage listener for feed posts:', error);
      const existing = JSON.parse(localStorage.getItem('nivaaran_feed_posts') || '[]');
      callback(existing);
    });
  } catch (error) {
    const existing = JSON.parse(localStorage.getItem('nivaaran_feed_posts') || '[]');
    callback(existing);
    return () => {};
  }
};

export const upvotePostInFirestore = async (postId: string, currentUpvotes: number) => {
  try {
    if (!postId.startsWith('LOCAL-')) {
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, { upvotes: currentUpvotes + 1 });
    } else {
      const existing = JSON.parse(localStorage.getItem('nivaaran_feed_posts') || '[]');
      const updated = existing.map((p: any) => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p);
      localStorage.setItem('nivaaran_feed_posts', JSON.stringify(updated));
    }
  } catch (error) {
    console.warn('[Firestore] Local upvote fallback:', error);
  }
};

// 3. District Region Chat Persistence
export interface ChatMessageDoc {
  id?: string;
  sender: string;
  role: string;
  text: string;
  district: string;
  createdAt?: any;
}

export const sendChatMessageToFirestore = async (msg: Omit<ChatMessageDoc, 'id'>) => {
  const newId = `MSG-${Date.now()}`;
  const newMsgDoc: ChatMessageDoc = { ...msg, id: newId };

  // 1. Always persist locally immediately so refreshes never lose data
  try {
    const key = `nivaaran_chat_${msg.district}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...existing, newMsgDoc]));
  } catch (err) {
    console.warn('localStorage save error:', err);
  }

  // 2. Persist to Firestore if available
  try {
    const docRef = await addDoc(collection(db, 'district_chats'), {
      ...msg,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.warn('[Firestore] Local fallback active for chat:', error);
    return newId;
  }
};

export const subscribeToDistrictChat = (district: string, callback: (messages: ChatMessageDoc[]) => void) => {
  const loadLocalMessages = (): ChatMessageDoc[] => {
    try {
      const key = `nivaaran_chat_${district}`;
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      return saved;
    } catch {
      return [];
    }
  };

  // Immediate callback with local storage messages
  callback(loadLocalMessages());

  try {
    const q = query(
      collection(db, 'district_chats'),
      where('district', '==', district)
    );
    return onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const firestoreDocs: ChatMessageDoc[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as ChatMessageDoc[];
        
        // Merge firestore docs with local storage docs without duplicates
        const localDocs = loadLocalMessages();
        const combined = [...localDocs];
        firestoreDocs.forEach(fDoc => {
          if (!combined.some(c => c.id === fDoc.id || c.text === fDoc.text)) {
            combined.push(fDoc);
          }
        });
        callback(combined);
      } else {
        callback(loadLocalMessages());
      }
    }, (error) => {
      console.warn('[Firestore] Using local storage listener for chat:', error);
      callback(loadLocalMessages());
    });
  } catch (error) {
    callback(loadLocalMessages());
    return () => {};
  }
};

// 4. University Projects & Multidisciplinary Teams Persistence
export interface ProjectTeamMember {
  studentId: string;
  name: string;
  departmentName: string;
  role: string;
  skills: string[];
}

export interface MilestoneItem {
  stageNumber: number;
  title: string;
  description: string;
  status: MilestoneStatus;
  targetDays: number;
  evidenceUrl?: string;
}

export interface ProjectDoc {
  id?: string;
  challengeId: string;
  challengeTitle: string;
  category: string;
  district: string;
  universityId: string;
  universityName: string;
  facultyMentorName: string;
  facultyEmail: string;
  teamMembers: ProjectTeamMember[];
  status: ProjectStatus;
  milestones: MilestoneItem[];
  proposals?: Proposal[];
  collaborationOffers?: CollaborationOffer[];
  prototypeUpdate?: PrototypeUpdate;
  pilotReport?: PilotReport;
  outcomeAudit?: OutcomeAudit;
  budgetEstimated?: number;
  budgetApproved?: number;
  createdAt?: any;
  updatedAt?: any;
}

export const saveProjectTeamToStore = (project: ProjectDoc) => {
  try {
    const workflowProj = toWorkflowProject(project);

    // Keep project actions and the linked challenge lifecycle in sync. Do not
    // allow a project to be created for a challenge that has not been accepted.
    const linkedChallenge = workflowStore.getChallenge(workflowProj.challengeId);
    if (!linkedChallenge) return false;
    const targetStatus: Partial<Record<ProjectStatus, ChallengeStatus>> = {
      'Accepted': 'University Accepted',
      'Team Formed': 'In Progress',
      'Proposal Submitted': 'Proposal Submitted',
      'Industry Collaboration': 'Industry Collaboration',
      'Prototype Active': 'Prototype Active',
      'Pilot Active': 'Pilot Active',
      'Outcome Audit': 'Outcome Audit',
    };
    const target = targetStatus[workflowProj.status];
    if (target) {
      const currentStage = getStageForStatus(linkedChallenge.status)?.stageNumber;
      const targetStage = getStageForStatus(target)?.stageNumber;
      if (currentStage === undefined || targetStage === undefined) return false;
      if (currentStage < targetStage) {
        const transition = workflowStore.transitionChallenge(
          linkedChallenge.id,
          target,
          workflowProj.facultyMentorName || workflowProj.universityName,
          'University / Project Team',
          `Project advanced to ${workflowProj.status}.`
        );
        if (!transition.success) return false;
      }
    }

    const existing = workflowStore.getProject(workflowProj.id)
      || workflowStore.getProjectByChallengeId(workflowProj.challengeId);
    if (existing) {
      workflowStore.updateProject(existing.id, { ...workflowProj, id: existing.id });
    } else {
      workflowStore.createProject(workflowProj);
    }
    return true;
  } catch (err) {
    console.error('Error saving project team:', err);
    return false;
  }
};

const getProjectForPhase3 = (projectId: string): { project: ReturnType<typeof workflowStore.getProject>; challenge: ReturnType<typeof workflowStore.getChallenge> } => ({
  project: workflowStore.getProject(projectId),
  challenge: workflowStore.getChallenge(workflowStore.getProject(projectId)?.challengeId || ''),
});

const advanceChallengeIfNeeded = (
  challengeId: string,
  targetStatus: ChallengeStatus,
  actor: string,
  actorRole: string,
  note: string
): boolean => {
  const challenge = workflowStore.getChallenge(challengeId);
  const currentStage = challenge ? getStageForStatus(challenge.status)?.stageNumber : undefined;
  const targetStage = getStageForStatus(targetStatus)?.stageNumber;
  if (!challenge || currentStage === undefined || targetStage === undefined) return false;
  if (currentStage >= targetStage) return true;
  return workflowStore.transitionChallenge(challenge.id, targetStatus, actor, actorRole, note).success;
};

const updateProjectForPhase3 = (
  projectId: string,
  updates: Partial<ReturnType<typeof toWorkflowProject>>,
  actor: string,
  actorRole: string,
  description: string
): boolean => {
  const updated = workflowStore.updateProject(projectId, updates);
  if (!updated) return false;
  workflowStore.addTimelineEvent({
    id: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    entityType: 'project',
    entityId: projectId,
    action: 'phase3_update',
    actor,
    actorRole,
    description,
    timestamp: new Date().toISOString(),
  });
  return true;
};

export const submitCollaborationOffer = (
  projectId: string,
  offer: Omit<CollaborationOffer, 'id' | 'projectId' | 'status' | 'submittedAt'>
): boolean => {
  const { project, challenge } = getProjectForPhase3(projectId);
  if (!project || !challenge) return false;
  const currentStage = getStageForStatus(challenge.status)?.stageNumber || 0;
  if (currentStage < 9 || currentStage > 13) return false;

  if (!advanceChallengeIfNeeded(
    challenge.id,
    'Industry Collaboration',
    offer.partnerName,
    'Industry / CSR Partner',
    `${offer.partnerName} offered ${offer.supportType.toLowerCase()} support.`
  )) return false;

  const newOffer: CollaborationOffer = {
    ...offer,
    id: `COL-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    projectId,
    status: 'Proposed',
    submittedAt: new Date().toISOString(),
  };
  return updateProjectForPhase3(project.id, {
    status: currentStage <= 10 ? 'Industry Collaboration' : project.status,
    collaborationOffers: [...(project.collaborationOffers || []), newOffer],
  }, offer.partnerName, 'Industry / CSR Partner', `${offer.supportType} collaboration offer submitted.`);
};

export const requestCollaborationDetails = (projectId: string, partnerName: string): boolean => {
  const { project, challenge } = getProjectForPhase3(projectId);
  if (!project || !challenge) return false;
  const newOffer: CollaborationOffer = {
    id: `COL-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    projectId,
    partnerName,
    partnerType: 'Industry',
    supportType: 'Mentorship',
    message: 'Please share technical requirements, budget range, and pilot-readiness details.',
    status: 'Details Requested',
    submittedAt: new Date().toISOString(),
  };
  return updateProjectForPhase3(project.id, {
    collaborationOffers: [...(project.collaborationOffers || []), newOffer],
  }, partnerName, 'Industry / CSR Partner', 'Technical details requested from university project team.');
};

export const submitPrototypeUpdate = (
  projectId: string,
  update: Omit<PrototypeUpdate, 'submittedAt'>
): boolean => {
  const { project, challenge } = getProjectForPhase3(projectId);
  if (!project || !challenge) return false;
  const currentStage = getStageForStatus(challenge.status)?.stageNumber || 0;
  if (currentStage < 9 || currentStage > 12) return false;
  if (!advanceChallengeIfNeeded(challenge.id, 'Prototype Active', update.submittedBy, 'University / Project Team', 'Prototype progress submitted.')) return false;
  return updateProjectForPhase3(project.id, {
    status: currentStage <= 11 ? 'Prototype Active' : project.status,
    prototypeUpdate: { ...update, submittedAt: new Date().toISOString() },
  }, update.submittedBy, 'University / Project Team', 'Prototype documentation and telemetry submitted.');
};

export const submitPilotReport = (
  projectId: string,
  report: Omit<PilotReport, 'submittedAt'>
): boolean => {
  const { project, challenge } = getProjectForPhase3(projectId);
  if (!project || !challenge) return false;
  const currentStage = getStageForStatus(challenge.status)?.stageNumber || 0;
  if (currentStage < 11 || currentStage > 12) return false;
  if (!advanceChallengeIfNeeded(challenge.id, 'Pilot Active', report.submittedBy, 'University / Project Team', 'Pilot field report submitted.')) return false;
  return updateProjectForPhase3(project.id, {
    status: 'Pilot Active',
    pilotReport: { ...report, submittedAt: new Date().toISOString() },
  }, report.submittedBy, 'University / Project Team', 'Pilot report and field observations submitted.');
};

export const submitOutcomeAudit = (
  projectId: string,
  audit: OutcomeAudit
): boolean => {
  const { project, challenge } = getProjectForPhase3(projectId);
  if (!project || !challenge) return false;
  const currentStage = getStageForStatus(challenge.status)?.stageNumber || 0;
  if (currentStage < 12 || currentStage > 13) return false;
  if (!advanceChallengeIfNeeded(challenge.id, 'Outcome Audit', audit.verifiedBy, 'Government / Community Auditor', 'Technical and community outcome audit submitted.')) return false;
  return updateProjectForPhase3(project.id, {
    status: 'Outcome Audit',
    outcomeAudit: audit,
  }, audit.verifiedBy, 'Government / Community Auditor', 'Outcome audit submitted for validation.');
};

export const getProjectsFromStore = (): ProjectDoc[] => {
  try {
    return workflowStore.getProjects().map(toLegacyProjectDoc);
  } catch {
    return [];
  }
};

export const subscribeToProjects = (callback: (projects: ProjectDoc[]) => void) => {
  const notify = () => callback(getProjectsFromStore());
  notify();
  window.addEventListener(STORE_EVENT, notify);
  return () => window.removeEventListener(STORE_EVENT, notify);
};

export const updateChallengeUniversityAcceptance = (
  challengeId: string, 
  heiName: string, 
  deptName: string
) => {
  try {
    const challenge = workflowStore.getChallenge(challengeId);
    if (!challenge) return false;

    // The current university UI performs matching and acceptance together.
    // Record the internal stages in order so the transition remains valid.
    const bridgeStatuses: ChallengeStatus[] = ['Clustered', 'Prioritized', 'HEI Matched'];
    for (const bridgeStatus of bridgeStatuses) {
      const current = workflowStore.getChallenge(challengeId);
      const currentStage = current ? getStageForStatus(current.status)?.stageNumber : undefined;
      const bridgeStage = getStageForStatus(bridgeStatus)?.stageNumber;
      if (currentStage !== undefined && bridgeStage !== undefined && currentStage < bridgeStage) {
        const bridgeResult = workflowStore.transitionChallenge(
          challengeId,
          bridgeStatus,
          'Nivaaran Matching Engine',
          'System',
          `Advanced to ${bridgeStatus} before university acceptance.`
        );
        if (!bridgeResult.success) return false;
      }
    }

    const note = `Accepted by ${heiName} (${deptName}). Multidisciplinary R&D team assigned.`;
    const transitioned = workflowStore.transitionChallenge(
      challengeId,
      'University Accepted',
      heiName,
      'Faculty / Mentor',
      note
    );
    if (!transitioned.success) return false;

    return Boolean(workflowStore.updateChallenge(challengeId, {
      assignedHEI: heiName,
      assignedDept: deptName,
    }));
  } catch (err) {
    console.error('Error updating challenge acceptance:', err);
    return false;
  }
};

// ── Government Validation Action ──────────────────────────────────────────────
// Sets status to 'Government Validated', stage 3. Then auto-runs HEI matching
// to advance through Prioritized (stage 5) → HEI Matched (stage 6).
export const govValidateChallenge = async (
  challengeId: string,
  officerNote: string,
  officerName: string
): Promise<boolean> => {
  const updates: Partial<ChallengeDoc> = {
    status: 'Government Validated',
    govtOfficerNote: officerNote || `Validated by Government Officer (${officerName}). Queued for HEI matching.`,
    needsHumanVerification: false,
  };

  // 1. Update workflowStore (primary)
  try {
    const transitioned = workflowStore.transitionChallenge(challengeId, 'Government Validated', officerName, 'Government Department', officerNote);
    if (!transitioned.success) return false;
    workflowStore.updateChallenge(challengeId, {
      needsHumanVerification: false,
      govtValidatedBy: officerName,
      govtValidatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[WorkflowStore] Failed to transition challenge:', err);
    return false;
  }

  // 2. Auto-run HEI matching (stages 5 → 6) after a brief delay for UX
  setTimeout(() => {
    try {
      const challenge = workflowStore.getChallenge(challengeId);
      if (!challenge) return;

      // Build a ChallengeDoc from workflowStore data for the matching engine
      const challengeDoc: ChallengeDoc = {
        reportId: challenge.reportId,
        title: challenge.title,
        district: challenge.district,
        block: challenge.block,
        village: challenge.village,
        category: challenge.category,
        status: challenge.status,
        summary: challenge.description,
        priorityScore: challenge.priorityScore,
        riskLevel: challenge.riskLevel,
      };

      const rankings = rankUniversitiesForChallenge(challengeDoc);
      if (rankings.length === 0) return;

      const bestMatch = rankings[0];
      const now = new Date().toISOString();
      const stageHEIMatched = 6;

      // Advance through Prioritized (5) → HEI Matched (6)
      workflowStore.updateChallenge(challengeId, {
        status: 'HEI Matched',
        stageNumber: stageHEIMatched,
        stageName: formatStageName(stageHEIMatched),
        assignedHEI: bestMatch.university.name,
        assignedDept: bestMatch.recommendedDepartment?.name || bestMatch.university.departments[0]?.name,
        updatedAt: now,
      });

      // Timeline: Prioritized
      workflowStore.addTimelineEvent({
        id: `TL-${Date.now()}-prioritized`,
        entityType: 'challenge',
        entityId: challengeId,
        action: 'status_changed',
        actor: 'AI Prioritization Engine',
        actorRole: 'AI System',
        description: `Challenge prioritized. Priority score: ${challenge.priorityScore ?? 'N/A'}/100. Risk level: ${challenge.riskLevel ?? 'STANDARD'}. Queued for institution matching.`,
        previousValue: 'Government Validated',
        newValue: 'Prioritized',
        timestamp: new Date(Date.now() + 1).toISOString(),
      });

      // Timeline: HEI Matched
      workflowStore.addTimelineEvent({
        id: `TL-${Date.now()}-hei-matched`,
        entityType: 'challenge',
        entityId: challengeId,
        action: 'status_changed',
        actor: 'AI HEI Matching Engine',
        actorRole: 'AI System',
        description: `Matched to ${bestMatch.university.name} (${bestMatch.university.shortName}) — ${bestMatch.matchScore}% compatibility. Department: ${bestMatch.recommendedDepartment?.name || 'General'}. ${bestMatch.matchingReasons[0] || ''}`,
        previousValue: 'Prioritized',
        newValue: 'HEI Matched',
        timestamp: new Date(Date.now() + 2).toISOString(),
      });
    } catch (err) {
      console.warn('[HEI AutoMatch] Failed:', err);
    }
  }, 800); // 800ms delay so the gov validated status renders first

  // 3. Update Firestore (if available)
  try {
    if (challengeId && !challengeId.startsWith('LOCAL-') && !challengeId.startsWith('CH-')) {
      await updateDoc(doc(db, 'challenges', challengeId), updates);
    }
    return true;
  } catch (err) {
    console.warn('[Firestore] Govt validate failed:', err);
    return true;
  }
};

// ── Reject Challenge Action ───────────────────────────────────────────────────
// Sets status to 'Rejected', removing it from the active queue. Visible to citizen.
export const govRejectChallenge = async (
  challengeId: string,
  officerNote: string,
  officerName: string
): Promise<boolean> => {
  const updates: Partial<ChallengeDoc> = {
    status: 'Rejected',
    govtOfficerNote: officerNote || `Rejected by Government Officer (${officerName}). Challenge does not meet submission criteria.`,
    needsHumanVerification: false,
  };

  // 1. Update workflowStore (primary)
  try {
    workflowStore.updateChallenge(challengeId, {
      status: 'Rejected',
      stageNumber: 2,
      stageName: 'Rejected',
      govtOfficerNote: updates.govtOfficerNote,
      needsHumanVerification: false,
      govtValidatedBy: officerName,
      govtValidatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    workflowStore.addTimelineEvent({
      id: `TL-${Date.now()}-reject`,
      entityType: 'challenge',
      entityId: challengeId,
      action: 'status_changed',
      actor: officerName,
      actorRole: 'Government Department',
      description: officerNote || `Challenge rejected by ${officerName}.`,
      previousValue: 'Under Review',
      newValue: 'Rejected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[WorkflowStore] Failed to reject challenge:', err);
    return false;
  }

  // 2. Update Firestore (if available)
  try {
    if (challengeId && !challengeId.startsWith('LOCAL-') && !challengeId.startsWith('CH-')) {
      await updateDoc(doc(db, 'challenges', challengeId), updates);
    }
    return true;
  } catch (err) {
    console.warn('[Firestore] Reject failed:', err);
    return true;
  }
};

// ── Request Additional Evidence Action ────────────────────────────────────────
// Marks the challenge as needing more evidence from the citizen. Visible to citizen.
export const govRequestEvidence = async (
  challengeId: string,
  officerNote: string,
  officerName: string
): Promise<boolean> => {
  const updates: Partial<ChallengeDoc> = {
    status: 'Evidence Requested',
    needsHumanVerification: true,
    govtOfficerNote: officerNote || `Evidence requested by Government Officer (${officerName}). Please upload additional photos/GPS data.`,
  };

  // 1. Update workflowStore (primary)
  try {
    const transitioned = workflowStore.transitionChallenge(challengeId, 'Evidence Requested', officerName, 'Government Department', officerNote);
    if (!transitioned.success) return false;
    workflowStore.updateChallenge(challengeId, {
      needsHumanVerification: true,
    });
  } catch (err) {
    console.warn('[WorkflowStore] Failed to transition challenge:', err);
    return false;
  }

  // 2. Update Firestore (if available)
  try {
    if (challengeId && !challengeId.startsWith('LOCAL-') && !challengeId.startsWith('CH-')) {
      await updateDoc(doc(db, 'challenges', challengeId), updates);
    }
    return true;
  } catch (err) {
    console.warn('[Firestore] Request evidence failed:', err);
    return true;
  }
};
