import { http, createConfig } from 'wagmi';
import { bsc, mainnet, polygon, base, optimism, arbitrum } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// WalletConnect Project ID - Replace with your own from https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const config = createConfig({
  chains: [bsc, mainnet, polygon, base, optimism, arbitrum],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [bsc.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
});
