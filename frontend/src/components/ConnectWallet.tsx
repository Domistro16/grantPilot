import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, X } from 'lucide-react';
import { useENSName } from '../hooks/useENSName';

type ConnectionStep = 'initial' | 'evm' | 'solana' | 'connected';

export function ConnectWallet() {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<ConnectionStep>('initial');

  // EVM wallet state
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const { connectors, connect: connectEvm } = useConnect();
  const { disconnect: disconnectEvm } = useDisconnect();

  // Solana wallet state
  const { publicKey: solanaAddress, connected: isSolanaConnected, disconnect: disconnectSolana } = useWallet();

  // .safu domain name resolution for EVM address
  const { name: safuName, loading: safuLoading } = useENSName({
    owner: evmAddress as `0x${string}` | undefined
  });

  const bothConnected = isEvmConnected && isSolanaConnected;

  // Auto-advance to next step
  useEffect(() => {
    if (step === 'evm' && isEvmConnected && !isSolanaConnected) {
      setStep('solana');
    } else if (isEvmConnected && isSolanaConnected) {
      setStep('connected');
      setShowModal(false);
    }
  }, [isEvmConnected, isSolanaConnected, step]);

  const handleDisconnectAll = () => {
    if (isEvmConnected) {
      disconnectEvm();
    }
    if (isSolanaConnected) {
      disconnectSolana();
    }
    setStep('initial');
  };

  const handleEvmConnect = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (connector) {
      connectEvm({ connector });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const getDisplayName = () => {
    if (safuName && !safuLoading) {
      return safuName;
    }
    return evmAddress ? formatAddress(evmAddress) : '';
  };

  const openConnectFlow = () => {
    if (isEvmConnected && !isSolanaConnected) {
      setStep('solana');
    } else if (!isEvmConnected) {
      setStep('evm');
    } else {
      setStep('initial');
    }
    setShowModal(true);
  };

  // Connected state - show both addresses
  if (bothConnected && evmAddress && solanaAddress) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs">
          <span className={`${safuName ? '' : 'font-mono'}`}>
            {safuLoading ? (
              <span className="inline-block animate-pulse">Loading...</span>
            ) : (
              getDisplayName()
            )}
          </span>
          <span className="text-emerald-400">•</span>
          <span className="font-mono">{formatAddress(solanaAddress.toString())}</span>
        </div>
        <button
          onClick={handleDisconnectAll}
          className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-300 rounded-full text-xs hover:bg-red-500/30 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={openConnectFlow}
        className="px-6 py-1.5 bg-[#FFB000] text-black rounded-full hover:bg-[#e6a000] transition font-semibold text-xs"
      >
        Connect Wallet
      </button>

      {/* Connection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-32 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#0a0e27] border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-2">Connect Wallets</h2>
            <p className="text-sm text-gray-400 mb-6">
              Connect both EVM and Solana wallets to use GrantPilot
            </p>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex-1 h-1 rounded ${step === 'evm' || step === 'solana' || step === 'connected' ? 'bg-[#FFB000]' : 'bg-gray-700'}`} />
              <div className={`flex-1 h-1 rounded ${step === 'solana' || step === 'connected' ? 'bg-[#FFB000]' : 'bg-gray-700'}`} />
            </div>

            {/* Step 1: Connect EVM Wallet */}
            {step === 'evm' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Step 1: Connect EVM Wallet
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Choose your EVM wallet (for BNB Chain, Ethereum, etc.)
                </p>
                <div className="space-y-2">
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => handleEvmConnect(connector.id)}
                      className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-left transition"
                    >
                      {connector.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Connect Solana Wallet */}
            {step === 'solana' && (
              <div>
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-emerald-300">
                    ✓ EVM Wallet Connected:{' '}
                    {safuLoading ? (
                      <span className="inline-block animate-pulse">Loading name...</span>
                    ) : safuName ? (
                      <span className="font-semibold">{safuName}</span>
                    ) : (
                      evmAddress && formatAddress(evmAddress)
                    )}
                  </p>
                </div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Step 2: Connect Solana Wallet
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Choose your Solana wallet
                </p>
                <WalletMultiButton className="!w-full !bg-[#FFB000] !text-black !rounded-lg !py-3 !font-semibold hover:!bg-[#e6a000]" />
              </div>
            )}

            {/* Initial state fallback */}
            {step === 'initial' && (
              <div>
                <button
                  onClick={() => setStep('evm')}
                  className="w-full px-4 py-3 bg-[#FFB000] text-black rounded-lg font-semibold hover:bg-[#e6a000] transition"
                >
                  Start Connection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
