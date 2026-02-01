import {ethers} from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createAssetScript(){
    console.log('Starting createAssetScript...');
    try{
        console.log('RPC_URL:', process.env.RPC_URL);
        console.log('WALLET_PRIVATE_KEY exists:', !!process.env.WALLET_PRIVATE_KEY);
        console.log('WALLET_PRIVATE_KEY length:', process.env.WALLET_PRIVATE_KEY ? process.env.WALLET_PRIVATE_KEY.length : 0);
        console.log('WALLET_PRIVATE_KEY first 10 chars:', process.env.WALLET_PRIVATE_KEY ? process.env.WALLET_PRIVATE_KEY.substring(0, 10) + '...' : 'undefined');
        
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        console.log('Provider created');
        
        const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
        console.log('Wallet created, address:', wallet.address);
        
        const ASSET_REGISTRY_DEPLOYED_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
        console.log('Contract address:', ASSET_REGISTRY_DEPLOYED_ADDRESS);
        
        // Load ABI from the JSON file
        const abiPath = path.join(__dirname, '../../../hardhat/artifacts/contracts/AssetRegistry.sol/AssetRegistry.json');
        console.log('Looking for ABI at:', abiPath);
        console.log('File exists:', fs.existsSync(abiPath));
        
        const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        console.log('ABI loaded, abi.abi exists:', !!abi.abi);
        
        const contract = new ethers.Contract(ASSET_REGISTRY_DEPLOYED_ADDRESS, abi.abi, wallet);
        console.log('Contract instance created');

        console.log('Creating asset...');
        const createAssetTx = await contract.createAsset('ipfstest', 'filecointest', 'arweavetest');
        console.log('Transaction sent:', createAssetTx.hash);
        
        const receipt = await createAssetTx.wait();
        console.log('Receipt:', receipt);
        
        return receipt;
    }catch(err){
        console.error('Error in createAssetScript:', err.message);
        console.error(err.stack);
        throw err;
    }
}
export { createAssetScript };
