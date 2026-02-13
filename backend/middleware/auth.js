const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');

/**
 * Middleware to protect routes - verifies JWT access token
 * Attaches user object to request if token is valid
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header (Bearer token)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Also check for token in cookies as fallback
        else if (req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token
            const decoded = verifyAccessToken(token);

            // Get user from database (exclude password and refreshToken)
            const user = await User.findById(decoded.userId).select('-password -refreshToken');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Token is invalid.'
                });
            }

            // Attach user and userId to request object
            req.user = user;
            req.userId = user._id;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired. Please login again.'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication middleware',
            error: error.message
        });
    }
};

/**
 * Middleware to check if user is authenticated
 * Similar to protect but doesn't fail if no token present
 * Useful for optional authentication
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (token) {
            try {
                const decoded = verifyAccessToken(token);
                const user = await User.findById(decoded.userId).select('-password -refreshToken');
                if (user) {
                    req.user = user;
                    req.userId = user._id;
                }
            } catch (error) {
                // Token invalid, but we don't fail the request
                req.user = null;
            }
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = { protect, optionalAuth };
