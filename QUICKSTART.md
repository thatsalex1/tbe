# TrustBridge Escrow - Quick Start Guide

## 🚀 30-Second Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create `.env` File
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### 3. Start Backend
```bash
npm start
# Runs on http://localhost:3001
```

### 4. Start Frontend
```bash
cd frontend
python3 -m http.server 3000
# Or: npx http-server -p 3000
# Navigate to http://localhost:3000
```

---

## 📱 User Flow

### New User (Signup)
1. Click "Sign Up" on landing page
2. Fill form:
   - Email
   - Password (min 6 chars)
   - Full Name
   - Phone (optional)
   - Role (Buyer or Seller)
3. Click "Create Account"
4. Redirects to login automatically

### Existing User (Login)
1. Click "Log In" on landing page
2. Enter email & password
3. Click "Log In"
4. Taken to dashboard (buyer or seller)

### Using Dashboard
1. **Buyer Dashboard:**
   - View balance (available + pending)
   - Make deposits (crypto/bank)
   - Start escrow transactions
   - View transaction history

2. **Seller Dashboard:**
   - View balance
   - See pending sales
   - Request withdrawals
   - View withdrawal history

### Logout
1. Click "Logout" button (top right)
2. Confirm logout
3. Redirected to home page
4. Session cleared

---

## 🔑 Authentication Explained

### How It Works
- **Signup**: Creates Supabase Auth user + database profile
- **Login**: Returns JWT access token + refresh token
- **Storage**: Tokens saved in browser localStorage
- **Requests**: All API calls include `Authorization: Bearer {token}`
- **Verification**: Backend verifies token with Supabase

### Tokens
```javascript
// Stored in localStorage:
accessToken     // Used for API calls (JWT)
refreshToken    // Used to get new tokens
userId          // User's unique ID
userEmail       // User's email
userRole        // 'buyer' or 'seller'
userName        // User's full name
```

### Token Lifetime
- Access token: Expires based on Supabase settings (usually 1 hour)
- Refresh token: Long-lived (usually 30 days)
- If access token expires, user redirected to login

---

## 📁 File Structure

```
frontend/
├── index.html              ← Landing page
├── signup.html             ← Sign up form
├── login.html              ← Log in form
├── buyer-dashboard.html    ← Buyer area
├── seller-dashboard.html   ← Seller area
├── admin-dashboard.html    ← Admin panel
├── deposits.html           ← Deposit info
├── css/
│   └── style.css           ← All styles
├── js/
│   ├── auth.js             ← Auth utilities ⭐
│   ├── buyer-dashboard.js
│   └── seller-dashboard.js
└── favicon.svg

backend/
├── server.js               ← Express app
├── db.js                   ← Supabase client
├── middleware/
│   └── auth.js             ← Token verification ⭐
└── routes/
    ├── auth.js             ← POST /signup, POST /login
    ├── deposits.js
    ├── transactions.js
    ├── withdrawals.js
    └── balance.js
```

⭐ = Most important for understanding auth flow

---

## 🔌 API Reference

### Auth Endpoints
```
POST /api/auth/signup
  Body: { email, password, full_name, phone, role }
  Response: { success, message, user }

POST /api/auth/login
  Body: { email, password }
  Response: { success, session, user }

GET /api/auth/me
  Headers: { Authorization: Bearer {token} }
  Response: { success, user }
```

### User Endpoints
```
GET /api/balance
  Response: { success, balance: { available, pending, total } }

POST /api/deposits
  Body: { amount, currency, transaction_id_hash, screenshot_url }
  Response: { success, deposit }

POST /api/transactions
  Body: { seller_email, amount }
  Response: { success, transaction }

POST /api/withdrawals
  Body: { amount, account_info }
  Response: { success, withdrawal }
```

---

## 🛠️ Troubleshooting

### "Can't connect to backend"
- ✅ Backend running? (`npm start` in `/backend`)
- ✅ Check `API_BASE_URL` in `frontend/js/auth.js`
- ✅ Check CORS enabled in `backend/server.js`

### "Login fails - Invalid email or password"
- ✅ Check email is correct
- ✅ Check password is at least 6 characters
- ✅ Try signing up again

### "Tokens not saving"
- ✅ localStorage disabled? Enable it
- ✅ Private browsing? Use normal mode
- ✅ Check browser console for errors

### "Dashboard shows blank"
- ✅ Wait 2-3 seconds for data to load
- ✅ Check network tab for API errors
- ✅ Try refreshing page

### "Can't access dashboard after refresh"
- ✅ Tokens expired? Log in again
- ✅ localStorage cleared? Log in again
- ✅ Check if token still in localStorage

---

## 🧪 Test It Out

### Create Test Accounts
```
Account 1 (Buyer):
Email: buyer@test.com
Password: test123456
Role: Buyer

Account 2 (Seller):
Email: seller@test.com
Password: test123456
Role: Seller
```

### Test Flow
1. Signup with Account 1 (Buyer)
2. Login with buyer email
3. Check buyer dashboard loads
4. Logout
5. Signup with Account 2 (Seller)
6. Login with seller email
7. Check seller dashboard loads
8. Logout

---

## 🚀 Deploy to Production

### Frontend → Vercel
```bash
1. Push code to GitHub
2. Connect repo to Vercel
3. No special config needed
4. Auto-deploys on push
```

### Backend → Railway
```bash
1. Push code to GitHub
2. Connect repo to Railway
3. Set environment variables
4. Auto-deploys on push
```

### After Deploy
1. Test signup/login on live URL
2. Check admin dashboard works
3. Verify all API endpoints respond
4. Test on mobile

---

## 📊 Key Differences from Old System

| Feature | Old (Clerk) | New (Supabase) |
|---------|-----------|----------------|
| Signup | Clerk hosted | Simple form |
| Verification | Email OTP | Direct to login |
| Dependencies | 10+ packages | 7 packages |
| Complexity | Medium | Low |
| Auth code | ~400 lines | ~100 lines |
| Setup time | 2 hours | 30 minutes |

---

## 💡 Tips & Tricks

1. **Keep logout button visible** - Users can get stuck if unsure how to logout
2. **Show loading state** - Let users know app is working during API calls
3. **Clear error messages** - Tell users exactly what went wrong
4. **Auto-logout on token expire** - Currently manual, can add auto-refresh
5. **Remember login email** - Use browser autofill for better UX

---

## ❓ FAQ

**Q: Can I use OAuth (Google, GitHub)?**
A: Not yet. Easy to add - just update signup endpoint.

**Q: How do I reset a user's password?**
A: Users must navigate to password reset link. Can be added to login page.

**Q: Can I add 2FA?**
A: Yes, Supabase supports 2FA. Update auth endpoints.

**Q: What if Supabase goes down?**
A: App won't work. No fallback auth system currently.

**Q: How do I backup user data?**
A: Supabase has built-in backups. Configure in dashboard.

---

## 📚 Learn More

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Express.js Guide](https://expressjs.com)
- [JWT Tokens Explained](https://jwt.io/introduction)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**Last Updated:** May 13, 2026  
**Status:** ✅ Production Ready
