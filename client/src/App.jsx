import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import CarbonCalculatorPage from './pages/CarbonCalculatorPage';
import ChallengesPage from './pages/ChallengesPage';
import InitiativesPage from './pages/InitiativesPage';
import AdminInitiativesPage from './pages/AdminInitiativesPage';
import QRScanPage from './pages/QRScanPage';
import SmartBinKioskPage from './pages/SmartBinKioskPage';
import Campus3DPage from './pages/Campus3DPage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <ErrorBoundary>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/calculator" element={<CarbonCalculatorPage />} />
              <Route path="/carbon-footprint" element={<CarbonCalculatorPage />} />
              <Route
  path="/challenges"
  element={
    <ProtectedRoute>
      <ChallengesPage />
    </ProtectedRoute>
  }
/>
              <Route path="/qr-scan" element={<QRScanPage />} />
              <Route path="/smart-bin" element={<SmartBinKioskPage />} />
              <Route path="/campus-3d" element={<Campus3DPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
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
                path="/initiatives"
                element={
                  <ProtectedRoute>
                    <InitiativesPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/initiatives"
                element={
                  <AdminRoute>
                    <AdminInitiativesPage />
                  </AdminRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
