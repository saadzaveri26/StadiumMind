import type { App } from "firebase-admin/app";
import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";

/**
 * Strips surrounding quotes, trims whitespace, and converts escaped newlines to real newlines.
 * @param key - The raw private key string from env vars.
 * @returns The cleaned PEM private key.
 */
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

/** Cached dynamic import for firebase-admin/app */
let appModuleCache: typeof import("firebase-admin/app") | null = null;
/** Cached dynamic import for firebase-admin/firestore */
let firestoreModuleCache: typeof import("firebase-admin/firestore") | null = null;
/** Cached dynamic import for firebase-admin/auth */
let authModuleCache: typeof import("firebase-admin/auth") | null = null;

/**
 * Returns the cached firebase-admin/app module, importing it only once.
 * @returns The firebase-admin/app module.
 */
async function getAppModule(): Promise<typeof import("firebase-admin/app")> {
  if (!appModuleCache) {
    appModuleCache = await import("firebase-admin/app");
  }
  return appModuleCache;
}

/**
 * Initializes the Firebase Admin SDK app if not already initialized.
 * Throws a descriptive error if credentials are missing (caught by route handlers).
 * Uses dynamic import to prevent startup module evaluation crashes on Vercel.
 * @returns The initialized App instance.
 */
export async function getFirebaseAdminApp(): Promise<App> {
  if (adminAppInstance) return adminAppInstance;

  const { getApps, initializeApp, cert } = await getAppModule();
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
 * Caches the dynamic import to avoid repeated module resolution.
 * @returns The Admin Firestore database.
 */
export async function getAdminDb(): Promise<Firestore> {
  const app = await getFirebaseAdminApp();
  if (!firestoreModuleCache) {
    firestoreModuleCache = await import("firebase-admin/firestore");
  }
  return firestoreModuleCache.getFirestore(app);
}

/**
 * Returns the Firebase Admin Auth instance.
 * Caches the dynamic import to avoid repeated module resolution.
 * @returns The Admin Auth instance.
 */
export async function getAdminAuth(): Promise<Auth> {
  const app = await getFirebaseAdminApp();
  if (!authModuleCache) {
    authModuleCache = await import("firebase-admin/auth");
  }
  return authModuleCache.getAuth(app);
}
