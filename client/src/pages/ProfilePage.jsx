import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Building2, 
  Award, 
  Sparkles, 
  LogOut, 
  Calendar, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-700 text-2xl font-black shadow-inner">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{user.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 capitalize">
                  {user.role}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5 flex items-center justify-center sm:justify-start space-x-1.5">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                <span className="font-mono">{user.collegeId}</span>
                <span>•</span>
                <span>{user.department}</span>
              </p>
              <div className="flex items-center justify-center sm:justify-start space-x-4 mt-3 text-xs text-slate-500">
                <div className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Joined {joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Eco-Points Balance */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wider">Current Eco-Points</span>
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-4 text-3xl font-black text-emerald-950">
            {user.ecoPoints || 0} <span className="text-sm font-normal text-emerald-700">pts</span>
          </div>
          <p className="text-xs text-emerald-700 mt-1 font-medium">Includes 50 welcome bonus points</p>
        </div>

        {/* Security / Verification */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Session Security</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-4 text-lg font-bold text-slate-900">JWT Verified</div>
          <p className="text-xs text-slate-500 mt-1">Stateful Bearer token active</p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Account Status</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-4 text-lg font-bold text-slate-900">Active Student</div>
          <p className="text-xs text-slate-500 mt-1">Ready for sustainability deeds</p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Sustainability Badges & Honors</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {user.badges && user.badges.length > 0 ? (
            user.badges.map((badge, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center space-x-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{badge.title}</div>
                  <div className="text-xs text-emerald-700">Pioneer Membership</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Complete campus challenges and verified green deeds to earn achievement badges.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
