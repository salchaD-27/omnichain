'use client'
import Image from "next/image";
import ConnectWallet from "./components/ConnectWallet";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  useEffect(()=>{
    if(isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated])
  
  return (
    <div className="h-[100vh] w-screen">
      <ConnectWallet/>
    </div>
  );
}
