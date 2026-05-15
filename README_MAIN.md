# LegacyHold Escrow Platform

**Complete luxury escrow solution for high-value transactions**

## 🎯 What Is This?

LegacyHold is a secure escrow platform designed for buying and selling luxury items (particularly timepieces). It protects both buyers and sellers by holding payments in escrow until both parties are satisfied.

**Current Status:** ✅ **Production-Ready for User Registration & Authentication**

---

## 🚀 Quick Start (5 Minutes)

### 1. Set Up Your Environment

```bash
# Open VS Code
# Open folder: C:\Users\联想\Documents\trustbridge-escrow
# Right-click 'frontend' folder
# Select "Open with Live Server"
```

Your browser will open at: `http://127.0.0.1:5500`

### 2. Check Your Database

1. Go to: `http://127.0.0.1:5500/setup.html`
2. Wait for the database check to complete
3. If you see ✅ **"Database setup complete!"** → Skip to step 4
4. If you see ⚠️ **"Users table needs to be created"** → Follow these steps:
   - Copy the SQL code shown on the page
   - Go to [Supabase Dashboard](https://supabase.com)
   - Click your project → **SQL Editor** → **New Query**
   - Paste and run the SQL
   - Return and refresh setup.html

### 3. Create Your Test Account

1. Click **"Continue to Signup"** from setup page
2. Fill in:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Password: `TestPassword123`
3. Click **"Create Account"**
4. Select your role: **Buyer** or **Seller**
5. ✅ You're now in the dashboard!

### 4. Test Sign In

1. Sign out (clear browser cache or use new incognito window)
2. Go to: `http://127.0.0.1:5500/signin-custom.html`
3. Sign in with your credentials
4. ✅ You're back in the dashboard!

---

## 📚 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **QUICK_SETUP_GUIDE.md** | Step-by-step setup instructions | 10 min |
| **TESTING_CHECKLIST.md** | Complete test plan with verification steps | 30 min |
| **IMPLEMENTATION_STATUS.md** | What's complete, what's in progress | 15 min |

**👉 START HERE: Read `QUICK_SETUP_GUIDE.md` next**

---

## ✨ What's Ready Right Now

### User Authentication
- ✅ Signup with email & password
- ✅ Signin to existing accounts
- ✅ Role selection (Buyer/Seller)
- ✅ Session management
- ✅ Dashboard based on role
- ✅ Automatic logout redirect

### Database
- ✅ PostgreSQL schema with all tables
- ✅ Automatic setup checker
- ✅ User data storage
- ✅ Security policies enabled

### Design
- ✅ Beautiful dark theme with gold accents
- ✅ Responsive mobile design
- ✅ Professional landing page
- ✅ Clean, modern dashboards

---

## 🔄 What's In Progress

- 🔄 Deposit/payment methods
- 🔄 Escrow transaction system
- 🔄 Seller withdrawals
- 🔄 Admin dashboard features
- 🔄 Transaction history

---

## 🎨 Features Overview

### For Buyers
- 💳 Initiate escrow transactions
- 📸 Upload payment proof (screenshot)
- 💰 See balance & pending funds
- 📋 View transaction history
- 🔒 Secure escrow protection

### For Sellers
- 📊 Dashboard with sales activity
- 💰 Available and pending balance
- 💸 Request withdrawals
- 📦 Track pending escrow releases
- 🔔 Get notified of incoming transactions

### For Admins
- 👥 Manage users
- ✅ Approve/reject deposits
- 💼 Update transaction status
- 💳 Process seller withdrawals
- 📋 View audit logs

---

## 🌍 How It Works

```
1. SIGNUP
   User creates account → Email verified → Account active
                              ↓
2. ROLE SELECTION
   Choose buyer or seller → Directed to dashboard
                              ↓
3. BUYER INITIATES
   Buyer → Selects item → Enters seller email → Amount → Escrow created
                              ↓
4. PAYMENT
   Buyer → Sends payment → Upload proof → Awaiting admin confirmation
                              ↓
5. ADMIN CONFIRMATION
   Admin reviews → Approves payment → Funds added to escrow
                              ↓
6. COMPLETION
   Both parties satisfied → Admin releases → Seller gets paid
                              ↓
7. WITHDRAWAL
   Seller → Requests withdrawal → Admin processes → Funds transferred
```

---

## 🛠️ Technology Stack

**Frontend:**
- HTML5 + CSS3
- JavaScript (ES6+)
- Supabase SDK

**Database:**
- PostgreSQL (via Supabase)
- Row-Level Security
- Automated backups

**Design:**
- Dark Navy Theme (#0a0e1a)
- Gold Accents (#c9a84c)
- Mobile Responsive

**Development:**
- VS Code + Live Server
- Local development, no build process needed

---

## ✅ Quick Verification

After setup, you should be able to:

- [ ] Navigate to setup.html and see database status
- [ ] Create a new account
- [ ] Select a role (buyer or seller)
- [ ] See your dashboard with your name
- [ ] Sign in with your credentials
- [ ] View your balance ($0.00 for new account)
- [ ] See no JavaScript errors in console (F12)

---

## 📞 Support & Next Steps

1. **First:** Read `QUICK_SETUP_GUIDE.md`
2. **Then:** Follow the setup and create your first account
3. **Finally:** Use `TESTING_CHECKLIST.md` to verify everything works

---

**Ready? 👉 Open `QUICK_SETUP_GUIDE.md` now!**

Version: 1.0  
Last Updated: May 14, 2026  
Status: ✅ Ready for Testing & Deployment
