import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Wind, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { verifyEmail } from "@/api/auth";

type State = "loading" | "ok" | "error";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMessage("Liên kết không có token xác thực.");
      return;
    }

    verifyEmail(token)
      .then(() => setState("ok"))
      .catch((err: unknown) => {
        setState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Token không hợp lệ hoặc đã hết hạn.",
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 text-center space-y-4">
          <div className="flex items-center gap-3 mb-2 justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wind className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-display font-bold text-foreground">Chất Lượng Không Khí Việt Nam</h1>
              <p className="text-xs text-muted-foreground">Xác thực email</p>
            </div>
          </div>

          {state === "loading" && (
            <>
              <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Đang xác thực email của bạn...</p>
            </>
          )}

          {state === "ok" && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Xác thực thành công</h2>
              <p className="text-sm text-muted-foreground">
                Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.
              </p>
              <Link
                to="/auth"
                className="inline-flex w-full items-center justify-center py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Đăng nhập
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Không thể xác thực</h2>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Quay lại trang đăng nhập
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
