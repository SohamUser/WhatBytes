import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { AuthFieldErrors } from "@/types";
import { mapFirebaseAuthErrorCode } from "@/utils/authErrors";

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

  return mapFirebaseAuthErrorCode(error.code);
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
