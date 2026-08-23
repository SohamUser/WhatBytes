import { Redirect, Stack } from "expo-router";

import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { TaskProvider } from "@/context/TaskContext";
import { routes } from "@/navigation/routes";

export default function ProtectedLayout() {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) return <LoadingState label="Restoring your session…" />;
  if (!user) return <Redirect href={routes.login} />;

  return (
    <TaskProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
        <Stack.Screen name="task-form" options={{ presentation: "modal" }} />
      </Stack>
    </TaskProvider>
  );
}
