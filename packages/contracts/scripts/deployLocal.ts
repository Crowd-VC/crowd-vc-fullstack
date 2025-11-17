import hre from "hardhat";
import { formatUnits, parseUnits } from "viem";

/**
 * Local Hardhat Development Deployment Script (using Viem)
 *
 * Deploys:
 * 1. MockUSDT (6 decimals)
 * 2. MockUSDC (6 decimals)
 * 3. CrowdVCPool Implementation
 * 4. CrowdVCFactory (UUPS Proxy)
 *
 * Automatically configures tokens and mints test tokens for deployer
 */

async function main() {
  console.log("🚀 Starting Local Development Deployment (Viem)\n");
  console.log("=".repeat(60));

  const [deployer] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();

  console.log("📋 Deploying with account:", deployer.account.address);
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("💰 Account balance:", formatUnits(balance, 18), "ETH\n");

  // ============ STEP 1: Deploy Mock Tokens ============
  console.log("📦 Step 1: Deploying Mock Tokens...\n");

  // Deploy MockUSDT
  console.log("  Deploying MockUSDT...");
  const mockUSDT = await hre.viem.deployContract("MockUSDT");
  const usdtAddress = mockUSDT.address;
  console.log("  ✅ MockUSDT deployed to:", usdtAddress);

  // Deploy MockUSDC
  console.log("  Deploying MockUSDC...");
  const mockUSDC = await hre.viem.deployContract("MockUSDC");
  const usdcAddress = mockUSDC.address;
  console.log("  ✅ MockUSDC deployed to:", usdcAddress);

  // Mint test tokens to deployer (1 million of each)
  const mintAmount = parseUnits("1000000", 6); // 1M tokens with 6 decimals

  console.log("\n  Minting test tokens to deployer...");
  await mockUSDT.write.mint([deployer.account.address, mintAmount]);
  await mockUSDC.write.mint([deployer.account.address, mintAmount]);
  console.log("  ✅ Minted 1,000,000 USDT and 1,000,000 USDC to deployer\n");

  // ============ STEP 2: Deploy CrowdVCPool Implementation ============
  console.log("📦 Step 2: Deploying CrowdVCPool Implementation...");
  const poolImplementation = await hre.viem.deployContract("CrowdVCPool");
  const poolImplAddress = poolImplementation.address;
  console.log("✅ CrowdVCPool Implementation deployed to:", poolImplAddress);
  console.log("   (This is the template for all future pools)\n");

  // ============ STEP 3: Deploy CrowdVCFactory (UUPS Upgradeable) ============
  console.log("📦 Step 3: Deploying CrowdVCFactory (UUPS)...");

  // Configuration
  const treasuryAddress = deployer.account.address; // Use deployer as treasury for local testing
  const platformFee = 500; // 5% (500 basis points)

  console.log("   Configuration:");
  console.log("   - Treasury:", treasuryAddress);
  console.log("   - Platform Fee:", platformFee, "basis points (5%)");
  console.log("   - USDT:", usdtAddress);
  console.log("   - USDC:", usdcAddress);
  console.log("   - Pool Implementation:", poolImplAddress);

  // Deploy Factory Implementation
  const factoryImplementation = await hre.viem.deployContract("CrowdVCFactory");
  const factoryImplAddress = factoryImplementation.address;
  console.log("\n  ✅ Factory Implementation deployed to:", factoryImplAddress);

  // Prepare initialization data
  const initData = await publicClient.encodeFunctionData({
    abi: factoryImplementation.abi,
    functionName: "initialize",
    args: [treasuryAddress, platformFee, usdtAddress, usdcAddress, poolImplAddress],
  });

  // Deploy ERC1967Proxy
  console.log("  Deploying ERC1967Proxy...");
  const proxy = await hre.viem.deployContract("ERC1967Proxy", [factoryImplAddress, initData]);
  const proxyAddress = proxy.address;
  console.log("  ✅ ERC1967Proxy deployed to:", proxyAddress);
  console.log("     (This is your Factory address - use this for all interactions)\n");

  // ============ STEP 4: Verify Initialization ============
  console.log("🔍 Step 4: Verifying Factory Initialization...");

  // Get factory contract instance at proxy address
  const factory = await hre.viem.getContractAt("CrowdVCFactory", proxyAddress);

  const storedTreasury = await factory.read.treasury();
  const storedFee = await factory.read.platformFeePercent();
  const storedUSDT = await factory.read.supportedTokens([usdtAddress]);
  const storedUSDC = await factory.read.supportedTokens([usdcAddress]);
  const storedPoolImpl = await factory.read.poolImplementation();

  console.log("✅ Factory initialized successfully!");
  console.log("   - Treasury:", storedTreasury);
  console.log("   - Platform Fee:", storedFee.toString(), "basis points");
  console.log("   - USDT Supported:", storedUSDT ? "✅" : "❌");
  console.log("   - USDC Supported:", storedUSDC ? "✅" : "❌");
  console.log("   - Pool Implementation:", storedPoolImpl);
  console.log("   - Pool Impl matches:", storedPoolImpl === poolImplAddress ? "✅" : "❌");

  // ============ STEP 5: Grant Admin Role to Deployer ============
  console.log("\n🔐 Step 5: Verifying Admin Roles...");
  const ADMIN_ROLE = await factory.read.ADMIN_ROLE();
  const hasAdminRole = await factory.read.hasRole([ADMIN_ROLE, deployer.account.address]);
  console.log("   - Deployer has ADMIN_ROLE:", hasAdminRole ? "✅" : "❌");

  // ============ STEP 6: Check Token Balances ============
  console.log("\n💵 Step 6: Token Balances...");
  const deployerUSDTBalance = await mockUSDT.read.balanceOf([deployer.account.address]);
  const deployerUSDCBalance = await mockUSDC.read.balanceOf([deployer.account.address]);
  console.log("   - Deployer USDT:", formatUnits(deployerUSDTBalance, 6));
  console.log("   - Deployer USDC:", formatUnits(deployerUSDCBalance, 6));

  // ============ DEPLOYMENT SUMMARY ============
  console.log("\n" + "=".repeat(60));
  console.log("🎉 LOCAL DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));

  console.log("\n📝 Contract Addresses:");
  console.log("   MockUSDT:                     ", usdtAddress);
  console.log("   MockUSDC:                     ", usdcAddress);
  console.log("   CrowdVCPool Implementation:   ", poolImplAddress);
  console.log("   CrowdVCFactory Implementation:", factoryImplAddress);
  console.log("   CrowdVCFactory Proxy:         ", proxyAddress, "⭐ USE THIS");

  console.log("\n⚙️  Configuration:");
  console.log("   Treasury:     ", treasuryAddress);
  console.log("   Platform Fee: ", platformFee, "basis points (5%)");
  console.log("   Network:      ", "localhost (Hardhat)");
  console.log("   Chain ID:     ", "31337");

  console.log("\n💾 Add these to apps/web/.env.local:");
  console.log("─".repeat(60));
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS_LOCAL=${proxyAddress}`);
  console.log(`NEXT_PUBLIC_USDT_ADDRESS_LOCAL=${usdtAddress}`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS_LOCAL=${usdcAddress}`);
  console.log("─".repeat(60));

  console.log("\n📊 Test Tokens Available:");
  console.log("   - Deployer has 1,000,000 USDT");
  console.log("   - Deployer has 1,000,000 USDC");
  console.log("   - Mint more tokens using mockUSDT.mint() or mockUSDC.mint()");

  console.log("\n🔍 Next Steps:");
  console.log("   1. Copy the environment variables above to apps/web/.env.local");
  console.log("   2. Start your Next.js app: cd apps/web && pnpm dev");
  console.log("   3. Connect your wallet (use the deployer address for testing)");
  console.log("   4. Register as a user using the web3 hooks");
  console.log("   5. Test pool creation and contributions");

  console.log("\n🧪 Useful Hardhat Commands:");
  console.log("   - View accounts: npx hardhat accounts");
  console.log("   - Fund account: Send ETH from deployer to test accounts");
  console.log("   - Mint tokens: Call mockUSDT.mint(address, amount)");
  console.log("   - Check balance: Call mockUSDT.balanceOf(address)");

  console.log("\n✅ READY FOR DEVELOPMENT!");
  console.log("=".repeat(60) + "\n");

  return {
    mockUSDT: usdtAddress,
    mockUSDC: usdcAddress,
    poolImplementation: poolImplAddress,
    factoryImplementation: factoryImplAddress,
    factoryProxy: proxyAddress,
    deployer: deployer.account.address,
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
