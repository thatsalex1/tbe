# LegacyHold Platform - Testing Checklist

Use this checklist to verify all features are working correctly.

---

## Pre-Testing Setup

- [ ] Open VS Code
- [ ] Open project folder: `C:\Users\联想\Documents\trustbridge-escrow`
- [ ] Right-click `frontend` folder → "Open with Live Server"
- [ ] Browser opens at `http://127.0.0.1:5500`
- [ ] Open browser Developer Tools (F12) and go to Console tab
- [ ] Keep console open throughout testing

---

## Test 1: Database Setup

**Purpose:** Verify Supabase database is accessible and has required tables

**Steps:**
1. Navigate to `http://127.0.0.1:5500/setup.html`
2. Wait for page to load completely
3. Check the status messages

**Expected Results:**
- [ ] Page displays "Checking Supabase connection..."
- [ ] Console shows "✓ Supabase connected" or "✓ Users table exists"
- [ ] "Continue to Signup" button becomes enabled (not grayed out)

**If you see "Users table needs to be created manually":**
- [ ] Copy the SQL code displayed
- [ ] Go to Supabase dashboard (supabase.com)
- [ ] Click your project
- [ ] Click "SQL Editor" → "New Query"
- [ ] Paste the SQL code
- [ ] Click "Run" button
- [ ] Wait for "Success" message
- [ ] Return to setup.html and refresh
- [ ] Should now show "✓ Database setup complete!"

**Troubleshooting:**
- If connection fails:
  - [ ] Check internet connection
  - [ ] Verify Supabase website is accessible
  - [ ] Check console for specific error messages
  - [ ] Try refreshing the page

---

## Test 2: Signup Flow

**Purpose:** Verify new user account creation works correctly

**Test Accounts to Create:**

### Test Account 1 - Buyer
- [ ] Navigate to `http://127.0.0.1:5500/signup-simple.html`
- [ ] Fill in form with:
  - First Name: `John`
  - Last Name: `Doe`
  - Email: `john@example.com`
  - Password: `TestPassword123`
  - Confirm Password: `TestPassword123`
- [ ] Click "Create Account" button
- [ ] Console should show "✓ User created:" with user ID
- [ ] Page shows "Account created! Redirecting..."
- [ ] After 1.5 seconds, redirected to role selection page

**Expected Results:**
- [ ] Form validates correctly
- [ ] No error messages appear
- [ ] Supabase successfully inserts user record
- [ ] Page redirects to `select-role.html`

**Possible Errors:**
- [ ] "Email already in use" - Use a different email
- [ ] "Please fill all fields" - Check no fields are empty
- [ ] "Passwords do not match" - Retype both passwords identically
- [ ] "Password must be at least 6 characters" - Use longer password

### Test Account 2 - Seller
- [ ] Repeat signup with:
  - First Name: `Jane`
  - Last Name: `Smith`
  - Email: `jane@example.com`
  - Password: `TestPassword123`
  - Confirm Password: `TestPassword123`
- [ ] Verify successful signup and redirect

---

## Test 3: Role Selection

**Purpose:** Verify role selection works and updates user record

**For John (Buyer Account):**
- [ ] On role selection page, see two cards: "Buyer" and "Seller"
- [ ] Click the "Buyer" card
  - [ ] Card should highlight with gold border
  - [ ] "Continue" button becomes enabled
- [ ] Click "Continue" button
- [ ] Page shows loading message
- [ ] Console shows role being updated
- [ ] After 1-2 seconds, redirected to buyer dashboard

**For Jane (Seller Account):**
- [ ] On role selection page, click "Seller" card
  - [ ] Card highlights with gold border
  - [ ] "Continue" button enables
- [ ] Click "Continue"
- [ ] Redirected to seller dashboard

**Expected Results:**
- [ ] Role selection is required (button disabled until selected)
- [ ] Dashboard loads for correct role
- [ ] Page title changes (Buyer Dashboard vs Seller Dashboard)

---

## Test 4: Buyer Dashboard

**Purpose:** Verify buyer dashboard loads and displays correctly

**While on Buyer Dashboard:**
- [ ] Page title shows "Buyer Dashboard - LegacyHoldEscrow"
- [ ] Sidebar is visible on the left with menu items
- [ ] User name displays in the header (John Doe)
- [ ] Balance section visible showing:
  - [ ] Available Balance: $0.00
  - [ ] Pending Balance: $0.00
  - [ ] Total Balance: $0.00
- [ ] "Deposits" section visible with heading
- [ ] "Escrow Transactions" section visible
- [ ] "Activity" section visible
- [ ] Sidebar navigation items clickable:
  - [ ] Overview
  - [ ] Deposits
  - [ ] Escrow
  - [ ] Activity
  - [ ] Help

**Expected Results:**
- [ ] Page loads completely without errors
- [ ] Layout is clean and professional
- [ ] Gold and dark theme colors are visible
- [ ] User information is correct
- [ ] Balance shows as zero (new account)
- [ ] No console errors (F12 → Console tab)

**Navigation Test:**
- [ ] Click "Deposits" in sidebar → Deposits section appears
- [ ] Click "Escrow" in sidebar → Escrow section appears
- [ ] Click "Activity" in sidebar → Activity section appears
- [ ] Click "Overview" in sidebar → Overview section appears

---

## Test 5: Seller Dashboard

**Purpose:** Verify seller dashboard is different from buyer dashboard

**Steps:**
1. Sign out (clear browser cache or use incognito mode)
2. Navigate to `signin-custom.html`
3. Sign in with Jane (jane@example.com)
4. Verify redirected to seller dashboard

**Expected Results:**
- [ ] Page title shows "Seller Dashboard - LegacyHoldEscrow"
- [ ] Same layout but content for sellers
- [ ] Balance section present
- [ ] Withdrawal section visible
- [ ] Sales activity section visible
- [ ] Page shows "Seller" role context

---

## Test 6: Sign In Flow

**Purpose:** Verify existing users can sign back in

**Test Steps:**
- [ ] Navigate to `signin-custom.html` OR click "Sign In" on landing page
- [ ] Enter email: `john@example.com`
- [ ] Enter password: `TestPassword123`
- [ ] Click "Sign In" button
- [ ] Console shows "🔑 Looking up user..."
- [ ] Console shows "✓ User found:"
- [ ] Page shows loading message
- [ ] After 0.5 seconds, redirected to dashboard
- [ ] Dashboard shows correct user (John Doe)
- [ ] Balance displays correctly

**Expected Results:**
- [ ] Successful authentication
- [ ] User data retrieved from database
- [ ] LocalStorage populated with user info
- [ ] Redirected to buyer dashboard (John's role)
- [ ] No error messages

**Error Testing:**
- [ ] Try signing in with wrong email:
  - [ ] Should show "Email not found. Please create an account first."
- [ ] Try signing in with wrong password:
  - [ ] Should show appropriate error message

---

## Test 7: Session Persistence

**Purpose:** Verify session continues across page refreshes

**Steps:**
- [ ] While on dashboard, press F5 (refresh page)
- [ ] Dashboard should reload with same user data
- [ ] User name still shows correctly
- [ ] Balance still displays
- [ ] No redirect to login

**Expected Results:**
- [ ] Session maintained via localStorage
- [ ] Page reloads instantly without login prompt
- [ ] All user data persists

---

## Test 8: Authentication Protection

**Purpose:** Verify unauthorized access is blocked

**Steps:**
1. Open a new browser tab/window
2. Manually navigate to `http://127.0.0.1:5500/buyer-dashboard.html`
3. Don't sign in, just type URL directly

**Expected Results:**
- [ ] Page redirects to login immediately
- [ ] Cannot access dashboard without proper role

**Testing Role Restriction:**
- [ ] Sign in as seller (jane@example.com)
- [ ] Try manually accessing buyer dashboard URL
- [ ] Should redirect to login (role mismatch)

---

## Test 9: Landing Page

**Purpose:** Verify landing page displays and links work correctly

**Steps:**
- [ ] Navigate to `http://127.0.0.1:5500/`
- [ ] Page loads with hero section
- [ ] Scroll through page to see all sections

**Expected Results:**
- [ ] Hero section displays with CTA buttons
- [ ] Features section visible with descriptions
- [ ] Process section shows steps
- [ ] Security section visible
- [ ] Footer visible with links
- [ ] Responsive on mobile (resize browser)

**Link Testing:**
- [ ] Click "Create Free Account" → Goes to signup-simple.html
- [ ] Click "Sign In" → Goes to signin-custom.html
- [ ] Click "Get Started" → Goes to signup-simple.html
- [ ] Footer links work correctly

---

## Test 10: Console & Error Checking

**Purpose:** Verify no JavaScript errors

**Steps:**
- [ ] During all testing, keep browser console open (F12)
- [ ] After each test, check console for red error messages

**Expected Results:**
- [ ] No red error messages
- [ ] Console shows informational logs (green ✓, blue ℹ️)
- [ ] Page-specific logs appear at load time:
  - Signup: "🚀 Starting signup...", "✓ User created:"
  - Signin: "🚀 Starting signin...", "✓ User found:"
  - Dashboard: "Auth check:", "User authenticated as buyer"

---

## Test 11: Form Validation

**Purpose:** Verify form validation prevents invalid data

**Signup Form Validation:**
- [ ] Try submitting empty form → "Please fill all fields"
- [ ] Try password < 6 chars → "Password must be at least 6 characters"
- [ ] Try mismatched passwords → "Passwords do not match"
- [ ] Try duplicate email → "This email is already registered"

**Sign In Form Validation:**
- [ ] Try submitting empty form → "Please enter email and password"
- [ ] Try non-existent email → "Email not found..."
- [ ] Try wrong password → Error message appears

**Expected Results:**
- [ ] Validation prevents invalid submissions
- [ ] Error messages are clear and helpful
- [ ] Form doesn't submit until valid

---

## Test 12: LocalStorage Verification

**Purpose:** Verify session data is stored correctly

**Steps:**
1. Sign in as john@example.com
2. Open Developer Tools (F12)
3. Go to "Application" or "Storage" tab
4. Click "LocalStorage"
5. Select the current website

**Expected Results:**
- [ ] localStorage contains:
  - [ ] `userId`: Something like `user_1715744230000`
  - [ ] `userEmail`: `john@example.com`
  - [ ] `userName`: `John Doe`
  - [ ] `userRole`: `buyer`

**Clearing Session:**
- [ ] Right-click localStorage entry → Delete
- [ ] Refresh page
- [ ] Should redirect to login page

---

## Summary Checklist

### Critical Features (Must Work)
- [ ] Database setup/verification
- [ ] User signup with validation
- [ ] User signin with existing account
- [ ] Role selection
- [ ] Dashboard loads with correct role
- [ ] Session persists on refresh
- [ ] Unauthorized access blocked

### Secondary Features (Should Work)
- [ ] Landing page displays well
- [ ] Form validation prevents errors
- [ ] Navigation menu works
- [ ] Page titles are correct
- [ ] Design looks professional

### Developer Experience
- [ ] Console logs are helpful
- [ ] Error messages are clear
- [ ] No JavaScript errors
- [ ] Responsive design works
- [ ] Development is smooth

---

## Test Result Summary

**Total Tests:** 12 major test groups
**Time Estimate:** 30-45 minutes
**Difficulty:** Beginner-friendly

**Scoring:**
- ✅ 10-12 passed: Platform ready for feature development
- ⚠️ 7-9 passed: Minor issues need fixing
- ❌ <7 passed: Major issues - review setup steps

---

## Issues Found Log

Use this section to track any problems encountered:

| Issue | Date Found | Status | Notes |
|-------|-----------|--------|-------|
|       |           |        |       |
|       |           |        |       |
|       |           |        |       |

---

## Next Steps After Testing

If all tests pass:
1. ✅ Platform is ready for next phase
2. ✅ Can begin implementing deposits/withdrawals
3. ✅ Can build admin dashboard
4. ✅ Can prepare for backend API development
5. ✅ Can plan deployment to Vercel + Railway

---

**Test Date:** _______________
**Tester Name:** _______________
**All Tests Passed:** ☐ Yes ☐ No

