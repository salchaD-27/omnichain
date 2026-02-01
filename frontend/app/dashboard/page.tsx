'use client'
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useWallet } from "../context/WalletContext";
import Tab2 from "./components/tab2";
import Tab1 from "./components/tab1";
import Tab0 from "./components/tab0";

export default function Dashboard(){
    const router = useRouter();
    const { isAuthenticated, authenticatedAddress, isLoading, login, logout } = useAuth();
    const [tab, setTab] = useState<number>(2);

    useEffect(()=>{
        if(!isAuthenticated) router.push('/')
    }, [isAuthenticated])

    return (
        <div className="h-full w-full flex flex-col items-center justify-center text-[27px]">
            <div className="absolute h-[10vh] w-full top-0 bg-neutral-800 flex items-center justify-center text-white text-[22px]">
                <div onClick={()=>setTab(0)} className="h-full w-[20%] flex items-center justify-center cursor-pointer hover:opacity-70">MarketPlace</div>
                <div onClick={()=>setTab(1)} className="h-full w-[20%] flex items-center justify-center cursor-pointer hover:opacity-70">Assets</div>
                <div onClick={()=>setTab(2)} className="h-full w-[20%] flex items-center justify-center cursor-pointer hover:opacity-70">User</div>
            </div>
            <div className="h-[10vh] w-full flex items-center justify-center"></div>
            <div className="h-[90vh] w-full flex items-center justify-center">
                {tab===0 && <Tab0/>}
                {tab===1 && <Tab1/>}
                {tab===2 && <Tab2/>}
            </div>
        </div>
    );
}