import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Leaf, 
  LayoutDashboard, 
  Calculator, 
  Sparkles, 
  QrCode, 
  Box, 
  LogIn, 
  UserPlus, 
  User, 
  LogOut,
  Award,
  Users,
  Settings,
  Trash2,
  MapPin,
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { to: '/', label: 'Home', icon: Leaf },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/calculator', label: 'Calculator', icon: Calculator },
    { to: '/challenges', label: 'Challenges', icon: Sparkles },
    { to: '/initiatives', label: 'Initiatives', icon: Users },
    { to: '/smart-bin', label: 'Smart Bin', icon: Trash2 },
    { to: '/qr-scan', label: 'Scan QR', icon: QrCode },
    { to: '/campus-3d', label: 'Campus Map', icon: MapPin },
    // Admin-only link — conditionally included
    ...(user?.role === 'admin'
      ? [{ to: '/admin/initiatives', label: 'Admin', icon: Settings }]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Eco<span className="text-emerald-600">Pulse</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                Campus
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isAuthenticated && user ? (
              <>
                {/* Eco-Points Pill */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition shadow-sm"
                  title="Your Current Eco-Points"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{user.ecoPoints || 0} pts</span>
                </Link>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-xs font-semibold text-slate-700"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{user.fullName}</span>
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition shadow-emerald-200"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
