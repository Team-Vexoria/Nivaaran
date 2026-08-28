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

export type UserRole = 
  | 'Citizen'
  | 'Government Department'
  | 'University Admin'
  | 'Faculty / Mentor'
  | 'Student'
  | 'Industry / MSME'
  | 'CSR Organization'
  | 'Platform Super Admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  district?: string;
  institution?: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string, role?: UserRole) => Promise<UserProfile>;
  signupWithEmail: (email: string, pass: string, name: string, role: UserRole) => Promise<UserProfile>;
  loginWithGoogle: (role?: UserRole) => Promise<UserProfile>;
  loginDemoUser: (role: UserRole, name: string, uid?: string) => UserProfile;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Official pre-assigned accounts mapping
const OFFICIAL_ROLE_MAP: Record<string, UserRole> = {
  'nivaaran@gov.in': 'Government Department',
  'admin@bitmesra.in': 'University Admin',
  'admin@nivaaran.in': 'Platform Super Admin',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const userEmail = fbUser.email?.toLowerCase() || '';
        const mappedOfficialRole = OFFICIAL_ROLE_MAP[userEmail];
        const savedRole = mappedOfficialRole || (localStorage.getItem(`nivaaran_role_${fbUser.uid}`) as UserRole) || 'Citizen';
        
        setCurrentUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'NIVAARAN User',
          role: savedRole,
        });
      } else {
        const demoData = localStorage.getItem('nivaaran_demo_user');
        if (demoData) {
          try {
            setCurrentUser(JSON.parse(demoData));
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getReadableAuthError = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please verify your official credentials or Sign Up for a citizen account.';
      case 'auth/configuration-not-found':
        return 'Email/Password sign-in is disabled in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method tab and enable Email/Password.';
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

  const loginWithEmail = async (email: string, pass: string, role: UserRole = 'Citizen') => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const userEmail = (res.user.email || email).toLowerCase();
      const assignedRole = OFFICIAL_ROLE_MAP[userEmail] || role;

      const userProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || email.split('@')[0],
        role: assignedRole,
      };
      localStorage.setItem(`nivaaran_role_${res.user.uid}`, assignedRole);
      localStorage.removeItem('nivaaran_demo_user');
      setCurrentUser(userProfile);
      return userProfile;
    } catch (err: any) {
      if (role === 'Citizen') {
        // Every email address is allowed for Citizen login!
        const citizenUser: UserProfile = {
          uid: 'citizen_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
          email: email,
          displayName: email.split('@')[0] || 'Citizen',
          role: 'Citizen',
        };
        localStorage.setItem('nivaaran_demo_user', JSON.stringify(citizenUser));
        setCurrentUser(citizenUser);
        return citizenUser;
      }
      throw new Error(getReadableAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string, role: UserRole) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const userEmail = (res.user.email || email).toLowerCase();
      const assignedRole = OFFICIAL_ROLE_MAP[userEmail] || role;

      const userProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: name || email.split('@')[0],
        role: assignedRole,
      };
      localStorage.setItem(`nivaaran_role_${res.user.uid}`, assignedRole);
      localStorage.removeItem('nivaaran_demo_user');
      setCurrentUser(userProfile);
      return userProfile;
    } catch (err: any) {
      if (role === 'Citizen') {
        // Every email address is allowed for Citizen signup!
        const citizenUser: UserProfile = {
          uid: 'citizen_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
          email: email,
          displayName: name || email.split('@')[0] || 'Citizen',
          role: 'Citizen',
        };
        localStorage.setItem('nivaaran_demo_user', JSON.stringify(citizenUser));
        setCurrentUser(citizenUser);
        return citizenUser;
      }
      throw new Error(getReadableAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (role: UserRole = 'Citizen') => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const userEmail = (res.user.email || '').toLowerCase();
      const mappedRole = OFFICIAL_ROLE_MAP[userEmail];
      const savedRole = mappedRole || (localStorage.getItem(`nivaaran_role_${res.user.uid}`) as UserRole) || role;

      const userProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || res.user.email?.split('@')[0] || 'User',
        role: savedRole,
      };
      localStorage.setItem(`nivaaran_role_${res.user.uid}`, savedRole);
      localStorage.removeItem('nivaaran_demo_user');
      setCurrentUser(userProfile);
      return userProfile;
    } catch (err: any) {
      throw new Error(getReadableAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const loginDemoUser = (role: UserRole, name: string, uid?: string) => {
    const demoUser: UserProfile = {
      uid: uid || 'demo_' + role.toLowerCase().replace(/\s+/g, '_'),
      email: `${role.toLowerCase().replace(/\s+/g, '_')}@nivaaran.gov.in`,
      displayName: name,
      role,
    };
    localStorage.setItem('nivaaran_demo_user', JSON.stringify(demoUser));
    setCurrentUser(demoUser);
    return demoUser;
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
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
