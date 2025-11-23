import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_GATE_CONFIG } from '../config/tokenGate';

interface TokenGateState {
  hasAccess: boolean;
  balance: number;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
}

/**
 * Hook to check if user has required token balance for AI agent access
 *
 * Checks the user's Solana wallet for WSOL (or LV Token when deployed)
 * Returns access status and current balance
 */
export function useTokenGate(): TokenGateState {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [state, setState] = useState<TokenGateState>({
    hasAccess: false,
    balance: 0,
    loading: true,
    error: null,
    isConnected: connected,
  });

  useEffect(() => {
    async function checkTokenBalance() {
      // Reset state if wallet not connected
      if (!connected || !publicKey) {
        setState({
          hasAccess: false,
          balance: 0,
          loading: false,
          error: null,
          isConnected: false,
        });
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null, isConnected: true }));

      try {
        // For WSOL, we can check native SOL balance (WSOL = wrapped SOL)
        // When switching to LV Token, this will check the SPL token account
        const tokenMint = new PublicKey(TOKEN_GATE_CONFIG.TOKEN_MINT_ADDRESS);

        let balance = 0;

        // Check if this is WSOL (native SOL token)
        if (TOKEN_GATE_CONFIG.TOKEN_MINT_ADDRESS === 'So11111111111111111111111111111111111111112') {
          // For WSOL, check native SOL balance
          const solBalance = await connection.getBalance(publicKey);
          balance = solBalance; // Balance in lamports
        } else {
          // For other SPL tokens (future LV Token), check token account
          try {
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
              mint: tokenMint,
            });

            if (tokenAccounts.value.length > 0) {
              const tokenAccount = tokenAccounts.value[0];
              const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount;
              balance = parseInt(tokenAmount.amount); // Balance in base units
            }
          } catch (err) {
            console.warn('Token account not found, balance is 0');
            balance = 0;
          }
        }

        const hasAccess = balance >= TOKEN_GATE_CONFIG.REQUIRED_AMOUNT;

        setState({
          hasAccess,
          balance,
          loading: false,
          error: null,
          isConnected: true,
        });
      } catch (err) {
        console.error('Error checking token balance:', err);
        setState({
          hasAccess: false,
          balance: 0,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to check token balance',
          isConnected: true,
        });
      }
    }

    checkTokenBalance();

    // Re-check balance every 30 seconds when connected
    const interval = connected ? setInterval(checkTokenBalance, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [publicKey, connected, connection]);

  return state;
}
