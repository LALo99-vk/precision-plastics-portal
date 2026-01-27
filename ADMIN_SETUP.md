# Admin Panel Setup Guide

## Prerequisites

1. Install Supabase client:
```bash
npm install @supabase/supabase-js
```

2. Create a Supabase account at https://supabase.com

## Step 1: Set Up Supabase Project

1. Go to https://app.supabase.com and create a new project
2. Wait for the project to be fully initialized
3. Go to **Settings** > **API** to get your credentials:
   - Project URL
   - Anon/Public Key

## Step 2: Create Database Tables

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-setup.sql`
3. Click **Run** to create all tables and policies

## Step 3: Set Up Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **Create Bucket**
3. Name: `product-images`
4. Make it **Public** (or set up proper access policies)
5. Click **Create**

## Step 4: Configure Environment Variables

1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Add your Supabase credentials:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_ADMIN_PASSWORD=your_admin_password_here
```

## Step 5: Access Admin Panel

1. Start your development server: `npm run dev`
2. Navigate to `/admin/login`
3. Enter your admin password (set in `.env` file)
4. You'll be redirected to the admin dashboard

## Admin Panel Features

### Product Management (`/admin`)
- View all products
- Add new products
- Edit existing products
- Delete products
- Upload product images (stored in Supabase Storage)

### Material Management (`/admin/materials`)
- View all materials organized by tier
- Add new materials
- Edit existing materials
- Delete materials

## Security Notes

- The current setup uses simple password authentication
- For production, consider implementing:
  - Supabase Auth with email/password
  - Role-based access control (RBAC)
  - Row Level Security (RLS) policies for admin operations

## Troubleshooting

### Images not uploading?
- Check that the `product-images` bucket exists in Supabase Storage
- Verify the bucket is set to Public or has proper access policies
- Check browser console for errors

### Database errors?
- Ensure all SQL from `supabase-setup.sql` has been executed
- Check that tables exist in Supabase Dashboard > Table Editor
- Verify RLS policies are set correctly

### Can't access admin panel?
- Check that `.env` file exists and has correct values
- Verify `VITE_ADMIN_PASSWORD` matches what you're entering
- Check browser console for errors
