import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16 bg-gradient-to-tr from-green-50/50 via-slate-50 to-amber-50/30">
      <div className="max-w-md text-center p-8 bg-white border border-slate-100 rounded-card shadow-soft space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-accent">
          <FiAlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight font-display">404 - Recipe Lost</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back to the kitchen.
        </p>
        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <Link
            to="/"
            className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <FiHome /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
