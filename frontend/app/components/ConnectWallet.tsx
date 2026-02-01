'use client'
import { useAccount, useChainId, useConnect, useConnection, useDisconnect } from "wagmi"
import { useWallet } from "../context/WalletContext"
import { verify } from "crypto";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { log } from "console";

export default function ConnectWallet(){
    const { address, chain, connectors, connect, disconnect, isConnecting, isConnected, signMessage} = useWallet();
    const { isAuthenticated, authenticatedAddress, isLoading, login, logout } = useAuth();
    const [siweSuccess, setSiweSuccess] = useState<boolean>(false);
    
    // --------- A. WALLET NOT CONNECTED ---------
    if (!isConnected) {
        return (
        <div className="h-full w-full flex flex-col items-center justify-center text-[27px]">
            <div className="text-[54px] mb-4">Connect Wallet</div>
            <div className="mb-2">Connect with:</div>
            <div className="flex">
            {connectors.map((connector) => (
                <button
                key={connector.uid}
                className="px-[20px] py-[6px] mx-[4px] rounded bg-white text-black text-[17px] hover:opacity-70"
                onClick={() => connect(connector)}
                disabled={isConnecting}
                >
                {connector.name}
                </button>
            ))}
            </div>
            {isConnecting && <div className="mt-3">Connecting wallet…</div>}
        </div>
        );
    }

    // --------- B. WALLET CONNECTED ---------
    return (
        <div className="h-full w-full flex flex-col items-center justify-center text-[27px]">
        <div className="text-[54px] mb-4">Wallet Connected</div>
        {isAuthenticated?<div>Address (authenticated): {authenticatedAddress}</div>:<div>Address: {address}</div>}
        <div>Chain: {chain?.name}</div>
        {/* --------- WRONG NETWORK --------- */}
        {chain && !chain.isAnchorChain && (
            <div className="mt-4 text-yellow-400 text-[20px] text-center">
            ⚠️ Wrong network<br />
            Please switch to Hardhat Localhost
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
                onClick={() => {console.log('click');login(address!)}}
                // disabled={!chain?.isAnchorChain}
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
    );
}