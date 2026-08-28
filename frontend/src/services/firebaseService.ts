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
    // Update local storage challenges
    const localChallenges: ChallengeDoc[] = JSON.parse(localStorage.getItem('nivaaran_challenges') || '[]');
    const idx = localChallenges.findIndex(c => (c.id === challengeId || c.reportId === challengeId));
    if (idx >= 0) {
      localChallenges[idx].assignedHEI = heiName;
      localChallenges[idx].assignedDept = deptName;
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
