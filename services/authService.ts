import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { AuthFieldErrors } from "@/types";

import { auth } from "./firebase";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required.";
  if (!EMAIL_PATTERN.test(email.trim())) return "Enter a valid email address.";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return undefined;
}

export function mapAuthError(error: unknown): AuthFieldErrors {
  if (!(error instanceof FirebaseError)) {
    console.error("[auth] Unexpected authentication error", error);
    return { form: "Something went wrong. Please try again." };
  }

  console.error("[auth] Firebase request failed", {
    code: error.code,
    message: error.message,
  });

  switch (error.code) {
    case "auth/invalid-email":
      return { email: "Enter a valid email address." };
    case "auth/email-already-in-use":
      return { email: "An account already exists for this email." };
    case "auth/weak-password":
      return { password: "Choose a stronger password (at least 6 characters)." };
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/user-not-found":
      return { password: "Email or password is incorrect." };
    case "auth/network-request-failed":
      return { form: "Network error. Check your connection and try again." };
    case "auth/operation-not-allowed":
    case "auth/configuration-not-found":
      return {
        form: "Email/password authentication is not enabled for this Firebase project.",
      };
    case "auth/invalid-api-key":
    case "auth/app-not-authorized":
      return {
        form: "Firebase Authentication is not configured correctly for this app.",
      };
    case "auth/too-many-requests":
      return { form: "Too many attempts. Please wait a moment and try again." };
    default:
      return { form: "We couldn't complete that request. Please try again." };
  }
}

export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function register(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function logout() {
  return signOut(auth);
}
