import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../api/client';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiLock, FiCheck } from 'react-icons/fi';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Token missing. Please check your recovery link.');
      return;
    }

    setLoading(true);
    try {
      const response = await client.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      toast.success(response.data.message || 'Password reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 bg-gradient-to-tr from-green-50/50 via-slate-50 to-amber-50/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 glass-panel p-8 rounded-card shadow-soft"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-extrabold text-xl shadow-md">R</div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-850">Reset Password</h2>
          <p className="mt-2 text-sm text-slate-500">
            Set your new credentials to secure your account.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters long' }
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition-all ${
                    errors.password ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-primary'
                  }`}
                />
                <FiLock className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  {...register('confirmPassword', { 
                    required: 'Confirm password is required',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition-all ${
                    errors.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-primary'
                  }`}
                />
                <FiLock className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <FiCheck /> Reset Password
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
