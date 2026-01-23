const nodemailer = require('nodemailer');

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
    console.error('❌ Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env file');
    console.error('EMAIL_USER:', EMAIL_USER ? 'Set ✓' : 'Missing ✗');
    console.error('EMAIL_PASS:', EMAIL_PASS ? 'Set ✓' : 'Missing ✗');
    return null;
  }

  console.log('📧 Creating email transporter for:', EMAIL_USER);

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
  const transporter = createTransporter();

  if (!transporter) {
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
    console.log('✅ Reset email sent successfully:', info.messageId);
    console.log('📬 Email sent to:', email);
    return info;
  } catch (error) {
    console.error('❌ Error sending reset email:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response);
    throw new Error('Failed to send reset email: ' + error.message);
  }
};

module.exports = {
  sendResetPasswordEmail,
};
