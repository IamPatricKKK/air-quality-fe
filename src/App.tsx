import { lazy, Suspense, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";
import { useIsMobile } from "@/hooks/use-mobile";
import { Header } from "@/components/dashboard/Header";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { useUnreadCount } from "@/hooks/useAlerts";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import { InstallPrompt } from "@/components/InstallPrompt";
import { NetworkStatus } from "@/components/NetworkStatus";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthModalProvider, useAuthModal } from "@/hooks/useAuthModal";
import { AuthModal } from "@/components/auth/AuthModal";

const StationDetailPage = lazy(() => import("@/pages/StationDetailPage"));
const AlertSettings = lazy(() => import("@/pages/AlertSettings"));
const AlertHistory = lazy(() => import("@/pages/AlertHistory"));
const Compare = lazy(() => import("@/pages/Compare"));
const About = lazy(() => import("@/pages/About"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Landing = lazy(() => import("@/pages/Landing"));
const Intro = lazy(() => import("@/pages/Intro"));
const Profile = lazy(() => import("@/pages/Profile"));
const ProfileSettings = lazy(() => import("@/pages/ProfileSettings"));

const queryClient = new QueryClient();

/** Connects the realtime socket for logged-in users, app-wide (all routes). */
function RealtimeBridge() {
  const { user } = useAuth();
  useRealtime(Boolean(user));
  return null;
}

/** Gates a route behind authentication; sends anonymous users to /auth. */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

/** Global header — hidden on auth pages. On mobile, hidden on /home (Index has its own mobile header). */
function GlobalHeader() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const hideOn = ['/auth', '/auth/forgot', '/auth/reset', '/auth/verify'];
  if (hideOn.some(p => location.pathname.startsWith(p))) return null;
  // On mobile, /home has its own header
  if (isMobile && location.pathname === '/home') return null;

  if (isMobile) {
    return (
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-2.5">
        <Logo size="sm" />
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 px-8 md:px-12 lg:px-18">
      <HeaderScrollWrapper />
    </div>
  );
}

function HeaderScrollWrapper() {
  // Binary state: crossing the 10px threshold toggles "docked"; CSS handles
  // the 2s ease both ways (no scroll-position interpolation).
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const THRESHOLD = 10;
    const onScroll = () => setDocked(window.scrollY > THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const p = docked ? 1 : 0; // resting (0) → docked (1)

  // 2s tween, applied via CSS transition (not scroll mapping).
  const EASE = '2s cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <div
      style={{
        paddingTop: 10 + 10 * p,                // 10px → 20px
        transition: `padding-top ${EASE}`,
      }}
    >
      <div
        className="vn-header will-change-transform mx-auto"
        style={{
          maxWidth: 1700 - 200 * p,             // full → ~1500px centered
          background: `hsl(var(--card) / ${0.45 + 0.45 * p})`,
          borderColor: `hsl(var(--border) / ${0.3 + 0.5 * p})`,
          boxShadow: `inset 0 1px 0 hsl(0 0% 100% / 0.07), 0 ${8 + 16 * p}px ${24 + 36 * p}px ${-12 + 6 * p}px hsl(220 30% 10% / ${0.1 + 0.32 * p})`,
          transform: `scale(${1 - 0.012 * p})`,
          transformOrigin: 'top center',
          transition: `max-width ${EASE}, background ${EASE}, border-color ${EASE}, box-shadow ${EASE}, transform ${EASE}`,
        }}
      >
        <Header />
      </div>
    </div>
  );
}

/** Mobile-only bottom nav — shown on all pages except auth and landing. */
function GlobalMobileNav() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { data: alertUnread } = useUnreadCount();
  const hideOn = ['/auth', '/'];
  const isHidden = !isMobile || hideOn.some(p => location.pathname === p) || location.pathname.startsWith('/auth/') || location.pathname === '/home';
  if (isHidden) return null;

  // Determine active tab from route
  const path = location.pathname;
  const activeTab = path.startsWith('/notification') ? 'alerts' as const
    : path === '/profile' ? 'profile' as const
    : 'home' as const;

  return (
    <MobileNav
      activeTab={activeTab}
      onTabChange={() => {}}
      alertCount={alertUnread?.count ?? 0}
    />
  );
}

function GlobalAuthModal() {
  const { isOpen, closeAuthModal } = useAuthModal();
  return <AuthModal open={isOpen} onClose={closeAuthModal} />;
}

function RouteSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
      Đang tải trang...
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <AuthModalProvider>
            <TooltipProvider>
              <NetworkStatus />
              <Toaster />
              <Sonner />
              <InstallPrompt />
              <BrowserRouter>
                <RealtimeBridge />
                <GlobalAuthModal />
                <GlobalHeader />
                <GlobalMobileNav />
                <Suspense fallback={<RouteSkeleton />}>
                  <Routes>
                    {/* Landing — trang giới thiệu (khách chưa đăng nhập) */}
                    <Route path="/" element={<Landing />} />
                    {/* Intro — trang giới thiệu cho người đã đăng nhập */}
                    <Route path="/intro" element={<Intro />} />
                    {/* Public — duyệt dữ liệu tự do, không cần đăng nhập */}
                    <Route path="/home" element={<Index />} />
                    <Route path="/stations/:id" element={<StationDetailPage />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/about" element={<About />} />
                    {/* Cần đăng nhập — tính năng cá nhân hoá */}
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><AlertHistory /></ProtectedRoute>} />
                    <Route path="/notifications/alerts" element={<ProtectedRoute><AlertSettings /></ProtectedRoute>} />
                    <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
                    <Route path="/auth/forgot" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
                    <Route path="/auth/reset" element={<AuthRoute><ResetPassword /></AuthRoute>} />
                    <Route path="/auth/verify" element={<VerifyEmail />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
