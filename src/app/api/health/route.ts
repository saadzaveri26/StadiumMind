import { NextResponse } from "next/server";

/**
 * Diagnostic health-check endpoint that tests each layer of the backend stack
 * and reports exactly where the failure occurs. Visit /api/health in the browser.
 */
export async function GET(): Promise<Response> {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    status: "RUNNING",
  };

  // Step 1: Check env vars presence (never log actual values)
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  checks.envVars = {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY_SET: rawKey.length > 0,
    FIREBASE_PRIVATE_KEY_LENGTH: rawKey.length,
    FIREBASE_PRIVATE_KEY_STARTS_WITH_QUOTE: rawKey.startsWith('"'),
    FIREBASE_PRIVATE_KEY_HAS_BEGIN: rawKey.includes("-----BEGIN"),
    FIREBASE_PRIVATE_KEY_HAS_ESCAPED_NEWLINES: rawKey.includes("\\n"),
    FIREBASE_PRIVATE_KEY_HAS_REAL_NEWLINES: rawKey.includes("\n"),
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
  };

  // Step 2: Try dynamic import of firebase-admin
  try {
    const adminApp = await import("firebase-admin/app");
    checks.firebaseAdminImport = "OK";

    // Step 3: Try initialization
    try {
      const apps = adminApp.getApps();
      checks.existingApps = apps.length;

      if (apps.length === 0) {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

        // Clean the key (same logic as firebase-admin.ts)
        let cleanedKey = rawKey.trim();
        if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
          cleanedKey = cleanedKey.slice(1, -1);
        }
        if (cleanedKey.startsWith("'") && cleanedKey.endsWith("'")) {
          cleanedKey = cleanedKey.slice(1, -1);
        }
        if (cleanedKey.includes("\\n")) {
          cleanedKey = cleanedKey.replace(/\\n/g, "\n");
        }

        checks.cleanedKeyLength = cleanedKey.length;
        checks.cleanedKeyHasBegin = cleanedKey.includes("-----BEGIN PRIVATE KEY-----");
        checks.cleanedKeyHasEnd = cleanedKey.includes("-----END PRIVATE KEY-----");

        adminApp.initializeApp({
          credential: adminApp.cert({
            projectId,
            clientEmail,
            privateKey: cleanedKey,
          }),
        });
      }
      checks.firebaseInit = "OK";

      // Step 4: Try Firestore query
      try {
        const firestoreModule = await import("firebase-admin/firestore");
        const db = firestoreModule.getFirestore();
        const snapshot = await db.collection("zones").limit(1).get();
        checks.firestoreQuery = "OK";
        checks.zonesEmpty = snapshot.empty;
        checks.zonesCount = snapshot.size;
      } catch (fsErr: unknown) {
        checks.firestoreQuery = "FAILED";
        checks.firestoreError = (fsErr as Error)?.message || String(fsErr);
        checks.firestoreStack = (fsErr as Error)?.stack?.split("\n").slice(0, 5);
      }
    } catch (initErr: unknown) {
      checks.firebaseInit = "FAILED";
      checks.firebaseInitError = (initErr as Error)?.message || String(initErr);
      checks.firebaseInitStack = (initErr as Error)?.stack?.split("\n").slice(0, 5);
    }
  } catch (importErr: unknown) {
    checks.firebaseAdminImport = "FAILED";
    checks.firebaseAdminImportError = (importErr as Error)?.message || String(importErr);
    checks.firebaseAdminImportStack = (importErr as Error)?.stack?.split("\n").slice(0, 5);
  }

  return NextResponse.json(checks, { status: 200 });
}
