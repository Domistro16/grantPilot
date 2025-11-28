import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export function ConnectWallet() {
  const { publicKey: solanaAddress, connected: isSolanaConnected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const openConnectFlow = () => {
    setVisible(true);
  };

  // Connected state - show Solana address
  if (isSolanaConnected && solanaAddress) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs">
          <span className="font-mono">{formatAddress(solanaAddress.toString())}</span>
        </div>
        <button
          onClick={disconnect}
          className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-300 rounded-full text-xs hover:bg-red-500/30 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={openConnectFlow}
      className="px-6 py-1.5 bg-[#FFB000] text-black rounded-full hover:bg-[#e6a000] transition font-semibold text-xs"
    >
      Connect Wallet
    </button>
  );
}
