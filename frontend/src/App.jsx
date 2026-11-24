import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { CandidateHome } from './pages/candidate/CandidateHome';
import { AdminHome } from './pages/admin/AdminHome';
import { InterviewerHome } from './pages/interviewer/InterviewerHome';
import { Unauthorized } from './pages/Unauthorized';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (user?.role === 'interviewer') {
    return <Navigate to="/interviewer" replace />;
  }
  return <Navigate to="/candidate" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes with Role Guards */}
              <Route
                path="/candidate"
                element={
                  <ProtectedRoute allowedRoles={['candidate', 'admin']}>
                    <CandidateHome />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminHome />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/interviewer"
                element={
                  <ProtectedRoute allowedRoles={['interviewer', 'admin']}>
                    <InterviewerHome />
                  </ProtectedRoute>
                }
              />

              {/* Root & Fallback */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
