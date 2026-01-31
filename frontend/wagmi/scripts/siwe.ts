import { Chain, NonceRecord } from "@/app/context/WalletContext";

export interface SiweMsgPayload {
    domain: string;
    address: `0x${string}`;
    statement: string;
    uri: string;
    version: string;
    chainId: number;
    nonce: string;
    expirationTime?: string;
}

export function buildSiweMessage({address, chain, nonceRecord}: {address: `0x${string}`, chain: Chain, nonceRecord: NonceRecord}){
    const domain = 'OmniChain.dapp'
    const statement = `Sign in to ${domain} using your wallet. This request proves ownership of the address.`;
    const message = `
        ${domain} wants you to sign in with your Ethereum account:${address}
        Purpose: ${statement}
        Chain: ${chain.name} (id: ${chain.id}, anchor: ${chain.isAnchorChain})
        Nonce: ${nonceRecord.nonce}
        Expiration: ${nonceRecord.expiresAt}
    `.trim();
    return message;
}