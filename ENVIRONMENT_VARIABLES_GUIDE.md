# Environment Variables Setup for Netlify

## Required Environment Variables

Add these in Netlify Dashboard → Site Settings → Environment Variables:

### 1. Database Configuration
```
MONGODB_URI=mongodb+srv://aravindhalkachenu:Satya%409100@starnovacluster.gwo0dow.mongodb.net/?appName=StarNovaCluster
```

### 2. Authentication Secrets
```
NEXTAUTH_SECRET=IT33HrMFtmUmX6WTsPQWptqi1dk0IdpoGuJDXpqEB1MrEo/WT1NoPgKhUCU=
JWT_SECRET=76254ac4453e939acccfff1445e6a593
```

### 3. URL Configuration
```
NEXTAUTH_URL=https://your-site-name.netlify.app
NEXT_PUBLIC_API_URL=https://your-site-name.netlify.app
```

**Important:** Replace `your-site-name` with your actual Netlify site name.

## How to Add Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Enter the key (e.g., `MONGODB_URI`) and value
5. Click **Save**
6. Repeat for all variables above

## Security Notes

- Never commit these values to your repository
- The values above are from your local `.env.local` file
- Make sure your MongoDB cluster allows connections from anywhere (0.0.0.0/0) for Netlify builds
- Consider rotating secrets periodically

## Verification

After adding all variables:
1. Go to **Deploys** → **Trigger deploy** → **Deploy site**
2. Check the build log to ensure no "Missing environment variable" errors
3. Test your deployed site functionality

## Troubleshooting

If you see "Invalid/Missing environment variable" errors:
1. Double-check all variable names are spelled correctly
2. Ensure no extra spaces in variable names or values
3. Verify your MongoDB URI is accessible from external networks
4. Check that all required variables are added in Netlify dashboard