const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Constants
const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpire: {
    type: Date,
    select: false,
  },
  passwordChangeToken: {
    type: String,
    select: false,
  },
  passwordChangeExpire: {
    type: Date,
    select: false,
  },
  pendingPassword: {
    type: String,
    select: false,
  },
  refreshToken: {
    type: String,
    select: false,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
  // This prevents double-hashing when password is set from pendingPassword
  if (this.password && /^\$2[aby]\$/.test(this.password)) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});



/**
 * Compares a plaintext candidate password with the user's stored hashed password.
 *
 * @param {string} candidatePassword - The plaintext password to verify.
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, or false otherwise.
 * @throws {Error} If an error occurs during password comparison.
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

/**
 * Generates a password reset token for the user.
 *
 * This method:
 * - Generates a random 6-digit numeric reset token.
 * - Hashes the token and assigns it to `this.resetPasswordToken`.
 * - Sets `this.resetPasswordExpire` to an expiry time from now.
 *
 * IMPORTANT: This method mutates the current document instance but does NOT save it
 * to the database. You MUST call `await user.save()` after calling this method
 * to persist the reset token and expiration to the database.
 *
 * Example usage:
 *   const resetToken = user.getResetPasswordToken();
 *   await user.save({ validateBeforeSave: false });
 *
 * @returns {string} The unhashed 6-digit reset token to be sent to the user via email.
 */
userSchema.methods.getResetPasswordToken = function() {
  // Generate a 6-digit random token (100000 to 999999)
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the token before storing
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + RESET_TOKEN_EXPIRY_MS;

  // Return the plain text token to be sent via email
  return resetToken;
};

/**
 * Generates a password change verification token for authenticated users.
 * Similar to getResetPasswordToken but for profile password changes.
 * 
 * @returns {string} The unhashed 6-digit verification token
 */
userSchema.methods.getPasswordChangeToken = function() {
  // Generate a 6-digit random token
  const changeToken = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the token before storing
  this.passwordChangeToken = crypto
    .createHash('sha256')
    .update(changeToken)
    .digest('hex');

  this.passwordChangeExpire = Date.now() + RESET_TOKEN_EXPIRY_MS;

  // Return the plain text token to be sent via email
  return changeToken;
};

module.exports = mongoose.model('User', userSchema);
