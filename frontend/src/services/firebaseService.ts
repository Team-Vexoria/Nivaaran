import { 
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, getDoc, where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { workflowStore, STORE_EVENT } from './workflowStore';
import { toLegacyChallengeDoc, toWorkflowChallenge, toWorkflowProject, toLegacyProjectDoc } from './workflowAdapters';
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
  ResearchResult,
} from './workflowTypes';
import { getStageForStatus, formatStageName } from './workflowLifecycle';
import { rankUniversitiesForChallenge } from './heiMatchingEngine';

// Helper: Upload photo file to Firebase Storage
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

// Helper: Upload video file to Firebase Storage
export const uploadEvidenceVideo = async (file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `evidence_videos/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('[Firebase Storage] Video upload error, using object URL fallback:', error);
    return URL.createObjectURL(file);
  }
};

// Helper: Upload voice recording audio to Firebase Storage
export const uploadEvidenceAudio = async (blob: Blob, filename = 'voice_report.webm'): Promise<string> => {
  try {
    const storageRef = ref(storage, `evidence_audio/${Date.now()}_${filename}`);
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('[Firebase Storage] Audio upload error, using object URL fallback:', error);
    return URL.createObjectURL(blob);
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
  counterTerms?: string,
  fallbackFullDoc?: CollaborationRequest
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
    } else if (fallbackFullDoc) {
      existing.unshift({ ...fallbackFullDoc, ...updates });
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
  status: ChallengeStatus;
  summary: string;
  evidenceUrl?: string;
  evidenceUrls?: string[];
  videoUrl?: string;
  videoUrls?: string[];
  audioUrl?: string;
  voiceLanguage?: string;
  evidenceType?: 'image' | 'video' | 'mixed';
  locationCoords?: { lat: number; lng: number };
  formattedAddress?: string;
  priorityScore?: number;
  confidenceScore?: number;
  riskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';
  aiReasoning?: string;
  priorityFactors?: PriorityFactors;
  research?: ResearchResult;
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
  govtValidatedBy?: string;
  govtValidatedAt?: string;
  clusterId?: string;
  citizenReportCount?: number;
  communityUpvotes?: number;
  extractedMetadata?: import('./dataExtractionService').IncidentExtractedData;
  translations?: Record<string, any>;
  reporterId?: string;
  reporterEmail?: string;
  reporterName?: string;
  createdAt?: any;
  affectedPopulation?: number;
  economicValueEstimate?: number;
  estimatedResolutionCost?: number;
  isProvisionalIntake?: boolean;
  provisionalReason?: string;
}

export const submitChallengeToFirestore = async (challenge: Omit<ChallengeDoc, 'id'> & { id?: string }) => {
  // 1. Primary: Save to local workflowStore immediately so UI responds in 0ms
  const targetId = challenge.id || challenge.reportId || `CH-${Date.now()}`;
  const legacyChallenge: ChallengeDoc = { ...challenge, id: targetId, reportId: challenge.reportId || targetId };
  const { workflowStore } = await import('./workflowStore');
  const result = await workflowStore.addChallenge(toWorkflowChallenge(legacyChallenge));
  const newId = result.created?.id || result.existing?.id || targetId;

  // 2. Secondary: Background non-blocking sync to API and Firestore
  (async () => {
    try {
      const { apiClient } = await import('../api/client');
      await apiClient.createChallenge({ ...challenge, id: newId } as any);
    } catch (err) {
      console.warn('[API] Background challenge sync failed:', err);
    }

    if (result.created) {
      try {
        await addDoc(collection(db, 'challenges'), {
          ...challenge,
          id: newId,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.warn('[Firestore] Background challenge write skipped:', error);
      }
    }
  })();

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

  // Poll API for backend challenges every 10 seconds.
  // FIX: Previously this called callback() directly with raw Prisma objects
  // mapped through toLegacyChallengeDoc, but Prisma returns snake_case fields
  // (district_code, created_at) while toLegacyChallengeDoc expects camelCase
  // workflow Challenge fields (district, createdAt). This mangled every
  // challenge and overwrote local state with garbage — causing user-submitted
  // challenges to vanish and be replaced by seed data.
  // FIX2: Now we properly convert via toWorkflowChallengeFromApi, then merge
  // into the local store (which triggers STORE_EVENT for React re-renders).
  const apiInterval = setInterval(async () => {
    try {
      const { apiClient } = await import('../api/client');
      const { toWorkflowChallengeFromApi } = await import('./workflowAdapters');
      const res = await apiClient.getChallenges();
      if (res.ok && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const localChallenges = workflowStore.getChallenges();
        // Properly convert API (Prisma) data to workflow Challenge format
        const serverChallenges = res.data.map((item: any) => toWorkflowChallengeFromApi(item));
        // IMPORTANT: Never let server data overwrite local DEMO seed challenges.
        // DEMO challenges have curated assignedHEI values that must be preserved.
        const realServerChallenges = serverChallenges
          .filter((c: any) => !c.id?.startsWith('DEMO-') && c.id !== 'NIV-JH-RNC-2026-0042' && c.reportId !== 'NIV-JH-RNC-2026-0042')
          .map((sc: any) => {
            const local = localChallenges.find((lc: any) => lc.id === sc.id || lc.reportId === sc.reportId);
            if (local) {
              return {
                ...sc,
                assignedHEI: local.assignedHEI || sc.assignedHEI,
                assignedDept: local.assignedDept || sc.assignedDept,
                status: (local.stageNumber || 0) >= (sc.stageNumber || 0) ? (local.status || sc.status) : sc.status,
                stageNumber: Math.max(local.stageNumber || 0, sc.stageNumber || 0) || sc.stageNumber,
                stageName: (local.stageNumber || 0) >= (sc.stageNumber || 0) ? (local.stageName || sc.stageName) : sc.stageName,
              };
            }
            return sc;
          });
        const serverIds = new Set([
          ...realServerChallenges.map((c: any) => c.id).filter(Boolean),
          ...realServerChallenges.map((c: any) => c.reportId).filter(Boolean),
        ]);
        // Real server challenges update/add; local entries (including DEMOs) are preserved
        const merged = [
          ...localChallenges.filter((c: any) => !serverIds.has(c.id) && !serverIds.has(c.reportId)),
          ...realServerChallenges,
        ];
        // Only persist if something actually changed (avoids infinite loop)
        if (merged.length !== localChallenges.length || merged.some((c, i) => c.id !== localChallenges[i]?.id)) {
          workflowStore.loadFromApi({ challenges: merged });
        }
      }
    } catch {
      // Keep using local store
    }
  }, 10000);

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
    clearInterval(apiInterval);
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
  evidenceUrl?: string;
  evidenceUrls?: string[];
  videoUrl?: string;
  videoUrls?: string[];
  audioUrl?: string;
  voiceLanguage?: string;
  evidenceType?: 'image' | 'video' | 'mixed';
  comments?: FeedCommentDoc[];
  translations?: Record<string, any>;
  createdAt?: any;
}

export interface FeedCommentDoc {
  id?: string;
  postId?: string;
  author: string;
  role: 'Citizen' | 'Government Admin' | 'University Student' | 'Faculty / Mentor' | 'Industry / MSME';
  text: string;
  timestamp?: string;
  isVerifiedGovt?: boolean;
  beforeImg?: string;
  afterImg?: string;
  createdAt?: any;
}

export const submitFeedPostToFirestore = async (post: Omit<FeedPostDoc, 'id'>) => {
  const newId = `POST-${Date.now()}`;
  try {
    const existing = JSON.parse(localStorage.getItem('nivaaran_feed_posts') || '[]');
    const newDoc = { ...post, id: newId };
    localStorage.setItem('nivaaran_feed_posts', JSON.stringify([newDoc, ...existing]));
  } catch (e) {
    console.warn('[Feed] Local storage save failed:', e);
  }

  // Background non-blocking Firestore write
  (async () => {
    try {
      await addDoc(collection(db, 'community_posts'), {
        ...post,
        id: newId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('[Firestore] Background feed post write skipped:', error);
    }
  })();

  return newId;
};

export const subscribeToFeedPosts = (callback: (posts: FeedPostDoc[]) => void) => {
  let unsubscribeFirestore = () => {};
  
  const notifyLocal = () => {
    try {
      callback(JSON.parse(localStorage.getItem('nivaaran_feed_posts') || '[]'));
    } catch {
      callback([]);
    }
  };

  try {
    const q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'));
    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const posts: FeedPostDoc[] = [];
      snapshot.forEach(doc => posts.push({ id: doc.id, ...doc.data() } as FeedPostDoc));
      
      // Merge with local storage for offline support
      const local = JSON.parse(localStorage.getItem('nivaaran_feed_posts') || '[]');
      const localMap = new Map(local.map((p: any) => [p.id, p]));
      posts.forEach(p => localMap.set(p.id, p));
      
      const merged = Array.from(localMap.values()).sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      callback(merged as FeedPostDoc[]);
    }, (err) => {
      console.warn('[Firestore] Feed subscription failed, using local storage:', err);
      notifyLocal();
    });
  } catch (error) {
    console.warn('[Firestore] Initialization failed, using local storage:', error);
    notifyLocal();
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('nivaaran-storage-changed', notifyLocal);
  }

  return () => {
    unsubscribeFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('nivaaran-storage-changed', notifyLocal);
    }
  };
};

export const deleteChallengeDoc = async (id: string): Promise<boolean> => {
  const ok = workflowStore.deleteChallenge(id);
  // Also clean up local storage and try firestore in background
  try {
    const existing = JSON.parse(localStorage.getItem('nivaaran_challenges') || '[]');
    const filtered = existing.filter((c: any) => c.id !== id && c.reportId !== id);
    localStorage.setItem('nivaaran_challenges', JSON.stringify(filtered));
  } catch {}

  // Also purge from community feed posts if matched
  try {
    const existingPosts = JSON.parse(localStorage.getItem('nivaaran_feed_posts') || '[]');
    const filteredPosts = existingPosts.filter((p: any) => 
      p.id !== id && 
      p.challengeId !== id && 
      p.reportId !== id && 
      p.ticketId !== id &&
      (p as any).customId !== id
    );
    localStorage.setItem('nivaaran_feed_posts', JSON.stringify(filteredPosts));
  } catch {}

  // Delete from Firestore if online and not a local ID
  try {
    if (id && !id.startsWith('LOCAL-')) {
      const challengeRef = doc(db, 'challenges', id);
      await deleteDoc(challengeRef);
    }
  } catch (err) {
    console.warn('[Firestore] Delete challenge fallback:', err);
  }

  try {
    if (id && !id.startsWith('LOCAL-')) {
      const postRef = doc(db, 'community_posts', id);
      await deleteDoc(postRef);
    }
  } catch (err) {
    console.warn('[Firestore] Delete post fallback:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nivaaran-storage-changed'));
    window.dispatchEvent(new CustomEvent(STORE_EVENT));
  }

  return ok;
};

export const deleteFeedPostFromFirestore = async (postId: string): Promise<boolean> => {
  try {
    const existing = JSON.parse(localStorage.getItem('nivaaran_feed_posts') || '[]');
    const filtered = existing.filter((p: any) => p.id !== postId);
    localStorage.setItem('nivaaran_feed_posts', JSON.stringify(filtered));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('nivaaran-storage-changed'));
    }
  } catch {}
  return true;
};

export const upvotePostInFirestore = async (postId: string, currentUpvotes: number) => {
  try {
    if (!postId.startsWith('LOCAL-')) {
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, { upvotes: currentUpvotes + 1 });
    }
  } catch (error) {
    console.warn('[Firestore] Local upvote fallback:', error);
  }
  
  // Local storage fallback
  const existing = JSON.parse(localStorage.getItem('nivaaran_feed_posts') || '[]');
  const updated = existing.map((p: any) => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p);
  localStorage.setItem('nivaaran_feed_posts', JSON.stringify(updated));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nivaaran-storage-changed'));
  }
};

export const addCommentToFeedPost = async (postId: string, comment: Omit<FeedCommentDoc, 'id'>) => {
  const newComment = { ...comment, id: `C-${Date.now()}` };
  try {
    if (!postId.startsWith('LOCAL-')) {
      const postRef = doc(db, 'community_posts', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postData = postSnap.data() as FeedPostDoc;
        const existingComments = postData.comments || [];
        await updateDoc(postRef, { comments: [...existingComments, newComment] });
      }
    }
  } catch (error) {
    console.warn('[Firestore] Local comment fallback:', error);
  }
  
  // Local storage fallback
  const existing = JSON.parse(localStorage.getItem('nivaaran_feed_posts') || '[]');
  const updated = existing.map((p: any) => {
    if (p.id === postId) {
      return { ...p, comments: [...(p.comments || []), newComment] };
    }
    return p;
  });
  localStorage.setItem('nivaaran_feed_posts', JSON.stringify(updated));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nivaaran-storage-changed'));
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
  let unsubscribeFirestore = () => {};
  const key = `nivaaran_chat_${district}`;

  const loadLocalMessages = (): ChatMessageDoc[] => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  };

  try {
    // Wait for the firebase query to return something
    // Because we use firestore we do an actual query for chat
    // Ensure you fetch district specific chats
    const q = query(collection(db, 'district_chats'), orderBy('createdAt', 'asc'));
    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessageDoc[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as ChatMessageDoc;
        if (data.district === district) {
          msgs.push({ id: doc.id, ...data });
        }
      });
      
      const local = loadLocalMessages();
      const localMap = new Map(local.map((m: any) => [m.id, m]));
      msgs.forEach(m => localMap.set(m.id, m));
      
      callback(Array.from(localMap.values()).sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      }));
    }, (err) => {
      console.warn('[Firestore] Chat subscription failed:', err);
      callback(loadLocalMessages());
    });
  } catch (err) {
    console.warn('[Firestore] Chat init failed:', err);
    callback(loadLocalMessages());
  }

  const handleStorageChange = () => {
    callback(loadLocalMessages());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('nivaaran-storage-changed', handleStorageChange);
  }

  return () => {
    unsubscribeFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('nivaaran-storage-changed', handleStorageChange);
    }
  };
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

export const saveProjectTeamToStore = async (project: ProjectDoc) => {
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
        const transition = await workflowStore.transitionChallenge(
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
      await workflowStore.createProject(workflowProj);
    }
    return true;
  } catch (err) {
    console.error('Error saving project team:', err);
    return false;
  }
};

const getProjectForPhase3 = (projectId: string): { project: ReturnType<typeof workflowStore.getProject>; challenge: ReturnType<typeof workflowStore.getChallenge> } => {
  let project = workflowStore.getProject(projectId);
  if (!project) {
    project = workflowStore.getProjects().find(p => p.id === projectId || p.challengeId === projectId);
  }
  let challenge = project ? (workflowStore.getChallenge(project.challengeId) || workflowStore.findChallengeByIdOrReportId(project.challengeId)) : undefined;
  if (!challenge) {
    challenge = workflowStore.findChallengeByIdOrReportId(projectId);
  }
  if (!project && challenge) {
    project = workflowStore.getProjects().find(p => p.challengeId === challenge?.id || p.challengeId === challenge?.reportId);
  }
  return { project, challenge };
};

const advanceChallengeIfNeeded = async (
  challengeId: string,
  targetStatus: ChallengeStatus,
  actor: string,
  actorRole: string,
  note: string
): Promise<boolean> => {
  const challenge = workflowStore.findChallengeByIdOrReportId(challengeId);
  const currentStage = challenge ? getStageForStatus(challenge.status)?.stageNumber : undefined;
  const targetStage = getStageForStatus(targetStatus)?.stageNumber;
  if (!challenge || currentStage === undefined || targetStage === undefined) return false;
  if (currentStage >= targetStage) return true;
  return (await workflowStore.transitionChallenge(challenge.id, targetStatus, actor, actorRole, note)).success;
};

const updateProjectForPhase3 = async (
  projectId: string,
  updates: Partial<ReturnType<typeof toWorkflowProject>>,
  actor: string,
  actorRole: string,
  description: string
): Promise<boolean> => {
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

export const submitCollaborationOffer = async (
  projectId: string,
  offer: Omit<CollaborationOffer, 'id' | 'projectId' | 'status' | 'submittedAt'>
): Promise<boolean> => {
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

export const requestCollaborationDetails = async (projectId: string, partnerName: string): Promise<boolean> => {
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

export const submitPrototypeUpdate = async (
  projectId: string,
  update: Omit<PrototypeUpdate, 'submittedAt'>
): Promise<boolean> => {
  let { project, challenge } = getProjectForPhase3(projectId);
  if (!challenge && project) challenge = workflowStore.findChallengeByIdOrReportId(project.challengeId);
  if (!challenge) challenge = workflowStore.findChallengeByIdOrReportId(projectId);
  if (challenge && !project) {
    const prjId = projectId.startsWith('PRJ-') || projectId.startsWith('DEMO-PRJ-') ? projectId : `PRJ-${challenge.id}`;
    const newPrj: any = {
      id: prjId,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      universityId: 'UNI-CUJ-RANCHI',
      universityName: challenge.assignedHEI || 'Central University of Jharkhand (CUJ)',
      category: challenge.category,
      district: challenge.district,
      status: 'Prototype Active',
      teamMembers: [],
      proposals: [],
      budgetEstimated: 500000,
      budgetApproved: 500000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await workflowStore.createProject(newPrj);
    project = newPrj;
  }
  if (!project || !challenge) return false;

  await workflowStore.updateChallenge(challenge.id, {
    status: 'Prototype Active',
    stageNumber: 11,
    stageName: 'Stage 11: Prototype Development & Testing',
  });

  return updateProjectForPhase3(project.id, {
    status: 'Prototype Active',
    prototypeUpdate: { ...update, submittedAt: new Date().toISOString() },
  }, update.submittedBy, 'University / Project Team', 'Prototype documentation and telemetry submitted.');
};

export const submitPilotReport = async (
  projectId: string,
  report: Omit<PilotReport, 'submittedAt'>
): Promise<boolean> => {
  let { project, challenge } = getProjectForPhase3(projectId);
  if (!challenge && project) challenge = workflowStore.findChallengeByIdOrReportId(project.challengeId);
  if (!challenge) challenge = workflowStore.findChallengeByIdOrReportId(projectId);
  if (challenge && !project) {
    const prjId = projectId.startsWith('PRJ-') || projectId.startsWith('DEMO-PRJ-') ? projectId : `PRJ-${challenge.id}`;
    const newPrj: any = {
      id: prjId,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      universityId: 'UNI-CUJ-RANCHI',
      universityName: challenge.assignedHEI || 'Central University of Jharkhand (CUJ)',
      category: challenge.category,
      district: challenge.district,
      status: 'Pilot Active',
      teamMembers: [],
      proposals: [],
      budgetEstimated: 500000,
      budgetApproved: 500000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await workflowStore.createProject(newPrj);
    project = newPrj;
  }
  if (!project || !challenge) return false;

  await workflowStore.updateChallenge(challenge.id, {
    status: 'Pilot Active',
    stageNumber: 12,
    stageName: 'Stage 12: Panchayat Pilot & Field Trials',
  });

  return updateProjectForPhase3(project.id, {
    status: 'Pilot Active',
    pilotReport: { ...report, submittedAt: new Date().toISOString() },
  }, report.submittedBy, 'University / Project Team', 'Pilot report and field observations submitted.');
};

export const submitOutcomeAudit = async (
  projectId: string,
  audit: OutcomeAudit
): Promise<boolean> => {
  let { project, challenge } = getProjectForPhase3(projectId);
  if (!challenge && project) {
    challenge = workflowStore.findChallengeByIdOrReportId(project.challengeId);
  }
  if (!challenge) {
    challenge = workflowStore.findChallengeByIdOrReportId(projectId);
  }

  // If no project exists yet in store, create/register one so state is persisted
  if (challenge && !project) {
    const prjId = projectId.startsWith('PRJ-') || projectId.startsWith('DEMO-PRJ-') ? projectId : `DEMO-PRJ-${challenge.id.replace(/[^a-zA-Z0-9]/g, '')}`;
    const newPrj: any = {
      id: prjId,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      universityId: 'UNI-CUJ-RANCHI',
      universityName: challenge.assignedHEI || 'Central University of Jharkhand (CUJ)',
      category: challenge.category,
      district: challenge.district,
      status: 'Outcome Audit',
      teamMembers: [],
      proposals: [],
      budgetEstimated: 500000,
      budgetApproved: 500000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await workflowStore.createProject(newPrj);
    project = newPrj;
  }

  if (!project || !challenge) {
    console.warn('[submitOutcomeAudit] Project or challenge not found for:', projectId);
    return false;
  }

  // Advance challenge to Stage 13: Outcome Audit
  await workflowStore.updateChallenge(challenge.id, {
    status: 'Outcome Audit',
    stageNumber: 13,
    stageName: 'Stage 13: Outcome Audit & Scaled Production Clearance',
    govtOfficerNote: `Stage 13 Outcome Audit submitted by ${audit.verifiedBy}. Verified findings: ${audit.summary}`,
  });

  workflowStore.addTimelineEvent({
    id: `TL_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    entityType: 'challenge',
    entityId: challenge.id,
    action: 'status_changed',
    actor: audit.verifiedBy || 'Research Team',
    actorRole: 'Student Research Lead',
    description: `Stage 13 Outcome Audit submitted: ${audit.summary}`,
    previousValue: challenge.status,
    newValue: 'Outcome Audit',
    timestamp: new Date().toISOString()
  });

  return updateProjectForPhase3(project.id, {
    status: 'Outcome Audit',
    outcomeAudit: audit,
  }, audit.verifiedBy || 'Research Team', 'Student Research Lead', 'Stage 13 Outcome audit submitted for validation.');
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

export const updateChallengeUniversityAcceptance = async (
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
        const bridgeResult = await workflowStore.transitionChallenge(
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
    const transitioned = await workflowStore.transitionChallenge(
      challengeId,
      'University Accepted',
      heiName,
      'Faculty / Mentor',
      note
    );
    if (!transitioned.success) return false;

    return Boolean(await workflowStore.updateChallenge(challengeId, {
      assignedHEI: heiName,
      assignedDept: deptName,
    }));
  } catch (err) {
    console.error('Error updating challenge acceptance:', err);
    return false;
  }
};

// Government Proposal Review
// Government officers review university-submitted technical proposals (Stage 9).
//   Approve: challenge advances to Prototype Active (Stage 11)
//   Request Revision: challenge stays at Proposal Submitted (Stage 9)
//   Reject: challenge reverts to In Progress (Stage 8) so the team can refine and resubmit.
export const govApproveProposal = async (
  projectId: string,
  proposalId: string,
  officerNote: string,
  officerName: string
): Promise<boolean> => {
  const { project, challenge } = getProjectForPhase3(projectId);
  if (!project || !challenge) return false;

  const proposals = (project.proposals || []).map(p => p.id === proposalId
    ? { ...p, status: 'Approved' as const, reviewNote: officerNote }
    : p);

  const note = officerNote || `Proposal approved by Government Officer (${officerName}). Solution work initiated.`;
  const advanced = await advanceChallengeIfNeeded(
    challenge.id,
    'Prototype Active',
    officerName,
    'Government Department',
    note
  );
  if (!advanced) return false;

  return updateProjectForPhase3(
    project.id,
    {
      status: 'Prototype Active',
      budgetApproved: project.budgetEstimated ?? project.budgetApproved,
      proposals,
    },
    officerName,
    'Government Department',
    `Proposal ${proposalId} approved ΓÇö advancing to prototype phase.`
  );
};

export const govRequestProposalRevision = async (
  projectId: string,
  proposalId: string,
  officerNote: string,
  officerName: string
): Promise<boolean> => {
  const { project, challenge } = getProjectForPhase3(projectId);
  if (!project || !challenge) return false;

  const proposals = (project.proposals || []).map(p => p.id === proposalId
    ? { ...p, status: 'Revision Requested' as const, reviewNote: officerNote }
    : p);

  const note = officerNote || `Revision requested by Government Officer (${officerName}). Please refine the technical proposal.`;
  // Challenge remains at Proposal Submitted (Stage 9).
  await workflowStore.updateChallenge(challenge.id, { govtOfficerNote: note });

  return updateProjectForPhase3(
    project.id,
    { status: 'Proposal Submitted', proposals },
    officerName,
    'Government Department',
    `Revision requested on proposal ${proposalId}.`
  );
};

export const govRejectProposal = async (
  projectId: string,
  proposalId: string,
  officerNote: string,
  officerName: string
): Promise<boolean> => {
  const { project, challenge } = getProjectForPhase3(projectId);
  if (!project || !challenge) return false;

  const proposals = (project.proposals || []).map(p => p.id === proposalId
    ? { ...p, status: 'Rejected' as const, reviewNote: officerNote }
    : p);

  const note = officerNote || `Proposal rejected by Government Officer (${officerName}).`;
  // Revert challenge to In Progress (Stage 8) so the team can refine & resubmit.
  const reverted = await workflowStore.updateChallenge(challenge.id, {
    status: 'In Progress',
    stageNumber: 8,
    stageName: formatStageName(8),
    govtOfficerNote: note,
  });
  if (!reverted) return false;

  workflowStore.addTimelineEvent({
    id: `TL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    entityType: 'challenge',
    entityId: challenge.id,
    action: 'status_changed',
    actor: officerName,
    actorRole: 'Government Department',
    description: note,
    previousValue: 'Proposal Submitted',
    newValue: 'In Progress',
    timestamp: new Date().toISOString(),
  });

  return updateProjectForPhase3(
    project.id,
    { status: 'Team Formed', proposals },
    officerName,
    'Government Department',
    `Proposal ${proposalId} rejected ΓÇö reverting to team formation.`
  );
};

// ΓöÇΓöÇ Government Validation Action ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Sets status to 'Government Validated', stage 3. Then auto-runs HEI matching
// to advance through Prioritized (stage 5) ΓåÆ HEI Matched (stage 6).
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
    const transitioned = await workflowStore.transitionChallenge(challengeId, 'Government Validated', officerName, 'Government Department', officerNote);
    if (!transitioned.success) {
      /* Direct update fallback ensures verification succeeds reliably */
      const { formatStageName } = await import('./workflowLifecycle');
      await workflowStore.updateChallenge(challengeId, {
        status: 'Government Validated',
        stageNumber: 5,
        stageName: formatStageName(5),
        govtOfficerNote: updates.govtOfficerNote,
        needsHumanVerification: false,
        govtValidatedBy: officerName,
        govtValidatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      workflowStore.addTimelineEvent({
        id: `TL_${Date.now()}_validate`,
        entityType: 'challenge',
        entityId: challengeId,
        action: 'status_changed',
        actor: officerName,
        actorRole: 'Government Department',
        description: officerNote || `Validated by Government Officer (${officerName}). Queued for HEI matching.`,
        previousValue: 'Under Review',
        newValue: 'Government Validated',
        timestamp: new Date().toISOString(),
      });
    } else {
      await workflowStore.updateChallenge(challengeId, {
        needsHumanVerification: false,
        govtValidatedBy: officerName,
        govtValidatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[WorkflowStore] Failed to transition challenge:', err);
    try {
      const { formatStageName } = await import('./workflowLifecycle');
      await workflowStore.updateChallenge(challengeId, {
        status: 'Government Validated',
        stageNumber: 5,
        stageName: formatStageName(5),
        govtOfficerNote: updates.govtOfficerNote,
        needsHumanVerification: false,
        govtValidatedBy: officerName,
        govtValidatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e2) {
      console.warn('[WorkflowStore] Fallback update error:', e2);
    }
  }

  // 2. Sync to Backend API if available
  try {
    const { apiClient } = await import('../api/client');
    await apiClient.transitionChallenge(challengeId, 'Government Validated', { note: officerNote, officer: officerName });
  } catch (e) {
    console.warn('[API] govValidate transition sync skipped:', e);
  }

  // 3. Auto-run HEI matching (stages 5 -> 6) after a brief delay for UX
  setTimeout(async () => {
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

      // Advance through Prioritized (5) -> HEI Matched (6)
      await workflowStore.updateChallenge(challengeId, {
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
        description: `Matched to ${bestMatch.university.name} (${bestMatch.university.shortName}) - ${bestMatch.matchScore}% compatibility. Department: ${bestMatch.recommendedDepartment?.name || 'General'}. ${bestMatch.matchingReasons[0] || ''}`,
        previousValue: 'Prioritized',
        newValue: 'HEI Matched',
        timestamp: new Date(Date.now() + 2).toISOString(),
      });
    } catch (err) {
      console.warn('[HEI AutoMatch] Failed:', err);
    }
  }, 800); // 800ms delay so the gov validated status renders first

  // 4. Update Firestore (if available)
  try {
    if (challengeId && !challengeId.startsWith('LOCAL-') && !challengeId.startsWith('CH-')) {
      await updateDoc(doc(db, 'challenges', challengeId), updates);
    }
  } catch (err) {
    console.warn('[Firestore] Govt validate failed:', err);
  }

  return true;
};

// -- Reject Challenge Action ---------------------------------------------------
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
    await workflowStore.updateChallenge(challengeId, {
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

  // 2. Sync to API if available
  try {
    const { apiClient } = await import('../api/client');
    await apiClient.transitionChallenge(challengeId, 'Rejected', { note: officerNote, officer: officerName });
  } catch (err) {
    console.warn('[API] govReject transition skipped:', err);
  }

  // 3. Update Firestore (if available)
  try {
    if (challengeId && !challengeId.startsWith('LOCAL-') && !challengeId.startsWith('CH-')) {
      await updateDoc(doc(db, 'challenges', challengeId), updates);
    }
  } catch (err) {
    console.warn('[Firestore] Reject failed:', err);
  }
  return true;
};

// -- Request Additional Evidence Action ----------------------------------------
// Marks the challenge as needing more evidence from the citizen. Visible to citizen.
export const govRequestEvidence = async (
  challengeId: string,
  officerNote: string,
  officerName: string
): Promise<boolean> => {
  try {
    const transitioned = await workflowStore.transitionChallenge(challengeId, 'Evidence Requested', officerName, 'Government Department', officerNote);
    if (!transitioned.success) return false;
    await workflowStore.updateChallenge(challengeId, {
      needsHumanVerification: true,
    });
    return true;
  } catch (err) {
    console.warn('[WorkflowStore] Failed to transition challenge:', err);
    return false;
  }
};

// -- University Prototype Progress (Stage 11) ----------------------------------
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
    if (challengeId && !challengeId.startsWith('LOCAL-') && !challengeId.startsWith('CH-')) {
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

