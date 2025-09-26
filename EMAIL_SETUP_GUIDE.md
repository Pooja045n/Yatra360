# 📧 Email Setup Guide for Yatra360

This guide will help you set up email functionality for password reset features in Yatra360.

## 🚀 Quick Setup

### Step 1: Choose Your Email Provider

**Gmail (Recommended)**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

**Outlook/Hotmail**
1. Enable 2-Factor Authentication
2. Generate an App Password in account settings

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env` in the backend folder:
   ```bash
   cp .env.example .env
   ```

2. Update your `.env` file with your email credentials:
   ```env
   # For Gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password

   # For Outlook
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASS=your-app-password
   ```

### Step 3: Update Transporter (if not using Gmail)

If you're not using Gmail, update the transporter configuration in `controllers/authController.js`:

```javascript
// For Outlook/Hotmail
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// For Yahoo
const transporter = nodemailer.createTransporter({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// For custom SMTP
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## 🎨 Features Included

### 1. **Bubble Drop CSS Login Page**
- ✅ Beautiful animated bubbles background
- ✅ Floating Indian cultural icons
- ✅ Glass morphism effects
- ✅ Tricolor theme integration
- ✅ Mobile responsive design

### 2. **Authentication Features**
- ✅ **Login** - Secure user authentication with JWT
- ✅ **Registration** - New user signup with validation
- ✅ **Forgot Password** - Email-based password reset

### 3. **Email Integration**
- ✅ **Nodemailer** setup for sending emails
- ✅ **Beautiful HTML email templates** with Indian theme
- ✅ **Password reset emails** with secure tokens
- ✅ **Confirmation emails** after password reset

### 4. **Security Features**
- ✅ **JWT Authentication** with secure tokens
- ✅ **Password encryption** using bcrypt
- ✅ **Reset token expiry** (1 hour validity)
- ✅ **Input validation** and sanitization

## 🧪 Testing the Features

### Test Login Page
1. Start your backend server: `npm start` (in backend folder)
2. Start your frontend: `npm start` (in frontend folder)
3. Navigate to `http://localhost:3000/login`
4. You should see the beautiful bubble drop login page!

### Test Email Functionality
1. Configure your email credentials in `.env`
2. Register a new account
3. Try the "Forgot Password" feature
4. Check your email for the reset link
5. Click the link to reset your password

## 🎯 Login Page Features

### **Visual Effects**
- **Animated Bubbles**: 15 floating bubbles with random sizes and timing
- **Floating Icons**: Indian cultural icons (🏛️🎭🏔️🌊🕌🐘) floating around
- **Gradient Background**: Animated tricolor gradient
- **Glass Morphism**: Semi-transparent card with backdrop blur

### **Form Features**
- **Three Tabs**: Login, Register, Reset Password
- **Real-time Validation**: Instant feedback on form errors
- **Loading States**: Beautiful loading animations
- **Success/Error Messages**: Clear feedback to users

### **Responsive Design**
- **Mobile First**: Optimized for all screen sizes
- **Touch Friendly**: Large buttons and inputs for mobile
- **Accessible**: Proper labels and keyboard navigation

## 📱 Pages Created

1. **`Login.jsx`** - Main authentication page with all features
2. **`Login.css`** - Beautiful bubble drop CSS effects
3. **`ResetPassword.jsx`** - Password reset page
4. **`ResetPassword.css`** - Styling for reset page

## 🔧 Backend Updates

1. **`authController.js`** - Added forgot/reset password functionality
2. **`authRoutes.js`** - Added new API endpoints
3. **`User.js`** - Added reset token fields to model
4. **`.env.example`** - Email configuration template

## 🌟 Email Templates

The system includes beautiful HTML email templates with:
- **Indian tricolor theme** (saffron, white, green)
- **Responsive design** for all email clients
- **Security information** and tips
- **Clear call-to-action buttons**
- **Professional branding** with Yatra360 logo

## 🚀 Ready to Go!

Your login system is now complete with:
- ✅ Beautiful bubble drop CSS effects
- ✅ Full authentication flow
- ✅ Email-based password reset
- ✅ Professional Indian-themed design
- ✅ Mobile responsive interface
- ✅ Security best practices

Enjoy your enhanced Yatra360 platform! 🎉
