# 🚀 MongoDB Setup Guide

## Step 1: Create MongoDB Atlas Account

1. **Go to**: https://www.mongodb.com/atlas
2. **Click "Try Free"**
3. **Create account** with your email
4. **Verify email** and login

## Step 2: Create Database Cluster

1. **Choose "Build a Database"**
2. **Select "M0 Sandbox"** (Free tier)
3. **Choose AWS** as provider
4. **Select region** closest to you
5. **Cluster Name**: `healthcare-cluster`
6. **Click "Create"**

## Step 3: Create Database User

1. **Go to "Database Access"** in left sidebar
2. **Click "Add New Database User"**
3. **Username**: `healthcare-user`
4. **Password**: Generate secure password (save it!)
5. **Database User Privileges**: Read and write to any database
6. **Click "Add User"**

## Step 4: Configure Network Access

1. **Go to "Network Access"** in left sidebar
2. **Click "Add IP Address"**
3. **Click "Allow Access from Anywhere"** (for development)
4. **Click "Confirm"**

## Step 5: Get Connection String

1. **Go to "Database"** in left sidebar
2. **Click "Connect"** on your cluster
3. **Choose "Connect your application"**
4. **Copy the connection string**
5. **Replace `<password>` with your actual password**

## Step 6: Update Environment Variables

Update your `.env.local` file:

```env
# MongoDB configuration
MONGODB_URI=mongodb+srv://healthcare-user:YOUR_PASSWORD@healthcare-cluster.xxxxx.mongodb.net/healthcare?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long-and-random
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=another-super-secret-key-for-jwt-tokens
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Step 7: Install Dependencies

```bash
npm install
```

## Step 8: Initialize Database

The app will automatically create sample doctors when you first run it.

## Step 9: Test the Application

1. **Start the app**: `npm run dev`
2. **Go to**: `http://localhost:3000`
3. **Sign up** with any email/password
4. **Login** and test features

## ✅ Expected Results

- ✅ **Signup works immediately** (no email verification)
- ✅ **Login redirects to dashboard**
- ✅ **Patient can book appointments**
- ✅ **Doctor can manage appointments**
- ✅ **All data stored in MongoDB**

## 🔧 Troubleshooting

### Connection Issues:
- Check your MongoDB connection string
- Verify network access allows your IP
- Ensure database user has correct permissions

### Authentication Issues:
- Clear browser cookies
- Check JWT_SECRET is set
- Verify API routes are working

### Sample Data:
- Doctors are created automatically on first run
- Check MongoDB Atlas dashboard to see data

This setup gives you a fully working application with MongoDB backend!