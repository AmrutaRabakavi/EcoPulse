import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Leaf className="w-8 h-8 text-slate-400" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <h2 className="text-lg font-semibold text-slate-700 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 mt-2 mb-6">
        The sustainability route you're looking for doesn't exist or has moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition shadow-sm"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
