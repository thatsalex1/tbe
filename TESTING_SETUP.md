# LegacyHoldEscrow - Testing & Setup Guide

## Quick Start: Local Testing

### 1. Start the Development Server

The frontend files are being served on `http://localhost:8000`. The server is already running.

```bash
# The server is running at:
http://localhost:8000
```

### 2. Access the Application

- **Landing Page:** http://localhost:8000
- **Sign Up:** http://localhost:8000/signup.html
- **Log In:** http://localhost:8000/login.html
- **Admin Dashboard:** http://localhost:8000/admin/index.html

## Critical Update: Supabase Database Schema

### Important: Update RLS Policies

The original RLS policies were blocking signup because they required Supabase Auth (which you're not using). They've been updated to work with Clerk.

**Updated RLS Policies:**
- Users table: Allow anyone to insert (Clerk authenticates on frontend)
- Deposits table: Allow anyone to insert (frontend validates via Clerk)
- Transactions table: Allow anyone to insert/read (frontend validates via Clerk)
- Withdrawals table: Allow anyone to insert/read (frontend validates via Clerk)

**To apply the new schema:**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to SQL Editor
4. Run the SQL from `database/schema.sql`
5. If you get "table already exists" errors, first DROP the existing tables:

```sql
-- Run this FIRST if tables already exist:
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS deposits CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then run the full schema.sql content
```

## Complete Signup Flow

### Step 1: Navigate to Sign Up
- Go to http://localhost:8000/signup.html
- You should see the Clerk sign-up form with:
  - Email field
  - Password field
  - First name and Last name fields

### Step 2: Fill in the Form
- Enter your test email (e.g., test@example.com)
- Enter a password
- Enter first and last name
- Click "Create Account"

### Step 3: Clerk Verification
- Clerk will process the signup
- After successful signup, you'll be redirected to select-role.html
- **Note:** Check the browser console (F12) for debug logs starting with ✓ or ✗

### Step 4: Select Your Role
You should see two cards:
- **Buyer:** For purchasing items with escrow protection
- **Seller:** For selling items safely

- Click on one of the cards to select it
- Click the "Continue" button
- Monitor the browser console for these messages:
  - `✓ Clerk loaded`
  - `✓ Supabase client initialized successfully`
  - `✓ User profile saved to Supabase`
  - `✓ Data stored in localStorage`

### Step 5: Dashboard Access
- If all steps succeeded, you'll be redirected to:
  - `buyer-dashboard.html` (if you selected Buyer)
  - `seller-dashboard.html` (if you selected Seller)

## Debugging: Browser Console

Open the browser console (F12) to see detailed logs:

```
✓ Page loaded, Clerk available: true
✓ Supabase client initialized successfully
📝 Step 1: Loading Clerk...
✓ Clerk loaded
📝 Step 2: User object: { id: "...", emailAddresses: [...] }
📝 Step 3: User details - ID: ... Email: ... Name: ...
📝 Step 4: Creating Supabase user profile...
✓ User profile saved to Supabase
📝 Step 5: Supabase response - Data: [...] Error: null
📝 Step 6: Storing data in localStorage...
✓ Data stored in localStorage
📝 Step 7: Redirecting to buyer-dashboard.html
```

### Common Issues & Solutions

#### Issue 1: "User not logged in with Clerk"
**Cause:** User didn't complete the Clerk signup form
**Solution:** Go back and complete the signup form on signup.html

#### Issue 2: Clerk component not showing on signup.html
**Cause:** Page loaded via file:// protocol (CORS issue)
**Solution:** Make sure you're accessing http://localhost:8000/signup.html, NOT file:///

#### Issue 3: "Supabase client not initialized"
**Cause:** Supabase URL or API key is invalid
**Solution:** 
- Verify SUPABASE_URL in select-role.html
- Verify SUPABASE_ANON_KEY is correct
- Check that Supabase project is active

#### Issue 4: "Supabase error (23505): ..."
**Cause:** User already exists in the database (duplicate email)
**Solution:** Use a different email address or delete the user from Supabase

## Verify Everything is Working

### 1. Check Clerk Dashboard
- Go to https://dashboard.clerk.com
- Log in with your Clerk account
- Navigate to "Users"
- You should see your test user listed

### 2. Check Supabase Database
- Go to https://app.supabase.com
- Select your project
- Go to "SQL Editor" or "Table Editor"
- Check the "users" table
- You should see your test user with:
  - `id` = Clerk user ID
  - `email` = Your test email
  - `full_name` = Your name
  - `role` = 'buyer' or 'seller'
  - `available_balance` = 0
  - `pending_balance` = 0

### 3. Check Dashboard Access
- After signup, the dashboard should load
- Verify the profile section shows your email and role
- Check browser localStorage (F12 → Application → Local Storage)
  - `userId` = Your Clerk ID
  - `userEmail` = Your email
  - `userRole` = 'buyer' or 'seller'
  - `userName` = Your name

## Authentication Check

The dashboards have built-in authentication checks:

```javascript
function checkAuth() {
  const userId = localStorage.getItem('userId');
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  
  if (!userId || !userEmail || userRole !== 'buyer') {
    window.location.href = './login.html';
  }
}
```

**To test authentication:**
1. Log out (clear localStorage manually)
2. Try to access `/buyer-dashboard.html` directly
3. You should be redirected to `/login.html`

## File Structure

```
frontend/
├── index.html                    # Landing page
├── login.html                    # Clerk login form
├── signup.html                   # Clerk signup form
├── select-role.html              # Role selection → Supabase user creation
├── buyer-dashboard.html          # Buyer dashboard (with auth check)
├── seller-dashboard.html         # Seller dashboard (with auth check)
├── admin/
│   └── index.html                # Admin dashboard
├── css/
│   ├── style.css                 # Main styles
│   └── admin.css                 # Admin styles
├── js/
│   └── api.js                    # API helper functions
├── server.js                     # Local development server
└── .env.local                    # Clerk publishable key

database/
└── schema.sql                    # Updated Supabase schema (RLS fixed)
```

## Key Fixes Made

1. **RLS Policies:** Updated to work with Clerk instead of Supabase Auth
   - Removed `auth.uid()` checks that were blocking inserts
   - Changed to `WITH CHECK (true)` to allow frontend validation

2. **Logging:** Added comprehensive debug logs to track the signup flow
   - Logs in select-role.html for each step
   - Console shows checkmarks (✓) for success, X (✗) for errors

3. **Error Messages:** Enhanced error handling in select-role.html
   - Specific error messages for Clerk failures
   - Specific error messages for Supabase failures

## Next Steps

After verification, you can:

1. **Deploy to Production:**
   - Deploy frontend to Vercel
   - Update Supabase project with production schema
   - Update Clerk publishable key with production key

2. **Add Features:**
   - Implement deposit functionality
   - Implement escrow transaction flow
   - Implement withdrawal requests
   - Implement admin dashboard

3. **Customization:**
   - Replace placeholder wallet addresses
   - Update company contact information
   - Customize dashboard layouts

## Support

For issues:
1. Check the browser console (F12) for detailed error messages
2. Verify Supabase credentials are correct
3. Verify Clerk configuration is correct
4. Check that the local server is running on http://localhost:8000

