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
  TOKEN_MINT_ADDRESS: 'So11111111111111111111111111111111111111112' as const,

  // Minimum token amount required (in base units)
  // 0 WSOL for testing, will be 100000 LV Tokens when deployed
  REQUIRED_AMOUNT: 0,

  // Token display name
  TOKEN_NAME: 'WSOL',

  // Future config (uncomment when LV Token is deployed):
  // TOKEN_MINT_ADDRESS: 'YOUR_LV_TOKEN_MINT_ADDRESS',
  // REQUIRED_AMOUNT: 100000,
  // TOKEN_NAME: 'LV Token',
} as const;

/**
 * Format token amount for display
 * Converts base units to human-readable format
 */
export function formatTokenAmount(amount: number, decimals: number = 9): string {
  return (amount / Math.pow(10, decimals)).toLocaleString();
}
