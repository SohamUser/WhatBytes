import { Redirect } from "expo-router";

import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/navigation/routes";

export default function Index() {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) return <LoadingState label="Restoring your session…" />;
  return <Redirect href={user ? routes.tasks : routes.login} />;
}
