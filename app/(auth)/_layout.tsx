import { Redirect, Stack } from "expo-router";

import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/navigation/routes";

export default function AuthLayout() {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) return <LoadingState label="Restoring your session…" />;
  if (user) return <Redirect href={routes.tasks} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
