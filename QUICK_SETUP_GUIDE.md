# LegacyHold Escrow Platform - Quick Setup Guide

## Overview

This guide will walk you through setting up and testing the complete LegacyHold platform. The system has:
- **Landing Page** (index.html)
- **Authentication** (signup-simple.html, signin-custom.html)
- **Role Selection** (select-role.html)
- **Buyer Dashboard** (buyer-dashboard.html)
- **Seller Dashboard** (seller-dashboard.html)

---

## Prerequisites

You need:
1. **Supabase Account** - Already set up at `https://wdhvrghpmypjthpkfffb.supabase.co`
2. **VS Code with Live Server** - For running the frontend locally
3. **Web Browser** - Chrome, Firefox, Edge, or Safari

---

## Step 1: Set Up Your Database (One-Time Setup)

### 1a. Open Setup Page

1. Open VS Code
2. Open the project folder: `C:\Users\联想\Documents\trustbridge-escrow`
3. Right-click on `frontend` folder in Explorer
4. Select **"Open with Live Server"**
5. This opens your browser at `http://127.0.0.1:5500`
6. Click on **setup.html**

### 1b. Verify or Create Users Table

The setup page will automatically check if your Supabase database has the `users` table.

**If the page shows "✓ Database setup complete!":**
- Your database is ready! Click "Continue to Signup" and skip to Step 2.

**If the page shows "⚠️ Users table needs to be created manually":**
- Copy the SQL code shown on the page
- Go to [Supabase Dashboard](https://supabase.com)
- Click on your project
- Click **"SQL Editor"** on the left sidebar
- Click **"New Query"**
- Paste the SQL code
- Click **"Run"** button
- Return to the setup page and refresh
- You should now see "✓ Database setup complete!"

---

## Step 2: Create Your First Account

### 2a. Sign Up as Buyer

1. From the setup page, click **"Continue to Signup"** OR
2. Navigate to `http://127.0.0.1:5500/signup-simple.html`
3. Fill in the form:
   - **First Name:** John
   - **Last Name:** Doe
   - **Email:** john@example.com
   - **Password:** Password123
   - **Confirm Password:** Password123
4. Click **"Create Account"**

You should see: **"Account created! Redirecting..."**

### 2b. Select Your Role

After signup, you'll be asked to choose your role:
- Click **"Buyer"** card
- Click **"Continue"**

You should be redirected to the **Buyer Dashboard**.

### 2c. Verify Dashboard

You should see:
- Your name in the top-right
- Sidebar with navigation options
- Balance section showing $0.00 available
- Deposits section with payment options

---

## Step 3: Test Sign In

### 3a. Sign Out (Optional)

If you want to test sign in, you need to sign out first:
1. Look for a sign out button on the dashboard
2. Click it (or manually clear localStorage and refresh)

### 3b. Sign In

1. Go to `http://127.0.0.1:5500/signin-custom.html` OR click "Sign In" link on landing page
2. Enter your email: john@example.com
3. Enter your password: Password123
4. Click "Sign In"
5. You should be redirected back to the Buyer Dashboard

---

## Step 4: Test Multiple Accounts

Repeat Step 2 with different test accounts:

**Seller Account:**
- First Name: Jane
- Last Name: Smith
- Email: jane@example.com
- Password: Password123
- Role: Seller → You'll be directed to Seller Dashboard

---

## Troubleshooting

### "Database connection failed"
- Check if Supabase is accessible
- Verify the Supabase credentials in the HTML file (they're hardcoded)
- Check browser console for errors (F12 → Console tab)

### "Email already registered"
- The email already exists in your database
- Try with a different email address

### "Please fill all fields"
- Make sure all form fields are filled in
- Password must be at least 6 characters

### "Users table not found"
- Run the SQL from setup.html in your Supabase SQL Editor
- Make sure you click "Run" button after pasting the SQL

### Role Selection Not Working
- Check browser console (F12) for JavaScript errors
- Make sure you selected a role (card should be highlighted gold)
- Click "Continue" button

---

## What's Ready to Use

✅ **Signup** - Create new accounts with email/password
✅ **Signin** - Sign in to existing accounts
✅ **Role Selection** - Choose buyer or seller
✅ **Balance Display** - See your available and pending balance
✅ **Sidebar Navigation** - Menu for different sections
✅ **Basic Dashboard Layout** - Clean, professional design

---

## What's Coming Next

These features are prepared in code but need completion:
- 📝 Deposit functionality (screenshots upload, payment tracking)
- 💳 Escrow transactions (buyer initiates, funds held)
- 💰 Withdrawals (sellers request, admin approves)
- 👨‍💼 Admin dashboard (manage deposits, transactions, users)
- 🔔 Admin notifications (pending approvals)

---

## File Structure

```
frontend/
├── index.html                 ← Landing page
├── setup.html                 ← Database setup checker
├── signup-simple.html         ← Account creation
├── signin-custom.html         ← Account login
├── select-role.html           ← Choose buyer/seller
├── buyer-dashboard.html       ← Buyer interface
├── seller-dashboard.html      ← Seller interface
├── admin-dashboard.html       ← Admin interface (in progress)
└── css/
    └── style.css              ← Shared styles (dark theme, gold accents)
```

---

## Important Details

### Credentials Used
- **Supabase URL:** https://wdhvrghpmypjthpkfffb.supabase.co
- **Supabase Key:** (embedded in HTML files)
- **Admin Login:** (To be configured when admin dashboard is completed)

### Database Tables Created
1. **users** - User accounts with balance info
2. **deposits** - Deposit records with payment details
3. **transactions** - Escrow deals between buyers and sellers
4. **withdrawals** - Withdrawal requests from sellers
5. **admin_logs** - Audit trail for admin actions

### Data Stored Locally
User session data is stored in browser's localStorage:
- userId
- userEmail
- userName
- userRole

This allows the dashboard to work without a backend server.

---

## Testing Checklist

- [ ] Database setup page works and finds/creates users table
- [ ] Can create new account at signup page
- [ ] After signup, directed to role selection page
- [ ] Can select buyer role and reach buyer dashboard
- [ ] Dashboard shows correct user name and balance
- [ ] Can create seller account with different email
- [ ] Seller dashboard loads and shows correct role
- [ ] Can sign in with existing account
- [ ] Signed-in user sees their correct balance
- [ ] Console has no JavaScript errors (F12)

---

## Need Help?

Check the browser console for detailed error messages:
1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Look for any red error messages
4. These will help identify what's wrong

All pages log their operations to the console, so it's very helpful for debugging.

---

**Enjoy using LegacyHold! 🎉**
