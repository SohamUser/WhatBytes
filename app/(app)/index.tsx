import { Redirect } from "expo-router";

import { routes } from "@/navigation/routes";

export default function ProtectedIndex() {
  return <Redirect href={routes.create} />;
}
