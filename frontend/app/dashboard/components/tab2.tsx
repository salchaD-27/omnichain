'use client'
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useWallet } from "../../context/WalletContext";

export default function Tab2(){
    const router = useRouter();
    const { address, chain, connectors, connect, disconnect, isConnecting, isConnected, signMessage} = useWallet();
    const { isAuthenticated, authenticatedAddress, isLoading, login, logout } = useAuth();

    const [tab, setTab] = useState<number>(1);
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(authenticatedAddress as string);
        setCopied(true);
        setTimeout(() => setCopied(false), 1700);
    };
    return(
        <div className="h-full w-full flex flex-col items-center justify-center">
            <div onClick={handleCopy} className="hover:opacity-70 cursor-pointer select-none">
                Address (authenticated): {authenticatedAddress?.substring(0, 4)}...
                {authenticatedAddress?.substring(authenticatedAddress.length - 4)}
                {" "}({copied ? "Copied" : "Copy"})
            </div>

            <div>Chain: {chain?.name}</div>
            {/* --------- WRONG NETWORK --------- */}
            {chain && !chain.isAnchorChain && (
                <div className="mt-4 text-yellow-400 text-[20px] text-center">
                ⚠️ Wrong network<br />
                Please switch to Ethereum Sepolia
                </div>
            )}
            {/* --------- WALLET ACTIONS --------- */}
            <button
                className="mt-4 px-[20px] py-[6px] rounded bg-white text-black text-[17px] hover:opacity-70"
                onClick={disconnect}
            >
                Disconnect Wallet
            </button>

            {/* --------- AUTH SECTION --------- */}
            <div className="mt-6">
                {isLoading && <div>Checking session…</div>}
                {!isLoading && !isAuthenticated && (
                <button
                    className="px-[20px] py-[6px] rounded bg-white text-black text-[17px] hover:opacity-70"
                    onClick={() => login(address!)}
                    disabled={!chain?.isAnchorChain}
                >
                    Sign in
                </button>
                )}
                {!isLoading && isAuthenticated && (
                <button
                    className="px-[20px] py-[6px] rounded bg-white text-black text-[17px] hover:opacity-70"
                    onClick={logout}
                >
                    Logout
                </button>
                )}
            </div>
        </div>
    )
}