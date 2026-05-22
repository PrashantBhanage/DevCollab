import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Public route wrapper - redirects to dashboard if already logged in
function PublicRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function App() {
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