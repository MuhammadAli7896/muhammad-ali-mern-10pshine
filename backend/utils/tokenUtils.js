const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

/**
 * Generates an access token for the user
 * @param {string} userId - The user's ID
 * @returns {string} The generated access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-key-change-this',
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generates a refresh token for the user
 * @param {string} userId - The user's ID
 * @returns {string} The generated refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key-change-this',
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * Generates both access and refresh tokens
 * @param {string} userId - The user's ID
 * @returns {Object} Object containing both tokens
 */
const generateTokens = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  
  return { accessToken, refreshToken };
};

/**
 * Verifies an access token
 * @param {string} token - The token to verify
 * @returns {Object} The decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-key-change-this'
    );
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verifies a refresh token
 * @param {string} token - The token to verify
 * @returns {Object} The decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key-change-this'
    );
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Hashes a refresh token for secure storage in database
 * @param {string} token - The refresh token to hash
 * @returns {string} The hashed token
 */
const hashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

/**
 * Sets authentication cookies in the response
 * @param {Object} res - Express response object
 * @param {string} accessToken - Access token to set
 * @param {string} refreshToken - Refresh token to set
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
  // Access token cookie - httpOnly, secure in production
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token cookie - httpOnly, secure in production
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Clears authentication cookies
 * @param {Object} res - Express response object
 */
const clearAuthCookies = (res) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};
