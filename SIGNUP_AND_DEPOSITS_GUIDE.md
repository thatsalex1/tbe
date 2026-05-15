# Signup & Deposits Complete Guide

## ✅ What's Been Completed

### 1. Signup Functionality
- ✅ Clerk authentication (signup/login)
- ✅ Role selection (Buyer/Seller)
- ✅ User profile creation in Supabase
- ✅ localStorage management for session
- ✅ Dashboard authentication guards
- ✅ Enhanced error logging

### 2. Deposit System
- ✅ 6 deposit methods (BTC, ETH, USDC, USDT, Bank, Card)
- ✅ Dynamic deposit form
- ✅ Supabase deposit storage
- ✅ Deposit history display
- ✅ Status tracking
- ✅ User balance updates

### 3. Authentication
- ✅ auth.js with Clerk integration
- ✅ User balance functions
- ✅ Deposit CRUD operations
- ✅ Session management
- ✅ Role-based access control

---

## 🚀 Complete Signup Flow

### Step 1: Update Supabase Database

**CRITICAL:** You must run the schema-clean.sql file

1. Go to https://app.supabase.com
2. Select your LegacyHoldEscrow project
3. Open **SQL Editor**
4. Copy entire content from:
   ```
   database/schema-clean.sql
   ```
5. Paste into SQL Editor
6. Click **Run**
7. Wait for "Success" message

### Step 2: Test Signup

1. Go to: **http://localhost:8000/signup.html**
2. You should see Clerk signup form with:
   - Email field
   - Password field
   - First Name field
   - Last Name field

3. Fill in test data:
   ```
   Email:     testbuyer@example.com
   Password:  TestPassword123!
   First:     Test
   Last:      Buyer
   ```

4. Click "Create Account"
5. After signup, you'll see role selection page:
   - Two cards: "Buyer" and "Seller"
   - Click the "Buyer" card
   - Click "Continue"

6. **Check Browser Console (F12)** for these messages:
   ```
   ✓ Clerk loaded
   ✓ Supabase client initialized successfully
   ✓ User profile saved to Supabase
   ✓ Data stored in localStorage
   📝 Step 7: Redirecting to buyer-dashboard.html
   ```

7. You should be redirected to **buyer-dashboard.html**

### Step 3: Verify Signup Success

**Check Clerk Dashboard:**
1. Go to https://dashboard.clerk.com
2. Click "Users"
3. Look for "testbuyer@example.com"
4. User should be listed

**Check Supabase:**
1. Go to https://app.supabase.com
2. Select your project
3. Click "Table Editor"
4. Click "users" table
5. You should see:
   - id: (Clerk user ID)
   - email: testbuyer@example.com
   - full_name: Test Buyer
   - role: buyer
   - available_balance: 0
   - pending_balance: 0

---

## 💰 Complete Deposit Flow

### Step 1: Navigate to Deposits

In buyer dashboard:
1. Click "Deposits" in left sidebar
2. You'll see deposit options:
   - ₿ Bitcoin
   - Ξ Ethereum
   - $ USD Coin
   - ≈ Tether
   - 🏦 Bank Transfer
   - 💳 Credit Card

### Step 2: Select Deposit Method - Bitcoin Example

1. Click "₿ Bitcoin" card
2. You'll see:
   - Title: "₿ Bitcoin Deposit"
   - Description: "Send Bitcoin to the address below..."
   - Bitcoin address: **1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa**
   - Form with fields:
     - **Amount** (number)
     - **Transaction ID / Reference** (text)
   - "Copy" button to copy address
   - "Submit Deposit" button

3. Fill in test data:
   ```
   Amount:        0.001
   Transaction ID: 1a2b3c4d5e6f7g8h (example)
   ```

4. Click "Copy" to copy Bitcoin address (test that it copies)

5. Click "Submit Deposit"

6. **Check Console (F12)** for:
   ```
   📝 Creating deposit: {amount: 0.001, currency: "BTC", ...}
   ✓ Deposit created successfully: [...]
   ✓ Deposit submitted successfully! Admin will verify within 24 hours.
   ```

### Step 3: Verify Deposit in Dashboard

After submitting:
1. Form should clear
2. "Deposit History" table should show your new deposit:
   - **Date:** Today's date
   - **Method:** ₿
   - **Amount:** ₦0.001 (or equivalent)
   - **Status:** Pending

### Step 4: Test Bank Transfer Deposit

1. Click "Bank Transfer" card
2. You'll see bank details:
   ```
   Account Name: LegacyHoldEscrow Escrow Ltd
   Account Number: 0123456789
   Bank: First Bank Nigeria
   Reference: TBxxxxxxxxxx (unique for each deposit)
   ```

3. Fill form:
   ```
   Amount:        50000
   Transaction ID: Your bank reference
   ```

4. Click "Submit Deposit"

5. Verify in deposit history table

---

## 🔍 Testing Checklist

### Signup Testing
- [ ] Clerk form displays on signup.html
- [ ] Can fill email, password, name
- [ ] Can click "Create Account"
- [ ] Redirected to select-role.html
- [ ] Can select "Buyer" role
- [ ] Can click "Continue"
- [ ] Console shows all ✓ marks
- [ ] Redirected to buyer-dashboard.html
- [ ] User appears in Clerk dashboard
- [ ] User appears in Supabase users table
- [ ] Dashboard shows user email

### Deposit Testing
- [ ] Can navigate to Deposits section
- [ ] Can see all 6 deposit options
- [ ] Can click each method and form appears
- [ ] Can copy crypto address
- [ ] Can fill amount (>= 100)
- [ ] Can fill transaction ID
- [ ] Can submit deposit form
- [ ] Console shows ✓ Creating deposit
- [ ] Console shows ✓ Deposit created
- [ ] Notification shows success message
- [ ] Form clears after submission
- [ ] Deposit appears in history table
- [ ] Deposit shows "Pending" status
- [ ] Multiple deposits are listed

### Balance Testing
- [ ] Overview section shows balances
- [ ] Available Balance: ₦0.00 initially
- [ ] In Escrow: ₦0.00 initially
- [ ] Total Balance: ₦0.00 initially
- [ ] Balance updates after deposit (when admin confirms)

### Authentication Testing
- [ ] Logout button appears in navbar
- [ ] Can click logout
- [ ] Redirected to login.html
- [ ] Can log back in with same credentials
- [ ] Redirected to select-role.html
- [ ] Select role and continue
- [ ] Dashboard loads

---

## 📊 Database Verification

After successful signup and deposit, check Supabase:

**users table:**
```
id:                 (Clerk user ID)
email:              testbuyer@example.com
full_name:          Test Buyer
role:               buyer
available_balance:  0
pending_balance:    0
```

**deposits table:**
```
id:                (UUID)
user_id:           (Your user ID)
amount:            0.001 (or 50000)
currency:          BTC (or BANK)
transaction_id_hash: (Your tx ID)
status:            pending
created_at:        (Today's date)
```

---

## 🐛 Troubleshooting

### Issue: Clerk signup form not loading
**Solution:**
- Check URL is http://localhost:8000/signup.html (NOT file://)
- Server must be running on port 8000
- Try refreshing the page
- Clear browser cache

### Issue: "User not logged in with Clerk"
**Solution:**
- Complete the Clerk signup form fully
- Don't click Continue until Clerk form is submitted
- Check console for Clerk loading errors

### Issue: Deposit form not submitting
**Solution:**
- Fill all required fields (Amount must be >= 100)
- Check console (F12) for error messages
- Verify Supabase is accessible
- Check that user is authenticated

### Issue: Deposit doesn't appear in history
**Solution:**
- Refresh page
- Check that deposit was created in Supabase
- Check console for submission errors
- Verify user ID is correct

### Issue: Balance not showing
**Solution:**
- Refresh the page
- Check console for balance loading errors
- Verify user exists in Supabase users table
- Check that user ID in localStorage matches Supabase

---

## 📝 Next Steps After Testing

Once signup and deposits are working:

1. **Admin Dashboard**
   - View pending deposits
   - Approve/reject deposits
   - Update user balance when deposit confirmed

2. **Escrow Transactions**
   - Buyer initiates transaction with seller email
   - Funds moved to pending balance
   - Admin updates transaction status

3. **Seller Dashboard**
   - View received transactions
   - Request withdrawals
   - View transaction history

4. **Withdrawal System**
   - Seller requests withdrawal
   - Admin approves and pays
   - Balance updated

---

## 🎯 Success Criteria

You'll know everything is working when:

✓ User can sign up with Clerk
✓ User can select role (Buyer/Seller)
✓ User is redirected to correct dashboard
✓ User can navigate to deposits
✓ User can select deposit method
✓ User can submit deposit form
✓ Deposit appears in history with "Pending" status
✓ User can log out and back in
✓ User appears in both Clerk and Supabase
✓ All console messages show ✓ marks
✓ No errors in browser console

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12) for error messages
2. Read CRITICAL_FIXES.md for technical details
3. Check TESTING_SETUP.md for common issues
4. Verify Supabase schema was applied correctly
5. Verify Clerk keys are correct

---

**Server:** http://localhost:8000
**Signup:** http://localhost:8000/signup.html
**Buyer Dashboard:** http://localhost:8000/buyer-dashboard.html
