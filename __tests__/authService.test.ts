import { mapFirebaseAuthErrorCode } from "@/utils/authErrors";

describe("mapFirebaseAuthErrorCode", () => {
  it.each([
    "auth/invalid-credential",
    "auth/invalid-login-credentials",
    "auth/wrong-password",
    "auth/user-not-found",
  ])("shows a clear message for %s", (code) => {
    expect(mapFirebaseAuthErrorCode(code)).toEqual({
      password: "Incorrect email or password. Check your credentials and try again.",
    });
  });

  it("explains when an account is disabled", () => {
    expect(mapFirebaseAuthErrorCode("auth/user-disabled")).toEqual({
      form: "This account has been disabled. Contact support for help.",
    });
  });
});
