import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiLoader } from 'react-icons/fi';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Verification token is missing. Please check your verification link.');
        return;
      }

      try {
        await client.post('/auth/verify-email', { token });
        setStatus('success');
      } catch (error) {
        setStatus('error');
        setErrorMessage(
          error.response?.data?.message || 'Verification failed. The link may have expired or is invalid.'
        );
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 bg-gradient-to-tr from-green-50/50 via-slate-50 to-amber-50/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center p-8 glass-panel rounded-card shadow-soft space-y-6"
      >
        {status === 'loading' && (
          <div className="space-y-4 py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-primary">
              <FiLoader className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Verifying Account</h2>
            <p className="text-sm text-slate-500">
              Please wait while we activate your RecipeAI credentials...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <FiCheckCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Account Activated!</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your email address has been successfully verified. You can now access all features.
            </p>
            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/login"
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-all shadow-md inline-block text-center"
              >
                Proceed to Login
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <FiAlertTriangle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Verification Failed</h2>
            <p className="text-sm text-red-500 font-medium bg-red-50/50 p-3 rounded-xl border border-red-100 leading-relaxed">
              {errorMessage}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              If the token has expired, you can log in to resend a fresh email verification link.
            </p>
            <div className="pt-4 border-t border-slate-100 flex gap-3 justify-center">
              <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-3 py-2">
                Back to Home
              </Link>
              <Link
                to="/login"
                className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
