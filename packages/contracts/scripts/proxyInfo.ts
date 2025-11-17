/**
 * Script to get information about deployed proxy contracts
 * 
 * Usage:
 *   npx hardhat run scripts/proxyInfo.ts --network base
 * 
 * You can also pass the proxy address as an environment variable:
 *   PROXY_ADDRESS=0x... npx hardhat run scripts/proxyInfo.ts --network base
 */

import { ethers } from 'hardhat';

// ERC1967 storage slots (defined in ERC-1967)
const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
const ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';

async function getStorageAt(address: string, slot: string): Promise<string> {
  const value = await ethers.provider.getStorage(address, slot);
  // Remove leading zeros and convert to address format
  return ethers.getAddress('0x' + value.slice(-40));
}

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  
  if (!proxyAddress) {
    console.error('❌ Error: PROXY_ADDRESS environment variable not set');
    console.log('\nUsage:');
    console.log('  PROXY_ADDRESS=0x... npx hardhat run scripts/proxyInfo.ts --network base');
    process.exit(1);
  }

  console.log('🔍 Proxy Information\n');
  console.log('═'.repeat(60));
  console.log(`Proxy Address: ${proxyAddress}`);
  console.log('═'.repeat(60));

  try {
    // Get implementation address from storage
    const implementationAddress = await getStorageAt(proxyAddress, IMPLEMENTATION_SLOT);
    console.log(`\n📝 Implementation Address: ${implementationAddress}`);

    // Get admin address from storage
    const adminAddress = await getStorageAt(proxyAddress, ADMIN_SLOT);
    console.log(`👤 Admin Address: ${adminAddress}`);

    // Get ProxyAdmin owner (if it's a ProxyAdmin contract)
    try {
      const proxyAdmin = await ethers.getContractAt('ProxyAdmin', adminAddress);
      const owner = await proxyAdmin.owner();
      console.log(`👑 ProxyAdmin Owner: ${owner}`);
    } catch (error) {
      console.log('⚠️  Could not get ProxyAdmin owner (admin might not be a ProxyAdmin contract)');
    }

    // Get factory information from the proxied contract
    try {
      const factory = await ethers.getContractAt('CrowdVCFactory', proxyAddress);
      
      console.log('\n📊 Factory State:');
      console.log('─'.repeat(60));
      
      const version = await factory.getVersion();
      console.log(`Version: ${version}`);
      
      const treasury = await factory.getTreasury();
      console.log(`Treasury: ${treasury}`);
      
      const platformFee = await factory.getPlatformFee();
      console.log(`Platform Fee: ${platformFee} basis points (${Number(platformFee) / 100}%)`);
      
      const poolImplementation = await factory.poolImplementation();
      console.log(`Pool Implementation: ${poolImplementation}`);
      
      const allPools = await factory.getAllPools();
      console.log(`Total Pools Deployed: ${allPools.length}`);
      
      if (allPools.length > 0) {
        console.log('\n🏊 Deployed Pools:');
        for (let i = 0; i < Math.min(allPools.length, 5); i++) {
          const poolId = await factory.getPoolId(allPools[i]);
          console.log(`  ${i + 1}. ${poolId} - ${allPools[i]}`);
        }
        if (allPools.length > 5) {
          console.log(`  ... and ${allPools.length - 5} more pools`);
        }
      }
      
      // Check roles
      console.log('\n🔐 Roles:');
      console.log('─'.repeat(60));
      
      const DEFAULT_ADMIN_ROLE = await factory.DEFAULT_ADMIN_ROLE();
      const ADMIN_ROLE = await factory.ADMIN_ROLE();
      
      const [signer] = await ethers.getSigners();
      const hasDefaultAdmin = await factory.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
      const hasAdminRole = await factory.hasRole(ADMIN_ROLE, signer.address);
      
      console.log(`Your Address: ${signer.address}`);
      console.log(`  - DEFAULT_ADMIN_ROLE: ${hasDefaultAdmin ? '✅ Yes' : '❌ No'}`);
      console.log(`  - ADMIN_ROLE: ${hasAdminRole ? '✅ Yes' : '❌ No'}`);
      
    } catch (error) {
      console.log('\n⚠️  Could not read factory state. The contract might not be initialized yet.');
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
      }
    }

    // Check if contract is verified
    console.log('\n🔗 Useful Links:');
    console.log('─'.repeat(60));
    
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;
    
    let explorerUrl = '';
    if (chainId === 8453n) {
      explorerUrl = 'https://basescan.org';
    } else if (chainId === 84532n) {
      explorerUrl = 'https://sepolia.basescan.org';
    } else if (chainId === 1n) {
      explorerUrl = 'https://etherscan.io';
    } else {
      explorerUrl = 'https://etherscan.io'; // fallback
    }
    
    console.log(`Proxy: ${explorerUrl}/address/${proxyAddress}`);
    console.log(`Implementation: ${explorerUrl}/address/${implementationAddress}`);
    console.log(`Admin: ${explorerUrl}/address/${adminAddress}`);

    console.log('\n✅ Done!\n');

  } catch (error) {
    console.error('\n❌ Error getting proxy information:');
    if (error instanceof Error) {
      console.error(error.message);
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





