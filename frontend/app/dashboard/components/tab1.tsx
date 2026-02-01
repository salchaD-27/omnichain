'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../context/WalletContext";
import { useAuth } from "../../context/AuthContext";

type FormDataType = {
//   icon: File | null;
  name: string;
  description: string;
  color: string;
};

export default function Tab1() {
  const router = useRouter();
  const { address, chain, connect, disconnect, isConnected } = useWallet();
  const { isAuthenticated, login, logout } = useAuth();

  const [formData, setFormData] = useState<FormDataType>({
    // icon: null,
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
    //   if (!formData.icon) throw new Error("Please select an icon file");

      const body = new FormData();
    //   body.append("icon", formData.icon);
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
        // icon: null,
        name: "",
        description: "",
        color: "",
      });
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
          Your Assets
        </div>
        <div className="h-[80%] w-[95%] flex items-center justify-start bg-neutral-800 rounded"></div>
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
            {/* <span className="flex flex-col w-full">
              <label>Asset Icon</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="rounded border p-2"
              />
            </span> */}

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
