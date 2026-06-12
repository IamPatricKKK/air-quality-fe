import { useState } from "react";
import { Link } from "react-router-dom";
import { Wind, Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { requestPasswordReset } from "@/api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không gửi được yêu cầu";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wind className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Quên mật khẩu</h1>
              <p className="text-xs text-muted-foreground">Nhập email để nhận liên kết đặt lại</p>
            </div>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Đã gửi yêu cầu</h2>
              <p className="text-sm text-muted-foreground">
                Nếu <span className="text-foreground">{email}</span> là email đã đăng ký, bạn sẽ nhận được
                liên kết đặt lại mật khẩu trong vòng vài phút. Liên kết có hiệu lực 60 phút.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Về trang đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email đăng ký"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
                <Send className="w-4 h-4" />
              </button>

              <Link
                to="/auth"
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại đăng nhập
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
