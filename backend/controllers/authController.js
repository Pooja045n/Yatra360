const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'yatra_secret';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: 'User registered', user: { id: user._id, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid password' });

    const tokenPayload = { id: user._id.toString(), role: user.role, isAdmin: user.isAdmin };
    const token = jwt.sign(tokenPayload, SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; 

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@yatra360.com',
      to: email,
      subject: '🔑 Reset Your Yatra360 Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%);">
          <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FF9933; font-size: 2.5rem; margin-bottom: 10px;">🌍 Yatra360</h1>
              <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p style="font-size: 16px; color: #666; line-height: 1.6;">
                Hi there! 👋
              </p>
              <p style="font-size: 16px; color: #666; line-height: 1.6;">
                We received a request to reset your password for your Yatra360 account. No worries, we've got you covered!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetURL}" style="background: linear-gradient(135deg, #FF9933, #E6851A); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 5px 15px rgba(255, 153, 51, 0.3);">
                🔐 Reset My Password
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p style="font-size: 14px; color: #666; margin: 0; line-height: 1.5;">
                <strong>🔒 Security Note:</strong><br>
                • This link will expire in 1 hour<br>
                • If you didn't request this reset, please ignore this email<br>
                • Your password won't be changed until you create a new one
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="font-size: 14px; color: #999; margin: 0;">
                ✨ Happy travels!<br>
                The Yatra360 Team
              </p>
              <p style="font-size: 12px; color: #ccc; margin: 10px 0 0 0;">
                🌍 Discover Incredible India with Yatra360
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Password reset email sent successfully! Please check your inbox.',
      success: true 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Error sending password reset email. Please try again later.',
      error: error.message 
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Password reset token is invalid or has expired. Please request a new reset link.' 
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const confirmationMailOptions = {
      from: process.env.EMAIL_USER || 'noreply@yatra360.com',
      to: user.email,
      subject: '✅ Your Yatra360 Password Has Been Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%);">
          <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #138808; font-size: 2.5rem; margin-bottom: 10px;">🌍 Yatra360</h1>
              <h2 style="color: #333; margin-bottom: 20px;">Password Reset Successful! ✅</h2>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p style="font-size: 16px; color: #666; line-height: 1.6;">
                Hi ${user.name}! 👋
              </p>
              <p style="font-size: 16px; color: #666; line-height: 1.6;">
                Great news! Your Yatra360 password has been successfully reset. You can now log in with your new password and continue planning your amazing journeys across India.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(135deg, #FF9933, #E6851A); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 5px 15px rgba(255, 153, 51, 0.3);">
                ✈️ Login to Yatra360
              </a>
            </div>
            
            <div style="background: #f0f9f0; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #138808;">
              <p style="font-size: 14px; color: #666; margin: 0; line-height: 1.5;">
                <strong>🔐 Security Reminder:</strong><br>
                • Keep your password secure and don't share it with anyone<br>
                • If you notice any suspicious activity, contact our support team<br>
                • Consider using a strong, unique password for your account
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="font-size: 14px; color: #999; margin: 0;">
                ✨ Ready for your next adventure?<br>
                The Yatra360 Team
              </p>
              <p style="font-size: 12px; color: #ccc; margin: 10px 0 0 0;">
                🌍 Your Gateway to Incredible India
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(confirmationMailOptions);

    res.status(200).json({ 
      message: 'Password reset successful! You can now log in with your new password.',
      success: true 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Error resetting password. Please try again later.',
      error: error.message 
    });
  }
};

// Lightweight authenticated debug: returns the currently resolved user object
// (Derived from JWT + fresh DB fetch in auth middleware). Useful for verifying
// isAdmin / role claims when diagnosing 401/403 issues on admin routes.
exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }
  res.json({ user: req.user });
};
