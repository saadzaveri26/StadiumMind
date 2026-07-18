import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import type { App } from "firebase-admin/app";
import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";

const cleanPrivateKey = (key: string): string => {
  let cleaned = key.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.includes("\\n")) {
    cleaned = cleaned.replace(/\\n/g, "\n");
  }
  return cleaned;
};

const privateKey = cleanPrivateKey(rawKey);

const hasCredentials = !!(projectId && clientEmail && privateKey);
// Strict rule: Zero console.log except one credential-presence check in firebase-admin.ts (log true/false only)
console.log("Firebase Admin credentials present:", hasCredentials);

/**
 * Initializes the Firebase Admin SDK app if not already initialized.
 * @returns The initialized App instance.
 */
export function getFirebaseAdminApp(): App {
  const apps = getApps();
  if (apps.length === 0) {
    if (!hasCredentials) {
      // In serverless environments, if credentials aren't passed, fallback to default credentials
      return initializeApp();
    }

    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  return apps[0]!;
}

/**
 * Returns the Firebase Admin Firestore instance.
 * @returns The Admin Firestore database.
 */
export function getAdminDb(): Firestore {
  const app = getFirebaseAdminApp();
  return getFirestore(app);
}

/**
 * Returns the Firebase Admin Auth instance.
 * @returns The Admin Auth instance.
 */
export function getAdminAuth(): Auth {
  const app = getFirebaseAdminApp();
  return getAuth(app);
}
