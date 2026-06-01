import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';

function ProtectedRoute({ children }: any) {
  const token = (useAuthStore as any)((state: any) => state.token);
  const hasHydrated = (useAuthStore as any)((state: any) => state._hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="auth-layout">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicRoute({ children }: any) {
  const token = (useAuthStore as any)((state: any) => state.token);
  const hasHydrated = (useAuthStore as any)((state: any) => state._hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="auth-layout">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const setHasHydrated = (useAuthStore as any)((state: any) => state.setHasHydrated);

  useEffect(() => {
    const unsub = (useAuthStore as any).persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    if ((useAuthStore as any).persist.hasHydrated()) {
      setHasHydrated(true);
    }
    return unsub;
  }, [setHasHydrated]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1A1A',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#34A853',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EA4335',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/:id"
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
