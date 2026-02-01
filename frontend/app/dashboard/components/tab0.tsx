'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../context/WalletContext";
import { useAuth } from "../../context/AuthContext";
import { AssetState, AssetStateArr, useAsset } from "@/app/context/AssetContext";

type Asset = {
    owner: `0x${string}`,
    assetState: number,
    ipfsThumbnailCID: string,
    filecoinMetadatCID: string,
    arweaveHistoryCID: string,
    crossChainSynced: boolean,
    metadata?: {
        name: string;
        description: string;
        color: string;
        createdAt: string;
    }
    id: number,
}
export default function Tab0(){
    const router = useRouter();
    const [assets, setAsstes] = useState<Asset[] | null>(null);

    useEffect(()=>{
        const fetchAllAssets = async ()=>{
            const res = await fetch('http://localhost:3001/api/asset/get-all', {credentials: 'include'})
            if(!res.ok) throw new Error('Failed to fetch all assets');
            const {assets} = await res.json();
            for(let i=0; i<assets.length; i++){
                const res = await fetch(`https://gateway.lighthouse.storage/ipfs/${assets[i].filecoinMetadatCID}`)
                const metadata = await res.json();
                assets[i].metadata = {name: metadata.name, description: metadata.description, color: metadata.color, createdAt: metadata.createdAt}
            }
            console.log(assets[0].id);
            setAsstes(assets);
        }
        fetchAllAssets();
    }, [])

    return(
        <div className="h-[90%] w-[90%] bg-neutral-800 rounded flex flex-col items-center justify-start pt-[20px] overflow-y-auto">
            <div className="h-[77px] w-[90%] mb-[7px] flex flex-row items-center justify-center rounded bg-neutral-700 text-[15px] font-bold">
                <div className="h-full w-1/8 flex items-center justify-center">Icon</div>
                <div className="h-full w-1/8 flex items-center justify-center">Owner</div>
                <div className="h-full w-3/8 flex items-center justify-center">Asset Name</div>
                <div className="h-full w-1/8 flex items-center justify-center">Asset Desc</div>
                <div className="h-full w-1/8 flex items-center justify-center">Asset State</div>
                <div className="h-full w-1/8 flex items-center justify-center"></div>
            </div>
            {assets?.map((asset, idx)=>(
                <div key={idx} className="h-[77px] w-[90%] mb-[7px] py-[10px] flex-shrink-0 flex flex-row items-center justify-center rounded bg-neutral-500 text-[15px]">
                    <div className="h-full w-1/8 flex items-center justify-center">
                    {asset.ipfsThumbnailCID && (
                    <img 
                      src={`https://ipfs.io/ipfs/${asset.ipfsThumbnailCID}`}
                      alt={asset.ipfsThumbnailCID || 'Asset Icon'}
                      className="w-auto h-[90%] rounded object-cover object-center"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                    </div>
                    <div className="h-full w-1/8 flex items-center justify-center">{asset.owner?.substring(0, 4)}...{asset.owner?.substring(asset.owner.length - 4)}</div>
                    <div className="h-full w-3/8 flex items-center justify-center">{asset.metadata?.name}</div>
                    <div className="h-full w-1/8 flex items-center justify-center">{asset.metadata?.description}</div>
                    <div className="h-full w-1/8 flex items-center justify-center">{AssetStateArr[asset.assetState]}</div>
                    <div onClick={()=>router.push(`/asset/${asset.id}`)} className="h-full w-1/8 flex items-center justify-center bg-white text-black text-[17px] mr-[10px] cursor-pointer hover:opacity-70 rounded">Open Asset</div>
            </div>
            ))}
        </div>
    )
}