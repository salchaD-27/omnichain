import {ethers} from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const ASSET_REGISTRY_DEPLOYED_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const abiPath = path.join(__dirname, '../../../hardhat/artifacts/contracts/AssetRegistry.sol/AssetRegistry.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
// Use a read-only contract (no signer needed for view functions)
const contract = new ethers.Contract(ASSET_REGISTRY_DEPLOYED_ADDRESS, abi.abi, provider);

// AssetState enum mapping
const AssetStateMap = ['Drafted', 'Active', 'Inactive', 'Deleted'];

export async function getAssetsScript(address) {
    try {
        try {
            const assets = await contract.getAssetsForAddress(address.staticCall({ from: ethers.ZeroAddress }));
            return assets.map(formatAsset);
        } catch (staticCallErr) {
            const iface = new ethers.Interface(abi.abi);
            const data = iface.encodeFunctionData('getAssetsForAddress', [address]);
            const result = await provider.call({
                to: ASSET_REGISTRY_DEPLOYED_ADDRESS,
                data: data
            });
            if (!result || result === '0x' || result === '0x0000000000000000000000000000000000000000000000000000000000000020') {return [];}
            // Try to decode the result
            try {
                const decoded = iface.decodeFunctionResult('getAssetsForAddress', result);
                const assetsArray = decoded[0]; // First element is the return value
                return assetsArray.map(formatAsset);
            } catch (decodeErr) {
                console.error('Failed to decode result:', decodeErr.message);
                return [];
            }
        }
    } catch (err) {
        console.error('Error fetching assets for address', address, err.message);
        return []; // return empty array on failure
    }
}

// Format raw asset tuple to object with proper field names
function formatAsset(asset) {
    // Handle both tuple result and individual properties
    const owner = asset.owner || asset[0];
    const assetState = asset.assetState !== undefined ? asset.assetState : (asset[1] !== undefined ? Number(asset[1]) : 0);
    const ipfsThumbnailCID = asset.ipfsThumbnailCID || asset[2] || '';
    const filecoinMetadatCID = asset.filecoinMetadatCID || asset[3] || '';
    const arweaveHistoryCID = asset.arweaveHistoryCID || asset[4] || '';
    const crossChainSynced = asset.crossChainSynced !== undefined ? asset.crossChainSynced : (asset[5] !== undefined ? asset[5] : false);
    
    return {
        owner: owner,
        assetState: assetState,
        ipfsThumbnailCID: ipfsThumbnailCID,
        filecoinMetadatCID: filecoinMetadatCID,
        arweaveHistoryCID: arweaveHistoryCID,
        crossChainSynced: crossChainSynced
    };
}
