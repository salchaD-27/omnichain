// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract AssetRegistry {
    // data strucs
    uint256 public assetNonce = 0;
    enum AssetState {Drafted, Active, Inactive, Deleted}
    struct AssetData {
        address owner;
        AssetState assetState;
        string ipfsThumbnailCID;
        string filecoinMetadatCID;
        string arweaveHistoryCID;
        bool crossChainSynced;
    }
    mapping(uint256 => AssetData) public registry;
    mapping(address => uint256[]) private assetIdsByOwner;

    // events
    event AssetCreated(address owner, uint256 assetId, AssetState assetState);
    event AssetDeleted(address owner, uint256 assetId);
    event AssetOwnershipTransferred(uint256 assetId, address from, address to);

    // funcs
    function getAssetFromId(uint256 _assetId) public view returns (AssetData memory){return registry[_assetId];}
    function getAssetsForAddress(address _address) public view returns (AssetData[] memory){
        uint256[] storage ids = assetIdsByOwner[_address];
        AssetData[] memory assets = new AssetData[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {assets[i] = registry[ids[i]];}
        return assets;
    }
    function createAsset(string memory _ipfsThumbnailCID, string memory _filecoinMetadatCID, string memory _arweaveHistoryCID) public {
        uint256 assetId = assetNonce++;
        require(registry[assetId].owner == address(0), "Asset already exists");
        registry[assetId] = AssetData({
            owner: msg.sender,
            assetState: AssetState.Drafted,
            ipfsThumbnailCID: _ipfsThumbnailCID,
            filecoinMetadatCID: _filecoinMetadatCID,
            arweaveHistoryCID: _arweaveHistoryCID,
            crossChainSynced: false
        });
        assetIdsByOwner[msg.sender].push(assetId);
        emit AssetCreated(msg.sender, assetId, AssetState.Drafted);
    }
    function deleteAsset(uint256 _assetId) public {
        AssetData storage asset = registry[_assetId];
        require(asset.owner != address(0), "Asset does not exist");
        require(asset.owner == msg.sender, "Not asset owner. Asset deletion not authorized");
        require(asset.assetState != AssetState.Deleted, "Asset already deleted");
        asset.assetState = AssetState.Deleted;
        emit AssetDeleted(msg.sender, _assetId);
    }
    function changeAssetOwner(uint256 _assetId, address _newOwner) public {
        AssetData storage asset = registry[_assetId];
        require(asset.owner != address(0), "Asset does not exist");
        require(asset.assetState != AssetState.Deleted, "Asset deleted. Cant tranfer ownership");
        require(asset.owner == msg.sender, "Not asset owner. Ownership transfer not authorized");
        require(_newOwner != address(0), "Invalid new owner");
        registry[_assetId].owner = _newOwner;
        emit AssetOwnershipTransferred(_assetId, msg.sender, _newOwner);
    }
}