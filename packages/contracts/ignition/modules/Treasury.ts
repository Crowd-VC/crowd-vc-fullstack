import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TreasuryModule", (m) => {
    // Get deployment parameters
    const deployer = m.getAccount(0);

    // Step 1: Deploy Treasury Contract
    // Constructor args: (admin)
    const treasury = m.contract("CrowdVCTreasury", [deployer], {
        id: "CrowdVCTreasury",
    });

    return {
        treasury,
    };
});
