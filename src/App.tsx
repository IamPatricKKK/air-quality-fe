import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import { InstallPrompt } from "@/components/InstallPrompt";
import { NetworkStatus } from "@/components/NetworkStatus";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const StationDetailPage = lazy(() => import("@/pages/StationDetailPage"));
const AlertSettings = lazy(() => import("@/pages/AlertSettings"));
const AlertHistory = lazy(() => import("@/pages/AlertHistory"));
const Compare = lazy(() => import("@/pages/Compare"));
const About = lazy(() => import("@/pages/About"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const NotFound = lazy(() => import("@/pages/NotFound"));

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
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <TooltipProvider>
              <NetworkStatus />
              <Toaster />
              <Sonner />
              <InstallPrompt />
              <BrowserRouter>
                <RealtimeBridge />
                <Suspense fallback={<RouteSkeleton />}>
                  <Routes>
                    {/* Public — duyệt dữ liệu tự do, không cần đăng nhập */}
                    <Route path="/" element={<Index />} />
                    <Route path="/stations/:id" element={<StationDetailPage />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/about" element={<About />} />
                    {/* Cần đăng nhập — tính năng cá nhân hoá */}
                    <Route path="/settings/alerts" element={<ProtectedRoute><AlertSettings /></ProtectedRoute>} />
                    <Route path="/alerts" element={<ProtectedRoute><AlertHistory /></ProtectedRoute>} />
                    <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
                    <Route path="/auth/forgot" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
                    <Route path="/auth/reset" element={<AuthRoute><ResetPassword /></AuthRoute>} />
                    <Route path="/auth/verify" element={<VerifyEmail />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
