import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AssetRegistryModule = buildModule("AssetRegistryModule", (m) => {
  const assetRegistry = m.contract("AssetRegistry");
  return {assetRegistry};
});

export default AssetRegistryModule;