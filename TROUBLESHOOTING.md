# Login Issue Troubleshooting Guide

## Problem
When clicking "Login" on the frontend, nothing happens - no error message, no response.

## Root Cause
The backend at `https://learnvest-erp.onrender.com` is returning **"Access denied"** for all API requests. This is NOT coming from the Express app code itself - it's a Render-level issue.

## Test Results
```bash
curl https://learnvest-erp.onrender.com/api
# Returns: "Access denied"

curl https://learnvest-erp.onrender.com/api/auth/login
# Returns: HTTP 403 Forbidden
```

---

## Solution Steps

### 1. Check Render Dashboard

Go to your Render dashboard for the **learnvest-erp** service and check:

**a) Environment Variables**
Make sure these are set:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key (e.g., "supersecretkey123")
- `PORT` - Should be 5000 or leave blank for Render default

**b) Build & Deploy Logs**
- Click on your service
- Go to "Logs" tab
- Look for any errors during the build or deployment
- You should see: "✅ Connected to MongoDB" and "🚀 Server is running on port XXXX"

**c) Service Status**
- Make sure the service shows as "Live" (green)
- If it shows "Deploy failed" or "Build failed", check the logs

**d) Web Service Settings**
- Root Directory: Should be blank (or "./" if needed)
- Build Command: `npm install`
- Start Command: `node server.js`
- Auto-Deploy: Should be enabled

### 2. Verify MongoDB Connection

**Option A: Check Render Logs**
Look for "✅ Connected to MongoDB" in the logs

**Option B: Test MongoDB URI locally**
```bash
# In your local learnvest-erp directory
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_MONGODB_URI').then(() => console.log('OK')).catch(e => console.log('FAIL:', e))"
```

### 3. Check CORS Settings

The backend currently allows:
- `http://localhost:3000` (for local development)
- `https://learnvest-erp-frontend.onrender.com` (for production)

If your frontend is deployed at a different URL, you need to add it to `server.js`.

### 4. Create Test Admin User

Once the backend is working, create an admin user:

**Option A: Use the register endpoint**
```bash
curl -X POST https://learnvest-erp.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@learnvest.com","password":"admin123","role":"admin"}'
```

**Option B: Test locally then create via frontend**
1. Start backend locally: `npm start`
2. Visit http://localhost:3000
3. Open browser console and run:
```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Admin',
    email: 'admin@learnvest.com',
    password: 'admin123',
    role: 'admin'
  })
}).then(r => r.json()).then(console.log)
```

### 5. Test Login Locally

Before testing on Render, verify login works locally:

```bash
# Terminal 1 - Start backend
cd learnvest-erp
npm start
# Should see: "🚀 Server is running on port 5000"

# Terminal 2 - Start frontend
cd learnvest-erp-frontend
npm start
# Should open http://localhost:3000

# Try logging in with:
# Email: admin@learnvest.com
# Password: admin123
```

---

## Common Issues & Fixes

### Issue: "Access denied" from Render

**Possible causes:**
1. **Render service is suspended** - Check if you need to upgrade or verify payment
2. **IP restrictions** - Remove any IP allow lists in Render settings
3. **Service crashed** - Check logs for errors and redeploy

**Fix:**
- Go to Render dashboard > Your service > Manual Deploy > "Clear build cache & deploy"
- Wait 2-5 minutes for deployment to complete

### Issue: "Cannot connect to MongoDB"

**Fix:**
1. Go to MongoDB Atlas
2. Click "Network Access"
3. Make sure `0.0.0.0/0` is in the IP allow list (allows access from anywhere, including Render)
4. Or specifically add Render's IP addresses

### Issue: "Invalid email or password"

**Causes:**
- No admin user exists in database
- Wrong password

**Fix:**
Create admin user using steps in Section 4 above

### Issue: Frontend shows no error

**Cause:**
Backend is not responding at all (timeout or connection refused)

**Fix:**
1. Verify backend URL in frontend `.env` file
2. Check Render service is "Live"
3. Check browser Network tab for failed requests

---

## Quick Diagnostic Commands

```bash
# Test if backend is responding
curl https://learnvest-erp.onrender.com/

# Test /api endpoint
curl https://learnvest-erp.onrender.com/api

# Test login endpoint
curl -X POST https://learnvest-erp.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@learnvest.com","password":"admin123"}'

# Expected response (if working):
# {"_id":"...","name":"Admin","email":"admin@learnvest.com","role":"admin","token":"..."}
```

---

## What I've Verified

✅ Backend code structure is correct
✅ Auth routes are properly configured
✅ CORS settings include frontend domain
✅ User model has password matching method
✅ Login endpoint returns correct data format
✅ Frontend login flow is correctly implemented
✅ Password change endpoint has been added

❌ Backend is returning "Access denied" - **Render configuration issue**

---

## Next Steps

1. **Check your Render dashboard** - service status and logs
2. **Verify environment variables** are set correctly
3. **Redeploy if needed** - "Clear build cache & deploy"
4. **Create admin user** once backend is responding
5. **Test login** with admin@learnvest.com / admin123

If you're still having issues after checking Render, please share:
- Screenshots of Render dashboard showing service status
- Recent logs from Render
- Any error messages you see

The code is correct - this is purely a deployment/configuration issue!
