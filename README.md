# Palette - Crowdfunding for Creators

A Solana-based patronage platform where artists raise funding for specific projects by issuing custom tokens. Collectors invest by purchasing these tokens and receive perks defined by the artist.

## 🎨 Features

### Core Features
- **Artist Profile Creation**: Create public profiles with bio, fundraising goals, and custom SPL token configuration
- **Token Minting**: Automatically mint Solana SPL tokens tied to artist campaigns
- **Token Purchase Flow**: Allow collectors to buy tokens using SOL with wallet connection
- **Perk Tiers**: Artists define 1-3 reward tiers based on token ownership
- **Customizable Profiles**: Add catalogs, posts, and media uploads
- **Public Campaign Pages**: Beautiful `/artists/[slug]` pages with progress tracking
- **Collector Dashboard**: Track investments, token holdings, and eligible perks
- **Artist Dashboard**: View campaign stats, supporter lists, and export data

### Design Features
- **Premium UI**: MIT Media Lab meets Apple/Nike visual polish
- **Responsive Design**: Mobile-first layouts that work across all devices
- **Smooth Animations**: Framer Motion micro-interactions and transitions
- **Beautiful Typography**: Clean, modern type hierarchy
- **Dark Mode Ready**: Comprehensive CSS custom properties for theming

## 🛠 Tech Stack

- **Frontend**: Next.js 15 + TypeScript + TailwindCSS v4
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Blockchain**: Solana (SPL tokens)
- **Authentication**: Email/Password via Supabase Auth (wallet optional)
- **Animations**: Framer Motion
- **Hosting**: Vercel-ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Basic understanding of Solana development

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd palette-crowdfunding
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Solana Configuration  
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   ```

4. **Set up Supabase database**
   Run the SQL schema in your Supabase project:
   ```bash
   # Copy the contents of supabase-schema.sql and run in your Supabase SQL editor
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 📂 Project Structure

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── auth/              # Authentication pages
│   │   ├── signin/        # Sign in page
│   │   └── signup/        # Sign up page
│   ├── artists/           # Artist discovery and profiles
│   │   ├── [slug]/        # Dynamic artist profile pages
│   │   └── page.tsx       # Artists listing page
│   ├── create/            # Campaign creation wizard
│   ├── dashboard/         # Artist dashboard
│   ├── wallet/            # Collector dashboard
│   ├── success/           # Purchase confirmation
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles with CSS custom properties
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── progress.tsx
│   │   └── tabs.tsx
│   ├── navigation.tsx     # Main navigation component
│   └── providers.tsx      # Wallet & auth providers
├── contexts/              # React contexts
│   └── auth-context.tsx   # Authentication context
└── lib/                   # Utility libraries
    ├── auth.ts           # Authentication service
    ├── solana.ts         # Solana blockchain utilities
    ├── supabase.ts       # Supabase client and types
    └── utils.ts          # General utilities
```

## 🗄 Database Schema

The application uses a PostgreSQL database with the following tables:

- **artists**: Artist profiles, token configuration, and fundraising goals
- **perks**: Reward tiers based on token ownership
- **purchases**: Token purchase transactions
- **posts**: Artist updates and project logs
- **catalog_items**: Artist artwork catalogs

See `supabase-schema.sql` for the complete schema with indexes and RLS policies.

## 🔐 Authentication & Security

- **Email/Password Authentication**: Primary auth method via Supabase
- **Optional Wallet Connection**: Required only for token transactions
- **Row Level Security**: Comprehensive RLS policies on all tables
- **Protected Routes**: Client-side route protection for dashboards

## 🌐 Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with platform explanation |
| `/create` | Artist onboarding and token creation wizard |
| `/artists` | Browse all active campaigns |
| `/artists/[slug]` | Individual artist campaign page |
| `/dashboard` | Artist campaign management |
| `/wallet` | Collector token holdings and rewards |
| `/auth/signin` | Sign in page |
| `/auth/signup` | Account creation |
| `/success` | Purchase confirmation |

## 🎯 User Flows

### Artist Flow
1. Sign up with email/password
2. Create campaign with profile, token details, and perks
3. Share campaign URL to attract supporters
4. Monitor progress in dashboard
5. Export supporter data for perk fulfillment

### Collector Flow
1. Browse artists on homepage or `/artists`
2. Visit artist profile to learn about project
3. Connect Solana wallet when ready to purchase
4. Buy tokens with SOL
5. View holdings and eligible perks in wallet dashboard

## 🚀 Production Ready

This application is now configured for production deployment with:

- **Real Supabase Integration**: Full database operations with RLS policies
- **Mainnet Solana Configuration**: Ready for real blockchain transactions
- **Production Authentication**: Secure user management and profiles
- **Clean Codebase**: All mock data and testing code removed

## 🌐 Domain Configuration

To deploy with your custom domain (palette-crowdfunding.com):

1. **Deploy to Vercel**: Connect your GitHub repository to Vercel
2. **Add Environment Variables** in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```
3. **Configure Custom Domain** in Vercel settings
4. **Update DNS** in Squarespace to point to Vercel

## 🛡 Security Considerations

- All database operations use RLS policies
- Wallet connections are validated client-side
- No private keys are stored or transmitted
- Environment variables separate sensitive data

## 📄 License

This project is for demonstration purposes. See LICENSE file for details.

## 🤝 Contributing

This is a demo project showcasing Next.js, Supabase, and Solana integration patterns. Feel free to fork and extend for your own use cases.

---

**Note**: This is a demonstration application. For production use, implement proper Solana program development, real token minting, and comprehensive security audits.