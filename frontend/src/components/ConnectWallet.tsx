import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';

type WalletType = 'solana' | 'evm';

export function ConnectWallet() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState<WalletType | null>(null);

  // EVM wallet state
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const { connectors, connect: connectEvm } = useConnect();
  const { disconnect: disconnectEvm } = useDisconnect();

  // Solana wallet state
  const { publicKey: solanaAddress, connected: isSolanaConnected, disconnect: disconnectSolana } = useWallet();

  const isConnected = isEvmConnected || isSolanaConnected;
  const address = evmAddress || (solanaAddress ? solanaAddress.toString() : null);

  const handleDisconnect = () => {
    if (isEvmConnected) {
      disconnectEvm();
    }
    if (isSolanaConnected) {
      disconnectSolana();
    }
    setSelectedType(null);
    setShowDropdown(false);
  };

  const handleEvmConnect = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (connector) {
      connectEvm({ connector });
      setSelectedType('evm');
      setShowDropdown(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span className="font-mono">{formatAddress(address)}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                {selectedType === 'solana' ? 'Solana Wallet' : 'EVM Wallet'}
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              EVM Wallets (BNB, ETH, etc.)
            </div>
            <div className="space-y-1 mb-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleEvmConnect(connector.id)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  {connector.name}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Solana Wallets
              </div>
              <div onClick={() => { setSelectedType('solana'); setShowDropdown(false); }}>
                <WalletMultiButton className="!w-full !bg-purple-600 !hover:bg-purple-700 !rounded !text-sm !py-2" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
