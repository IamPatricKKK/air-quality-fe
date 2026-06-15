import { createContext, useContext, useEffect, useState } from "react";
import { getStoredSession, persistUser, signIn, signInWithGoogle, signOut, signUp, type SignUpResult } from "@/api/auth";
import type { AppSession, AppUser, AuthPayload } from "@/types";

interface AuthContextType {
  user: AppUser | null;
  session: AppSession | null;
  loading: boolean;
  signIn: (payload: AuthPayload) => Promise<void>;
  signInWithGoogle: (token: string) => Promise<void>;
  signUp: (payload: AuthPayload) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<AppUser>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signUp: async () => ({ kind: "pending_verification", email: "", message: "" }),
  signOut: async () => {},
  updateUser: () => {},
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

  /** Cập nhật user hiện tại tại chỗ (state + localStorage) sau khi đổi hồ sơ. */
  const handleUpdateUser = (patch: Partial<AppUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        ...patch,
        user_metadata: { ...prev.user_metadata, ...patch.user_metadata },
      };
      persistUser(next);
      return next;
    });
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
        updateUser: handleUpdateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
