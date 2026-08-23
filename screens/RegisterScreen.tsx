import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { routes } from "@/navigation/routes";
import { mapAuthError, register, validateEmail, validatePassword } from "@/services/authService";
import { isFirebaseConfigured } from "@/services/firebase";
import { AuthFieldErrors } from "@/types";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors: AuthFieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword:
        password === confirmPassword ? undefined : "Passwords do not match.",
    };
    if (nextErrors.email || nextErrors.password || nextErrors.confirmPassword) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await register(email, password);
    } catch (error) {
      setErrors(mapAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="GigFlow"
      title="Create account"
      subtitle="Create your workspace for tasks, deadlines, and priorities."
    >
      <View className="gap-4">
        {!isFirebaseConfigured ? (
          <InlineBanner message="Firebase isn't configured yet. Add the EXPO_PUBLIC_FIREBASE_* values to .env.local." />
        ) : null}
        {errors.form ? <InlineBanner message={errors.form} /> : null}
        <PasswordInput
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
          keyboardType="email-address"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrors((current) => ({ ...current, email: undefined, form: undefined }));
          }}
        />
        <Input
          autoCapitalize="none"
          autoComplete="new-password"
          error={errors.password}
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: undefined, form: undefined }));
          }}
        />
        <PasswordInput
          autoCapitalize="none"
          autoComplete="new-password"
          error={errors.confirmPassword}
          label="Confirm password"
          placeholder="Repeat your password"
          returnKeyType="done"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            setErrors((current) => ({ ...current, confirmPassword: undefined, form: undefined }));
          }}
          onSubmitEditing={handleSubmit}
        />
        <Button
          disabled={!isFirebaseConfigured}
          fullWidth
          label="Create account"
          loading={isSubmitting}
          onPress={handleSubmit}
        />
        <View className="flex-row items-center justify-center">
          <Text className="text-sm text-slate-500">Already have an account?</Text>
          <Button
            className="ml-1 min-h-12 px-2 py-1"
            label="Sign in"
            variant="ghost"
            onPress={() => router.replace(routes.login)}
          />
        </View>
      </View>
    </AuthShell>
  );
}
