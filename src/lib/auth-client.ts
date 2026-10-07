import { auth } from "@/src/lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

export async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
  } catch (err) {
    console.warn("Error getting Firebase ID token:", err);
  }

  // Fallback to token saved in localStorage during login session if user refresh happens
  if (typeof window !== "undefined") {
    return localStorage.getItem("dinego_auth_token") || localStorage.getItem("dinego_admin_token");
  }

  return null;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function loginWithFirebase(email: string, pass: string): Promise<{ user: User; idToken: string }> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const idToken = await userCredential.user.getIdToken();

  if (typeof window !== "undefined") {
    localStorage.setItem("dinego_auth_token", idToken);
    localStorage.setItem(
      "dinego_admin_user",
      JSON.stringify({ email: userCredential.user.email, uid: userCredential.user.uid, role: "owner" })
    );
    document.cookie = `dinego_owner_session=active; path=/; max-age=86400; SameSite=Strict`;
  }

  return { user: userCredential.user, idToken };
}

export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn("Firebase signout error:", err);
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem("dinego_auth_token");
    localStorage.removeItem("dinego_admin_token");
    localStorage.removeItem("dinego_admin_user");
    document.cookie = "dinego_owner_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}
