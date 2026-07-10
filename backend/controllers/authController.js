import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Token from '../models/tokenModel.js';
import { ErrorResponse } from '../middlewares/errorMiddleware.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

/**
 * Helper to hash a token string.
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('User already exists with this email address', 400));
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
    });

    // Generate Email Verification token
    const rawVerificationToken = user.generateEmailVerificationToken();

    // Save user to trigger password pre-save hash
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        user.name,
        rawVerificationToken,
        process.env.FRONTEND_URL
      );
    } catch (emailErr) {
      console.error(`[Nodemailer Error]: Failed to send verification email: ${emailErr.message}`);
      // Don't fail registration if mail fails in dev, but notify response
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email address
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new ErrorResponse('Verification token is required', 400));
  }

  try {
    // Hash token to match database record
    const hashedToken = hashToken(token);

    // Find user with matching token and unexpired validity
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired verification token', 400));
    }

    // Clear verification fields and mark user verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email address verified successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend Email Verification link
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
export const resendVerification = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Email address is required', 400));
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse('No user account found with this email', 404));
    }

    if (user.isVerified) {
      return next(new ErrorResponse('This email account is already verified', 400));
    }

    // Generate fresh verification token
    const rawVerificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send email
    await sendVerificationEmail(
      user.email,
      user.name,
      rawVerificationToken,
      process.env.FRONTEND_URL
    );

    res.status(200).json({
      success: true,
      message: 'Verification email resent. Please check your inbox.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    User Login & Token Generation
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Verify password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Generate JWT access & refresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save hashed refresh token to database
    const hashedToken = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days

    await Token.create({
      user: user._id,
      token: hashedToken,
      expiresAt,
    });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh Access Token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
export const refreshAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new ErrorResponse('Access denied. Session token missing.', 401));
  }

  try {
    // Hash incoming cookie token to match DB
    const hashedToken = hashToken(refreshToken);

    // Check database to ensure session is active
    const savedToken = await Token.findOne({ token: hashedToken });
    if (!savedToken) {
      return next(new ErrorResponse('Session expired or revoked. Please log in again.', 401));
    }

    // Verify JWT integrity
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Fetch user details
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorResponse('User account not found.', 401));
    }

    // Generate brand new access token
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    // If JWT is expired or malformed, remove DB token to clean up
    const hashedToken = hashToken(refreshToken);
    await Token.findOneAndDelete({ token: hashedToken });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return next(new ErrorResponse('Session verification failed. Please log in again.', 401));
  }
};

/**
 * @desc    User Logout (Revoke Tokens)
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutUser = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (refreshToken) {
      const hashedToken = hashToken(refreshToken);
      // Remove token from DB
      await Token.findOneAndDelete({ token: hashedToken });
    }

    // Clear client side cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password Request
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Security practice: do not leak whether account exists or not
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If a matching account exists, a reset link will be sent shortly.',
      });
    }

    // Generate crypto token
    const rawResetToken = user.generateResetPasswordToken();
    await user.save();

    // Send email
    try {
      await sendPasswordResetEmail(
        user.email,
        user.name,
        rawResetToken,
        process.env.FRONTEND_URL
      );
    } catch (emailErr) {
      console.error(`[Nodemailer Error]: Failed to send reset email: ${emailErr.message}`);
    }

    res.status(200).json({
      success: true,
      message: 'If a matching account exists, a reset link will be sent shortly.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    // Hash token
    const hashedToken = hashToken(token);

    // Find user with valid unexpired token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired reset token', 400));
    }

    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current User Profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified,
        profilePicture: req.user.profilePicture,
        bio: req.user.bio,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update User Profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  const { name, bio } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new ErrorResponse('User account not found', 404));
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change Password (Authenticated Users)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Select password field explicitly since it's hidden by default schema rules
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return next(new ErrorResponse('User account not found', 404));
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return next(new ErrorResponse('Current password entered is incorrect', 400));
    }

    // Save new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
