import type { AuthFieldErrors } from "@/types";

export function mapFirebaseAuthErrorCode(code: string): AuthFieldErrors {
  switch (code) {
    case "auth/invalid-email":
      return { email: "Enter a valid email address." };
    case "auth/email-already-in-use":
      return { email: "An account already exists for this email." };
    case "auth/weak-password":
      return { password: "Choose a stronger password (at least 6 characters)." };
    case "auth/missing-password":
      return { password: "Password is required." };
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/invalid-password":
    case "auth/user-not-found":
      return { password: "Incorrect email or password. Check your credentials and try again." };
    case "auth/user-disabled":
      return { form: "This account has been disabled. Contact support for help." };
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
