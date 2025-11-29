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
  // Note: LVL has 0 decimals, so 100,000 base units = 100,000 tokens
  REQUIRED_AMOUNT: 100000,

  // Token display name
  TOKEN_NAME: 'LVL',

  // Token decimals (LVL uses 0 decimals)
  DECIMALS: 0,
};

/**
 * Format token amount for display
 * Converts base units to human-readable format
 */
export function formatTokenAmount(amount: number, decimals: number = TOKEN_GATE_CONFIG.DECIMALS): string {
  return (amount / Math.pow(10, decimals)).toLocaleString();
}
