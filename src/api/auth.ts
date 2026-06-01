import { airQualityApiRequest } from "@/api/client";
import type { AppSession, AppUser, AuthPayload } from "@/types";

const SESSION_KEY = "air-quality-fe:user-session";
const USER_KEY = "air-quality-fe:user";

interface AuthResponse {
  user: AppUser;
  session: AppSession;
}

interface PendingVerificationResponse {
  pending_verification: true;
  email: string;
  message: string;
}

export type SignUpResult =
  | { kind: "session"; user: AppUser; session: AppSession }
  | { kind: "pending_verification"; email: string; message: string };

function readStoredSession() {
  const rawUser = localStorage.getItem(USER_KEY);
  const rawSession = localStorage.getItem(SESSION_KEY);

  if (!rawUser || !rawSession) {
    return null;
  }

  try {
    return {
      user: JSON.parse(rawUser) as AppUser,
      session: JSON.parse(rawSession) as AppSession,
    };
  } catch {
    return null;
  }
}

function persistSession(payload: AuthResponse) {
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload.session));
}

export async function signIn(payload: AuthPayload) {
  const result = await airQualityApiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  persistSession(result);
  return result;
}

export async function signUp(payload: AuthPayload): Promise<SignUpResult> {
  const result = await airQualityApiRequest<AuthResponse | PendingVerificationResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  if ("pending_verification" in result && result.pending_verification) {
    return { kind: "pending_verification", email: result.email, message: result.message };
  }

  const authResult = result as AuthResponse;
  persistSession(authResult);
  return { kind: "session", user: authResult.user, session: authResult.session };
}

export async function verifyEmail(token: string) {
  return airQualityApiRequest<{ success: boolean }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function resendVerification(email: string) {
  return airQualityApiRequest<{ success: boolean; message: string }>(
    "/auth/resend-verification",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export async function signInWithGoogle(token: string, kind: "idToken" | "accessToken" = "accessToken") {
  const result = await airQualityApiRequest<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ [kind]: token }),
  });
  persistSession(result);
  return result;
}

export async function signOut() {
  await airQualityApiRequest("/auth/logout", { method: "POST" });
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function getStoredSession() {
  return readStoredSession();
}

export async function requestPasswordReset(email: string) {
  return airQualityApiRequest<{ success: boolean; message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  return airQualityApiRequest<{ success: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}
