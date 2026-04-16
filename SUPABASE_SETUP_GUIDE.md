# Complete Supabase User Login/Register System Setup Guide

## 🎯 Overview
This guide will help you set up a complete authentication system with:
- Email/Password Registration
- Email/Password Login
- Google OAuth (Gmail) Login
- User Dashboard
- Session Management

---

## 📋 Step 1: Supabase Project Setup

### 1.1 Access Your Supabase Dashboard
- Go to: https://supabase.com/dashboard/project/gudyszcygszreixvnmjp
- Make sure you're logged in

### 1.2 Get Your API Keys (Already Done ✅)
Your keys are already configured in the code:
- **Project URL**: `https://gudyszcygszreixvnmjp.supabase.co`
- **Anon Key**: Already added to `script.js`

---

## 📋 Step 2: Configure Email Authentication

### 2.1 Enable Email Provider
1. Go to: **Authentication** → **Providers**
2. Find **Email** provider
3. Make sure it's **Enabled** (should be by default)

### 2.2 Configure Email Settings
1. Go to: **Authentication** → **Email Templates**
2. You can customize:
   - Confirmation email
   - Password reset email
   - Magic link email

### 2.3 Email Confirmation Settings
1. Go to: **Authentication** → **Settings**
2. Find **"Enable email confirmations"**
3. **Options:**
   - ✅ **Enabled**: Users must verify email before signing in (More Secure)
   - ❌ **Disabled**: Users can sign in immediately (Faster onboarding)

**Recommendation**: Keep it **DISABLED** for now for easier testing, enable later for production.

---

## 📋 Step 3: Configure Google OAuth (Gmail Login)

### 3.1 Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select Project**
   - Click "Select a project" → "New Project"
   - Name it: "Rivernova Auth"
   - Click "Create"

3. **Enable Google+ API**
   - Go to: **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to: **APIs & Services** → **Credentials**
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: **External**
     - App name: **Rivernova**
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue"
   
5. **Configure OAuth Client**
   - Application type: **Web application**
   - Name: **Rivernova Web Client**
   - **Authorized JavaScript origins**:
     - `http://localhost:5500`
     - `http://localhost:8000`
     - `http://127.0.0.1:5500`
     - Add your production domain later
   - **Authorized redirect URIs**:
     - `https://gudyszcygszreixvnmjp.supabase.co/auth/v1/callback`
   - Click "Create"

6. **Copy Credentials**
   - You'll see **Client ID** and **Client Secret**
   - Keep this window open!

### 3.2 Add Google Credentials to Supabase

1. **Go to Supabase Dashboard**
   - Authentication → Providers → Google

2. **Enable Google Provider**
   - Toggle "Enable Sign in with Google"

3. **Add Credentials**
   - Paste **Client ID** from Google
   - Paste **Client Secret** from Google
   - Click "Save"

---

## 📋 Step 4: Configure Site URL and Redirect URLs

### 4.1 Set Site URL
1. Go to: **Authentication** → **URL Configuration**
2. **Site URL**: 
   - For local development: `http://localhost:5500`
   - For production: `https://yourdomain.com`

### 4.2 Add Redirect URLs
1. In the same section, find **Redirect URLs**
2. Add these URLs:
   ```
   http://localhost:5500/**
   http://localhost:8000/**
   http://127.0.0.1:5500/**
   ```
3. Click "Save"

---

## 📋 Step 5: Test Your Authentication System

### 5.1 Run Local Server
**Option 1: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"
- Opens at: `http://localhost:5500`

**Option 2: Python**
```bash
cd "c:\Users\roman\OneDrive\Desktop\Startup\Rivernova"
python -m http.server 8000
```
- Opens at: `http://localhost:8000`

### 5.2 Test Email/Password Sign Up
1. Click "Get Started"
2. Click "Sign Up" tab
3. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123
4. Click "Create Account"
5. Should redirect to dashboard

### 5.3 Test Email/Password Sign In
1. Click "Get Started"
2. Click "Sign In" tab
3. Enter email and password
4. Click "Sign In"
5. Should redirect to dashboard

### 5.4 Test Google OAuth
1. Click "Get Started"
2. Click "Continue with Gmail" or "Sign up with Gmail"
3. Select your Google account
4. Authorize the app
5. Should redirect back and go to dashboard

---

## 📋 Step 6: View Registered Users

### 6.1 Check Users in Supabase
1. Go to: **Authentication** → **Users**
2. You'll see all registered users:
   - Email users
   - Google OAuth users
   - Registration date
   - Last sign in

### 6.2 User Details
Click on any user to see:
- User ID
- Email
- Provider (email or google)
- Metadata (name, etc.)
- Created date

---

## 🔒 Security Best Practices

### 1. Enable Row Level Security (RLS)
If you create database tables:
1. Go to: **Database** → **Tables**
2. Select your table
3. Enable RLS
4. Add policies for user access

### 2. Enable Email Confirmation (Production)
1. Go to: **Authentication** → **Settings**
2. Enable "Email confirmations"
3. Users must verify email before accessing

### 3. Set Password Requirements
1. Go to: **Authentication** → **Settings**
2. Configure:
   - Minimum password length (default: 6)
   - Password strength requirements

### 4. Enable Rate Limiting
Already enabled by default in Supabase:
- Sign up: 30 requests per hour per IP
- Sign in: 30 requests per hour per IP

---

## 🎨 Current Features

### ✅ What's Working:
1. **Email/Password Registration**
   - Input validation
   - Password strength check
   - Auto-login after sign up

2. **Email/Password Login**
   - Credential validation
   - Error handling
   - Session management

3. **Google OAuth**
   - One-click sign in
   - Auto account creation
   - Secure token handling

4. **User Dashboard**
   - Protected route
   - User profile display
   - Sign out functionality

5. **Security Features**
   - Token verification
   - Session expiration (24 hours)
   - Input validation
   - Rate limit handling

---

## 🐛 Troubleshooting

### Issue: "Site URL not allowed"
**Solution**: Add your URL to Redirect URLs in Supabase dashboard

### Issue: "Invalid redirect URL"
**Solution**: Make sure you're running on `http://localhost`, not `file://`

### Issue: Google OAuth not working
**Solution**: 
1. Check Google credentials are added to Supabase
2. Verify redirect URI in Google Console matches Supabase callback URL
3. Make sure you're running on a local server

### Issue: "Email rate limit exceeded"
**Solution**: Wait 1 hour or use a different email address

### Issue: Can't access dashboard
**Solution**: 
1. Check if token exists: Open browser console → `localStorage.getItem('supabase_token')`
2. If null, sign in again
3. If exists but can't access, token might be expired

---

## 📱 Next Steps

### 1. Add Password Reset
- Create forgot password page
- Use Supabase password reset API

### 2. Add User Profile Editing
- Allow users to update name, email
- Add profile picture upload

### 3. Add Email Verification
- Enable email confirmation in Supabase
- Create verification page

### 4. Deploy to Production
- Deploy to Vercel/Netlify
- Update Site URL in Supabase
- Update Google OAuth redirect URIs
- Enable email confirmation

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify all URLs match in Supabase and Google Console
4. Make sure you're running on a local server (not file://)

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Email provider enabled
- [ ] Google OAuth credentials created
- [ ] Google credentials added to Supabase
- [ ] Site URL configured
- [ ] Redirect URLs added
- [ ] Local server running
- [ ] Email sign up tested
- [ ] Email sign in tested
- [ ] Google OAuth tested
- [ ] Dashboard access verified
- [ ] Sign out tested

---

**Your authentication system is ready! 🎉**
