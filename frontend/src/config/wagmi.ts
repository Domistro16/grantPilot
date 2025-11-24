import { http, createConfig } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// WalletConnect Project ID - Replace with your own from https://cloud.walletconnect.com
const projectId =
  (import.meta as any).env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id";

export const config = createConfig({
  chains: [bsc],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [bsc.id]: http()
  },
});
