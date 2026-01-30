const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  updateUsername,
  requestPasswordChange,
  verifyPasswordChange,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);

// Protected routes (require authentication)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/profile/name', protect, updateUsername);
router.post('/profile/change-password-request', protect, requestPasswordChange);
router.post('/profile/verify-password-change', protect, verifyPasswordChange);

module.exports = router;
