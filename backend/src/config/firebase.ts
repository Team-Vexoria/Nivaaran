import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let firebaseApp: App | undefined;
let firebaseAuth: Auth | undefined;

try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : undefined;

  if (!getApps().length) {
    if (serviceAccount) {
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('[NIVAARAN Backend] Firebase Admin SDK initialized with Service Account.');
    } else {
      firebaseApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
      });
      console.log('[NIVAARAN Backend] Firebase Admin SDK initialized in default mode.');
    }
  }

  firebaseAuth = getAuth();
} catch (error) {
  console.warn('[NIVAARAN Backend] Firebase Admin initialization warning:', error);
}

export { firebaseApp, firebaseAuth };
