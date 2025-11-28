/**
 * Token gating configuration for AI Agent access
 *
 * Currently using WSOL as placeholder until LV Token is deployed
 * WSOL (Wrapped SOL) address: So11111111111111111111111111111111111111112
 *
 * TODO: Update TOKEN_MINT_ADDRESS to LV Token address when deployed
 * TODO: Update REQUIRED_AMOUNT to 100000 when LV Token is live
 */

export const TOKEN_GATE_CONFIG = {
  // Token mint address (currently WSOL, will be LV Token)
  TOKEN_MINT_ADDRESS: 'FD37XbmN4NvmX8wn1upCyPYsZx6pVR5nbbhvzJnHBAGS',

  // Minimum token amount required (in base units/lamports)
  // 0 WSOL for testing, will be 100000 LV Tokens when deployed
  REQUIRED_AMOUNT: 100000,

  // Token display name
  TOKEN_NAME: 'LVL',

  // Solana RPC endpoint
  RPC_ENDPOINT: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',

  // Future config (uncomment when LV Token is deployed):
  // TOKEN_MINT_ADDRESS: 'YOUR_LV_TOKEN_MINT_ADDRESS',
  // REQUIRED_AMOUNT: 100000,
  // TOKEN_NAME: 'LV Token',
} as const;
