# Production Deployment Guide

This guide will help you deploy Palette Crowdfunding to production with your domain `palette-crowdfunding.com`.

## Prerequisites

1. **Supabase Project**: You'll need a production Supabase project
2. **Vercel Account**: For hosting the Next.js application
3. **Domain Access**: Access to your Squarespace domain settings

## Step 1: Set Up Supabase Database

1. **Create a new Supabase project** for production
2. **Run the database schema** from `supabase-schema.sql` in your Supabase SQL editor
3. **Note down your project URL and anon key** from the Supabase dashboard

## Step 2: Deploy to Vercel

1. **Connect Repository**: 
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `palette-crowdfunding` project

2. **Configure Environment Variables**:
   Add these in your Vercel project settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```

3. **Deploy**: Click "Deploy" and wait for the build to complete

## Step 3: Configure Custom Domain

1. **In Vercel**:
   - Go to your project settings
   - Navigate to "Domains"
   - Add `palette-crowdfunding.com`
   - Add `www.palette-crowdfunding.com` (optional)

2. **In Squarespace**:
   - Go to your domain management
   - Update DNS settings to point to Vercel:
     - Add CNAME record: `www` → `cname.vercel-dns.com`
     - Add A records for apex domain:
       - `76.76.19.61`
       - `76.76.21.21`

## Step 4: Verify Production Setup

1. **Test Authentication**: Try signing up and signing in
2. **Test Wallet Connection**: Connect a Solana wallet
3. **Test Campaign Creation**: Create a test artist profile and campaign
4. **Test Database**: Verify data is being stored in Supabase

## Step 5: Optional Enhancements

### Premium Solana RPC (Recommended)
For better performance, consider using a premium RPC provider:

**Alchemy**:
```
NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/your-api-key
```

**Helius**:
```
NEXT_PUBLIC_SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=your-api-key
```

### Image Upload (Future Enhancement)
Currently, image uploads are disabled. To enable:
1. Set up Supabase Storage bucket
2. Configure upload policies
3. Update the upload logic in profile setup and campaign creation

## Security Checklist

- [ ] Environment variables are properly set
- [ ] Supabase RLS policies are enabled
- [ ] Database is using production settings
- [ ] Solana network is set to mainnet-beta
- [ ] Domain is properly configured with SSL

## Monitoring

1. **Vercel Analytics**: Enable in project settings for traffic monitoring
2. **Supabase Dashboard**: Monitor database usage and API calls
3. **Error Tracking**: Consider adding Sentry for error monitoring

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify environment variables are correct
4. Test wallet connection on mainnet

---

**Note**: This application is ready for production use with real users and real blockchain transactions. Make sure to test thoroughly before announcing the launch.
