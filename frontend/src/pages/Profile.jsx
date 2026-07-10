import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, getProfile } from '../redux/slices/authSlice';
import client from '../api/client';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUser, FiCamera, FiLock, FiCheckCircle } from 'react-icons/fi';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePicture || '');

  const { register: registerProfile, handleSubmit: handleSubmitProfile, setValue } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, watch } = useForm();
  const newPassword = watch('newPassword');

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('bio', user.bio || '');
      setProfilePictureUrl(user.profilePicture || '');
    }
  }, [user, setValue]);

  // Handle avatar upload to backend
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setAvatarLoading(true);
    const toastId = toast.loading('Uploading avatar image...');

    try {
      const response = await client.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfilePictureUrl(response.data.url);
      toast.success('Avatar uploaded successfully!', { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar', { id: toastId });
    } finally {
      setAvatarLoading(false);
    }
  };

  // Submit profile details
  const onProfileSubmit = async (data) => {
    const payload = {
      ...data,
      profilePicture: profilePictureUrl,
    };

    const action = await dispatch(updateProfile(payload));
    if (updateProfile.fulfilled.match(action)) {
      toast.success('Profile updated successfully!');
      dispatch(getProfile()); // Sync store
    } else {
      toast.error(action.payload || 'Failed to update profile');
    }
  };

  // Submit password change
  const onPasswordSubmit = async (data) => {
    const toastId = toast.loading('Updating password credentials...');
    try {
      const response = await client.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(response.data.message || 'Password changed successfully!', { id: toastId });
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password', { id: toastId });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-left space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800">Profile Settings</h1>
        <p className="text-slate-500 text-sm">Update your public details and password security credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar view */}
        <div className="md:col-span-1 bg-white border border-slate-100 p-6 rounded-card shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="relative group">
            {profilePictureUrl ? (
              <img 
                src={profilePictureUrl} 
                alt="Avatar" 
                className="h-32 w-32 rounded-full object-cover border-4 border-slate-50 shadow-inner group-hover:opacity-85 transition-opacity"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-3xl uppercase border-4 border-slate-50">
                {user?.name?.[0]}
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary-dark transition-colors shadow-md">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarLoading} />
              <FiCamera className="h-4 w-4" />
            </label>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-slate-800 text-base">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        {/* Right Columns: Edit Forms */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Section 1: Public Info Form */}
          <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm text-left">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
              <FiUser className="text-primary" /> General Profile Info
            </h3>
            
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Name</label>
                <input 
                  type="text" 
                  required 
                  {...registerProfile('name')}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Short Biography</label>
                <textarea 
                  rows="3" 
                  placeholder="Tell us about your kitchen preferences, allergies, or culinary skills..."
                  {...registerProfile('bio')}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || avatarLoading}
                  className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2 px-5 rounded-xl transition-all shadow-md"
                >
                  Save Profile Info
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Password Form */}
          <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm text-left">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
              <FiLock className="text-primary" /> Security password
            </h3>
            
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  {...registerPassword('currentPassword')}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  {...registerPassword('newPassword', { minLength: 6 })}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  {...registerPassword('confirmNewPassword', {
                    validate: (val) => val === newPassword || 'Passwords do not match',
                  })}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2 px-5 rounded-xl transition-all shadow-md"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
