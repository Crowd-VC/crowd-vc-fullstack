#!/bin/bash

###############################################################################
# CrowdVC Contract Deployment Script
# 
# Simple shell script wrapper for the TypeScript deployment script
# Provides a convenient way to deploy contracts from the command line
#
# Usage:
#   ./scripts/deploy.sh [network] [options]
#
# Examples:
#   ./scripts/deploy.sh sepolia
#   ./scripts/deploy.sh baseSepolia --with-mocks
#   ./scripts/deploy.sh baseMainnet --verify
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Function to print colored output
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print help
print_help() {
    cat << EOF
${CYAN}CrowdVC Contract Deployment Script${NC}

${GREEN}Usage:${NC}
  ./scripts/deploy.sh [network] [options]

${GREEN}Networks:${NC}
  hardhat       Local Hardhat network (default)
  sepolia       Sepolia testnet
  baseSepolia   Base Sepolia testnet
  baseMainnet   Base mainnet

${GREEN}Options:${NC}
  --with-mocks, -m    Deploy mock tokens before factory
  --verify, -v        Verify contracts on Etherscan
  --clean, -c         Clean build artifacts before compilation
  --help, -h          Show this help message

${GREEN}Examples:${NC}
  # Deploy to Sepolia
  ./scripts/deploy.sh sepolia

  # Deploy to Base Sepolia with mock tokens
  ./scripts/deploy.sh baseSepolia --with-mocks

  # Deploy and verify on Base Mainnet
  ./scripts/deploy.sh baseMainnet --verify

  # Clean and deploy to local network
  ./scripts/deploy.sh hardhat --clean

  # Multiple options
  ./scripts/deploy.sh sepolia --verify --clean

EOF
}

# Check if help is requested
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    print_help
    exit 0
fi

# Parse network argument
NETWORK="${1:-hardhat}"
shift || true

# Check if we're in the right directory
if [[ ! -f "$PROJECT_DIR/hardhat.config.ts" ]]; then
    log_error "hardhat.config.ts not found. Please run this script from the contracts package directory."
    exit 1
fi

# Change to project directory
cd "$PROJECT_DIR"

log_info "Deploying to network: $NETWORK"

# Parse options and set environment variables
export DEPLOY_MOCKS=false
export DEPLOY_VERIFY=false
export DEPLOY_CLEAN=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --with-mocks|-m)
            export DEPLOY_MOCKS=true
            shift
            ;;
        --verify|-v)
            export DEPLOY_VERIFY=true
            shift
            ;;
        --clean|-c)
            export DEPLOY_CLEAN=true
            shift
            ;;
        --parameters|-p)
            export DEPLOY_PARAMETERS="$2"
            shift 2
            ;;
        *)
            log_warning "Unknown option: $1"
            shift
            ;;
    esac
done

# Build the command
CMD="pnpm hardhat run --network $NETWORK scripts/deploy-and-update.ts"

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    log_error "pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Run the deployment
log_info "Running deployment command..."
echo -e "${CYAN}$CMD${NC}"
if [ "$DEPLOY_MOCKS" = "true" ]; then
    echo -e "  ${YELLOW}DEPLOY_MOCKS=true${NC}"
fi
if [ "$DEPLOY_VERIFY" = "true" ]; then
    echo -e "  ${YELLOW}DEPLOY_VERIFY=true${NC}"
fi
if [ "$DEPLOY_CLEAN" = "true" ]; then
    echo -e "  ${YELLOW}DEPLOY_CLEAN=true${NC}"
fi
if [ -n "$DEPLOY_PARAMETERS" ]; then
    echo -e "  ${YELLOW}DEPLOY_PARAMETERS=$DEPLOY_PARAMETERS${NC}"
fi
echo ""

eval $CMD

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    log_success "Deployment script completed successfully!"
else
    log_error "Deployment script failed with exit code: $EXIT_CODE"
    exit $EXIT_CODE
fi

