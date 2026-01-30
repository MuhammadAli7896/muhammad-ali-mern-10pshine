const nodemailer = require('nodemailer');
const { logger, logEmail } = require('./logger');

/**
 * Creates a nodemailer transporter configured for Gmail SMTP.
 * 
 * IMPORTANT SETUP INSTRUCTIONS:
 * 1. Go to Google Account settings: https://myaccount.google.com/security
 * 2. Enable 2-Step Verification
 * 3. Go to App Passwords: https://myaccount.google.com/apppasswords
 * 4. Create a new app password for "Mail" and "Other (Custom name)"
 * 5. Add to .env file:
 *    EMAIL_USER=your-email@gmail.com
 *    EMAIL_PASS=your-16-character-app-password
 */
const createTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    logger.error({
      emailUserSet: !!EMAIL_USER,
      emailPassSet: !!EMAIL_PASS,
    }, 'Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env file');
    return null;
  }

  logger.debug({ emailUser: EMAIL_USER }, 'Creating email transporter');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

/**
 * Sends a password reset email with a 6-digit token.
 * 
 * @param {string} email - Recipient email address
 * @param {string} resetToken - The plain text reset token to send
 * @param {string} userName - User's name for personalization
 * @returns {Promise<Object>} Nodemailer send result
 */
const sendResetPasswordEmail = async (email, resetToken, userName = 'User') => {
  logger.info({ to: email, userName }, 'Preparing to send password reset email');
  
  const transporter = createTransporter();

  if (!transporter) {
    logger.error('Email transporter not configured');
    throw new Error('Email service not configured');
  }

  const mailOptions = {
    from: `"Notes App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - Notes App',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              padding: 40px 30px;
            }
            .content p {
              margin: 0 0 20px;
              font-size: 16px;
            }
            .token-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px;
              margin: 30px 0;
            }
            .token {
              font-size: 48px;
              font-weight: 700;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .token-label {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              opacity: 0.9;
              margin-bottom: 10px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning p {
              margin: 0;
              color: #856404;
              font-size: 14px;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              font-size: 14px;
              color: #6c757d;
              border-top: 1px solid #e9ecef;
            }
            .footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              <p>We received a request to reset your password. Use the following token to proceed with resetting your password:</p>
              
              <div class="token-box">
                <div class="token-label">Your Reset Token</div>
                <div class="token">${resetToken}</div>
              </div>

              <div class="warning">
                <p><strong>⚠️ Important:</strong> This token will expire in <strong>10 minutes</strong>. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>

              <p>After entering the token, you'll be able to set a new password for your account.</p>
              
              <p>If you're having trouble, please contact our support team.</p>
              
              <p>Best regards,<br><strong>Think Nest Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} Think Nest. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hello ${userName},

We received a request to reset your password.

Your Reset Token: ${resetToken}

This token will expire in 10 minutes.

If you didn't request a password reset, please ignore this email.

Best regards,
Think Nest Team
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logEmail('sent-password-reset', { 
      to: email, 
      messageId: info.messageId,
      userName 
    });
    logger.info({ messageId: info.messageId, to: email }, 'Password reset email sent successfully');
    return info;
  } catch (error) {
    logger.error({ 
      err: error, 
      to: email,
      code: error.code,
      response: error.response 
    }, 'Failed to send password reset email');
    throw new Error('Failed to send reset email: ' + error.message);
  }
};

/**
 * Sends a password change verification email with a 6-digit token.
 * Used when an authenticated user wants to change their password.
 * 
 * @param {string} email - Recipient email address
 * @param {string} verificationToken - The plain text verification token to send
 * @param {string} userName - User's name for personalization
 * @returns {Promise<Object>} Nodemailer send result
 */
const sendPasswordChangeEmail = async (email, verificationToken, userName = 'User') => {
  logger.info({ to: email, userName }, 'Preparing to send password change verification email');
  
  const transporter = createTransporter();

  if (!transporter) {
    logger.error('Email transporter not configured');
    throw new Error('Email service not configured');
  }

  const mailOptions = {
    from: `"Notes App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Change Verification - Notes App',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              padding: 40px 30px;
            }
            .content p {
              margin: 0 0 20px;
              font-size: 16px;
            }
            .token-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px;
              margin: 30px 0;
            }
            .token-box .label {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
              opacity: 0.9;
            }
            .token-box .token {
              font-size: 48px;
              font-weight: 700;
              letter-spacing: 8px;
              margin: 10px 0;
              font-family: 'Courier New', monospace;
            }
            .token-box .expiry {
              font-size: 14px;
              margin-top: 15px;
              opacity: 0.9;
            }
            .warning-box {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning-box p {
              margin: 0;
              color: #856404;
              font-size: 14px;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              color: #6c757d;
              font-size: 14px;
            }
            .footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Change Verification</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>We received a request to change your password. To verify this change, please use the following verification code:</p>
              
              <div class="token-box">
                <div class="label">Verification Code</div>
                <div class="token">${verificationToken}</div>
                <div class="expiry">⏰ Expires in 10 minutes</div>
              </div>

              <div class="warning-box">
                <p><strong>⚠️ Security Alert:</strong> If you didn't request this password change, please ignore this email and ensure your account is secure.</p>
              </div>

              <p>Enter this code in your profile settings to complete the password change process.</p>
              
              <p>For security reasons, this code will expire in 10 minutes.</p>
              
              <p>Best regards,<br>
              <strong>Think Nest Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} Think Nest. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hello ${userName},

We received a request to change your password.

Your Verification Code: ${verificationToken}

This code will expire in 10 minutes.

If you didn't request this password change, please ignore this email.

Best regards,
Think Nest Team
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logEmail('sent-password-change-verification', { 
      to: email, 
      messageId: info.messageId,
      userName 
    });
    logger.info({ messageId: info.messageId, to: email }, 'Password change verification email sent successfully');
    return info;
  } catch (error) {
    logger.error({ 
      err: error, 
      to: email,
      code: error.code,
      response: error.response 
    }, 'Failed to send password change verification email');
    throw new Error('Failed to send verification email: ' + error.message);
  }
};

module.exports = {
  sendResetPasswordEmail,
  sendPasswordChangeEmail,
  sendResetPasswordEmail,
};
