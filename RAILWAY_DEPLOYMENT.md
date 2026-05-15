# Deploy Backend to Railway

**Quick guide to deploy Express.js backend to Railway**

## Prerequisites

- GitHub account
- Backend code pushed to GitHub
- Railway account (https://railway.app)
- Supabase credentials

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Start New Project"
3. Select "Deploy from GitHub"
4. Authorize Railway to access your GitHub

## Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub"
3. Find your repository: `trustbridge-escrow`
4. Click "Import"
5. Wait for Railway to detect the project

## Step 3: Configure Environment Variables

1. Click on your project
2. Go to **Variables** section
3. Add the following variables:

```
SUPABASE_URL = https://wdhvrghpmypjthpkfffb.supabase.co
SUPABASE_KEY = (your supabase key)
NODE_ENV = production
PORT = 3000
```

## Step 4: Deploy

1. Railway auto-deploys from GitHub
2. Wait for deployment to complete
3. You'll get a Railway URL like: `https://legacyhold-backend-railway.up.railway.app`
4. This is your backend API URL

## Step 5: Update Frontend

In your HTML files, update the API calls to use Railway URL:

```javascript
const API_URL = 'https://legacyhold-backend-railway.up.railway.app';

// Example:
fetch(`${API_URL}/api/balance/${userId}`)
```

## Step 6: Test API

Test your API endpoints:

```bash
# Health check
curl https://legacyhold-backend-railway.up.railway.app/health

# Get balance
curl https://legacyhold-backend-railway.up.railway.app/api/balance/user_123
```

## Troubleshooting

**Deployment fails:**
- Check package.json is in root of backend folder
- Verify start script: `npm start`
- Check Node version >= 18

**Port error:**
- Railway assigns port automatically
- Don't hardcode port 3000
- Use `process.env.PORT`

**Supabase connection fails:**
- Verify credentials are correct
- Check Supabase project is online
- Test credentials in local environment first

**CORS errors:**
- Update FRONTEND_URL in variables
- Configure CORS in server.js
- Allow all origins temporarily for testing
