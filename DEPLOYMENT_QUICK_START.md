# 🚀 Quick Start Deployment Guide

This is a condensed version of the full deployment guide. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## ⚡ Quick Steps

### Backend on Render (5 minutes)

1. **Go to Render Dashboard** → New Web Service
2. **Connect GitHub** repository
3. **Configure**:
   - Root Directory: `digipechan--backend/server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. **Add Environment Variables** (see `.env.production.example`)
5. **Deploy** → Copy your backend URL

### Frontend on Vercel (3 minutes)

1. **Go to Vercel Dashboard** → Add New Project
2. **Import GitHub** repository
3. **Configure**:
   - Root Directory: `digipechan--backend/client`
   - Framework: Next.js (auto-detected)
   - Build Command: `pnpm build`
4. **Add Environment Variables**:
   - `NEXT_PUBLIC_BACKEND_BASE_URL` = Your Render backend URL
5. **Deploy** → Copy your frontend URL

### Update Backend CORS

1. Go to Render → Your Backend → Environment
2. Update `FRONTEND_BASE_URL_PROD_VERCEL` with Vercel URL
3. Redeploy backend

## ✅ Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] All environment variables set
- [ ] Backend CORS updated with frontend URL
- [ ] Test API connection from frontend
- [ ] Test authentication flow

## 🔗 Important URLs

After deployment, update these in your backend env vars:
- `FRONTEND_BASE_URL_PROD_VERCEL` = Your Vercel URL
- `BACKEND_PROD_URL` = Your Render URL

## 🆘 Need Help?

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed troubleshooting.

