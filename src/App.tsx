import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PlansPage } from '@/pages/PlansPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { MissionPage } from '@/pages/MissionPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { MentorPage } from '@/pages/MentorPage';
import { ResourcesPage } from '@/pages/ResourcesPage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-200 dark:border-brand-900 border-t-brand-500 animate-spin" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: ReactNode }) {
  const { profile, session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-200 dark:border-brand-900 border-t-brand-500 animate-spin" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  if (profile?.onboarded) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-200 dark:border-brand-900 border-t-brand-500 animate-spin" />
      </div>
    );
  }
  if (session) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="mission" element={<MissionPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="mentor" element={<MentorPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
