import express from 'express';
import {
  registerUser,
  verifyEmail,
  resendVerification,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/authValidators.js';
import { protect } from '../middlewares/authMiddleware.js';
import { getMockEmails, clearMockEmails } from '../services/emailService.js';

const router = express.Router();

// Developer / Testing Mock Email Endpoints (development only)
router.get('/mock-emails', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }
  res.json({ emails: getMockEmails() });
});

router.delete('/mock-emails', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }
  clearMockEmails();
  res.json({ message: 'Mock emails cleared' });
});

// Public auth endpoints
router.post('/register', registerValidator, registerUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', loginValidator, loginUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);

// Private profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidator, updateProfile);
router.put('/change-password', protect, changePasswordValidator, changePassword);

export default router;
