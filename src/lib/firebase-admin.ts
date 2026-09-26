import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

export function hasFirebaseAdminCredentials(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID?.trim() &&
    process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
    process.env.FIREBASE_PRIVATE_KEY?.trim()
  );
}

export function getAdminDb(): Firestore | null {
  if (!hasFirebaseAdminCredentials()) {
    return null;
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
  } catch (err) {
    console.warn("⚠️ Firebase Admin initialization failed, falling back to local database store:", err);
    return null;
  }
}