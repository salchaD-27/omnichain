import {ethers, id} from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const deployedAddressesPath = path.join(__dirname, '../../../hardhat/ignition/deployments/chain-31337/deployed_addresses.json');
const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, 'utf8'));
export const ASSET_REGISTRY_DEPLOYED_ADDRESS = deployedAddresses['AssetRegistryModule#AssetRegistry'];
if (!ASSET_REGISTRY_DEPLOYED_ADDRESS) throw new Error('AssetRegistry address not found in deployed_addresses.json');

const abiPath = path.join(__dirname, '../../../hardhat/artifacts/contracts/AssetRegistry.sol/AssetRegistry.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const contract = new ethers.Contract(ASSET_REGISTRY_DEPLOYED_ADDRESS, abi.abi, provider);

const AssetStateMap = ['Drafted', 'Active', 'Inactive', 'Deleted'];

export async function getAssetsScript(address) {
    try {
        try {
            const assets = await contract.getAssetsForAddress(address.staticCall({ from: ethers.ZeroAddress }));
            return assets.map(formatAsset);
        } catch (staticCallErr) {
            const iface = new ethers.Interface(abi.abi);
            const data = iface.encodeFunctionData('getAssetsForAddress', [address]);
            const result = await provider.call({ to: ASSET_REGISTRY_DEPLOYED_ADDRESS, data: data });
            if (!result || result === '0x' || result === '0x0000000000000000000000000000000000000000000000000000000000000020') {return [];}
            try {
                const decoded = iface.decodeFunctionResult('getAssetsForAddress', result);
                return decoded[0].map(formatAsset);
            } catch (decodeErr) {
                console.error('Failed to decode result:', decodeErr.message);
                return [];
            }
        }
    } catch (err) {
        console.error('Error fetching assets for address', address, err.message);
        return [];
    }
}

export async function getAllAssetsScript() {
    try {
        const assetIds = await contract.getAllAssetIds();
        const assets = [];
        for (const id of assetIds) {
            const asset = await contract.getAssetFromId(id);
            assets.push(formatAsset(asset, id));
        }
        return assets;
    } catch (err) {
        console.error('Error fetching all assets:', err.message);
        return [];
    }
}

export async function getAssetFromIdScript(assetId) {
    try {
        const asset = await contract.getAssetFromId(assetId);
        return formatAsset(asset, assetId);
    } catch (err) {
        console.error('Error fetching asset:', err.message);
        return null;
    }
}

function formatAsset(asset, id = undefined) {
    const owner = asset.owner || asset[0];
    const assetState = asset.assetState !== undefined ? asset.assetState : (asset[1] !== undefined ? Number(asset[1]) : 0);
    const ipfsThumbnailCID = asset.ipfsThumbnailCID || asset[2] || '';
    const filecoinMetadatCID = asset.filecoinMetadatCID || asset[3] || '';
    const arweaveHistoryCID = asset.arweaveHistoryCID || asset[4] || '';
    const crossChainSynced = asset.crossChainSynced !== undefined ? asset.crossChainSynced : (asset[5] !== undefined ? asset[5] : false);
    // id is at index 6 in the contract return, or passed as parameter
    const assetId = id !== undefined ? Number(id) : (asset.id !== undefined ? Number(asset.id) : (asset[6] !== undefined ? Number(asset[6]) : undefined));
    return {
        owner: owner,
        assetState: assetState,
        ipfsThumbnailCID: ipfsThumbnailCID,
        filecoinMetadatCID: filecoinMetadatCID,
        arweaveHistoryCID: arweaveHistoryCID,
        crossChainSynced: crossChainSynced,
        id: assetId
    };
}
