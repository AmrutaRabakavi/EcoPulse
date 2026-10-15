import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Leaf, Lock, Mail, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const redirectPath = location.state?.from?.pathname || '/profile';

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

    if (!formData.email.trim()) {
      setValidationError('Please enter your email address');
      return;
    }
    if (!formData.password) {
      setValidationError('Please enter your password');
      return;
    }

    setSubmitting(true);
    const result = await login({
      email: formData.email.trim(),
      password: formData.password,
    });
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg('Signed in successfully! Redirecting...');
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 800);
    } else {
      setApiError(result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-3">
          <Leaf className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Student Portal Login</h2>
        <p className="text-sm text-slate-500 mt-1">Access your EcoPulse dashboard & eco-points</p>
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

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-200 transition disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In to Student Account</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account yet?{' '}
        <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
