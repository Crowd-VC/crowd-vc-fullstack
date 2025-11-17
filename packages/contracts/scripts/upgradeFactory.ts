/**
 * Script to upgrade the CrowdVCFactory implementation
 * 
 * This script:
 * 1. Deploys a new implementation contract
 * 2. Uses ProxyAdmin to upgrade the proxy to point to the new implementation
 * 3. Optionally calls a reinitializer function if needed
 * 
 * Usage:
 *   PROXY_ADDRESS=0x... PROXY_ADMIN_ADDRESS=0x... \
 *   npx hardhat run scripts/upgradeFactory.ts --network base
 * 
 * With reinitialization:
 *   PROXY_ADDRESS=0x... PROXY_ADMIN_ADDRESS=0x... REINITIALIZE=true \
 *   npx hardhat run scripts/upgradeFactory.ts --network base
 */

import { ethers } from 'hardhat';

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  const proxyAdminAddress = process.env.PROXY_ADMIN_ADDRESS;
  const needsReinitialize = process.env.REINITIALIZE === 'true';

  if (!proxyAddress || !proxyAdminAddress) {
    console.error('❌ Error: Required environment variables not set');
    console.log('\nUsage:');
    console.log('  PROXY_ADDRESS=0x... PROXY_ADMIN_ADDRESS=0x... \\');
    console.log('  npx hardhat run scripts/upgradeFactory.ts --network base');
    console.log('\nOptional:');
    console.log('  REINITIALIZE=true - Call reinitializer function after upgrade');
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  
  console.log('🔄 Upgrading CrowdVCFactory\n');
  console.log('═'.repeat(60));
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Proxy: ${proxyAddress}`);
  console.log(`ProxyAdmin: ${proxyAdminAddress}`);
  console.log('═'.repeat(60));

  try {
    // Step 1: Get the current implementation version
    console.log('\n📊 Getting current state...');
    const factoryProxy = await ethers.getContractAt('CrowdVCFactory', proxyAddress);
    const currentVersion = await factoryProxy.getVersion();
    console.log(`Current Version: ${currentVersion}`);

    // Step 2: Deploy new implementation
    console.log('\n🚀 Deploying new implementation...');
    const FactoryV2 = await ethers.getContractFactory('CrowdVCFactory');
    const newImplementation = await FactoryV2.deploy();
    await newImplementation.waitForDeployment();
    const newImplAddress = await newImplementation.getAddress();
    console.log(`✅ New Implementation deployed at: ${newImplAddress}`);

    // Step 3: Get ProxyAdmin
    console.log('\n🔧 Preparing upgrade transaction...');
    const proxyAdmin = await ethers.getContractAt('ProxyAdmin', proxyAdminAddress);
    
    // Verify deployer is the owner
    const owner = await proxyAdmin.owner();
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      throw new Error(`Deployer ${deployer.address} is not the ProxyAdmin owner (${owner})`);
    }
    console.log(`✅ Verified: You are the ProxyAdmin owner`);

    // Step 4: Upgrade the proxy
    if (needsReinitialize) {
      console.log('\n⚙️  Upgrading with reinitialization...');
      console.log('⚠️  Note: Make sure your contract has a reinitializer function!');
      
      // Example: If you have initializeV2() function
      // const reinitData = newImplementation.interface.encodeFunctionData('initializeV2', []);
      
      // For this example, we'll just do a simple upgrade
      // You should modify this to call your actual reinitializer
      console.log('⚠️  Reinitialization not implemented in this script.');
      console.log('Please implement the reinitialization logic for your specific upgrade.');
      
      // Uncomment and modify this when you have a reinitializer:
      /*
      const reinitData = newImplementation.interface.encodeFunctionData('initializeV2', [
        // your parameters here
      ]);
      
      const tx = await proxyAdmin.upgradeAndCall(
        proxyAddress,
        newImplAddress,
        reinitData
      );
      console.log(`Transaction hash: ${tx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      await tx.wait();
      */
      
      process.exit(1); // Exit since we can't continue without proper reinit
      
    } else {
      console.log('\n⚙️  Upgrading proxy...');
      const tx = await proxyAdmin.upgrade(proxyAddress, newImplAddress);
      console.log(`Transaction hash: ${tx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();
      console.log(`✅ Confirmed in block ${receipt?.blockNumber}`);
    }

    // Step 5: Verify upgrade
    console.log('\n🔍 Verifying upgrade...');
    
    // Get implementation from storage
    const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
    const implValue = await ethers.provider.getStorage(proxyAddress, IMPLEMENTATION_SLOT);
    const currentImpl = ethers.getAddress('0x' + implValue.slice(-40));
    
    if (currentImpl.toLowerCase() === newImplAddress.toLowerCase()) {
      console.log('✅ Upgrade successful!');
      console.log(`Implementation updated to: ${currentImpl}`);
    } else {
      console.log('❌ Upgrade verification failed!');
      console.log(`Expected: ${newImplAddress}`);
      console.log(`Got: ${currentImpl}`);
      process.exit(1);
    }

    // Step 6: Verify contract state
    console.log('\n📊 Verifying contract state...');
    const upgradedFactory = await ethers.getContractAt('CrowdVCFactory', proxyAddress);
    const newVersion = await upgradedFactory.getVersion();
    const treasury = await upgradedFactory.getTreasury();
    const platformFee = await upgradedFactory.getPlatformFee();
    
    console.log(`Version: ${newVersion}`);
    console.log(`Treasury: ${treasury}`);
    console.log(`Platform Fee: ${platformFee} basis points`);

    // Step 7: Summary
    console.log('\n✅ Upgrade Complete!\n');
    console.log('═'.repeat(60));
    console.log('Summary:');
    console.log('─'.repeat(60));
    console.log(`Old Version: ${currentVersion}`);
    console.log(`New Version: ${newVersion}`);
    console.log(`Old Implementation: (check proxy info)`);
    console.log(`New Implementation: ${newImplAddress}`);
    console.log('═'.repeat(60));

    // Step 8: Next steps
    console.log('\n📋 Next Steps:');
    console.log('1. Verify the new implementation on block explorer:');
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;
    let explorerUrl = '';
    if (chainId === 8453n) {
      explorerUrl = 'https://basescan.org';
    } else if (chainId === 84532n) {
      explorerUrl = 'https://sepolia.basescan.org';
    }
    console.log(`   npx hardhat verify --network base ${newImplAddress}`);
    console.log(`   ${explorerUrl}/address/${newImplAddress}`);
    
    console.log('\n2. Test the upgraded contract thoroughly');
    console.log('3. Update your frontend to use the proxy address (unchanged):');
    console.log(`   Proxy: ${proxyAddress}`);
    
    console.log('\n✅ Done!\n');

  } catch (error) {
    console.error('\n❌ Upgrade failed:');
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });





