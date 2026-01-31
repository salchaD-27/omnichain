'use client';

import { createContext, useContext } from 'react';
import {
  Connector,
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSignMessage,
} from 'wagmi';
import { Chain as ViemChain } from 'viem';
import { buildSiweMessage } from '@/wagmi/scripts/siwe';

// Extend Wagmi/Viem Chain with custom field
export type Chain = ViemChain & {
  isAnchorChain: boolean;
};
export interface NonceRecord {
    nonce: number,
    expiresAt: Date,
    used: boolean
}
// Wallet context type
type WalletContextType = {
  address?: `0x${string}`;
  chain?: Chain;
  chainId: number;
  isConnecting: boolean;
  isConnected: boolean;
  connectors: readonly Connector[];
  connect: (connector: Connector) => void;
  disconnect: () => void;
  signMessage: (msg: NonceRecord) => Promise<{nonce: number; siweMsg: string; signature: `0x${string}`}>;
};

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { address, isConnecting, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  // Add isAnchorChain safely
  const myChain: Chain | undefined = chain
    ? { ...chain, isAnchorChain: chain.id === 11155111 } // ethereum sepolia as anchor
    : undefined;

  // Async signMessage wrapper
  const signMessage = async (nonceRecord: NonceRecord) => {
    if (!address || !myChain) throw new Error('Wallet not connected or chain undefined');
    const siweMsg = buildSiweMessage({ address, chain: myChain, nonceRecord });
    const signature =  await signMessageAsync({ message: siweMsg });
    const nonce = nonceRecord.nonce;
    return {nonce, siweMsg, signature};
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        chain: myChain,
        chainId,
        isConnecting,
        isConnected,
        connectors,
        connect: (c) => connect({ connector: c }),
        disconnect,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Hook to consume the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
