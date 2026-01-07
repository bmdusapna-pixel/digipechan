# 🚀 DigiPehchan Deployment Guide

Complete guide to deploy DigiPehchan backend on Render and frontend on Vercel.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment on Render](#backend-deployment-on-render)
3. [Frontend Deployment on Vercel](#frontend-deployment-on-vercel)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Post-Deployment Checklist](#post-deployment-checklist)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with your code pushed to a repository
- ✅ Render account (sign up at [render.com](https://render.com))
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ MongoDB Atlas account (or MongoDB database URL)
- ✅ All API keys and secrets ready (Cloudinary, Twilio, PhonePe, etc.)

---

## Backend Deployment on Render

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub
2. Ensure `render.yaml` is in the `digipechan--backend/server/` directory
3. Verify your `package.json` has correct build and start scripts

### Step 2: Create a New Web Service on Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing your code

### Step 3: Configure the Service

**Basic Settings:**
- **Name**: `digipechan-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your production branch)
- **Root Directory**: `digipechan--backend/server`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Instance Type**: Free tier is fine for testing, upgrade for production
- **Auto-Deploy**: Enable to auto-deploy on push to main branch

### Step 4: Add Environment Variables

In Render dashboard, go to **Environment** tab and add all these variables:

```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Database
MONGODB_DATABASE_NAME=your_database_name
MONGODB_DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name
DB_MAX_RETRIES=3

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Frontend URLs (Update with your Vercel URL after frontend deployment)
FRONTEND_URL=https://your-frontend.vercel.app
FRONTEND_BASE_URL_DEV=http://localhost:3000
FRONTEND_BASE_URL_PROD_VERCEL=https://your-frontend.vercel.app
FRONTEND_BASE_URL_PROD_DOMAIN=https://yourdomain.com
FRONTEND_SIGNUP_URL=https://your-frontend.vercel.app/auth/sign-up

# Backend URLs (Update after Render deployment)
BACKEND_BASE_URL=https://your-backend.onrender.com
BACKEND_PROD_URL=https://your-backend.onrender.com

# Email Configuration (Nodemailer)
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_SENDER_ADDRESS=your-email@gmail.com
NODEMAILER_GMAIL_APP_PASSWORD=your_app_password
SEND_EMAIL_RETRIES=3
OTP_EXPIRY_MINUTES=10

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# PhonePe Payment Gateway
PHONEPE_SALT_INDEX=your_salt_index
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_MERCHANT_ID=your_merchant_id

# EKQR API
EQR_API_KEY=your_ekqr_api_key

# Hash ID
HASH_ID_SECRET_SALT=your_hash_salt

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# RTO API
RTOAPI=https://your-rto-api-url.com
RTO_TOKEN=your_rto_token

# Sales Squared API
salessquared_api_key=your_sales_squared_key

# Cloud Phone
CLOUD_PHONE=your_cloud_phone_number

# Agora (Video Calling)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERT=your_agora_app_certificate
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying your service
3. Wait for deployment to complete (usually 5-10 minutes)
4. Your backend URL will be: `https://your-service-name.onrender.com`

### Step 6: Important Notes for Render

- **Free Tier Limitations**: 
  - Services spin down after 15 minutes of inactivity
  - First request after spin-down may take 30-60 seconds
  - Consider upgrading to paid plan for production

- **Firebase Service Account**: 
  - Upload `serviceAccountKey.json` as a secret file in Render
  - Or use environment variables for Firebase config

- **Static Files**: 
  - Ensure `copy-assets` script works (updated for cross-platform compatibility)

---

## Frontend Deployment on Vercel

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub
2. Verify `next.config.ts` is properly configured
3. Check that environment variables are set up correctly

### Step 2: Import Project to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the repository

### Step 3: Configure Project Settings

**Framework Preset:**
- **Framework Preset**: Next.js (auto-detected)

**Root Directory:**
- **Root Directory**: `digipechan--backend/client`

**Build and Output Settings:**
- **Build Command**: `pnpm build` (or `npm run build` if using npm)
- **Output Directory**: `.next` (default for Next.js)
- **Install Command**: `pnpm install` (or `npm install`)

### Step 4: Add Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```env
# Backend API URL (Update with your Render backend URL)
NEXT_PUBLIC_BACKEND_BASE_URL=https://your-backend.onrender.com

# Agora App ID (if using video calling)
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
```

**Important**: 
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Add these for all environments: Production, Preview, and Development

### Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. Wait for deployment to complete (usually 2-5 minutes)
4. Your frontend URL will be: `https://your-project-name.vercel.app`

### Step 6: Update Backend CORS Settings

After getting your Vercel URL, update the backend environment variables in Render:

1. Go to Render dashboard → Your backend service → Environment
2. Update `FRONTEND_BASE_URL_PROD_VERCEL` with your Vercel URL
3. Update `FRONTEND_URL` with your Vercel URL
4. Redeploy the backend service

---

## Environment Variables Setup

### Backend Environment Variables (Render)

All variables listed in Step 4 of Backend Deployment section above.

**Critical Variables:**
- `MONGODB_DATABASE_URL` - Your MongoDB connection string
- `JWT_SECRET` - Strong random string for JWT signing
- `FRONTEND_BASE_URL_PROD_VERCEL` - Your Vercel frontend URL
- `BACKEND_PROD_URL` - Your Render backend URL

### Frontend Environment Variables (Vercel)

**Required:**
- `NEXT_PUBLIC_BACKEND_BASE_URL` - Your Render backend URL

**Optional:**
- `NEXT_PUBLIC_AGORA_APP_ID` - If using Agora video calling

---

## Post-Deployment Checklist

### Backend (Render)

- [ ] Backend service is running and accessible
- [ ] Health check endpoint (`/`) returns success
- [ ] Database connection is working
- [ ] CORS is configured correctly with frontend URL
- [ ] All API endpoints are responding
- [ ] Environment variables are set correctly
- [ ] Firebase service account key is uploaded (if using Firebase)

### Frontend (Vercel)

- [ ] Frontend is deployed and accessible
- [ ] API calls are pointing to correct backend URL
- [ ] Authentication flow works
- [ ] All pages load correctly
- [ ] Images and assets load properly
- [ ] Environment variables are set for all environments

### Integration

- [ ] Frontend can communicate with backend
- [ ] CORS errors are resolved
- [ ] Authentication tokens are working
- [ ] API requests are successful
- [ ] Payment gateway integration works (if applicable)

---

## Troubleshooting

### Backend Issues

**Issue: Build fails on Render**
- **Solution**: Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check if `copy-assets` script works (may need cross-platform fix)

**Issue: Service keeps crashing**
- **Solution**: 
  - Check logs in Render dashboard
  - Verify all environment variables are set
  - Ensure MongoDB connection string is correct
  - Check if PORT is set correctly (Render uses PORT env var)

**Issue: CORS errors**
- **Solution**: 
  - Update `FRONTEND_BASE_URL_PROD_VERCEL` in backend env vars
  - Ensure frontend URL is in `allowedOrigins` array in `index.ts`
  - Redeploy backend after updating CORS settings

**Issue: Database connection fails**
- **Solution**: 
  - Verify MongoDB Atlas IP whitelist includes Render IPs (0.0.0.0/0 for all)
  - Check MongoDB connection string format
  - Ensure database user has correct permissions

### Frontend Issues

**Issue: Build fails on Vercel**
- **Solution**: 
  - Check build logs in Vercel dashboard
  - Ensure `pnpm` is available (Vercel auto-detects package manager)
  - Verify all dependencies are in `package.json`
  - Check TypeScript errors

**Issue: API calls fail**
- **Solution**: 
  - Verify `NEXT_PUBLIC_BACKEND_BASE_URL` is set correctly
  - Check backend CORS settings
  - Ensure backend is running and accessible
  - Check browser console for errors

**Issue: Environment variables not working**
- **Solution**: 
  - Variables must start with `NEXT_PUBLIC_` to be accessible in browser
  - Redeploy after adding new environment variables
  - Check if variables are set for correct environment (Production/Preview/Development)

### General Issues

**Issue: Services not communicating**
- **Solution**: 
  - Verify URLs are correct (no trailing slashes)
  - Check HTTPS vs HTTP (use HTTPS for production)
  - Verify CORS configuration
  - Check network tab in browser DevTools

**Issue: Slow first request (Render free tier)**
- **Solution**: 
  - This is normal for free tier (cold start)
  - Consider upgrading to paid plan
  - Use a health check service to keep service warm

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)

---

## Support

If you encounter issues not covered in this guide:

1. Check service logs in Render/Vercel dashboards
2. Review error messages carefully
3. Verify all environment variables are correct
4. Test API endpoints directly using Postman or curl
5. Check browser console for frontend errors

---

**Last Updated**: 2024
**Project**: DigiPehchan
**Backend**: Render
**Frontend**: Vercel

