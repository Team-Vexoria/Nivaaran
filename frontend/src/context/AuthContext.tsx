import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { demoAuthEnabled } from '../api/client';
import { getUniversityByEmail } from '../services/universityData';

export type UserRole =
  | 'Citizen'
  | 'Government Department'
  | 'University Admin'
  | 'Faculty / Mentor'
  | 'Student'
  | 'Industry / MSME'
  | 'CSR Organization'
  | 'Platform Super Admin'
  | 'Community / NGO'
  | 'PRI (Panchayat)'
  | 'ULB (Urban Local Body)'
  | 'Research Lab / Industry Lab';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  district?: string;
  institution?: string;
  photoURL?: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string, role?: UserRole) => Promise<UserProfile>;
  signupWithEmail: (email: string, pass: string, name: string, role: UserRole) => Promise<UserProfile>;
  loginWithGoogle: (role?: UserRole) => Promise<UserProfile>;
  loginDemoUser: (role: UserRole, name: string, uid?: string) => UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Official pre-assigned accounts mapping
const OFFICIAL_ROLE_MAP: Record<string, UserRole> = {
  'nivaaran@gov.in': 'Government Department',
  'admin@bitmesra.in': 'Faculty / Mentor',
  'bitmesera@nivaaran.com': 'Faculty / Mentor',
  'bitmesra@nivaaran.com': 'Faculty / Mentor',
  'iitism@nivaaran.com': 'Faculty / Mentor',
  'nitjsr@nivaaran.com': 'Faculty / Mentor',
  'faculty@bitmesra.in': 'Faculty / Mentor',
  'student@bitmesra.in': 'Student',
  'partner@tatasteel.com': 'Industry / MSME',
  'foundation@csr.org': 'CSR Organization',
  'citizen@nivaaran.in': 'Citizen',
  'admin@nivaaran.in': 'Platform Super Admin',
  'ngo@nivaaran.in': 'Community / NGO',
  'pri@nivaaran.in': 'PRI (Panchayat)',
  'ulb@nivaaran.in': 'ULB (Urban Local Body)',
  'lab@nivaaran.in': 'Research Lab / Industry Lab',
};

const OFFICIAL_NAME_MAP: Record<string, string> = {
  'nivaaran@gov.in': 'Jharkhand State Nodal Officer',
  'admin@bitmesra.in': 'BIT Mesra Faculty Lead',
  'bitmesera@nivaaran.com': 'BIT Mesra Faculty Lead',
  'bitmesra@nivaaran.com': 'BIT Mesra Faculty Lead',
  'iitism@nivaaran.com': 'IIT (ISM) Dhanbad Faculty Lead',
  'nitjsr@nivaaran.com': 'NIT Jamshedpur Faculty Lead',
  'faculty@bitmesra.in': 'Prof. Alok Sharma',
  'student@bitmesra.in': 'Pooja Kumari',
  'partner@tatasteel.com': 'Tata Steel Innovation Lead',
  'foundation@csr.org': 'CSR Foundation Lead',
  'citizen@nivaaran.in': 'Ramesh Soren',
  'admin@nivaaran.in': 'NIVAARAN State Super Admin',
  'ngo@nivaaran.in': 'Sewa Samiti Jharkhand',
  'pri@nivaaran.in': 'Gram Panchayat Adhyaksh',
  'ulb@nivaaran.in': 'Ranchi Municipal Commissioner',
  'lab@nivaaran.in': 'IIT(ISM) Dhanbad Innovation Lab',
};

const isMockFirebase = (): boolean => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return !key || key === 'mock_key' || key === 'demo-api-key' || key.startsWith('mock_');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local session first
    const demoData = localStorage.getItem('nivaaran_demo_user');
    if (demoData) {
      try {
        setCurrentUser(JSON.parse(demoData));
      } catch {
        // ignore parse error
      }
    }

    if (!isMockFirebase()) {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
          if (fbUser) {
            try {
              const token = await fbUser.getIdToken();
              const res = await fetch(`${import.meta.env?.VITE_API_URL || ''}/api/v1/auth/sync`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ email: fbUser.email, name: fbUser.displayName || fbUser.email })
              });
              if (!res.ok) console.warn('[AuthSync] sync failed');
            } catch (e) { console.warn('[AuthSync] error:', e); }
            const userEmail = fbUser.email?.toLowerCase() || '';
            const matchedUni = getUniversityByEmail(userEmail);
            const isStudent = userEmail.includes('student') || OFFICIAL_ROLE_MAP[userEmail] === 'Student';
            const mappedOfficialRole = OFFICIAL_ROLE_MAP[userEmail] || (matchedUni ? (isStudent ? 'Student' : 'Faculty / Mentor') : undefined);
            const savedRole = mappedOfficialRole || (localStorage.getItem(`nivaaran_role_${fbUser.uid}`) as UserRole) || 'Citizen';
            
            setCurrentUser({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || OFFICIAL_NAME_MAP[userEmail] || fbUser.email?.split('@')[0] || 'NIVAARAN User',
              role: savedRole,
              institution: matchedUni ? matchedUni.name : undefined,
            });
          } else if (!demoData) {
            setCurrentUser(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.warn('[Auth] Firebase listener initialization notice:', err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const getReadableAuthError = (error: any): string => {
    const code = error?.code || '';
    const message = error?.message || '';
    if (code === 'auth/api-key-not-valid' || code === 'auth/invalid-api-key' || message.includes('api-key-not-valid')) {
      return 'Firebase API key is not configured or invalid. Using local simulated mode.';
    }
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please verify your credentials or select an account from the auto-fill panel.';
      case 'auth/configuration-not-found':
        return 'Email/Password sign-in is disabled in your Firebase Console. Please enable Email/Password provider.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please Sign In instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'Google Sign-In popup was closed before completing.';
      default:
        return error?.message || 'Authentication error occurred. Please try again.';
    }
  };

  const createLocalUser = (email: string, role: UserRole, customName?: string): UserProfile => {
    const cleanEmail = email.toLowerCase().trim();
    const matchedUni = getUniversityByEmail(cleanEmail);
    const isStudent = role === 'Student' || cleanEmail.includes('student') || OFFICIAL_ROLE_MAP[cleanEmail] === 'Student';
    const assignedRole: UserRole = isStudent ? 'Student' : (OFFICIAL_ROLE_MAP[cleanEmail] || (matchedUni ? 'Faculty / Mentor' : role));
    const name = customName || OFFICIAL_NAME_MAP[cleanEmail] || (matchedUni ? (isStudent ? `${matchedUni.shortName} Student Lead` : `${matchedUni.shortName} Faculty Lead`) : cleanEmail.split('@')[0]);
    const userProfile: UserProfile = {
      uid: 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'),
      email: cleanEmail,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
      role: assignedRole,
      institution: matchedUni ? matchedUni.name : undefined,
    };
    if (matchedUni) {
      localStorage.setItem('nivaaran_active_university_id', matchedUni.id);
    }
    localStorage.setItem(`nivaaran_role_${userProfile.uid}`, assignedRole);
    localStorage.setItem('nivaaran_demo_user', JSON.stringify(userProfile));
    setCurrentUser(userProfile);
    return userProfile;
  };

  const loginWithEmail = async (email: string, pass: string, role: UserRole = 'Citizen') => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    // If mock Firebase is configured, or recognized official credential, or college test email, log in directly
    if (isMockFirebase() || OFFICIAL_ROLE_MAP[cleanEmail] || getUniversityByEmail(cleanEmail)) {
      const profile = createLocalUser(cleanEmail, role);
      setLoading(false);
      return profile;
    }

    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const userEmail = (res.user.email || email).toLowerCase();
      const matchedUni = getUniversityByEmail(userEmail);
      const isStudent = role === 'Student' || userEmail.includes('student') || OFFICIAL_ROLE_MAP[userEmail] === 'Student';
      const assignedRole = isStudent ? 'Student' : (OFFICIAL_ROLE_MAP[userEmail] || (matchedUni ? 'Faculty / Mentor' : role));

      const userProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || OFFICIAL_NAME_MAP[userEmail] || (matchedUni ? (isStudent ? `${matchedUni.shortName} Student Lead` : `${matchedUni.shortName} Faculty Lead`) : email.split('@')[0]),
        role: assignedRole,
        institution: matchedUni ? matchedUni.name : undefined,
      };
      if (matchedUni) {
        localStorage.setItem('nivaaran_active_university_id', matchedUni.id);
      }
      localStorage.setItem(`nivaaran_role_${res.user.uid}`, assignedRole);
      localStorage.removeItem('nivaaran_demo_user');
      setCurrentUser(userProfile);
      return userProfile;
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      // Graceful fallback if Firebase API key is invalid or offline
      if (
        code === 'auth/api-key-not-valid' ||
        code === 'auth/invalid-api-key' ||
        code === 'auth/app-not-authorized' ||
        msg.includes('api-key-not-valid') ||
        role === 'Citizen'
      ) {
        return createLocalUser(cleanEmail, role);
      }
      throw new Error(getReadableAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string, role: UserRole) => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    if (isMockFirebase()) {
      const profile = createLocalUser(cleanEmail, role, name);
      setLoading(false);
      return profile;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const userEmail = (res.user.email || email).toLowerCase();
      const matchedUni = getUniversityByEmail(userEmail);
      const isStudent = role === 'Student' || userEmail.includes('student') || OFFICIAL_ROLE_MAP[userEmail] === 'Student';
      const assignedRole = isStudent ? 'Student' : (OFFICIAL_ROLE_MAP[userEmail] || (matchedUni ? 'Faculty / Mentor' : role));

      const userProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: name || OFFICIAL_NAME_MAP[userEmail] || (matchedUni ? (isStudent ? `${matchedUni.shortName} Student Lead` : `${matchedUni.shortName} Faculty Lead`) : email.split('@')[0]),
        role: assignedRole,
        institution: matchedUni ? matchedUni.name : undefined,
      };
      if (matchedUni) {
        localStorage.setItem('nivaaran_active_university_id', matchedUni.id);
      }
      localStorage.setItem(`nivaaran_role_${res.user.uid}`, assignedRole);
      localStorage.removeItem('nivaaran_demo_user');
      setCurrentUser(userProfile);
      return userProfile;
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (
        code === 'auth/api-key-not-valid' ||
        code === 'auth/invalid-api-key' ||
        code === 'auth/app-not-authorized' ||
        msg.includes('api-key-not-valid') ||
        role === 'Citizen'
      ) {
        return createLocalUser(cleanEmail, role, name);
      }
      throw new Error(getReadableAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (role: UserRole = 'Citizen') => {
    setLoading(true);
    if (isMockFirebase()) {
      const googleDemoUser: UserProfile = {
        uid: 'google_demo_user',
        email: 'google.demo@nivaaran.gov.in',
        displayName: 'Google Demo User',
        role: role,
      };
      localStorage.setItem(`nivaaran_role_${googleDemoUser.uid}`, role);
      localStorage.setItem('nivaaran_demo_user', JSON.stringify(googleDemoUser));
      setCurrentUser(googleDemoUser);
      setLoading(false);
      return googleDemoUser;
    }

    try {
      const res = await signInWithPopup(auth, googleProvider);
      const userEmail = (res.user.email || '').toLowerCase();
      const mappedRole = OFFICIAL_ROLE_MAP[userEmail];
      const savedRole = mappedRole || (localStorage.getItem(`nivaaran_role_${res.user.uid}`) as UserRole) || role;

      const userProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || OFFICIAL_NAME_MAP[userEmail] || res.user.email?.split('@')[0] || 'User',
        role: savedRole,
      };
      localStorage.setItem(`nivaaran_role_${res.user.uid}`, savedRole);
      localStorage.removeItem('nivaaran_demo_user');
      setCurrentUser(userProfile);
      return userProfile;
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (
        code === 'auth/api-key-not-valid' ||
        code === 'auth/invalid-api-key' ||
        code === 'auth/app-not-authorized' ||
        msg.includes('api-key-not-valid')
      ) {
        const googleDemoUser: UserProfile = {
          uid: 'google_demo_user',
          email: 'google.demo@nivaaran.gov.in',
          displayName: 'Google Demo User',
          role: role,
        };
        localStorage.setItem(`nivaaran_role_${googleDemoUser.uid}`, role);
        localStorage.setItem('nivaaran_demo_user', JSON.stringify(googleDemoUser));
        setCurrentUser(googleDemoUser);
        return googleDemoUser;
      }
      throw new Error(getReadableAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const loginDemoUser = (role: UserRole, name: string, uid?: string) => {
    if (!demoAuthEnabled()) {
      throw new Error('Demo login is disabled (enable it with VITE_DEMO_AUTH_ENABLED=true in the local SIH demo build)');
    }
    // Canonical `demo-*` token matching the backend's seeded user uids — the
    // API client sends this exact token so the backend assigns the right role.
    const DEMO_TOKEN_BY_ROLE: Record<string, string> = {
      Citizen: 'demo-citizen',
      'Government Department': 'demo-department',
      'Government Validator': 'demo-validator',
      'University Admin': 'demo-university',
      'Faculty / Mentor': 'demo-faculty',
      Student: 'demo-student1',
      'Industry / MSME': 'demo-industry',
      'CSR Organization': 'demo-industry',
    };
    const demoToken = DEMO_TOKEN_BY_ROLE[role] ?? `demo_${role.toLowerCase().replace(/\s+/g, '_')}`;
    const demoUser: UserProfile & { demoToken?: string } = {
      uid: uid || demoToken,
      email: `${role.toLowerCase().replace(/\s+/g, '_')}@nivaaran.gov.in`,
      displayName: name,
      role,
      demoToken,
    };
    localStorage.setItem('nivaaran_demo_user', JSON.stringify(demoUser));
    setCurrentUser(demoUser);
    return demoUser;
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('nivaaran_demo_user', JSON.stringify(updated));
      } catch {
        // storage fallback
      }
      return updated;
    });
  };

  const logout = async () => {
    try {
      if (!isMockFirebase()) {
        await firebaseSignOut(auth);
      }
    } catch {
      // Ignore firebase signout error
    }
    localStorage.removeItem('nivaaran_demo_user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      loginDemoUser,
      updateUserProfile,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
