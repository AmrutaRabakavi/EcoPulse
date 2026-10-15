import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, ShieldAlert } from 'lucide-react';

/**
 * Route guard that requires the user to be authenticated AND have role 'admin'.
 * - Loading → spinner
 * - Not authenticated → redirect to /login
 * - Authenticated but not admin → access denied message
 * - Admin → render children
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-slate-500">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="p-3 bg-rose-50 rounded-2xl">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500 text-center max-w-md">
          This page is restricted to campus administrators. If you believe you
          should have access, please contact the Sustainability Office.
        </p>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
