import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  async headers() {
    if (!isProd) {
      return []
    }
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.mainnet-beta.solana.com https://api.devnet.solana.com https://api.testnet.solana.com https://solana-mainnet.g.alchemy.com https://rpc.helius.xyz https://www.google-analytics.com https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ]
  },
  webpack: (config, { isServer }) => {
    // Fix for Solana wallet adapter compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }

    return config
  },
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
    '@solana/web3.js',
    '@solana/spl-token',
    '@solana-mobile/wallet-adapter-mobile',
    '@solana-mobile/wallet-standard-mobile',
    '@toruslabs/solana-embed',
    '@toruslabs/metadata-helpers',
    '@toruslabs/broadcast-channel',
    '@toruslabs/base-controllers',
    'rpc-websockets',
    'ws',
    'hash.js',
    'qrcode',
    'whatwg-url',
  ],
}

export default nextConfig
