import {ethers} from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadIcon } from './ipfs.js';
import lighthouse from '@lighthouse-web3/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

const deployedAddressesPath = path.join(__dirname, '../../../hardhat/ignition/deployments/chain-31337/deployed_addresses.json');
const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, 'utf8'));
export const ASSET_REGISTRY_DEPLOYED_ADDRESS = deployedAddresses['AssetRegistryModule#AssetRegistry'];
if (!ASSET_REGISTRY_DEPLOYED_ADDRESS) throw new Error('AssetRegistry address not found in deployed_addresses.json');

const abiPath = path.join(__dirname, '../../../hardhat/artifacts/contracts/AssetRegistry.sol/AssetRegistry.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
export const contract = new ethers.Contract(ASSET_REGISTRY_DEPLOYED_ADDRESS, abi.abi, wallet);

async function createAssetScript(name, description, color, iconBuffer){
    try{
        const ipfsCid = await uploadIcon(iconBuffer);
        const metadata = {
            name, description, color, icon: `ipfs://${ipfsCid}`,
            createdAt: new Date().toISOString(),
        };
        const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
        const fil = await lighthouse.uploadBuffer(metadataBuffer, process.env.LIGHTHOUSE_API_KEY);
        const filCid = fil.data.Hash;

        const createAssetTx = await contract.createAsset(ipfsCid, filCid, 'arweavetest');
        const receipt = await createAssetTx.wait();
        return receipt;
    }catch(err){
        console.error('Error in createAssetScript:', err.message);
        console.error(err.stack);
        throw err;
    }
}
export { createAssetScript };
