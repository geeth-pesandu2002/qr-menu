import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

export function hasFirebaseAdminCredentials(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID?.trim() &&
    process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
    process.env.FIREBASE_PRIVATE_KEY?.trim()
  );
}

export function getAdminDb(): Firestore {
  if (!hasFirebaseAdminCredentials()) {
    throw new DatabaseConfigurationError(
      "Firebase Admin credentials are not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your server environment."
    );
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID!.trim().replace(/^(["'])([\s\S]*)\1$/, "$2");
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!.trim().replace(/^(["'])([\s\S]*)\1$/, "$2");
    const privateKey = process.env.FIREBASE_PRIVATE_KEY!.trim().replace(/\\n/g, "\n").replace(/^(["'])([\s\S]*)\1$/, "$2");

    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });

    return getFirestore(app);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new DatabaseConfigurationError(
      `Firebase Admin initialization failed: ${message}`
    );
  }
}