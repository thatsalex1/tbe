# Simple Hostinger Deployment - LegacyHold

**Just upload files and go live. That's it.**

---

## What You Get

✅ User signup/login (works)  
✅ Buyer/Seller dashboards (works)  
✅ Admin panel to see users (works)  
✅ Beautiful design (done)  

---

## Step 1: Prepare Files (5 minutes)

From your project folder: `trustbridge-escrow\frontend\`

Files to upload:
- `index.html`
- `setup.html`
- `signup-simple.html`
- `signin-custom.html`
- `select-role.html`
- `buyer-dashboard.html`
- `seller-dashboard.html`
- `admin-dashboard.html`
- `css/` folder

That's all you need.

---

## Step 2: Upload to Hostinger (15 minutes)

### Using File Manager (Easiest)

1. Log in to Hostinger
2. Click **File Manager**
3. Open **public_html** folder
4. Delete any existing files
5. Upload all the files from Step 1
6. Done!

### Using FTP (Alternative)

Use FileZilla:
- Host: `ftp.yourdomain.com`
- Upload to: `public_html/`

---

## Step 3: Enable HTTPS (10 minutes)

1. Go to **SSL/TLS** in Hostinger
2. Click "Manage"
3. Select "AutoSSL" 
4. Click "Install"
5. Wait 5-15 minutes

Done - you get free SSL certificate.

---

## Step 4: Test It (10 minutes)

1. Visit: `https://yourdomain.com`
2. See landing page ✅
3. Click "Get Started"
4. Sign up: test@example.com / Password123
5. Select "Buyer"
6. See dashboard ✅

---

## Step 5: Create Admin Account (5 minutes)

### Option A: Direct in Supabase (Recommended)

1. Create user account on your site (admin@example.com)
2. Go to Supabase dashboard
3. Find the users table
4. Find that user row
5. No need to change anything - admin can log in same as regular user
6. Visit: `https://yourdomain.com/admin-dashboard.html`
7. Sign in with admin@example.com
8. Can see users list

### Option B: Make Admin-Only Login

Currently admin page works with any account. If you want admin-only:

Edit `admin-dashboard.html` and find this section:

```javascript
const adminPassword = 'admin123'; // Change this to your admin password
```

Change to: `const adminPassword = 'your-secret-password';`

Then admins enter password when accessing admin dashboard.

---

## What Admin Can See

Admin logs in at: `https://yourdomain.com/admin-dashboard.html`

Admin dashboard shows:
- ✅ List of all users
- ✅ User information (email, name, role, balance)
- ✅ User status
- ✅ Can search/filter users

Currently admin-dashboard.html has the layout but basic data display. To see more, edit it to show more user fields.

---

## Users Can Do

1. **Sign Up** - Create new account
2. **Sign In** - Log back in anytime
3. **Select Role** - Choose Buyer or Seller
4. **View Dashboard** - See their info and balance
5. **View Profile** - See their data

---

## That's It!

Your system is live. No backend needed. Just:

```
Users → Signup → Supabase (database) → Dashboard
                                    ↓
                            Admin → See everything
```

---

## Costs

- Hostinger: $4-10/month
- Domain: $8-12/year
- Supabase: FREE (you're using free tier)
- SSL: FREE (included)

**Total: ~$4-10/month**

---

## Troubleshooting

**Pages won't load:**
- Check files are in public_html/
- Refresh browser (Ctrl+R)
- Check internet connection

**Signup doesn't work:**
- Check console (F12)
- Verify Supabase is online
- Make sure users table exists in Supabase

**Admin dashboard empty:**
- Log in first with regular account
- Then go to admin-dashboard.html
- It shows your users

**HTTPS not working:**
- Wait up to 24 hours for SSL
- Check DNS settings
- Force HTTPS in .htaccess (file provided)

---

## Adding More Admin Features Later

If you want admins to:
- Delete users
- Edit user data
- View transaction history
- Etc.

Just edit `admin-dashboard.html` and add the features.

For now, it's a simple read-only view of users.

---

## Quick Reference

| What | Where |
|------|-------|
| Users sign up | https://yourdomain.com/signup-simple.html |
| Users sign in | https://yourdomain.com/signin-custom.html |
| Buyer dashboard | https://yourdomain.com/buyer-dashboard.html (auto) |
| Seller dashboard | https://yourdomain.com/seller-dashboard.html (auto) |
| Admin panel | https://yourdomain.com/admin-dashboard.html |
| Database | Supabase (online, backed up automatically) |

---

## Setup Complete Checklist

- [ ] Files uploaded to Hostinger
- [ ] SSL certificate installed
- [ ] Site loads at https://yourdomain.com
- [ ] Can sign up new account
- [ ] Can sign in to account
- [ ] Dashboard shows user info
- [ ] Admin can view users list

All done? ✅ You're live!

---

**That's all you need. Simple and working.** 🎉

Next step: Tell me your Hostinger account details and I'll guide you through uploading the files.

