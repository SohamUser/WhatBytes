import { onAuthStateChanged } from "firebase/auth";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { auth } from "@/services/firebase";
import { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(
        firebaseUser
          ? { uid: firebaseUser.uid, email: firebaseUser.email ?? "" }
          : null,
      );
      setIsAuthLoading(false);
    });
  }, []);

  const value = useMemo(
    () => ({ user, isAuthLoading }),
    [user, isAuthLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
