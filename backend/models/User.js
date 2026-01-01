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
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
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
 * - Generates a random reset token.
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
 * @returns {string} The unhashed reset token to be sent to the user via email.
 */
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + RESET_TOKEN_EXPIRY_MS;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
