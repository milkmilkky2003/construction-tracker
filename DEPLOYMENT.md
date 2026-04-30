# BuildTrack Pro - Deployment Guide

## Prerequisites

- GitHub repository (already created)
- Render account (https://render.com)
- Supabase account (https://supabase.com) for database
- Environment variables ready

## Step 1: Set Up Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Get your database connection string (PostgreSQL or MySQL)
3. Run the SQL migration script to create tables:
   - Navigate to the SQL Editor in Supabase
   - Copy the SQL from `drizzle/migrations/` directory
   - Execute the migration

## Step 2: Deploy on Render

### Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (`construction-tracker`)
4. Fill in the service details:
   - **Name**: `construction-tracker` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Plan**: Choose based on your needs (Free tier available)

### Set Environment Variables

In the Render dashboard, add the following environment variables:

```
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=generate-a-random-secret-key
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key
VITE_APP_TITLE=BuildTrack Pro
VITE_APP_LOGO=https://your-logo-url.png
```

### Deploy

1. Click "Create Web Service"
2. Render will automatically deploy from your GitHub repository
3. Wait for the deployment to complete (usually 5-10 minutes)
4. Your app will be available at `https://your-service-name.onrender.com`

## Step 3: Database Schema Setup

After deployment, you need to set up the database schema:

### Option A: Using Supabase SQL Editor

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration SQL from the `drizzle/` directory
3. The schema includes:
   - `users` table (from template)
   - `projects` table (project management)
   - `project_updates` table (construction updates)
   - `update_images` table (photos)

### Option B: Using Drizzle Kit

If you have local access:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Step 4: Configure Custom Domain (Optional)

1. In Render dashboard, go to your service settings
2. Under "Custom Domain", add your domain
3. Update DNS records according to Render's instructions

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check that Supabase IP whitelist includes Render's IP ranges
- Ensure all required tables are created

### OAuth Not Working

- Verify `VITE_APP_ID` and `OAUTH_SERVER_URL` are correct
- Check that redirect URLs are configured in your OAuth provider
- Ensure cookies are enabled in browser

### File Upload Issues

- Check that storage bucket is properly configured
- Verify API keys have correct permissions
- Ensure file size limits are appropriate

## Monitoring

- Use Render's built-in logs to monitor your application
- Check Supabase dashboard for database performance
- Monitor API usage and rate limits

## Scaling

As your application grows:

1. Upgrade Render plan for more resources
2. Consider read replicas for Supabase database
3. Implement caching strategies
4. Monitor and optimize database queries

## Security Checklist

- [ ] All environment variables are set
- [ ] Database credentials are secure
- [ ] OAuth is properly configured
- [ ] HTTPS is enabled
- [ ] Database backups are configured
- [ ] API rate limiting is in place
- [ ] File upload validation is enabled

## Support

For issues or questions:
- Render Support: https://render.com/support
- Supabase Documentation: https://supabase.com/docs
- GitHub Issues: Create an issue in your repository
