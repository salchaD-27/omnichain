'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type AssetData = { owner: string, assetState: number, crossChainSynced: boolean }
const STATES = ['Drafted', 'Active', 'Inactive', 'Deleted']

export default function AssetPage() {
    const { id } = useParams()
    const router = useRouter()
    const [asset, setAsset] = useState<AssetData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`http://localhost:3001/api/asset/get-id`, {
            method: 'POST', credentials: 'include', 
            headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id})
        }).then(r => r.json()).then(d => { 
            if (d.success) { setAsset(d.asset); }
            setLoading(false) 
        })
    }, [id])

    if (loading) return <div className="h-screen text-white p-8">Loading...</div>
    if (!asset) return <div className="h-screen text-white p-8">Not found</div>

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <button onClick={() => router.push('/dashboard')} className="bg-blue-600 px-4 py-2 rounded">Back</button>
            <h1 className="text-4xl font-bold mt-4">Asset {id}</h1>
            <p className="mt-4">Status: {STATES[asset.assetState]}</p>
            <p className="mt-2">Owner: {asset.owner}</p>
            <p className="mt-2">Synced: {asset.crossChainSynced ? 'Yes' : 'No'}</p>
        </div>
    )
}
