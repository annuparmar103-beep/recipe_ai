import nodemailer from 'nodemailer';

// In-memory store for mock emails (only used in development)
let mockEmails = [];

export const getMockEmails = () => mockEmails;
export const clearMockEmails = () => { mockEmails = []; };

/**
 * Reusable email service wrapper.
 * Falls back to printing emails to console in development if SMTP configuration is default/invalid.
 */
export const sendEmail = async (options) => {
  const isMock =
    !process.env.SMTP_USER ||
    process.env.SMTP_USER === 'mock_user' ||
    process.env.SMTP_PASS === 'mock_pass';

  if (isMock || process.env.NODE_ENV === 'test') {
    const mockEmail = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      to: options.email,
      subject: options.subject,
      message: options.message,
      html: options.html,
      sentAt: new Date(),
    };
    
    mockEmails.unshift(mockEmail);
    // Keep only the latest 50 emails
    if (mockEmails.length > 50) {
      mockEmails.pop();
    }

    console.log('\n=================== [MOCK EMAIL SENT] ===================');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('=========================================================\n');
    return { success: true, mock: true };
  }

  // Create real SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'RecipeAI'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@recipeai.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email Sent]: Message ID: ${info.messageId}`);
  return info;
};

/**
 * Send email verification token.
 */
export const sendVerificationEmail = async (email, name, token, frontendUrl) => {
  const verificationLink = `${frontendUrl || 'http://localhost:5173'}/verify-email?token=${token}`;
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F8FAFC; border-radius: 16px;">
      <h2 style="color: #22C55E; font-size: 24px; font-weight: 700; margin-bottom: 10px;">Welcome to RecipeAI!</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hi ${name},</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">Thank you for registering at RecipeAI. To complete your sign-up and verify your account, please click the link below:</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${verificationLink}" style="background-color: #22C55E; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #64748B; font-size: 14px;">This link is valid for 24 hours. If you did not sign up for RecipeAI, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
      <p style="color: #94A3B8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} RecipeAI. All rights reserved.</p>
    </div>
  `;

  return await sendEmail({
    email,
    subject: 'Verify your RecipeAI Account',
    message: `Welcome to RecipeAI, ${name}! Verify your account by opening this link: ${verificationLink}`,
    html: htmlContent,
  });
};

/**
 * Send password reset email.
 */
export const sendPasswordResetEmail = async (email, name, token, frontendUrl) => {
  const resetLink = `${frontendUrl || 'http://localhost:5173'}/reset-password?token=${token}`;
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F8FAFC; border-radius: 16px;">
      <h2 style="color: #F59E0B; font-size: 24px; font-weight: 700; margin-bottom: 10px;">Reset Password Request</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hi ${name},</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">We received a request to reset your password for your RecipeAI account. Click the button below to set a new password:</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${resetLink}" style="background-color: #F59E0B; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #64748B; font-size: 14px;">This link is valid for 1 hour. If you did not request this, please contact support or ignore this email. Your password will remain unchanged.</p>
      <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
      <p style="color: #94A3B8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} RecipeAI. All rights reserved.</p>
    </div>
  `;

  return await sendEmail({
    email,
    subject: 'RecipeAI Password Reset Request',
    message: `Hi ${name}, reset your password using this link: ${resetLink}`,
    html: htmlContent,
  });
};
