import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import client from '../api/client';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await client.post('/auth/forgot-password', data);
      toast.success(response.data.message || 'Verification link sent!');
      setEmailSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 bg-gradient-to-tr from-green-50/50 via-slate-50 to-amber-50/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center p-8 glass-panel rounded-card shadow-soft space-y-6"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-primary">
            <FiSend className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Check Your Inbox</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            If an account is associated with this email, we sent instructions on how to reset your password.
          </p>
          <div className="pt-4 border-t border-slate-100">
            <Link to="/login" className="font-semibold text-primary hover:underline text-sm flex items-center justify-center gap-2">
              <FiArrowLeft /> Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 bg-gradient-to-tr from-green-50/50 via-slate-50 to-amber-50/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 glass-panel p-8 rounded-card shadow-soft"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-extrabold text-xl shadow-md">R</div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-850">Forgot Password</h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your email and we'll send you a secure link to reset your credentials.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition-all ${
                  errors.email ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-primary'
                }`}
              />
              <FiMail className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Send Recovery Link'
              )}
            </button>
            <Link to="/login" className="text-center text-sm font-semibold text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 mt-2">
              <FiArrowLeft /> Back to Login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
