/**
 * Token gating configuration for AI Agent access
 *
 * LVL Token address: FD37XbmN4NvmX8wn1upCyPYsZx6pVR5nbbhvzJnHBAGS
 * Required amount: 100,000 LVL tokens
 */

export const TOKEN_GATE_CONFIG = {
  // LVL token mint address
  TOKEN_MINT_ADDRESS: 'FD37XbmN4NvmX8wn1upCyPYsZx6pVR5nbbhvzJnHBAGS',

  // Minimum token amount required (in base units)
  REQUIRED_AMOUNT: 100000,

  // Token display name
  TOKEN_NAME: 'LVL',

  // Solana RPC endpoint
  RPC_ENDPOINT: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
};
