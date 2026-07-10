import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiUserCheck } from 'react-icons/fi';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect path after logging in (from protected route checks or fallback)
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Clear any prior auth error state on mount
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Logged in successfully!');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

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
          <h2 className="mt-6 text-3xl font-extrabold text-slate-850 tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-500">
            Log in to manage meal plans, shopping lists, and generate AI recipes.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
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
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-primary py-2.5 px-4 text-sm font-semibold text-white hover:bg-primary-dark transition-all shadow-md shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center gap-2">
                  <FiLogIn className="h-4 w-4" /> Sign In
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="text-center text-sm text-slate-500">
          New to RecipeAI?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
