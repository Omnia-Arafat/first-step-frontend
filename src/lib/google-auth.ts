import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/api";
import { toastError } from "@/lib/toast";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let isInitialized = false;

const getGoogleAuthErrorMessage = (error: any): string => {
  const code = error?.code as string | undefined;

  if (code === "auth/popup-closed-by-user") {
    return "Google sign-in was cancelled.";
  }

  if (code === "auth/popup-blocked") {
    return "Popup was blocked by your browser. Please allow popups and try again.";
  }

  if (code === "auth/network-request-failed") {
    return "Network error while contacting Google. Please try again.";
  }

  if (code === "auth/missing-google-access-token") {
    return "Google did not return a valid sign-in token. Please try again.";
  }

  if (code === "app/no-app") {
    return "Google sign-in is not configured correctly. Please try again later.";
  }

  return error?.message || "Failed to sign in with Google. Please try again.";
};

const getDashboardPath = (user: any) => {
  if (user?.role === "parent") return "/dashboard/parent";
  if (user?.role === "admin") return "/dashboard/admin";
  if (user?.role === "nursery") return "/dashboard/nursery";
  if (user?.role === "branch_admin") {
    return user.center_id ? "/dashboard/center" : "/dashboard/nursery";
  }
  return "/dashboard/center";
};

export const initializeGoogleAuth = () => {
  if (typeof window === "undefined") return;
  if (isInitialized) return;

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    getAuth(app);
    isInitialized = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
};

const handleGoogleSignIn = async (accessToken: string) => {
  try {
    const result = await authService.googleSignIn(accessToken);

    // Use setUserToken to properly set both state and cookies
    useAuthStore.getState().setUserToken(result.user, result.token);
    window.location.href = getDashboardPath(result.user);
  } catch (error: any) {
    console.error("Google sign-in failed:", error);
    toastError(getGoogleAuthErrorMessage(error));
    const wrappedError =
      error instanceof Error ? error : new Error(getGoogleAuthErrorMessage(error));
    (wrappedError as any)._googleToastShown = true;
    throw wrappedError;
  }
};

export const triggerGoogleSignIn = async () => {
  if (typeof window === "undefined") return false;

  try {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    const accessToken = credential?.accessToken;
    if (!accessToken) {
      throw Object.assign(new Error("Google access token is missing"), {
        code: "auth/missing-google-access-token",
      });
    }

    await handleGoogleSignIn(accessToken);
    return true;
  } catch (error: any) {
    console.error("Google sign-in failed:", error);
    if (!error?._googleToastShown) {
      toastError(getGoogleAuthErrorMessage(error));
    }
    throw error;
  }
};
