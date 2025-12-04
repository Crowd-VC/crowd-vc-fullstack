import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Mock Tokens Deployment Module
 *
 * This module deploys mock USDT and USDC tokens for testing purposes.
 * Use this module BEFORE deploying the Factory on testnets or local networks.
 *
 * Deployed Contracts:
 * 1. MockUSDT - ERC20 token with 6 decimals
 * 2. MockUSDC - ERC20 token with 6 decimals
 *
 * Both tokens are mintable, allowing you to create test tokens as needed.
 *
 * Usage:
 * npx hardhat ignition deploy ignition/modules/MockTokens.ts --network baseSepolia
 *
 * After deployment, use the token addresses in your Factory deployment parameters.
 */
export default buildModule("MockTokensModule", (m) => {
    const deployer = m.getAccount(0);

    // Deploy MockUSDT
    const mockUSDT = m.contract("MockUSDT", [], {
        id: "MockUSDT",
    });

    // Deploy MockUSDC
    const mockUSDC = m.contract("MockUSDC", [], {
        id: "MockUSDC",
    });

    // Optional: Mint initial supply to deployer for testing
    // You can call these from the console after deployment
    // Example: mockUSDT.mint(deployerAddress, parseUnits("1000000", 6))

    return {
        mockUSDT,
        mockUSDC,
    };
});
