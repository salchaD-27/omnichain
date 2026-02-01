'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../context/WalletContext";
import { useAuth } from "../../context/AuthContext";
import { AssetState, useAsset } from "@/app/context/AssetContext";

type FormDataType = {
  icon: File | null;
  name: string;
  description: string;
  color: string;
};

export default function Tab1() {
  const router = useRouter();
  const { address, chain, connect, disconnect, isConnected } = useWallet();
  const { authenticatedAddress, isAuthenticated, login, logout } = useAuth();
  const { assets, fetchAssets, isLoading } = useAsset();

  const [formData, setFormData] = useState<FormDataType>({
    icon: null,
    name: "",
    description: "",
    color: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle text inputs
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  // Handle file input
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        icon: e.target.files![0],
      }));
    }
  }

  // Fetch assets on mount
  useEffect(() => {
    if (isAuthenticated && authenticatedAddress) {
      fetchAssets(authenticatedAddress);
    }
  }, [isAuthenticated, authenticatedAddress]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.icon) throw new Error("Please select an icon file");

      const body = new FormData();
      body.append("icon", formData.icon);
      body.append("name", formData.name);
      body.append("description", formData.description);
      body.append("color", formData.color);
      const res = await fetch("http://localhost:3001/api/asset/create", {
        method: "POST", credentials: "include",
        body,
      });

      if (!res.ok) throw new Error("Failed to create asset");
      setSuccess(true);
      setFormData({
        icon: null,
        name: "",
        description: "",
        color: "",
      });
      // Refresh assets list after successful creation
      if (authenticatedAddress) {
        fetchAssets(authenticatedAddress);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center text-[22px]">
      <div className="h-full w-[75%] flex flex-col items-center justify-center">
        <div className="h-[10%] w-[95%] flex items-center justify-start">
          Your Assets ({assets?.length || 0})
        </div>
        <div className="h-[80%] w-[95%] flex items-center justify-start bg-neutral-800 rounded overflow-auto p-4">
          {isLoading ? (
            <div className="text-gray-400">Loading assets...</div>
          ) : assets && assets.length > 0 ? (
            <div className="h-full w-full flex flex-row items-center justify-start overflow-x-auto">
              {assets.map((asset, index) => (
                <div key={index} className="h-[90%] w-[25vw] mr-[10px] rounded bg-neutral-600 flex-shrink-0 mb-2 flex flex-col items-center justify-start p-4">
                  {asset.iconUrl && (
                    <img 
                      src={asset.iconUrl} 
                      alt={asset.metadata?.name || 'Asset'}
                      className="w-20 h-20 rounded mb-2 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="text-white text-[18px] font-bold mb-2">
                    {asset.metadata?.name || 'Unnamed Asset'}
                  </div>
                  <div className="text-gray-300 text-xs text-center mb-2 max-h-16 overflow-hidden">
                    {asset.metadata?.description?.slice(0, 100) || 'No description'}
                  </div>
                  <div className={`text-xs px-3 py-1 rounded mb-2 ${
                    asset.assetState === 'Active' ? 'bg-green-600' :
                    asset.assetState === 'Drafted' ? 'bg-yellow-600' :
                    asset.assetState === 'Inactive' ? 'bg-gray-600' :
                    'bg-red-600'
                  }`}>
                    {asset.assetState}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No assets found</div>
          )}
        </div>
      </div>

      <div className="h-full w-[25%] flex flex-col items-center justify-center">
        <div className="h-[90%] w-[90%] flex flex-col items-center justify-center bg-neutral-800 rounded">
          <div className="h-auto w-full flex items-center justify-center font-bold">
            Create New Asset
          </div>

          <form
            onSubmit={handleSubmit}
            className="h-auto w-full px-[10px] flex flex-col items-center justify-center gap-4"
          >
            <span className="flex flex-col w-full">
              <label>Asset Icon</label>
              <input
                type="file"
                name='icon'
                accept="image/*"
                onChange={handleFileChange}
                required
                className="rounded border p-2"
              />
            </span>

            <span className="flex flex-col w-full">
              <label>Asset Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="rounded border p-2"
              />
            </span>

            <span className="flex flex-col w-full">
              <label>Asset Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="rounded border p-2"
              />
            </span>

            <span className="flex flex-col w-full">
              <label>Asset Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="rounded border p-2"
              />
            </span>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Asset"}
            </button>

            {success && (
              <p className="text-green-600">Asset created successfully</p>
            )}
            {error && <p className="text-red-600">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
