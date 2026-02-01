'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

const STATES = ['Drafted', 'Active', 'Inactive', 'Deleted']

export default function AssetPage() {
    const { id } = useParams()
    const router = useRouter()
    const [asset, setAsset] = useState<Asset | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`http://localhost:3001/api/asset/get-id`, {
            method: 'POST', credentials: 'include',
            headers: {'Content-Type':'application/json'}, body: JSON.stringify({id})
        }).then(r => r.json()).then(async d => { 
            if (d.success) {
                const res = await fetch(`https://gateway.lighthouse.storage/ipfs/${d.asset.filecoinMetadatCID}`)
                const metadata = await res.json();
                const assetWithMetadata = { ...d.asset, metadata: { name: metadata.name, description: metadata.description, color: metadata.color, createdAt: metadata.createdAt } };
                setAsset(assetWithMetadata); 
            }
            setLoading(false) 
        })
    }, [id])

    if (loading) return <div className="h-screen text-white p-8">Loading...</div>
    if (!asset) return <div className="h-screen text-white p-8">Not found</div>

    return (
        <div className="h-full w-full flex flex-col items-start justify-start p-[2vh] bg-black text-white">
            <button onClick={() => router.push('/dashboard')} className="bg-neutral-700 px-4 py-2 rounded">Back</button>
            
            <div className="h-full w-1/8 my-[2vh] flex items-center justify-center">
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
            <h1 className="text-4xl mt-4">Asset: <strong>{asset.metadata?.name}</strong></h1>
            <p className="mt-4">Desc: <strong>{asset.metadata?.description}</strong></p>
            <p className="mt-2"></p>
            <p className="mt-2">Created: <strong>{asset.metadata?.createdAt}</strong></p>
            <p className="mt-2">Status: <strong>{STATES[asset.assetState]}</strong></p>
            <p className="mt-2">Synced: <strong>{asset.crossChainSynced ? 'Yes' : 'No'}</strong></p>
            <p className="mt-2"></p>
            <p className="mt-2">Owner: <strong>{asset.owner}</strong></p>
            <p className="mt-2">IPFS CID: <strong>{asset.ipfsThumbnailCID}</strong></p>
            <p className="mt-2">Filecoin CID: <strong>{asset.filecoinMetadatCID}</strong></p>
        </div>
    )
}
