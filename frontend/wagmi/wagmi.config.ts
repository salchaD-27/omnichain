import { sepolia } from 'viem/chains'
import { createConfig, http, injected } from 'wagmi'
import { baseAccount, metaMask, safe, walletConnect } from 'wagmi/connectors'
import dotenv from 'dotenv';
import { QueryClient } from '@tanstack/react-query';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID!;
export const queryClient = new QueryClient();

export const config = createConfig({
    ssr: true,
    chains: [sepolia],
    connectors: [injected(), metaMask(), walletConnect({projectId}), baseAccount(), safe()],
    transports: {
        [sepolia.id]: http(),
    }
})