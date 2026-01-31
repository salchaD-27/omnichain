'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Chain as ViemChain } from 'viem';
import { buildSiweMessage } from '@/wagmi/scripts/siwe';
import { useWallet } from './WalletContext';
import { addRequestMeta } from 'next/dist/server/request-meta';
import { useRouter } from 'next/navigation';

type AuthContextType = {
    isAuthenticated: boolean,
    authenticatedAddress: `0x${string}` | undefined,
    isLoading: boolean,
    login: (address: `0x${string}`) => void,
    logout: () => void,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const { signMessage, address } = useWallet();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [authenticatedAddress, setAuthenticatedAddress] = useState<`0x${string}` | undefined>(undefined);

    const login = async (walletAddress: `0x${string}`) => {
        setIsLoading(true);
        try {
        const nonceRes = await fetch('http://localhost:3001/api/auth/nonce-record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: walletAddress }),
        });
        if (!nonceRes.ok) throw new Error('Failed to get nonce');
        const nonceData = await nonceRes.json();

        const { nonce, siweMsg, signature } = await signMessage(nonceData);

        const verifyRes = await fetch('http://localhost:3001/api/auth/verify-sign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: walletAddress, nonce, siweMsg, signature }),
            credentials: 'include', // important!
        });
        if (!verifyRes.ok) throw new Error('Failed to verify signature');

        // Now fetch user session
        const authRes = await fetch('http://localhost:3001/api/auth/user', {
            credentials: 'include',
        });
        if (!authRes.ok) throw new Error('Session not authenticated');

        const { address: authAddr } = await authRes.json();
        if (authAddr === walletAddress) {
            setIsAuthenticated(true);
            setAuthenticatedAddress(authAddr);
            router.push('/dashboard');
        }
        } catch (err) {
        console.error('Login failed', err);
        setIsAuthenticated(false);
        setAuthenticatedAddress(undefined);
        } finally {
        setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
        const res = await fetch('http://localhost:3001/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Logout failed');
        setIsAuthenticated(false);
        setAuthenticatedAddress(undefined);
        } catch (err) {
        console.error(err);
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        if (
        authenticatedAddress && // session exists
        address && // wallet connected
        authenticatedAddress.toLowerCase() !== address.toLowerCase()
        ) {
        logout();
        }
    }, [address]);

    useEffect(() => {
        let cancelled = false;
        const hydrateSession = async () => {
        setIsLoading(true);
        try {
            const authRes = await fetch('http://localhost:3001/api/auth/user', {
            credentials: 'include',
            });
            if (!authRes.ok) {
            if (!cancelled) {
                setIsAuthenticated(false);
                setAuthenticatedAddress(undefined);
            }
            return;
            }
            const { address: authAddr } = await authRes.json();
            if (!cancelled && authAddr) {
            setIsAuthenticated(true);
            setAuthenticatedAddress(authAddr);
            }
        } catch (err) {
            console.error('Session hydration failed', err);
            if (!cancelled) {
            setIsAuthenticated(false);
            setAuthenticatedAddress(undefined);
            }
        } finally {
            if (!cancelled) setIsLoading(false);
        }
        };
        hydrateSession();
        return () => {
        cancelled = true;
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                authenticatedAddress,
                isLoading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook to consume the wallet context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
