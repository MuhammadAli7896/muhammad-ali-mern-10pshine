const User = require('../models/User');
const { generateTokens, verifyRefreshToken, hashToken, setAuthCookies, clearAuthCookies } = require('../utils/tokenUtils');
const { sendSuccess, sendError, asyncHandler } = require('../utils/responseHandler');
const { logger, logAuth } = require('../utils/logger');
const { sendResetPasswordEmail } = require('../utils/emailService');
const crypto = require('crypto');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return sendError(res, 400, 'Please provide all required fields');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 400, 'Email already registered');
  }

  // Validate password length
  if (password.length < 8) {
    return sendError(res, 400, 'Password must be at least 8 characters long');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id.toString());

  // Hash and save refresh token
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  // Set cookies
  setAuthCookies(res, accessToken, refreshToken);

  // Send response
  sendSuccess(res, 201, 'User registered successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return sendError(res, 400, 'Please provide email and password');
  }

  // Find user with password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return sendError(res, 401, 'Invalid email or password');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return sendError(res, 401, 'Invalid email or password');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id.toString());

  // Hash and save refresh token
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  // Set cookies
  setAuthCookies(res, accessToken, refreshToken);

  // Send response
  sendSuccess(res, 200, 'Login successful', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // Clear refresh token from database
  await User.findByIdAndUpdate(req.userId, {
    $unset: { refreshToken: 1 },
  });

  // Clear cookies
  clearAuthCookies(res);

  sendSuccess(res, 200, 'Logout successful');
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookie or body
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return sendError(res, 401, 'Refresh token not found');
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired refresh token');
  }

  // Find user with refresh token
  const hashedToken = hashToken(token);
  const user = await User.findOne({
    _id: decoded.userId,
    refreshToken: hashedToken,
  });

  if (!user) {
    return sendError(res, 401, 'Invalid refresh token');
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());

  // Update refresh token in database
  user.refreshToken = hashToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  // Set new cookies
  setAuthCookies(res, accessToken, newRefreshToken);

  sendSuccess(res, 200, 'Token refreshed successfully', {
    accessToken,
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  sendSuccess(res, 200, 'User profile retrieved successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  sendSuccess(res, 200, 'Profile updated successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validation
  if (!currentPassword || !newPassword) {
    return sendError(res, 400, 'Please provide current and new password');
  }

  if (newPassword.length < 8) {
    return sendError(res, 400, 'New password must be at least 8 characters long');
  }

  // Find user with password
  const user = await User.findById(req.userId).select('+password');

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return sendError(res, 401, 'Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Clear all refresh tokens (logout from all devices)
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  // Clear cookies
  clearAuthCookies(res);

  sendSuccess(res, 200, 'Password changed successfully. Please log in again.');
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset token
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendError(res, 400, 'Please provide your email address');
  }

  // Find user by email (need resetPasswordToken and resetPasswordExpire fields)
  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) {
    // For security, don't reveal if email exists
    logger.warn({ email }, 'Password reset requested for non-existent email');
    return sendSuccess(res, 200, 'If an account exists with that email, a password reset token has been sent');
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  logger.info({ userId: user._id, email }, 'Password reset token generated');

  try {
    // Send email with reset token
    await sendResetPasswordEmail(email, resetToken, user.name);

    logAuth('password-reset-requested', { userId: user._id, email });
    sendSuccess(res, 200, 'Password reset token has been sent to your email');
  } catch (error) {
    // If email fails, clear the reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error({ err: error, email, userId: user._id }, 'Failed to send password reset email');
    return sendError(res, 500, 'Failed to send reset email. Please try again later.');
  }
});

/**
 * @route   POST /api/auth/verify-reset-token
 * @desc    Verify if reset token is valid
 * @access  Public
 */
const verifyResetToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return sendError(res, 400, 'Please provide reset token');
  }

  // Hash the provided token to compare with stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with valid token that hasn't expired
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    logger.warn({ tokenProvided: !!token }, 'Invalid or expired reset token verification attempt');
    return sendError(res, 400, 'Invalid or expired reset token');
  }

  logger.info({ userId: user._id, email: user.email }, 'Reset token verified successfully');
  sendSuccess(res, 200, 'Token is valid', {
    email: user.email,
  });
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using valid token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  // Validation
  if (!token || !newPassword || !confirmPassword) {
    return sendError(res, 400, 'Please provide all required fields');
  }

  if (newPassword !== confirmPassword) {
    return sendError(res, 400, 'Passwords do not match');
  }

  if (newPassword.length < 8) {
    return sendError(res, 400, 'Password must be at least 8 characters long');
  }

  // Hash the provided token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password +resetPasswordToken +resetPasswordExpire');

  if (!user) {
    logger.warn({ tokenProvided: !!token }, 'Invalid or expired reset token for password reset');
    return sendError(res, 400, 'Invalid or expired reset token');
  }

  logger.info({ userId: user._id, email: user.email }, 'Resetting password and clearing all sessions');

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.refreshToken = undefined; // Clear refresh tokens (logout from all devices)
  await user.save();

  logAuth('password-reset-completed', { userId: user._id, email: user.email });
  sendSuccess(res, 200, 'Password has been reset successfully. Please log in with your new password.');
});

module.exports = {
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
};
