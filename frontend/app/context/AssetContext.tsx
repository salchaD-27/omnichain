'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { Chain as ViemChain } from 'viem';
import { buildSiweMessage } from '@/wagmi/scripts/siwe';
import { useWallet } from './WalletContext';
import { addRequestMeta } from 'next/dist/server/request-meta';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { astarZkEVM } from 'viem/chains';


export type AssetState = 'Drafted' | 'Active' | 'Inactive' | 'Deleted';
export const AssetStateArr: string[] = ['Drafted', 'Active', 'Inactive', 'Deleted'];

export type AssetData = {
    owner: `0x${string}`,
    assetState: AssetState;
    ipfsThumbnailCID: string;
    filecoinMetadatCID: string;
    arweaveHistoryCID: string;
    crossChainSynced: boolean;
    iconUrl?: string;
    metadata?: {
        name: string;
        description: string;
        color: string;
        createdAt: string;
    }    
};

type AssetContextType = {
    assets: AssetData[] | null,
    fetchAssets: (address?: `0x${string}`) => void,
    isLoading: boolean,
};

// Create context
const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const {authenticatedAddress} = useAuth();
    const [assets, setAssets] = useState<AssetData[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAssets = async (address?: `0x${string}`)=>{
        const targetAddress = address || authenticatedAddress;
        if (!targetAddress) {
            console.log('No authenticated address available');
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/asset/get', {
                method: 'POST', credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({address: targetAddress})
            })
            if(!res.ok) {
                const errorText = await res.text();
                console.error('Failed to fetch assets:', res.status, errorText);
                return;
            }
            const { assets } = await res.json();
            for(let i=0; i<assets.length; i++){
                assets[i].assetState = AssetStateArr[assets[i].assetState];
                assets[i].iconUrl = `https://ipfs.io/ipfs/${assets[i].ipfsThumbnailCID}`;
                const res = await fetch(`https://gateway.lighthouse.storage/ipfs/${assets[i].filecoinMetadatCID}`)
                const metadata = await res.json();
                assets[i].metadata = {name: metadata.name, description: metadata.description, color: metadata.color, createdAt: metadata.createdAt}
            }
            setAssets(assets);
        } catch (err) {
            console.error('Error in fetchAssets:', err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(()=>{
        if (authenticatedAddress) fetchAssets();
    }, [authenticatedAddress])

    return (
        <AssetContext.Provider
            value={{
                assets, fetchAssets, isLoading
            }}
        >
            {children}
        </AssetContext.Provider>
    );
};

// Hook to consume the asset context
export const useAsset = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAsset must be used within an AssetProvider');
  }
  return context;
};

