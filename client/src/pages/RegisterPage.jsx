import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Leaf, Mail, Lock, User, GraduationCap, Building2, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil & Environmental Engineering',
  'Electrical Engineering',
  'Information Technology',
  'Biotechnology & Life Sciences',
  'Business Administration',
  'General Science & Arts',
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    collegeId: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: DEPARTMENTS[0],
    role: 'student',
    adminSecret: '',
  });

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError('');
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    // Client-side validations
    if (!formData.fullName.trim()) {
      setValidationError('Please enter your full name');
      return;
    }
    if (formData.fullName.trim().length < 2) {
      setValidationError('Full name must be at least 2 characters long');
      return;
    }
    if (!formData.collegeId.trim()) {
      setValidationError('Please enter your College ID / Roll Number');
      return;
    }
    if (!formData.email.trim()) {
      setValidationError('Please enter your college email address');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setValidationError('Please enter a valid email format (e.g. name@college.edu)');
      return;
    }
    if (!formData.password) {
      setValidationError('Please choose a password');
      return;
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (isAdminMode && !formData.adminSecret.trim()) {
      setValidationError('Please enter the Campus Administrator Secret Passcode');
      return;
    }

    setSubmitting(true);
    const result = await register({
      fullName: formData.fullName.trim(),
      collegeId: formData.collegeId.trim().toUpperCase(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      department: formData.department,
      role: isAdminMode ? 'admin' : 'student',
      adminSecret: isAdminMode ? formData.adminSecret.trim() : undefined,
    });
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg(
        isAdminMode
          ? 'Administrator account created successfully! Redirecting...'
          : 'Student account created successfully! Redirecting...'
      );
      setTimeout(() => {
        if (isAdminMode) {
          navigate('/admin/initiatives');
        } else {
          navigate('/profile');
        }
      }, 1000);
    } else {
      setApiError(result.error);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-10 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-3">
          <Leaf className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Student Registration</h2>
        <p className="text-sm text-slate-500 mt-1">Join the campus sustainability platform</p>
      </div>

      {/* Validation / API Error Banner */}
      {(validationError || apiError) && (
        <div className="p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <span>{validationError || apiError}</span>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 mb-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Amruta Patil"
              required
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">College ID / Roll No</label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                name="collegeId"
                value={formData.collegeId}
                onChange={handleChange}
                placeholder="COL-2026-042"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 uppercase transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Department</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Campus Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@college.edu"
              required
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
          </div>
        </div>

        {/* Administrator Role Toggle */}
        <div className="pt-2">
          <div
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition select-none"
          >
            <div className="flex items-center space-x-2.5">
              <div className={`p-1.5 rounded-xl ${isAdminMode ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'} transition`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Faculty / Campus Administrator</div>
                <div className="text-[11px] text-slate-500">Enable to register with event verification privileges</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAdminMode}
              onChange={() => {}}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 pointer-events-none"
            />
          </div>

          {/* Admin Secret Passcode Field */}
          {isAdminMode && (
            <div className="mt-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 animate-fadeIn">
              <label className="block text-xs font-bold uppercase text-emerald-900">
                Campus Admin Secret Passcode *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-600 absolute left-3 top-3.5" />
                <input
                  type="password"
                  name="adminSecret"
                  value={formData.adminSecret}
                  onChange={handleChange}
                  placeholder="Enter admin passcode"
                  required={isAdminMode}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-emerald-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition"
                />
              </div>
              <p className="text-[11px] text-emerald-700">
                Default campus developer passcode: <code className="font-mono font-bold bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200">ECOPULSE_ADMIN_2026</code>
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-200 transition disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              {isAdminMode ? <ShieldCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{isAdminMode ? 'Create Administrator Account' : 'Create Student Account'}</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
