# LegacyHold Platform - Hostinger Deployment Guide

**Complete guide to deploy LegacyHold to production on Hostinger**

---

## 📋 Pre-Deployment Checklist

- [ ] Hostinger account created
- [ ] Domain name purchased/registered
- [ ] Supabase database is live and tested
- [ ] All frontend files are ready
- [ ] Backend prepared (if needed)
- [ ] SSL certificate obtained (Hostinger provides free)

---

## 🏗️ Architecture for Production

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR DOMAIN                          │
│                  (Hostinger Hosting)                    │
│            Frontend: HTML/CSS/JavaScript                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │   Supabase Cloud     │
        │   (Database/Auth)    │
        │   PostgreSQL         │
        └──────────────────────┘
                   │
                   ├──→ Optional: Backend API (Rails/Render)
                   │
                   └──→ Optional: File Storage
```

---

## 📦 Option 1: Frontend-Only (Quick Start)

**Best for:** Testing the complete flow without backend

### What You Get
- ✅ User signup/signin
- ✅ Role selection
- ✅ Dashboards
- ✅ Balance display
- ❌ Deposits (screenshots only, manual)
- ❌ Admin approval system
- ❌ Automated transactions

### Time to Deploy: 15 minutes

**Steps:**
1. Upload frontend files to Hostinger
2. Update Supabase credentials (if needed)
3. Test on your domain
4. Add backend later when ready

---

## 🚀 Option 2: Frontend + Backend (Full Stack)

**Best for:** Complete, production-ready system

### What You Get
- ✅ Everything from Option 1
- ✅ Automated deposit processing
- ✅ Admin approval workflows
- ✅ Email notifications
- ✅ Payment verification
- ✅ Transaction management

### Time to Deploy: 1-2 hours

**Architecture:**
- Frontend: Hostinger (your domain)
- Backend: Railway or Render (free tier available)
- Database: Supabase (already set up)

---

## 📂 Production File Structure

Your Hostinger file structure should look like:

```
public_html/                          ← Your website root
├── index.html                        ← Landing page
├── setup.html                        ← Database setup
├── signup-simple.html                ← Signup
├── signin-custom.html                ← Signin
├── select-role.html                  ← Role selection
├── buyer-dashboard.html              ← Buyer dashboard
├── seller-dashboard.html             ← Seller dashboard
├── admin-dashboard.html              ← Admin dashboard
├── css/
│   └── style.css                     ← Styles
├── js/
│   └── config.js                     ← Production config
└── .htaccess                         ← URL rewriting (included)
```

---

## 🌐 Part 1: Deploy to Hostinger (Frontend)

### Step 1: Upload Files to Hostinger

**Method A: Using File Manager (Easiest)**

1. Log in to Hostinger
2. Go to **File Manager** or **Hosting**
3. Navigate to **public_html** folder
4. Delete existing files (if any)
5. Upload all files from `frontend/` folder:
   - index.html
   - setup.html
   - signup-simple.html
   - signin-custom.html
   - select-role.html
   - buyer-dashboard.html
   - seller-dashboard.html
   - admin-dashboard.html
   - css/ folder
   - js/ folder (if you have one)

**Method B: Using FTP (More Control)**

```bash
# Install FileZilla or WinSCP
# FTP Credentials from Hostinger:
# Host: ftp.yourdomain.com (or IP address)
# Username: your-username
# Password: your-password
# Port: 21

# Connect and upload frontend/ folder to public_html/
```

### Step 2: Update .htaccess for Proper URL Handling

Create a `.htaccess` file in `public_html/` with this content:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Remove .html extension from URLs
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^([^\.]+)$ $1.html [NC,L]
    
    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Allow CORS for Supabase
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

### Step 3: Test Frontend on Hostinger

1. Go to your domain: `https://yourdomain.com`
2. You should see the landing page
3. Click "Get Started" → Should go to signup
4. Try signing up with a test account
5. Check browser console (F12) for any errors

**Expected Results:**
- ✅ Pages load quickly
- ✅ Styling looks correct (dark theme + gold)
- ✅ Forms are responsive
- ✅ Sign up works
- ✅ No console errors

### Step 4: Fix Common Issues

**Problem: Pages show 404 or not found**
- Check files are in `public_html/`
- Verify file names match exactly (case-sensitive on some servers)

**Problem: Styling looks wrong**
- Check css/ folder is uploaded
- Verify CSS file paths are correct
- Hard refresh browser (Ctrl+Shift+R)

**Problem: Forms don't work**
- Check Supabase credentials are correct
- Verify Supabase project is accessible
- Check browser console (F12) for errors

---

## 🔧 Part 2: Deploy Backend (Optional but Recommended)

### Why You Need a Backend

**Frontend-Only Issues:**
- ❌ Admins can't approve deposits
- ❌ No email notifications
- ❌ No payment verification
- ❌ Database operations are slow
- ❌ Security vulnerabilities

**Backend Solutions:**
- ✅ Secure admin operations
- ✅ Email notifications
- ✅ Fast database queries
- ✅ File uploads handled safely
- ✅ Payment verification

### Option A: Railway (Recommended)

**Cost:** Free tier available (~$5/month when upgraded)  
**Setup Time:** 30 minutes

**Steps:**

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Connect your GitHub account
   - Select trustbridge-escrow repo

3. **Set Environment Variables**
   - Go to Variables section
   - Add:
     ```
     SUPABASE_URL=https://wdhvrghpmypjthpkfffb.supabase.co
     SUPABASE_KEY=<your-key>
     DATABASE_URL=<from-supabase>
     NODE_ENV=production
     PORT=3000
     ```

4. **Deploy**
   - Railway auto-deploys from GitHub
   - Get your Railway URL: `https://yourdomain-railway.app`

5. **Update Frontend**
   - Change API calls to point to Railway URL
   - Update Supabase credentials in frontend

### Option B: Render

**Cost:** Free tier available  
**Setup Time:** 30 minutes

**Steps:**
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Set environment variables
5. Deploy

---

## 🔐 Security Setup

### 1. Supabase Security

✅ **Already Configured:**
- Row-Level Security policies
- API key restrictions
- Database backups

⚠️ **Still Needed:**
- Environment variables (don't expose keys in code)
- IP whitelist (if on VPS)
- Regular backups

### 2. Hostinger SSL Certificate

**Hostinger provides FREE SSL:**

1. Log in to Hostinger
2. Go to **SSL Certificate** section
3. Click "Manage SSL"
4. Select "AutoSSL" or "Free SSL"
5. Click "Install"
6. Wait 5-15 minutes for activation

✅ **Your site will have:** `https://yourdomain.com` (with lock icon)

### 3. Password Security

**Update all passwords before launch:**
- [ ] Change admin password
- [ ] Update Supabase credentials
- [ ] Rotate API keys
- [ ] Enable 2FA on Supabase account

---

## 🧪 Production Testing Checklist

### Frontend Testing
- [ ] Landing page loads in < 2 seconds
- [ ] All links work correctly
- [ ] Styling displays properly on mobile
- [ ] No JavaScript errors in console
- [ ] HTTPS works (lock icon visible)

### Authentication Testing
- [ ] Can create new account
- [ ] Can sign in with existing account
- [ ] Can select buyer/seller role
- [ ] Session persists after refresh
- [ ] Can sign out properly

### Database Testing
- [ ] Supabase connection works
- [ ] Users table populated correctly
- [ ] Balance displays accurately
- [ ] No 404 or connection errors

### Security Testing
- [ ] HTTPS enforced (redirects HTTP → HTTPS)
- [ ] No sensitive data in URLs
- [ ] Credentials not exposed in console
- [ ] API keys not visible in frontend code

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Dashboard loads quickly
- [ ] Forms respond immediately
- [ ] No lag when clicking buttons

---

## 📊 Monitoring & Maintenance

### Set Up Monitoring

**Hostinger:**
- Monitor disk usage
- Monitor bandwidth
- Monitor uptime
- Set up email alerts

**Supabase:**
- Monitor database performance
- Monitor API usage
- Set up authentication logs
- Enable automatic backups

### Regular Backups

**Supabase:** Automatic daily backups
**Hostinger:** Manual backups recommended
- Use Hostinger's backup feature
- Download database dumps monthly
- Store in safe location

### Updates & Maintenance

**Weekly:**
- Check error logs
- Monitor performance
- Check database size

**Monthly:**
- Update documentation
- Review security logs
- Performance optimization
- Database maintenance

---

## 🚨 Deployment Troubleshooting

### Pages show "Unable to connect"
```
Solution:
1. Check Supabase is online (supabase.com)
2. Verify credentials in HTML files
3. Check firewall settings
4. Restart Hostinger hosting
```

### Forms don't submit
```
Solution:
1. Check browser console (F12)
2. Verify Supabase connection
3. Check database table exists
4. Verify row-level security policies
```

### Styling looks broken
```
Solution:
1. Hard refresh (Ctrl+Shift+R)
2. Check CSS file is uploaded
3. Verify CSS file paths
4. Clear browser cache
```

### Slow performance
```
Solution:
1. Check Hostinger resource usage
2. Optimize database queries
3. Enable caching
4. Minimize CSS/JS files
5. Consider upgrading hosting plan
```

### SSL certificate error
```
Solution:
1. Wait for AutoSSL to install (up to 24 hours)
2. Force HTTPS in .htaccess
3. Update all internal links to HTTPS
4. Clear CloudFlare cache (if using)
```

---

## 💰 Cost Estimation

| Component | Cost | Notes |
|-----------|------|-------|
| **Hostinger Hosting** | $4-15/mo | Shared hosting sufficient |
| **Domain Name** | $8-12/yo | Buy from Hostinger or elsewhere |
| **SSL Certificate** | FREE | Hostinger includes AutoSSL |
| **Supabase** | FREE-$25/mo | Free tier good for starting |
| **Backend (Optional)** | $0-7/mo | Railway/Render free tier |
| **Email Service** | $0-20/mo | SendGrid, Mailgun (optional) |
| **CDN (Optional)** | $0-20/mo | Cloudflare (optional) |
| **Total** | **$12-100/mo** | Depends on scale |

---

## 📞 Support & Resources

### Hostinger Help
- Knowledge Base: https://support.hostinger.com
- Control Panel: https://hpanel.hostinger.com
- Chat Support: Available 24/7

### Supabase Help
- Docs: https://supabase.com/docs
- Discord Community: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase

### Common Supabase Issues
```
"Table does not exist"
→ Run schema.sql in SQL Editor

"Permission denied"
→ Check RLS policies

"Connection refused"
→ Verify URL and API key

"Rate limited"
→ Check API limits in dashboard
```

---

## 🎯 Deployment Checklist

### Before Launch
- [ ] All files uploaded to Hostinger
- [ ] SSL certificate installed and active
- [ ] Supabase database tested
- [ ] Admin account created
- [ ] Test account created
- [ ] Signup/signin tested
- [ ] Dashboard loads correctly
- [ ] All links work
- [ ] No console errors
- [ ] Performance acceptable (< 3s page load)

### Launch Day
- [ ] Do final testing on live site
- [ ] Monitor error logs
- [ ] Be ready for support
- [ ] Have Supabase backup ready
- [ ] Monitor uptime

### Post-Launch
- [ ] Monitor performance daily
- [ ] Check error logs weekly
- [ ] Update documentation
- [ ] Plan backend deployment
- [ ] Gather user feedback

---

## 🚀 Next Steps After Deployment

1. **Monitor Performance** (Week 1)
   - Watch for errors
   - Check loading times
   - Monitor Supabase usage

2. **Gather Feedback** (Week 1-2)
   - Ask users for feedback
   - Note issues reported
   - Plan improvements

3. **Build Backend** (Week 2-4)
   - Deploy Express.js on Railway
   - Implement deposits
   - Add admin approval system

4. **Scale & Optimize** (Ongoing)
   - Monitor growth
   - Optimize database
   - Plan infrastructure upgrades

---

## 📚 Additional Resources

- **Hostinger Docs:** https://support.hostinger.com
- **Supabase Guide:** https://supabase.com/docs
- **Railway Docs:** https://docs.railway.app
- **Express.js Guide:** https://expressjs.com

---

**Your LegacyHold platform is ready for the world!** 🌍

Questions? Check the troubleshooting section or contact support.
