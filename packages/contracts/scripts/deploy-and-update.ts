/**
 * Comprehensive Deployment Script
 *
 * This script handles the full deployment workflow:
 * 1. Compiles contracts
 * 2. Deploys contracts using Hardhat Ignition
 * 3. Updates the addresses file
 *
 * Usage:
 *   pnpm deploy:sepolia                                             # Deploy to Sepolia
 *   pnpm deploy:baseSepolia                                         # Deploy to Base Sepolia with mocks
 *   pnpm hardhat run --network sepolia scripts/deploy-and-update.ts # Direct usage
 *   pnpm hardhat run --network sepolia scripts/deploy-and-update.ts -- --verify --clean # With options
 */

import { network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import { Address } from 'viem';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ConstructorArgs = {
  FactoryModule: {
    treasury: Address;
    platformFee: number;
    usdt: Address;
    usdc: Address;
  };
};

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

interface DeploymentConfig {
  network: string;
  deployMocks: boolean;
  parametersFile?: string;
  verify: boolean;
  clean: boolean;
}

async function parseConfig(): Promise<DeploymentConfig> {
  // Connect to get the current network info
  const { networkName } = await network.connect();

  const config: DeploymentConfig = {
    network: networkName || 'hardhat',
    deployMocks: process.env.DEPLOY_MOCKS === 'true',
    verify: process.env.DEPLOY_VERIFY === 'true',
    clean: process.env.DEPLOY_CLEAN === 'true',
    parametersFile: process.env.DEPLOY_PARAMETERS,
  };

  // Show help if requested
  if (process.env.DEPLOY_HELP === 'true') {
    printHelp();
    process.exit(0);
  }

  return config;
}

function printHelp() {
  console.log(`
${colors.bright}CrowdVC Deployment Script${colors.reset}

${colors.bright}Usage:${colors.reset}
  pnpm deploy:hardhat               # Deploy to local Hardhat network
  pnpm deploy:sepolia               # Deploy to Sepolia testnet
  pnpm deploy:baseSepolia           # Deploy to Base Sepolia with mocks
  pnpm deploy:baseMainnet           # Deploy to Base Mainnet
  
  Or with environment variables:
  DEPLOY_VERIFY=true pnpm hardhat run --network sepolia scripts/deploy-and-update.ts

${colors.bright}Environment Variables:${colors.reset}
  DEPLOY_MOCKS=true         Deploy mock tokens before factory (for testnets)
  DEPLOY_PARAMETERS=<path>  Custom parameters file path
  DEPLOY_VERIFY=true        Verify contracts on Etherscan after deployment
  DEPLOY_CLEAN=true         Clean build artifacts before compilation
  DEPLOY_HELP=true          Show this help message

${colors.bright}Examples:${colors.reset}
  # Deploy to local Hardhat network
  pnpm deploy:hardhat

  # Deploy to Sepolia testnet
  pnpm deploy:sepolia

  # Deploy to Base Sepolia with mock tokens
  pnpm deploy:baseSepolia

  # Deploy with verification (using environment variable)
  DEPLOY_VERIFY=true pnpm hardhat run --network sepolia scripts/deploy-and-update.ts

  # Deploy with clean build
  DEPLOY_CLEAN=true pnpm hardhat run --network sepolia scripts/deploy-and-update.ts

  # Deploy with custom parameters
  DEPLOY_PARAMETERS=./custom.json pnpm hardhat run --network sepolia scripts/deploy-and-update.ts

  # Deploy with multiple options
  DEPLOY_VERIFY=true DEPLOY_CLEAN=true pnpm hardhat run --network sepolia scripts/deploy-and-update.ts
  `);
}

async function runCommand(
  command: string,
  description: string,
  options?: { cwd?: string; showOutput?: boolean },
): Promise<{ stdout: string; stderr: string }> {
  logInfo(`Running: ${description}`);
  console.log(`  Command: ${colors.yellow}${command}${colors.reset}`);

  try {
    const result = await execAsync(command, {
      cwd: options?.cwd || process.cwd(),
      env: process.env,
    });

    if (options?.showOutput && result.stdout) {
      console.log(result.stdout);
    }

    logSuccess(`Completed: ${description}`);
    return result;
  } catch (error: any) {
    logError(`Failed: ${description}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    throw error;
  }
}

function getParametersFile(
  network: string,
  customPath?: string,
): string | null {
  if (customPath) {
    return customPath;
  }

  const paramFiles: Record<string, string> = {
    sepolia: 'ignition/parameters/sepolia.json',
    baseSepolia: 'ignition/parameters/baseSepolia.json',
    baseMainnet: 'ignition/parameters/baseMainnet.json',
  };

  return paramFiles[network] || null;
}

async function checkNetwork(network: string): Promise<void> {
  logInfo(`Checking network configuration for: ${network}`);

  const hardhatConfigPath = path.join(__dirname, '../hardhat.config.ts');
  const hardhatConfig = fs.readFileSync(hardhatConfigPath, 'utf-8');

  if (!hardhatConfig.includes(`${network}:`)) {
    logWarning(`Network '${network}' not found in hardhat.config.ts`);
    logWarning('Make sure the network is properly configured');
  } else {
    logSuccess(`Network '${network}' is configured`);
  }
}

async function verifyContracts(
  network: string,
  deploymentPath: string,
  constructorArgsPath: string,
): Promise<void> {
  logSection('🔍 Verifying Contracts on Etherscan');
  const { FactoryModule }: ConstructorArgs = await JSON.parse(
    readFileSync(path.join(constructorArgsPath, `${network}.json`), 'utf-8'),
  );
  try {
    // Read deployed addresses
    const addressesPath = path.join(deploymentPath, 'deployed_addresses.json');
    if (!fs.existsSync(addressesPath)) {
      logWarning('No deployed_addresses.json found, skipping verification');
      return;
    }

    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf-8'));

    const contructorArgs = [
      addresses['FactoryModule#CrowdVCPool_Implementation'],
      FactoryModule.treasury,
      FactoryModule.platformFee,
      FactoryModule.usdt,
      FactoryModule.usdc,
    ].join(' ');

    // Verify Factory
    if (addresses['FactoryModule#CrowdVCFactory']) {
      await runCommand(
        `pnpm hardhat verify --network ${network} ${addresses['FactoryModule#CrowdVCFactory']} ${contructorArgs}`,
        'Verifying CrowdVCFactory',
        { showOutput: true },
      );
    }

    // Verify Pool Implementation
    if (addresses['FactoryModule#CrowdVCPool_Implementation']) {
      await runCommand(
        `pnpm hardhat verify --network ${network} ${addresses['FactoryModule#CrowdVCPool_Implementation']}`,
        'Verifying CrowdVCPool Implementation',
        { showOutput: true },
      );
    }

    logSuccess('Contract verification completed');
  } catch (error) {
    logWarning(
      'Contract verification failed (this is normal if already verified)',
    );
  }
}

async function main() {
  const startTime = Date.now();

  logSection('🚀 CrowdVC Deployment Script');

  const config = await parseConfig();

  console.log('\n' + colors.bright + 'Configuration:' + colors.reset);
  console.log(`  Network:      ${colors.cyan}${config.network}${colors.reset}`);
  console.log(
    `  Deploy Mocks: ${colors.cyan}${config.deployMocks}${colors.reset}`,
  );
  console.log(`  Verify:       ${colors.cyan}${config.verify}${colors.reset}`);
  console.log(`  Clean Build:  ${colors.cyan}${config.clean}${colors.reset}`);

  const parametersFile = getParametersFile(
    config.network,
    config.parametersFile,
  );
  if (parametersFile) {
    console.log(
      `  Parameters:   ${colors.cyan}${parametersFile}${colors.reset}`,
    );
  }

  try {
    // Step 0: Check network configuration
    await checkNetwork(config.network);

    // Step 1: Clean (optional)
    if (config.clean) {
      logSection('🧹 Cleaning Build Artifacts');
      await runCommand('pnpm hardhat clean', 'Cleaning build artifacts');
    }

    // Step 2: Compile contracts
    logSection('🔨 Compiling Contracts');
    await runCommand('pnpm hardhat compile', 'Compiling contracts', {
      showOutput: true,
    });

    // Step 3: Deploy mock tokens (if requested)
    if (config.deployMocks) {
      logSection('🪙 Deploying Mock Tokens');
      const mockDeployCmd = `pnpm hardhat ignition deploy ignition/modules/MockTokens.ts --network ${config.network}`;
      await runCommand(mockDeployCmd, 'Deploying mock USDT and USDC', {
        showOutput: true,
      });

      logWarning(
        'Mock tokens deployed! Please update your parameters file with the new token addresses.',
      );
      logInfo('You can find the addresses in the deployment output above.');
    }

    // Step 4: Deploy factory contracts
    logSection('🏭 Deploying Factory Contracts');
    let deployCmd = `echo "y" | pnpm hardhat ignition deploy ignition/modules/Factory.ts --network ${config.network}`;

    if (parametersFile) {
      deployCmd += ` --parameters ${parametersFile}`;
    }

    await runCommand(deployCmd, 'Deploying CrowdVC Factory and Pool', {
      showOutput: true,
    });

    // Step 5: Verify contracts (if requested and not hardhat)
    if (config.verify && config.network !== 'hardhat') {
      const chainId = getChainId(config.network);
      const deploymentPath = path.join(
        __dirname,
        `../ignition/deployments/chain-${chainId}`,
      );
      const constructorArgsPath = path.join(
        __dirname,
        `../ignition/parameters`,
      );
      await verifyContracts(
        config.network,
        deploymentPath,
        constructorArgsPath,
      );
    }

    // Step 6: Generate addresses file
    logSection('📝 Generating Addresses File');
    await runCommand(
      'pnpm hardhat run scripts/generateAddresses.ts',
      'Generating TypeScript addresses file',
      { showOutput: true },
    );

    // Success summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logSection('🎉 Deployment Complete!');
    logSuccess(`Total time: ${duration}s`);

    console.log('\n' + colors.bright + 'Next Steps:' + colors.reset);
    console.log(
      `  1. Check the generated addresses in: ${colors.cyan}packages/abis/src/addresses.ts${colors.reset}`,
    );
    console.log(
      `  2. View deployment artifacts in: ${colors.cyan}packages/contracts/ignition/deployments/${colors.reset}`,
    );

    if (config.deployMocks) {
      console.log(`  3. Update your parameters file with mock token addresses`);
    }

    if (!config.verify && config.network !== 'hardhat') {
      console.log(
        `  4. Optionally verify contracts with: ${colors.cyan}pnpm deploy-and-update --network ${config.network} --verify${colors.reset}`,
      );
    }
  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logSection('💥 Deployment Failed');
    logError(`Error after ${duration}s: ${error.message}`);
    process.exit(1);
  }
}

function getChainId(network: string): number {
  const chainIds: Record<string, number> = {
    hardhat: 31337,
    sepolia: 11155111,
    baseSepolia: 84532,
    baseMainnet: 8453,
  };
  return chainIds[network] || 0;
}

// Run the script
main().catch((error) => {
  logError(`Unhandled error: ${error.message}`);
  process.exit(1);
});
