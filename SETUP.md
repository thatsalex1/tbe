# TrustBridge Escrow - Setup & Deployment Guide

## Overview
TrustBridge is a simplified luxury watch escrow platform with direct Supabase authentication (no external services like Clerk).

**Tech Stack:**
- Frontend: Plain HTML/CSS/JavaScript (Vercel)
- Backend: Express.js (Railway)
- Database: Supabase PostgreSQL
- Auth: Supabase native authentication

---

## 1. Initial Setup

### 1.1 Supabase Setup

1. Create a new project at https://supabase.com
2. Copy your Supabase URL and Anon Key
3. Run the SQL schema from `database/schema.sql` in the Supabase SQL editor:
   - Creates `users`, `deposits`, `transactions`, `withdrawals` tables
   - Enables Row-Level Security for data isolation

### 1.2 Backend Environment Variables

Create `.env` file in `/backend`:

```
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_KEY=your_service_key

# Admin credentials (for /admin/auth endpoints)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Frontend URL (for email redirects)
FRONTEND_URL=http://localhost:3000
```

### 1.3 Frontend Configuration

Update `frontend/js/auth.js` if needed:
- `API_BASE_URL` - Backend API endpoint (default: http://localhost:3001/api)

---

## 2. Running Locally

### Backend:
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:3001
```

### Frontend:
```bash
cd frontend
# Serve with any static server, or use:
python3 -m http.server 3000
# Access at http://localhost:3000
```

---

## 3. User Authentication Flow

### Signup
1. User visits `/signup.html`
2. Fills: Email, Password, Full Name, Phone, Role (Buyer/Seller)
3. POST to `/api/auth/signup` creates:
   - Supabase Auth user
   - Database user profile
4. Redirects to `/login.html`

### Login
1. User visits `/login.html`
2. Enters Email + Password
3. POST to `/api/auth/login` returns:
   - `accessToken` (JWT for authenticated requests)
   - `refreshToken` (for token renewal)
   - User profile data
4. Tokens stored in localStorage
5. Redirects to appropriate dashboard (buyer/seller)

### Authenticated Requests
All API calls include:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

Backend middleware (`middleware/auth.js`) verifies tokens via Supabase.

---

## 4. API Endpoints

### Public Endpoints
```
POST   /api/auth/signup      Create account
POST   /api/auth/login       Login with email/password
```

### Protected Endpoints (require token)
```
GET    /api/auth/me          Get current user
GET    /api/balance          Get user's balance
POST   /api/deposits         Create deposit record
POST   /api/transactions     Initiate escrow transaction
POST   /api/withdrawals      Request withdrawal
```

### Admin Endpoints
```
POST   /api/admin/auth/login  Admin login (username/password)
GET    /api/admin/users       List all users
GET    /api/admin/deposits    List pending deposits
POST   /api/admin/deposits/:id/confirm  Confirm deposit
```

---

## 5. Directory Structure

```
trustbridge-escrow/
├── frontend/
│   ├── index.html              Landing page
│   ├── signup.html             Sign up form
│   ├── login.html              Login form
│   ├── buyer-dashboard.html    Buyer dashboard
│   ├── seller-dashboard.html   Seller dashboard
│   ├── admin-dashboard.html    Admin panel
│   ├── deposits.html           Deposit tracking
│   ├── css/
│   │   └── style.css           Shared styles
│   ├── js/
│   │   ├── auth.js             Auth utilities (localStorage, API calls)
│   │   ├── buyer-dashboard.js  Buyer logic
│   │   ├── seller-dashboard.js Seller logic
│   │   └── admin-dashboard.js  Admin logic
│   └── favicon.svg
│
├── backend/
│   ├── server.js               Express app
│   ├── db.js                   Supabase client
│   ├── .env                    Environment variables
│   ├── .env.example            Template
│   ├── middleware/
│   │   └── auth.js             JWT verification
│   └── routes/
│       ├── auth.js             POST /signup, POST /login, GET /me
│       ├── deposits.js         Deposit management
│       ├── transactions.js     Escrow transactions
│       ├── withdrawals.js      Withdrawal requests
│       ├── balance.js          User balance
│       ├── admin.js            Admin operations
│       └── upload.js           File uploads
│
├── database/
│   └── schema.sql              PostgreSQL schema
│
├── SETUP.md                    This file
└── README.md                   Project overview
```

---

## 6. Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repo to Vercel
3. Set build command: `cd frontend && npm install`
4. Output directory: `frontend`
5. Environment variables: None needed (API_BASE_URL hardcoded for prod)

### Backend (Railway)
1. Push code to GitHub
2. Connect repo to Railway
3. Set start command: `node backend/server.js`
4. Add environment variables from `.env`
5. Railway auto-deploys on push

---

## 7. Key Features

### Authentication
- ✅ Signup with email/password
- ✅ Login with email/password
- ✅ Automatic token refresh
- ✅ Logout clears localStorage
- ✅ Protected routes redirect to login

### Buyer Dashboard
- View available & pending balance
- Make deposits (crypto + bank transfer options)
- Initiate escrow transactions
- View transaction history

### Seller Dashboard
- View available & pending balance
- View received escrow transactions
- Request withdrawals

### Admin Dashboard
- View user statistics
- Manage users
- Confirm deposits
- Update transaction status
- Approve withdrawals

### Security
- ✅ JWT token authentication
- ✅ Supabase Row-Level Security
- ✅ Secure password hashing
- ✅ HTTPS only in production
- ✅ CORS enabled for frontend domain

---

## 8. Testing

### Test User Accounts
```
# Create via signup form
Email: buyer@test.com
Password: password123
Role: Buyer

Email: seller@test.com
Password: password123
Role: Seller
```

### Test Admin Login
```
Username: admin
Password: admin123
```

---

## 9. Troubleshooting

### Frontend can't connect to backend
- Check backend is running on http://localhost:3001
- Check CORS is enabled in `backend/server.js`
- Verify API_BASE_URL in `frontend/js/auth.js`

### Login fails
- Check Supabase connection in backend
- Verify environment variables
- Check user exists in Supabase Auth

### Tokens not persisting
- Check localStorage is enabled in browser
- Check browser privacy settings aren't blocking storage

---

## 10. Next Steps

1. ✅ Set up Supabase project
2. ✅ Configure environment variables
3. ✅ Run backend locally
4. ✅ Test signup/login flow
5. ✅ Deploy to Vercel + Railway
6. ✅ Test live endpoints

---

For questions or issues, refer to:
- Supabase docs: https://supabase.com/docs
- Express docs: https://expressjs.com
- Railway docs: https://docs.railway.app
