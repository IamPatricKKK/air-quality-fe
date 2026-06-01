import { createContext, useContext, useEffect, useState } from "react";
import { getStoredSession, signIn, signInWithGoogle, signOut, signUp, type SignUpResult } from "@/api/auth";
import type { AppSession, AppUser, AuthPayload } from "@/types";

interface AuthContextType {
  user: AppUser | null;
  session: AppSession | null;
  loading: boolean;
  signIn: (payload: AuthPayload) => Promise<void>;
  signInWithGoogle: (token: string) => Promise<void>;
  signUp: (payload: AuthPayload) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signUp: async () => ({ kind: "pending_verification", email: "", message: "" }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      setUser(stored.user);
      setSession(stored.session);
    }
    setLoading(false);
  }, []);

  const handleSignIn = async (payload: AuthPayload) => {
    const result = await signIn(payload);
    setUser(result.user);
    setSession(result.session);
  };

  const handleSignInWithGoogle = async (token: string) => {
    const result = await signInWithGoogle(token);
    setUser(result.user);
    setSession(result.session);
  };

  const handleSignUp = async (payload: AuthPayload): Promise<SignUpResult> => {
    const result = await signUp(payload);
    if (result.kind === "session") {
      setUser(result.user);
      setSession(result.session);
    }
    return result;
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn: handleSignIn,
        signInWithGoogle: handleSignInWithGoogle,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
