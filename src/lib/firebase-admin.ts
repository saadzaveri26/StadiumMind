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

let adminAppInstance: App | null = null;

/**
 * Initializes the Firebase Admin SDK app if not already initialized.
 * Throws a descriptive error if credentials are missing (caught by route handlers).
 * Uses dynamic import to prevent startup module evaluation crashes on Vercel.
 * @returns The initialized App instance.
 */
export async function getFirebaseAdminApp(): Promise<App> {
  if (adminAppInstance) return adminAppInstance;

  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  const apps = getApps();
  if (apps.length === 0) {
    if (!hasCredentials) {
      throw new Error(
        "Firebase Admin credentials missing. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID, " +
        "FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in Vercel Environment Variables."
      );
    }

    adminAppInstance = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    adminAppInstance = apps[0]!;
  }
  return adminAppInstance;
}

/**
 * Returns the Firebase Admin Firestore instance.
 * Uses dynamic import to prevent startup module evaluation crashes on Vercel.
 * @returns The Admin Firestore database.
 */
export async function getAdminDb(): Promise<Firestore> {
  const app = await getFirebaseAdminApp();
  const { getFirestore } = await import("firebase-admin/firestore");
  return getFirestore(app);
}

/**
 * Returns the Firebase Admin Auth instance.
 * Uses dynamic import to prevent startup module evaluation crashes on Vercel.
 * @returns The Admin Auth instance.
 */
export async function getAdminAuth(): Promise<Auth> {
  const app = await getFirebaseAdminApp();
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth(app);
}
