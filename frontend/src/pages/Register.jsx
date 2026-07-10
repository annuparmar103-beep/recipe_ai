import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiUserPlus, FiInbox } from 'react-icons/fi';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, message, isAuthenticated } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      setRegistrationSuccess(true);
      dispatch(clearError());
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  if (registrationSuccess) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-green-50/50 via-slate-50 to-amber-50/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center p-8 glass-panel rounded-card shadow-soft space-y-6"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-150 text-primary shadow-inner">
            <FiInbox className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Verify Your Email</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            We sent a verification link to your email address. Please check your inbox (and spam folder) and click the link to activate your account.
          </p>
          <div className="pt-4 border-t border-slate-100">
            <Link to="/login" className="font-semibold text-primary hover:underline text-sm">
              Back to Login screen
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-green-50/50 via-slate-50 to-amber-50/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-8 glass-panel p-8 rounded-card shadow-soft"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-extrabold text-xl shadow-md shadow-primary/20">R</div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-850 tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign up to generate, save, and plan meals using AI.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  {...register('name', { 
                    required: 'Name is required',
                    maxLength: { value: 50, message: 'Name cannot exceed 50 characters' }
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition-all ${
                    errors.name ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-primary'
                  }`}
                />
                <FiUser className="absolute left-3.5 top-3.5 text-slate-450 h-4 w-4" />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
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
                <FiMail className="absolute left-3.5 top-3.5 text-slate-450 h-4 w-4" />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters long'
                    }
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition-all ${
                    errors.password ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-primary'
                  }`}
                />
                <FiLock className="absolute left-3.5 top-3.5 text-slate-455 h-4 w-4" />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-primary py-2.5 px-4 text-sm font-semibold text-white hover:bg-primary-dark transition-all shadow-md shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center gap-2">
                  <FiUserPlus className="h-4 w-4" /> Register Account
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
