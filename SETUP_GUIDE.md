# DigiPehchan Project Setup Guide

This is a full-stack project with a Next.js frontend and Node.js/Express backend.

## 📋 Prerequisites

Before running this project, make sure you have installed:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **pnpm** (for frontend) - Install globally: `npm install -g pnpm`
3. **MongoDB** - Either local installation or MongoDB Atlas connection string
4. **npm** (for backend) - Comes with Node.js

## 🚀 Quick Start

### Step 1: Install Dependencies

#### Backend (Server)
```bash
cd digipechan--backend/server
npm install
```

#### Frontend (Client)
```bash
cd digipechan--backend/client
pnpm install
```

### Step 2: Environment Variables Setup

#### Backend Environment Variables

Create a `.env` file in `digipechan--backend/server/` with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_DATABASE_NAME=your_database_name
MONGODB_DATABASE_URL=mongodb://localhost:27017/your_database_name
# OR for MongoDB Atlas:
# MONGODB_DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name
DB_MAX_RETRIES=3

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Frontend URLs
FRONTEND_URL=http://localhost:3000
FRONTEND_BASE_URL_DEV=http://localhost:3000
FRONTEND_BASE_URL_PROD_VERCEL=https://your-vercel-url.vercel.app
FRONTEND_BASE_URL_PROD_DOMAIN=https://yourdomain.com
FRONTEND_SIGNUP_URL=http://localhost:3000/auth/sign-up

# Backend URLs
BACKEND_BASE_URL=http://localhost:5000
BACKEND_PROD_URL=https://your-backend-url.com

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

#### Frontend Environment Variables

Create a `.env.local` file in `digipechan--backend/client/` (if needed):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 3: Build the Backend (Optional for Development)

For development, you can skip this step as `npm run dev` uses `tsx` directly. For production:

```bash
cd digipechan--backend/server
npm run build
```

### Step 4: Run the Project

#### Terminal 1 - Start Backend Server
```bash
cd digipechan--backend/server
npm run dev
```

The backend will run on `http://localhost:5000` (or the PORT you specified in .env)

#### Terminal 2 - Start Frontend Client
```bash
cd digipechan--backend/client
pnpm dev
```

The frontend will run on `http://localhost:3000`

## 📝 Important Notes

1. **MongoDB**: Make sure MongoDB is running locally or you have a valid MongoDB Atlas connection string.

2. **Firebase**: The server uses Firebase Admin SDK. Make sure `serviceAccountKey.json` is present in the `server/` directory if you're using Firebase features.

3. **Environment Variables**: Some services (like Cloudinary, Twilio, PhonePe) require actual API keys. For development, you may need to:
   - Sign up for these services
   - Get API keys
   - Add them to your `.env` file

4. **Package Managers**: 
   - Backend uses **npm**
   - Frontend uses **pnpm** (make sure it's installed)

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Make sure you've run `npm install` in the server directory and `pnpm install` in the client directory.

### Issue: MongoDB connection errors
**Solution**: 
- Check if MongoDB is running: `mongod` (for local MongoDB)
- Verify your `MONGODB_DATABASE_URL` in the `.env` file
- Check network connectivity if using MongoDB Atlas

### Issue: Port already in use
**Solution**: 
- Change the `PORT` in your `.env` file
- Or stop the process using that port

### Issue: pnpm command not found
**Solution**: Install pnpm globally:
```bash
npm install -g pnpm
```

## 📚 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run format` - Format code with Prettier

### Frontend Scripts
- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🔐 Security Note

Never commit your `.env` files to version control. They are already in `.gitignore`.

