const { expect } = require('chai');
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const sinon = require('sinon');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../models/User');

// Stub email service before loading controller
const emailService = require('../utils/emailService');
const sendResetStub = sinon.stub(emailService, 'sendResetPasswordEmail').resolves({ success: true });

const authController = require('../controllers/authController');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());

// Setup routes
app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', authController.logout);
app.post('/api/auth/refresh', authController.refreshToken);
app.get('/api/auth/me', authController.getMe);
app.put('/api/auth/update-profile', authController.updateProfile);
app.put('/api/auth/change-password', authController.changePassword);
app.post('/api/auth/forgot-password', authController.forgotPassword);
app.post('/api/auth/verify-reset-token', authController.verifyResetToken);
app.post('/api/auth/reset-password', authController.resetPassword);
app.put('/api/auth/profile/name', authController.updateUsername);

describe('Auth Controller', () => {
  let mongoServer;

  before(async function() {
    this.timeout(30000);
    
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect mongoose to in-memory database
    await mongoose.connect(mongoUri);
  });

  after(async function() {
    this.timeout(30000);
    
    // Close mongoose connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    
    // Stop MongoDB Memory Server
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    // Restore email stub
    sendResetStub.restore();
  });

  beforeEach(async () => {
    // Clear collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    
    // Reset stub call history
    sendResetStub.resetHistory();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('User registered successfully');
      expect(res.body.data.user).to.have.property('id');
      expect(res.body.data.user.name).to.equal('Test User');
      expect(res.body.data.user.email).to.equal('test@example.com');
      expect(res.body.data).to.have.property('accessToken');
      expect(res.headers['set-cookie']).to.exist;
    });

    it('should return error if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Please provide all required fields');
    });

    it('should return error if email already exists', async () => {
      await User.create({
        name: 'Existing User',
        email: 'test@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Email already registered');
    });

    it('should return error if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'short'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Password must be at least 8 characters long');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should login user successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Login successful');
      expect(res.body.data.user).to.have.property('id');
      expect(res.body.data.user.email).to.equal('test@example.com');
      expect(res.body.data).to.have.property('accessToken');
      expect(res.headers['set-cookie']).to.exist;
    });

    it('should return error if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Please provide email and password');
    });

    it('should return error if email does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).to.equal(401);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Invalid email or password');
    });

    it('should return error if password is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).to.equal(401);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Invalid email or password');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      // Mock req.userId (normally set by auth middleware)
      app.post('/api/auth/logout-test', (req, res, next) => {
        req.userId = user._id.toString();
        next();
      }, authController.logout);

      const res = await request(app)
        .post('/api/auth/logout-test');

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Logout successful');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return error if refresh token is not provided', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(res.status).to.equal(401);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Refresh token not found');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send reset password email for existing user', async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.include('reset token has been sent');
      // Note: Email stub is expected but may throw error if not configured
    });

    it('should return success even for non-existent email (security)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
    });

    it('should return error if email is not provided', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Please provide your email address');
    });
  });

  describe('POST /api/auth/verify-reset-token', () => {
    it('should verify valid reset token', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      const res = await request(app)
        .post('/api/auth/verify-reset-token')
        .send({
          token: resetToken
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Token is valid');
      expect(res.body.data.email).to.equal('test@example.com');
    });

    it('should return error for invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/verify-reset-token')
        .send({
          token: 'invalid-token'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Invalid or expired reset token');
    });

    it('should return error if token is not provided', async () => {
      const res = await request(app)
        .post('/api/auth/verify-reset-token')
        .send({});

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Please provide reset token');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'oldpassword123'
      });

      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123'
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.include('Password has been reset successfully');

      // Verify password was actually changed
      const updatedUser = await User.findById(user._id).select('+password');
      const isValidPassword = await updatedUser.comparePassword('newpassword123');
      expect(isValidPassword).to.be.true;
    });

    it('should return error if passwords do not match', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
          confirmPassword: 'differentpassword'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Passwords do not match');
    });

    it('should return error if new password is too short', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'short',
          confirmPassword: 'short'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Password must be at least 8 characters long');
    });

    it('should return error for invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Invalid or expired reset token');
    });
  });

  describe('PUT /api/auth/profile/name', () => {
    it('should update username successfully', async () => {
      const user = await User.create({
        name: 'Old Name',
        email: 'test@example.com',
        password: 'password123'
      });

      app.put('/api/auth/profile/name-test', (req, res, next) => {
        req.userId = user._id.toString();
        next();
      }, authController.updateUsername);

      const res = await request(app)
        .put('/api/auth/profile/name-test')
        .send({
          name: 'New Name'
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Username updated successfully');
      expect(res.body.data.user.name).to.equal('New Name');

      // Verify in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).to.equal('New Name');
    });

    it('should return error if name is empty', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      app.put('/api/auth/profile/name-test-empty', (req, res, next) => {
        req.userId = user._id.toString();
        next();
      }, authController.updateUsername);

      const res = await request(app)
        .put('/api/auth/profile/name-test-empty')
        .send({
          name: '   '
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Please provide a name');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'oldpassword123'
      });

      app.put('/api/auth/change-password-test', (req, res, next) => {
        req.userId = user._id.toString();
        next();
      }, authController.changePassword);

      const res = await request(app)
        .put('/api/auth/change-password-test')
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword123'
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.include('Password changed successfully');

      // Verify password was changed
      const updatedUser = await User.findById(user._id).select('+password');
      const isValidPassword = await updatedUser.comparePassword('newpassword123');
      expect(isValidPassword).to.be.true;
    });

    it('should return error if current password is incorrect', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      app.put('/api/auth/change-password-test-wrong', (req, res, next) => {
        req.userId = user._id.toString();
        next();
      }, authController.changePassword);

      const res = await request(app)
        .put('/api/auth/change-password-test-wrong')
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      expect(res.status).to.equal(401);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Current password is incorrect');
    });

    it('should return error if new password is too short', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      app.put('/api/auth/change-password-test-short', (req, res, next) => {
        req.userId = user._id.toString();
        next();
      }, authController.changePassword);

      const res = await request(app)
        .put('/api/auth/change-password-test-short')
        .send({
          currentPassword: 'password123',
          newPassword: 'short'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('New password must be at least 8 characters long');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      app.get('/api/auth/me-test', (req, res, next) => {
        req.userId = user._id.toString();
        next();
      }, authController.getMe);

      const res = await request(app)
        .get('/api/auth/me-test');

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.user.name).to.equal('Test User');
      expect(res.body.data.user.email).to.equal('test@example.com');
    });
  });

  describe('PUT /api/auth/update-profile', () => {
    it('should update user profile', async () => {
      const user = await User.create({
        name: 'Old Name',
        email: 'old@example.com',
        password: 'password123'
      });

      app.put('/api/auth/update-profile-test', (req, res, next) => {
        req.userId = user._id.toString();
        next();
      }, authController.updateProfile);

      const res = await request(app)
        .put('/api/auth/update-profile-test')
        .send({
          name: 'New Name',
          email: 'new@example.com'
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Profile updated successfully');
      expect(res.body.data.user.name).to.equal('New Name');
      expect(res.body.data.user.email).to.equal('new@example.com');
    });
  });
});
