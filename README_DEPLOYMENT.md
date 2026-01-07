# 📦 DigiPehchan Deployment Setup

This directory contains all the necessary files and documentation for deploying the DigiPehchan project.

## 📁 Files Created for Deployment

### Configuration Files

1. **`server/render.yaml`** - Render deployment configuration
2. **`server/scripts/copy-assets.js`** - Cross-platform asset copying script
3. **`client/vercel.json`** - Vercel deployment configuration

### Documentation

1. **`DEPLOYMENT_GUIDE.md`** - Comprehensive deployment guide with step-by-step instructions
2. **`DEPLOYMENT_QUICK_START.md`** - Quick reference for fast deployment
3. **`server/env.production.template`** - Backend environment variables template
4. **`client/env.production.template`** - Frontend environment variables template

## 🚀 Quick Deployment Steps

### 1. Backend (Render)

```bash
# 1. Push code to GitHub
git add .
git commit -m "Prepare for deployment"
git push

# 2. Go to Render Dashboard
# 3. Create new Web Service
# 4. Configure:
#    - Root Directory: digipechan--backend/server
#    - Build Command: npm install && npm run build
#    - Start Command: npm start
# 5. Add environment variables (see server/env.production.template)
# 6. Deploy
```

### 2. Frontend (Vercel)

```bash
# 1. Go to Vercel Dashboard
# 2. Import GitHub repository
# 3. Configure:
#    - Root Directory: digipechan--backend/client
#    - Framework: Next.js
#    - Build Command: pnpm build
# 4. Add environment variables:
#    - NEXT_PUBLIC_BACKEND_BASE_URL=https://your-backend.onrender.com
# 5. Deploy
```

### 3. Update Backend CORS

After frontend deployment, update backend environment variables:
- `FRONTEND_BASE_URL_PROD_VERCEL` = Your Vercel URL
- Redeploy backend

## 📝 Important Notes

### Backend Changes Made

1. **Fixed build script**: Updated `copy-assets` script to use cross-platform Node.js instead of Unix `cp` command
2. **Created Render config**: Added `render.yaml` for Render deployment
3. **Cross-platform compatibility**: Build script now works on Windows, macOS, and Linux

### Frontend Changes Made

1. **Created Vercel config**: Added `vercel.json` for Vercel deployment
2. **Environment variables**: Uses `NEXT_PUBLIC_BACKEND_BASE_URL` for API calls

## 🔗 Deployment URLs

After deployment, you'll have:
- **Backend**: `https://your-service-name.onrender.com`
- **Frontend**: `https://your-project-name.vercel.app`

## 📚 Documentation

- **Full Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Quick Start**: See [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)
- **Setup Guide**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for local development

## ✅ Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] All environment variables ready
- [ ] MongoDB Atlas database configured
- [ ] API keys obtained (Cloudinary, Twilio, PhonePe, etc.)
- [ ] Firebase service account key ready (if using Firebase)
- [ ] Tested build locally (`npm run build` in server, `pnpm build` in client)

## 🆘 Troubleshooting

See the [Troubleshooting section](./DEPLOYMENT_GUIDE.md#troubleshooting) in the full deployment guide.

## 📞 Support

If you encounter issues:
1. Check service logs in Render/Vercel dashboards
2. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) troubleshooting section
3. Verify all environment variables are set correctly
4. Test API endpoints directly

---

**Happy Deploying! 🎉**

