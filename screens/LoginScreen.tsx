import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { routes } from "@/navigation/routes";
import { login, mapAuthError, validateEmail, validatePassword } from "@/services/authService";
import { isFirebaseConfigured } from "@/services/firebase";
import { AuthFieldErrors } from "@/types";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors: AuthFieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      setErrors(mapAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="GigFlow"
      title="Welcome back"
      subtitle="Your work, deadlines, and priorities in one place."
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
          returnKeyType="next"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrors((current) => ({ ...current, email: undefined, form: undefined }));
          }}
        />
        <Input
          autoCapitalize="none"
          autoComplete="current-password"
          error={errors.password}
          label="Password"
          placeholder="At least 6 characters"
          returnKeyType="done"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: undefined, form: undefined }));
          }}
          onSubmitEditing={handleSubmit}
        />
        <Button
          disabled={!isFirebaseConfigured}
          fullWidth
          label="Sign in"
          loading={isSubmitting}
          onPress={handleSubmit}
        />
        <View className="flex-row items-center justify-center">
          <Text className="text-sm text-slate-500">New to GigFlow?</Text>
          <Button
            className="ml-1 min-h-12 px-2 py-1"
            label="Create account"
            variant="ghost"
            onPress={() => router.push(routes.register)}
          />
        </View>
      </View>
    </AuthShell>
  );
}
