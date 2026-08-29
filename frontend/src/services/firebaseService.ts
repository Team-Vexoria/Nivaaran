import { 
  collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, where, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

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

// ── Industry / CSR Collaboration Types ────────────────────────────────────────

export type OrgType = 'Large Corporate' | 'PSU' | 'MSME' | 'Startup' | 'Foundation / Trust' | 'Research Lab';

export type CollaborationType =
  | 'CSR Cash Grant'
  | 'Hardware / Component Sponsorship'
  | 'Dedicated Testing Facility'
  | 'Cloud Infrastructure Credits'
  | 'Technical Mentorship'
  | 'Pilot Deployment Site & Field Access';

export type IpOwnershipPreference =
  | 'University retains full IP, industry gets acknowledgement'
  | 'Joint IP — university publishes, industry gets non-exclusive social-use license'
  | 'Company seeks exclusive license (requires Govt of Jharkhand approval)';

export type CollaborationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under University Review'
  | 'Negotiation — Counter Terms Sent'
  | 'MoU Signed'
  | 'Active'
  | 'Completed'
  | 'Declined';

export type Schedule7Category =
  | 'i. Eradicating extreme hunger, poverty and malnutrition'
  | 'ii. Promoting education, employment, livelihood'
  | 'iii. Promoting gender equality, empowering women'
  | 'iv. Ensuring environmental sustainability'
  | 'v. Protection of national heritage, art and culture'
  | 'vi. Measures for the benefit of armed forces veterans'
  | 'vii. Training to promote rural sports, nationally recognised sports'
  | 'viii. Contributions to PM National Relief Fund'
  | 'ix. Contributions to science, technology, engineering, medicine R&D'
  | 'x. Rural development projects'
  | 'xi. Slum area development'
  | 'xii. Disaster management, relief, rehabilitation';

export interface DisbursementMilestone {
  trancheNumber: number;
  label: string;
  triggerStageNumber: number;
  triggerStageName: string;
  amountInr: number;
  inKindDescription?: string;
  releaseCondition: string;
  status: 'Pending' | 'Unlocked' | 'Released';
  releasedAt?: string;
  confirmedByIndustry?: boolean;
  confirmedByOrg?: string;
}

export interface CollaborationRequest {
  id?: string;
  requestId: string;                     // e.g. CSR-REQ-2026-0001
  projectId: string;                     // from nivaaran_projects
  challengeId: string;                   // linked ChallengeDoc id / reportId
  challengeTitle: string;
  assignedHEI: string;

  // Step 1 — Organizational Identity & Legal Standing
  orgName: string;
  orgType: OrgType;
  cinNumber: string;                     // CIN or Udyam Reg No.
  csrRegistrationNumber: string;         // CSR-1 from MCA portal
  authorizedSignatoryName: string;
  authorizedSignatoryDesignation: string;
  authorizedSignatoryEmail: string;

  // Compliance flags (must all be true to Submit)
  has12ACertificate: boolean;
  has80GCertificate: boolean;
  hasSeparateCsrBankAccount: boolean;
  auditedFinancialsAvailable: boolean;   // last 3 years
  schedule7Category: Schedule7Category;

  // Step 2 — Collaboration Scope & Type
  collaborationTypes: CollaborationType[];
  proposedBudgetInr: number;            // total in INR (in-kind monetised)
  inKindDetails?: string;               // describe if hardware/services
  sdgAlignment: string;                 // e.g. SDG-11 Sustainable Cities
  expectedCommunityBeneficiaries: number;
  socialOutcomesStatement: string;      // what measurable outcomes they commit to

  // Step 3 — IP, Branding & Legal Terms
  ipOwnershipPreference: IpOwnershipPreference;
  exclusivityRequired: boolean;
  brandingScope: string;                // what acknowledgements they expect
  confidentialityScope?: string;        // any data not for public tracker
  disputeResolution: 'Platform Arbitration' | 'State Court, Jharkhand' | 'Mutual Negotiation';

  // Step 4 — Disbursement Milestone Plan
  disbursementMilestones: DisbursementMilestone[];

  // Status & Review
  status: CollaborationStatus;
  universityReviewNote?: string;
  universityCounterTerms?: string;
  reviewedByFaculty?: string;
  submittedByOrg?: string;
  submittedAt?: string;
  updatedAt?: string;
  moSignedAt?: string;
}

// ── COLLABORATION REQUEST CRUD ─────────────────────────────────────────────────

export const generateRequestId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CSR-REQ-${year}-${rand}`;
};

export const submitCollaborationRequest = async (
  request: Omit<CollaborationRequest, 'id'>
): Promise<string> => {
  const data: Omit<CollaborationRequest, 'id'> = {
    ...request,
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Persist to localStorage immediately (offline-first)
  try {
    const existing: CollaborationRequest[] = JSON.parse(
      localStorage.getItem('nivaaran_collab_requests') || '[]'
    );
    const localDoc = { ...data, id: `LOCAL-COLLAB-${Date.now()}` };
    localStorage.setItem('nivaaran_collab_requests', JSON.stringify([localDoc, ...existing]));
    // Try Firestore async
    addDoc(collection(db, 'collaboration_requests'), data).catch(e =>
      console.warn('[Firestore] collab request upload failed, localStorage ok:', e)
    );
    return localDoc.id!;
  } catch (err) {
    throw new Error('Failed to save collaboration request: ' + err);
  }
};

export const subscribeToCollaborationRequests = (
  callback: (requests: CollaborationRequest[]) => void,
  filterByChallenge?: string
): (() => void) => {
  // Firestore real-time (best effort)
  let unsub = () => {};
  try {
    const q = filterByChallenge
      ? query(collection(db, 'collaboration_requests'), where('challengeId', '==', filterByChallenge), orderBy('submittedAt', 'desc'))
      : query(collection(db, 'collaboration_requests'), orderBy('submittedAt', 'desc'));

    unsub = onSnapshot(q, (snap) => {
      const fromFirestore = snap.docs.map(d => ({ id: d.id, ...d.data() } as CollaborationRequest));
      // Merge with localStorage
      const fromLocal: CollaborationRequest[] = JSON.parse(
        localStorage.getItem('nivaaran_collab_requests') || '[]'
      );
      const merged = [
        ...fromFirestore,
        ...fromLocal.filter(l => !fromFirestore.find(f => f.requestId === l.requestId)),
      ];
      callback(merged);
    }, (err) => {
      console.warn('[Firestore] collab subscribe error, falling back to localStorage:', err);
      const fromLocal: CollaborationRequest[] = JSON.parse(
        localStorage.getItem('nivaaran_collab_requests') || '[]'
      );
      callback(fromLocal);
    });
  } catch {
    const fromLocal: CollaborationRequest[] = JSON.parse(
      localStorage.getItem('nivaaran_collab_requests') || '[]'
    );
    callback(fromLocal);
  }

  return unsub;
};

export const updateCollaborationRequestStatus = async (
  requestId: string,
  status: CollaborationStatus,
  note: string,
  reviewerName: string,
  counterTerms?: string
): Promise<boolean> => {
  const updates: Partial<CollaborationRequest> = {
    status,
    universityReviewNote: note,
    universityCounterTerms: counterTerms,
    reviewedByFaculty: reviewerName,
    updatedAt: new Date().toISOString(),
    ...(status === 'MoU Signed' ? { moSignedAt: new Date().toISOString() } : {}),
  };

  // localStorage
  try {
    const existing: CollaborationRequest[] = JSON.parse(
      localStorage.getItem('nivaaran_collab_requests') || '[]'
    );
    const idx = existing.findIndex(r => r.id === requestId || r.requestId === requestId);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...updates };
      localStorage.setItem('nivaaran_collab_requests', JSON.stringify(existing));
    }
  } catch (err) {
    console.warn('[localStorage] collab status update failed:', err);
  }

  // Firestore
  try {
    if (requestId && !requestId.startsWith('LOCAL-')) {
      await updateDoc(doc(db, 'collaboration_requests', requestId), updates);
    }
  } catch (err) {
    console.warn('[Firestore] collab status update failed, localStorage updated:', err);
  }
  return true;
};

export const confirmTrancheDisbursement = async (
  requestId: string,
  trancheNumber: number,
  confirmedByOrg: string
): Promise<boolean> => {
  const existing: CollaborationRequest[] = JSON.parse(
    localStorage.getItem('nivaaran_collab_requests') || '[]'
  );
  const idx = existing.findIndex(r => r.id === requestId || r.requestId === requestId);
  if (idx >= 0) {
    const milestones = existing[idx].disbursementMilestones.map(m =>
      m.trancheNumber === trancheNumber
        ? { ...m, status: 'Released' as const, confirmedByIndustry: true, confirmedByOrg, releasedAt: new Date().toISOString() }
        : m
    );
    existing[idx] = { ...existing[idx], disbursementMilestones: milestones, updatedAt: new Date().toISOString() };
    localStorage.setItem('nivaaran_collab_requests', JSON.stringify(existing));
  }
  return true;
};

export const getCollaborationRequestsFromStore = (): CollaborationRequest[] => {
  try {
    return JSON.parse(localStorage.getItem('nivaaran_collab_requests') || '[]');
  } catch {
    return [];
  }
};

export interface PrototypeDetails {
  hardwareSpec?: string;
  githubUrl?: string;
  telemetryLogs?: string;
  prototypeDate?: string;
  testingResults?: string;
  submittedByStudent?: string;
  circuitDiagramUrl?: string;
}

export interface PilotDetails {
  panchayatLocation?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  communityBeneficiaries?: number;
  groundVerificationReport?: string;
  pilotVerifiedByOfficer?: boolean;
}

export interface DeploymentDetails {
  deploymentAgency?: string;
  installationDate?: string;
  stateBudgetUtilized?: number;
  verifiedClosureDate?: string;
  impactCertificateId?: string;
  saplingVoucherId?: string;
}

// 1. Challenges / Reports Persistence
export interface ChallengeDoc {
  id?: string;
  reportId: string;
  title: string;
  district: string;
  block: string;
  village: string;
  category: string;
  status: 'Under Review' | 'Government Validated' | 'In Progress' | 'Resolved';
  summary: string;
  evidenceUrl?: string;
  locationCoords?: { lat: number; lng: number };
  formattedAddress?: string;
  priorityScore?: number;
  confidenceScore?: number;
  riskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';
  aiReasoning?: string;
  priorityFactors?: any;
  needsHumanVerification?: boolean;
  assignedHEI?: string;
  assignedDept?: string;
  csrSponsor?: string;
  stageNumber?: number;
  stageName?: string;
  govtOfficerNote?: string;
  prototypeDetails?: PrototypeDetails;
  pilotDetails?: PilotDetails;
  deploymentDetails?: DeploymentDetails;
  createdAt?: any;
}

export const submitChallengeToFirestore = async (challenge: Omit<ChallengeDoc, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'challenges'), {
      ...challenge,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.warn('[Firestore] Falling back to local storage for challenges:', error);
    const existing = JSON.parse(localStorage.getItem('nivaaran_challenges') || '[]');
    const newDoc = { ...challenge, id: `LOCAL-${Date.now()}` };
    localStorage.setItem('nivaaran_challenges', JSON.stringify([newDoc, ...existing]));
    return newDoc.id;
  }
};

export const subscribeToChallenges = (callback: (challenges: ChallengeDoc[]) => void) => {
  try {
    const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const docs: ChallengeDoc[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as ChallengeDoc[];
      callback(docs);
    }, (error) => {
      console.warn('[Firestore] Using local storage listener for challenges:', error);
      const existing = JSON.parse(localStorage.getItem('nivaaran_challenges') || '[]');
      callback(existing);
    });
  } catch (error) {
    const existing = JSON.parse(localStorage.getItem('nivaaran_challenges') || '[]');
    callback(existing);
    return () => {};
  }
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
  status: 'Completed' | 'In Progress' | 'Pending';
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
  status: 'Accepted' | 'Team Formed' | 'Proposal Submitted' | 'Prototype Active' | 'Completed';
  milestones: MilestoneItem[];
  budgetEstimated?: number;
  createdAt?: any;
}

export const saveProjectTeamToStore = (project: ProjectDoc) => {
  try {
    const existing: ProjectDoc[] = JSON.parse(localStorage.getItem('nivaaran_projects') || '[]');
    const index = existing.findIndex(p => p.challengeId === project.challengeId);
    if (index >= 0) {
      existing[index] = { ...existing[index], ...project };
    } else {
      existing.unshift({ ...project, id: `PROJ-${Date.now()}` });
    }
    localStorage.setItem('nivaaran_projects', JSON.stringify(existing));
    return true;
  } catch (err) {
    console.error('Error saving project team:', err);
    return false;
  }
};

export const getProjectsFromStore = (): ProjectDoc[] => {
  try {
    return JSON.parse(localStorage.getItem('nivaaran_projects') || '[]');
  } catch {
    return [];
  }
};

export const updateChallengeUniversityAcceptance = (
  challengeId: string, 
  heiName: string, 
  deptName: string
) => {
  try {
    const localChallenges: ChallengeDoc[] = JSON.parse(localStorage.getItem('nivaaran_challenges') || '[]');
    const idx = localChallenges.findIndex(c => (c.id === challengeId || c.reportId === challengeId));
    if (idx >= 0) {
      localChallenges[idx].assignedHEI = heiName;
      localChallenges[idx].assignedDept = deptName;
      localChallenges[idx].status = 'In Progress';
      localChallenges[idx].stageNumber = 7;
      localChallenges[idx].stageName = 'Stage 7: University Accepted & Project Allocation';
      localChallenges[idx].govtOfficerNote = `Accepted by ${heiName} (${deptName}). Multidisciplinary R&D team assigned.`;
      localStorage.setItem('nivaaran_challenges', JSON.stringify(localChallenges));
    }
    return true;
  } catch (err) {
    console.error('Error updating challenge acceptance:', err);
    return false;
  }
};

// ── Government Validation Action ──────────────────────────────────────────────
// Sets status to 'Government Validated', stage 3. Visible immediately to citizen.
export const govValidateChallenge = async (
  challengeId: string,
  officerNote: string,
  officerName: string
): Promise<boolean> => {
  const updates: Partial<ChallengeDoc> = {
    status: 'Government Validated',
    stageNumber: 3,
    stageName: 'Stage 3: Government Validated & Prioritized',
    govtOfficerNote: officerNote || `Validated by Government Officer (${officerName}). Queued for HEI matching.`,
    needsHumanVerification: false,
  };

  // 1. Update localStorage (immediate, works offline)
  try {
    const localChallenges: ChallengeDoc[] = JSON.parse(localStorage.getItem('nivaaran_challenges') || '[]');
    const idx = localChallenges.findIndex(c => c.id === challengeId || c.reportId === challengeId);
    if (idx >= 0) {
      localChallenges[idx] = { ...localChallenges[idx], ...updates };
      localStorage.setItem('nivaaran_challenges', JSON.stringify(localChallenges));
    }
  } catch (err) {
    console.warn('[localStorage] Failed to update challenge:', err);
  }

  // 2. Update Firestore (if available)
  try {
    if (challengeId && !challengeId.startsWith('LOCAL-')) {
      await updateDoc(doc(db, 'challenges', challengeId), updates);
    }
    return true;
  } catch (err) {
    console.warn('[Firestore] Govt validate failed, localStorage updated:', err);
    return true; // localStorage update still succeeded
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
    needsHumanVerification: true,
    govtOfficerNote: officerNote || `Evidence requested by Government Officer (${officerName}). Please upload additional photos/GPS data.`,
    stageName: 'Stage 2: Evidence Requested by Government Officer',
    stageNumber: 2,
  };

  try {
    const localChallenges: ChallengeDoc[] = JSON.parse(localStorage.getItem('nivaaran_challenges') || '[]');
    const idx = localChallenges.findIndex(c => c.id === challengeId || c.reportId === challengeId);
    if (idx >= 0) {
      localChallenges[idx] = { ...localChallenges[idx], ...updates };
      localStorage.setItem('nivaaran_challenges', JSON.stringify(localChallenges));
    }
  } catch (err) {
    console.warn('[localStorage] Failed to update challenge:', err);
  }

  try {
    if (challengeId && !challengeId.startsWith('LOCAL-')) {
      await updateDoc(doc(db, 'challenges', challengeId), updates);
    }
    return true;
  } catch (err) {
    console.warn('[Firestore] Request evidence failed, localStorage updated:', err);
    return true;
  }
};

// ── University Prototype Progress (Stage 11) ──────────────────────────────────
export const submitPrototypeProgress = async (
  challengeId: string,
  prototype: PrototypeDetails,
  studentName: string
): Promise<boolean> => {
  const updates: Partial<ChallengeDoc> = {
    stageNumber: 11,
    stageName: 'Stage 11: Hardware Prototype Ready & Lab Verified',
    status: 'In Progress',
    prototypeDetails: {
      ...prototype,
      prototypeDate: new Date().toISOString(),
      submittedByStudent: studentName,
    },
    govtOfficerNote: `Prototype submitted by ${studentName}. Telemetry active. Ready for Panchayat ground trial.`,
  };

  try {
    const localChallenges: ChallengeDoc[] = JSON.parse(localStorage.getItem('nivaaran_challenges') || '[]');
    const idx = localChallenges.findIndex(c => c.id === challengeId || c.reportId === challengeId);
    if (idx >= 0) {
      localChallenges[idx] = { ...localChallenges[idx], ...updates };
      localStorage.setItem('nivaaran_challenges', JSON.stringify(localChallenges));
    }
  } catch (err) {
    console.warn('[localStorage] Failed to update prototype:', err);
  }

  try {
    if (challengeId && !challengeId.startsWith('LOCAL-')) {
      await updateDoc(doc(db, 'challenges', challengeId), updates);
    }
    return true;
  } catch (err) {
    console.warn('[Firestore] Submit prototype failed, localStorage updated:', err);
    return true;
  }
};

// ── University Pilot Ground Trial (Stage 12) ──────────────────────────────────
export const submitPilotGroundTrial = async (
  challengeId: string,
  pilot: PilotDetails,
  studentName: string
): Promise<boolean> => {
  const updates: Partial<ChallengeDoc> = {
    stageNumber: 12,
    stageName: 'Stage 12: Panchayat Ground Trial Active',
    status: 'In Progress',
    pilotDetails: {
      ...pilot,
      trialStartDate: pilot.trialStartDate || new Date().toISOString(),
    },
    govtOfficerNote: `Ground trial initiated by ${studentName} in ${pilot.panchayatLocation || 'Panchayat'}. Beneficiaries: ~${pilot.communityBeneficiaries || 2500}. Awaiting Government Officer field audit.`,
  };

  try {
    const localChallenges: ChallengeDoc[] = JSON.parse(localStorage.getItem('nivaaran_challenges') || '[]');
    const idx = localChallenges.findIndex(c => c.id === challengeId || c.reportId === challengeId);
    if (idx >= 0) {
      localChallenges[idx] = { ...localChallenges[idx], ...updates };
      localStorage.setItem('nivaaran_challenges', JSON.stringify(localChallenges));
    }
  } catch (err) {
    console.warn('[localStorage] Failed to update pilot:', err);
  }

  try {
    if (challengeId && !challengeId.startsWith('LOCAL-')) {
      await updateDoc(doc(db, 'challenges', challengeId), updates);
    }
    return true;
  } catch (err) {
    console.warn('[Firestore] Submit pilot failed, localStorage updated:', err);
    return true;
  }
};

// ── Government Verify Pilot & Deploy Statewide (Stage 14 -> 16 Resolved) ───────
export const govVerifyAndDeployChallenge = async (
  challengeId: string,
  deploymentNote: string,
  officerName: string,
  budgetAllocated: number = 250000
): Promise<boolean> => {
  const reportCode = challengeId.replace('LOCAL-', 'JH-2026-');
  const updates: Partial<ChallengeDoc> = {
    status: 'Resolved',
    stageNumber: 16,
    stageName: 'Stage 16: Knowledge Package & Verified Closure',
    govtOfficerNote: deploymentNote || `Pilot verified and authorized for statewide installation by ${officerName}. Audit proof logged to State Impact Ledger.`,
    deploymentDetails: {
      deploymentAgency: `Jharkhand State Technical Directorate / ${officerName}`,
      installationDate: new Date().toISOString(),
      stateBudgetUtilized: budgetAllocated,
      verifiedClosureDate: new Date().toISOString(),
      impactCertificateId: `JH-IMPACT-${reportCode}`,
      saplingVoucherId: `JH-FOREST-SAPLING-${Math.floor(100000 + Math.random() * 900000)}`,
    },
  };

  try {
    const localChallenges: ChallengeDoc[] = JSON.parse(localStorage.getItem('nivaaran_challenges') || '[]');
    const idx = localChallenges.findIndex(c => c.id === challengeId || c.reportId === challengeId);
    if (idx >= 0) {
      localChallenges[idx] = { ...localChallenges[idx], ...updates };
      localStorage.setItem('nivaaran_challenges', JSON.stringify(localChallenges));
    }
  } catch (err) {
    console.warn('[localStorage] Failed to update deployment closure:', err);
  }

  try {
    if (challengeId && !challengeId.startsWith('LOCAL-')) {
      await updateDoc(doc(db, 'challenges', challengeId), updates);
    }
    return true;
  } catch (err) {
    console.warn('[Firestore] Govt verify deploy failed, localStorage updated:', err);
    return true;
  }
};

// ── Search or Retrieve Challenge by Report ID ─────────────────────────────────
export const getChallengeByReportId = (
  reportIdOrQuery: string,
  allChallenges: ChallengeDoc[]
): ChallengeDoc | null => {
  if (!reportIdOrQuery || !reportIdOrQuery.trim()) return null;
  const q = reportIdOrQuery.trim().toLowerCase();

  // 1. Exact match on reportId or ID
  const exact = allChallenges.find(
    c => c.reportId?.toLowerCase() === q || c.id?.toLowerCase() === q
  );
  if (exact) return exact;

  // 2. Partial match on reportId, title, district, or village
  const partial = allChallenges.find(
    c => c.reportId?.toLowerCase().includes(q) ||
         c.title?.toLowerCase().includes(q) ||
         c.district?.toLowerCase().includes(q) ||
         c.village?.toLowerCase().includes(q)
  );
  return partial || null;
};
