import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyFakeKeyForPrerenderingBuildCheck1",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "stadiummind-fake.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "stadiummind-fake",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stadiummind-fake.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:fakeapp12345",
};

/**
 * Initializes or retrieves the Firebase client application.
 * @returns The initialized FirebaseApp instance.
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export const app: FirebaseApp = getFirebaseApp();
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
