import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim();

/** Google "G" logo as inline SVG so the button styling stays under our control. */
function GoogleLogo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export function GoogleSignInButton({ label = "Đăng nhập bằng Google" }: { label?: string }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  // Hidden entirely when the deployment hasn't configured Google OAuth.
  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  const login = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      if (!accessToken) {
        toast.error("Không nhận được token từ Google");
        return;
      }
      setLoading(true);
      try {
        await auth.signInWithGoogle(accessToken);
        toast.success("Đăng nhập Google thành công!");
        navigate("/");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Đăng nhập Google thất bại");
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error("Đăng nhập Google thất bại"),
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={loading}
      className="w-full py-3 bg-secondary rounded-lg text-foreground font-medium text-sm flex items-center justify-center gap-3 hover:bg-secondary/80 transition-colors disabled:opacity-50 border border-border"
    >
      <GoogleLogo />
      {loading ? "Đang xử lý..." : label}
    </button>
  );
}
