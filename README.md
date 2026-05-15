# LegacyHold Escrow Platform

A secure, professional escrow service for luxury watch transactions with separate buyer and seller dashboards.

## Features

✅ **User Authentication**
- Custom signup and signin forms
- Role-based access (Buyer/Seller)
- Secure session management with localStorage

✅ **Dashboards**
- Buyer Dashboard: Deposit funds, initiate escrow, track transactions
- Seller Dashboard: View earnings, request withdrawals, manage sales
- Admin Dashboard: User management, transaction monitoring

✅ **Design**
- Beautiful dark theme with gold accents
- Fully responsive (mobile, tablet, desktop)
- Hamburger menu on mobile
- Professional UI/UX

✅ **Technology Stack**
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Database: Supabase (PostgreSQL)
- No backend server required
- Static file deployment

## Quick Start

### Development
```bash
# Navigate to frontend directory
cd frontend

# Open with Live Server (VS Code)
# Right-click frontend folder → Open with Live Server

# Or use Python HTTP server
python -m http.server 8000

# Open browser
# http://localhost:8000
```

### Test Accounts
```
Email: test@example.com
Password: Test123456
Role: Select Buyer or Seller
```

## Deployment

### Vercel
1. Push to GitHub
2. Connect GitHub repo to Vercel
3. Vercel auto-deploys on push

### Hostinger
1. Upload frontend/ files to public_html/
2. Enable HTTPS (AutoSSL)
3. Configure DNS

## Project Structure

```
trustbridge-escrow/
├── frontend/
│   ├── index.html                 # Landing page
│   ├── signup-simple.html         # User signup
│   ├── signin-custom.html         # User signin
│   ├── select-role.html           # Role selection
│   ├── buyer-dashboard.html       # Buyer dashboard
│   ├── seller-dashboard.html      # Seller dashboard
│   ├── admin-dashboard.html       # Admin panel
│   ├── setup.html                 # Database setup
│   ├── css/
│   │   └── style.css              # Shared styles
│   └── js/
│       ├── auth.js                # Authentication helpers
│       ├── buyer-dashboard-enhanced.js
│       ├── seller-dashboard.js
│       └── admin-dashboard.js
├── database/
│   ├── schema.sql                 # Database schema
│   └── schema-clean.sql           # Clean schema
└── README.md
```

## Database

Uses Supabase (PostgreSQL) with:
- Users table
- Deposits table
- Transactions table
- Withdrawals table
- Admin logs table

## Security

- Row-Level Security (RLS) on all tables
- Email uniqueness constraint
- Password validation
- Session-based authentication
- Protected dashboard routes

## Environment Variables

Not needed for frontend-only deployment.

## Support

For issues or questions, refer to the documentation files:
- `QUICK_REFERENCE.txt` - Quick start guide
- `SIMPLE_HOSTINGER_SETUP.md` - Hostinger deployment
- `HOSTINGER_DEPLOYMENT_GUIDE.md` - Complete guide

## License

Proprietary - LegacyHold Escrow Platform

---

**Status:** ✅ Production Ready
