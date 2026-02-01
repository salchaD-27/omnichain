import fs from 'fs';
import { create } from 'ipfs-http-client';

// const projectId = process.env.INFURA_IPFS_API_KEY;
// const projectSecret = process.env.INFURA_IPFS_SECRET;
// const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
// export const ipfs = create({host: 'ipfs.infura.io', port: 5001, protocol: 'https', headers: {authorization: auth}})
export async function uploadIcon(iconBuffer){
    const ipfs = create({host: '127.0.0.1', port: 5001, protocol: 'http'});
    const result = await ipfs.add(iconBuffer);
    return result.cid.toString();
}
