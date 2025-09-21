import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer, TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'

const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta'
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'

export const connection = new Connection(RPC_URL, 'confirmed')

// USDT Token Mint Addresses
export const USDT_TOKEN_MINTS = {
  mainnet: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'), // Real USDT on mainnet
  devnet: new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'), // USDT on devnet (if available)
  localnet: new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU') // Mock for local development
}

// Get the appropriate USDT mint for current network
export function getUSDTMint(): PublicKey {
  const network = SOLANA_NETWORK.toLowerCase()
  if (network === 'mainnet-beta' || network === 'mainnet') {
    return USDT_TOKEN_MINTS.mainnet
  } else if (network === 'devnet') {
    return USDT_TOKEN_MINTS.devnet
  } else {
    return USDT_TOKEN_MINTS.localnet
  }
}

// USDT has 6 decimals
export const USDT_DECIMALS = 6
export const USDT_SCALE = Math.pow(10, USDT_DECIMALS)

export interface TokenInfo {
  address: string
  supply: number
  decimals: number
}

export interface PurchaseParams {
  tokenMint: PublicKey
  amount: number
  artistWallet: PublicKey
  buyerWallet: PublicKey
  pricePerTokenUSDT: number
}

export interface USDTTransferParams {
  fromWallet: PublicKey
  toWallet: PublicKey
  amount: number // Amount in USDT (not scaled)
}

// Create a new SPL token for an artist
export async function createArtistToken(
  artistWallet: Keypair,
  tokenSymbol: string,
  supply: number
): Promise<TokenInfo> {
  try {
    // Create mint account
    const mint = await createMint(
      connection,
      artistWallet, // Payer
      artistWallet.publicKey, // Mint authority
      artistWallet.publicKey, // Freeze authority
      6 // Decimals
    )

    // Get or create associated token account for the artist
    const artistTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      artistWallet,
      mint,
      artistWallet.publicKey
    )

    // Mint tokens to artist's account
    await mintTo(
      connection,
      artistWallet,
      mint,
      artistTokenAccount.address,
      artistWallet,
      supply * Math.pow(10, 6) // Adjust for decimals
    )

    return {
      address: mint.toBase58(),
      supply,
      decimals: 6
    }
  } catch (error) {
    console.error('Error creating artist token:', error)
    throw new Error('Failed to create artist token')
  }
}

// Purchase tokens from an artist using USDT
export async function purchaseTokens(params: PurchaseParams): Promise<string> {
  try {
    const { tokenMint, amount, artistWallet, buyerWallet, pricePerTokenUSDT } = params

    // Calculate total cost in USDT
    const totalCostUSDT = amount * pricePerTokenUSDT
    const totalCostScaled = totalCostUSDT * USDT_SCALE

    // Get USDT mint
    const usdtMint = getUSDTMint()

    // Create transaction
    const transaction = new Transaction()

    // Get buyer's USDT token account
    const buyerUSDTAccount = await getAssociatedTokenAddress(
      usdtMint,
      buyerWallet
    )

    // Get or create artist's USDT token account
    const artistUSDTAccount = await getAssociatedTokenAddress(
      usdtMint,
      artistWallet
    )

    // Add USDT transfer instruction (payment to artist)
    transaction.add(
      await transfer(
        connection,
        buyerWallet, // Payer and owner of source account
        buyerUSDTAccount,
        artistUSDTAccount,
        buyerWallet, // Owner of source account (will need to sign)
        totalCostScaled
      )
    )

    // Get buyer's campaign token account
    const buyerTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      buyerWallet
    )

    // Get artist's campaign token account
    const artistTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      artistWallet
    )

    // Add campaign token transfer instruction (tokens from artist to buyer)
    transaction.add(
      await transfer(
        connection,
        artistWallet, // Payer (artist wallet)
        artistTokenAccount,
        buyerTokenAccount,
        artistWallet, // Artist wallet needs to sign this transaction
        amount * Math.pow(10, 6) // Adjust for token decimals
      )
    )

    // Note: This transaction requires both buyer and artist signatures
    // In production, implement a program or escrow system for atomic swaps
    console.log(`USDT payment: ${totalCostUSDT} USDT for ${amount} tokens`)
    
    // Return the transaction for signing - actual hash will be generated after signing
    return transaction.serialize({ requireAllSignatures: false }).toString('base64')
  } catch (error) {
    console.error('Error purchasing tokens with USDT:', error)
    throw new Error('Failed to purchase tokens with USDT')
  }
}

// Transfer USDT between wallets
export async function transferUSDT(params: USDTTransferParams): Promise<string> {
  try {
    const { fromWallet, toWallet, amount } = params
    const scaledAmount = amount * USDT_SCALE

    const usdtMint = getUSDTMint()

    // Get associated token addresses
    const fromTokenAccount = await getAssociatedTokenAddress(usdtMint, fromWallet)
    const toTokenAccount = await getAssociatedTokenAddress(usdtMint, toWallet)

    // Create transaction
    const transaction = new Transaction()

    // Add USDT transfer instruction
    transaction.add(
      await transfer(
        connection,
        fromWallet, // Payer and owner of source account
        fromTokenAccount,
        toTokenAccount,
        fromWallet, // Owner of source account
        scaledAmount
      )
    )

    console.log(`USDT transfer: ${amount} USDT`)
    
    // Return the transaction for signing - actual hash will be generated after signing
    return transaction.serialize({ requireAllSignatures: false }).toString('base64')
  } catch (error) {
    console.error('Error transferring USDT:', error)
    throw new Error('Failed to transfer USDT')
  }
}

// Get token balance for a wallet
export async function getTokenBalance(
  walletAddress: PublicKey,
  tokenMint: PublicKey
): Promise<number> {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      { mint: tokenMint }
    )

    if (tokenAccounts.value.length === 0) {
      return 0
    }

    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount
    return balance || 0
  } catch (error) {
    console.error('Error getting token balance:', error)
    return 0
  }
}

// Get USDT balance for a wallet
export async function getUSDTBalance(walletAddress: PublicKey): Promise<number> {
  try {
    const usdtMint = getUSDTMint()
    return await getTokenBalance(walletAddress, usdtMint)
  } catch (error) {
    console.error('Error getting USDT balance:', error)
    return 0
  }
}

// Get SOL balance for a wallet (still needed for transaction fees)
export async function getSOLBalance(walletAddress: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(walletAddress)
    return balance / LAMPORTS_PER_SOL
  } catch (error) {
    console.error('Error getting SOL balance:', error)
    return 0
  }
}

// Validate a Solana address
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

// Convert USDT to scaled amount (for transactions)
export function usdtToScaled(usdt: number): number {
  return usdt * USDT_SCALE
}

// Convert scaled amount to USDT
export function scaledToUSDT(scaled: number): number {
  return scaled / USDT_SCALE
}

// Convert SOL to lamports (still needed for transaction fees)
export function solToLamports(sol: number): number {
  return sol * LAMPORTS_PER_SOL
}

// Convert lamports to SOL
export function lamportsToSOL(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL
}

// Helper function to format USDT amounts
export function formatUSDTAmount(amount: number): string {
  return `${amount.toFixed(2)} USDT`
}