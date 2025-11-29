import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { agentApi } from '../api/agent';

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
 * Fetches token balance from backend API
 * Returns access status and current balance
 */
export function useTokenGate(): TokenGateState {
  const { publicKey, connected } = useWallet();

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
        // Fetch balance from backend API
        const walletAddress = publicKey.toBase58();
        const result = await agentApi.getTokenBalance(walletAddress);

        console.log('[TokenGate] Balance check result:', {
          balance: result.balance,
          required: result.requiredAmount,
          hasAccess: result.hasAccess,
          decimals: result.decimals,
        });

        setState({
          hasAccess: result.hasAccess,
          balance: result.balance,
          loading: false,
          error: result.error,
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
  }, [publicKey, connected]);

  return state;
}
