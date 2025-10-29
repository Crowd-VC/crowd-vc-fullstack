import hre from 'hardhat';
import { formatEther, parseUnits } from 'viem';

/**
 * Deploy CrowdVC Platform to Base Sepolia
 *
 * This script deploys:
 * 1. Mock USDC and USDT tokens (for testing)
 * 2. CrowdVCFactory (upgradeable proxy)
 *
 * Usage:
 * npx hardhat run scripts/deploy.ts --network baseSepolia
 */

async function main() {
  console.log('\n🚀 Starting CrowdVC Platform Deployment to Base Sepolia...\n');

  const publicClient = await hre.viem.getPublicClient();
  const [deployer] = await hre.viem.getWalletClients();

  console.log('📍 Deploying from address:', deployer.account.address);

  // Get deployer balance
  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log('💰 Deployer balance:', formatEther(balance), 'ETH\n');

  if (balance < parseUnits('0.01', 18)) {
    console.warn(
      '⚠️  Warning: Low balance. You may need more ETH for deployment.\n',
    );
  }

  // ============================================
  // Step 1: Deploy Mock Tokens (USDC and USDT)
  // ============================================
  console.log('📦 Step 1: Deploying Mock Tokens...\n');

  console.log('   Deploying MockUSDC...');
  const mockUSDC = await hre.viem.deployContract('MockUSDC', []);
  await publicClient.waitForTransactionReceipt({
    hash: mockUSDC.deploymentTransaction()?.hash!,
  });
  console.log('   ✅ MockUSDC deployed at:', mockUSDC.address);

  console.log('   Deploying MockUSDT...');
  const mockUSDT = await hre.viem.deployContract('MockUSDT', []);
  await publicClient.waitForTransactionReceipt({
    hash: mockUSDT.deploymentTransaction()?.hash!,
  });
  console.log('   ✅ MockUSDT deployed at:', mockUSDT.address);

  console.log('\n   Minting initial tokens to deployer for testing...');

  // Mint 1 million USDC to deployer
  const mintUsdcTx = await mockUSDC.write.mint([
    deployer.account.address,
    parseUnits('1000000', 6), // 1M USDC (6 decimals)
  ]);
  await publicClient.waitForTransactionReceipt({ hash: mintUsdcTx });
  console.log('   ✅ Minted 1,000,000 USDC to deployer');

  // Mint 1 million USDT to deployer
  const mintUsdtTx = await mockUSDT.write.mint([
    deployer.account.address,
    parseUnits('1000000', 6), // 1M USDT (6 decimals)
  ]);
  await publicClient.waitForTransactionReceipt({ hash: mintUsdtTx });
  console.log('   ✅ Minted 1,000,000 USDT to deployer\n');

  // ============================================
  // Step 2: Deploy CrowdVCFactory (Upgradeable)
  // ============================================
  console.log('📦 Step 2: Deploying CrowdVCFactory (Upgradeable)...\n');

  // Deploy implementation
  console.log('   Deploying Factory Implementation...');
  const factoryImplementation = await hre.viem.deployContract(
    'CrowdVCFactory',
    [],
  );
  await publicClient.waitForTransactionReceipt({
    hash: factoryImplementation.deploymentTransaction()?.hash!,
  });
  console.log(
    '   ✅ Factory Implementation deployed at:',
    factoryImplementation.address,
  );

  // Deploy ERC1967Proxy
  console.log('\n   Deploying UUPS Proxy...');

  // Prepare initialization data
  const treasuryAddress = deployer.account.address; // Using deployer as treasury for now
  const platformFee = 500n; // 5% (500 basis points)

  // Encode the initialize function call
  const initData = hre.viem.encodeFunctionData({
    abi: factoryImplementation.abi,
    functionName: 'initialize',
    args: [treasuryAddress, platformFee, mockUSDT.address, mockUSDC.address],
  });

  // Deploy proxy with initialization
  const proxy = await hre.viem.deployContract('Proxy', [
    factoryImplementation.address,
    initData,
  ]);
  await publicClient.waitForTransactionReceipt({
    hash: proxy.deploymentTransaction()?.hash!,
  });
  console.log('   ✅ Proxy deployed at:', proxy.address);

  // Get factory instance at proxy address
  const factory = await hre.viem.getContractAt('CrowdVCFactory', proxy.address);

  // ============================================
  // Step 3: Verify Deployment
  // ============================================
  console.log('\n📋 Step 3: Verifying Deployment...\n');

  const factoryTreasury = await factory.read.treasury();
  const factoryPlatformFee = await factory.read.platformFeePercent();
  const factoryVersion = await factory.read.version();

  console.log('   Treasury Address:', factoryTreasury);
  console.log('   Platform Fee:', `${Number(factoryPlatformFee) / 100}%`);
  console.log('   Factory Version:', factoryVersion.toString());

  // Verify token support
  const usdtSupported = await factory.read.supportedTokens([mockUSDT.address]);
  const usdcSupported = await factory.read.supportedTokens([mockUSDC.address]);
  console.log('   USDT Supported:', usdtSupported);
  console.log('   USDC Supported:', usdcSupported);

  // ============================================
  // Step 4: Summary
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('✅ DEPLOYMENT SUCCESSFUL!');
  console.log('='.repeat(60));
  console.log('\n📝 Deployment Summary:\n');
  console.log('Contract Addresses:');
  console.log('├─ MockUSDC:              ', mockUSDC.address);
  console.log('├─ MockUSDT:              ', mockUSDT.address);
  console.log('├─ Factory Implementation:', factoryImplementation.address);
  console.log('└─ Factory Proxy:         ', factory.address);
  console.log('\nConfiguration:');
  console.log('├─ Treasury:         ', treasuryAddress);
  console.log('├─ Platform Fee:     ', `${Number(platformFee) / 100}%`);
  console.log('├─ Network:          ', 'Base Sepolia (ChainID: 84532)');
  console.log('└─ Deployer:         ', deployer.account.address);

  console.log('\n📚 Next Steps:\n');
  console.log('1. Save these addresses to your .env file');
  console.log('2. Update the ABIs in packages/abis if needed');
  console.log('3. Verify contracts on Basescan:');
  console.log(
    `   npx hardhat verify --network baseSepolia ${mockUSDC.address}`,
  );
  console.log(
    `   npx hardhat verify --network baseSepolia ${mockUSDT.address}`,
  );
  console.log(
    `   npx hardhat verify --network baseSepolia ${factoryImplementation.address}`,
  );
  console.log(
    '\n4. Register test users and create pools through the web interface',
  );
  console.log('\n5. Get testnet tokens from faucet:');
  console.log(
    '   https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet\n',
  );

  // Save deployment addresses to file
  const fs = require('fs');
  const deploymentInfo = {
    network: 'baseSepolia',
    chainId: 84532,
    timestamp: new Date().toISOString(),
    deployer: deployer.account.address,
    contracts: {
      mockUSDC: mockUSDC.address,
      mockUSDT: mockUSDT.address,
      factoryImplementation: factoryImplementation.address,
      factoryProxy: factory.address,
    },
    config: {
      treasury: treasuryAddress,
      platformFee: Number(platformFee),
    },
  };

  fs.writeFileSync(
    'deployment-base-sepolia.json',
    JSON.stringify(deploymentInfo, null, 2),
  );
  console.log('💾 Deployment info saved to: deployment-base-sepolia.json\n');
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed:\n', error);
    process.exit(1);
  });
