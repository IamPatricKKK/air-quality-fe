import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, ArrowRight, MailCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Logo } from '@/components/Logo';
import { resendVerification } from '@/api/auth';
import { ApiError } from '@/api/client';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();
  const wasOpen = useRef(false);

  // Watch for user login (covers Google sign-in and any other auth method)
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
    }
    if (wasOpen.current && auth.user && !auth.loading) {
      wasOpen.current = false;
      onClose();
      navigate('/home');
    }
  }, [auth.user, auth.loading, open, onClose, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await auth.signIn({ email, password });
        toast.success('Đăng nhập thành công!');
        onClose();
        navigate('/home');
      } else {
        const result = await auth.signUp({ email, password, displayName });
        if (result.kind === 'pending_verification') {
          setPendingEmail(result.email);
          toast.success(result.message);
        } else {
          toast.success('Đăng ký thành công!');
          onClose();
          navigate('/home');
        }
      }
    } catch (error: unknown) {
      if (error instanceof ApiError && error.code === 'email_not_verified') {
        setPendingEmail(email);
        toast.error('Email chưa được xác thực. Hãy kiểm tra hộp thư hoặc gửi lại liên kết.');
      } else {
        const message = error instanceof Error ? error.message : 'Không thể xác thực tài khoản';
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setLoading(true);
    try {
      const res = await resendVerification(pendingEmail);
      toast.success(res.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không gửi lại được liên kết';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPendingEmail(null);
    setIsLogin(true);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              {pendingEmail ? (
                <div className="bg-background border border-border rounded-2xl shadow-2xl p-8 text-center space-y-4 relative">
                  <button onClick={handleClose} className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <MailCheck className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-lg font-display font-bold text-foreground">
                    Kiểm tra email của bạn
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Chúng tôi đã gửi liên kết xác thực tới <span className="text-foreground font-medium">{pendingEmail}</span>.
                    Mở email và bấm nút "Xác thực email" để kích hoạt tài khoản.
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Đang gửi...' : 'Gửi lại liên kết'}
                  </button>
                  <button
                    onClick={() => { setPendingEmail(null); setIsLogin(true); }}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    ← Quay lại đăng nhập
                  </button>
                </div>
              ) : (
                <div className="bg-background border border-border rounded-2xl shadow-2xl p-8 relative">
                  <button onClick={handleClose} className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex justify-start mb-6">
                    <Logo size="md" />
                  </div>

                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setIsLogin(true)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isLogin ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => setIsLogin(false)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !isLogin ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      Đăng ký
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Tên hiển thị"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
                    </div>
                  </div>

                  <GoogleSignInButton label={isLogin ? 'Đăng nhập bằng Google' : 'Đăng ký bằng Google'} />

                  {isLogin && (
                    <div className="space-y-2 mt-4 text-center">
                      <Link to="/auth/forgot" onClick={handleClose} className="block text-xs text-muted-foreground hover:text-primary">
                        Quên mật khẩu?
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Chưa có tài khoản?{' '}
                        <button onClick={() => setIsLogin(false)} className="text-primary hover:underline">
                          Đăng ký ngay
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
