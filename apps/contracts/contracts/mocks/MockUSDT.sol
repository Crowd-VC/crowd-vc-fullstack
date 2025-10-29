// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token for testing (6 decimals like real USDT)
 */
contract MockUSDT is ERC20, Ownable {
    constructor() ERC20("Mock Tether USD", "USDT") Ownable(msg.sender) {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @dev Mint tokens for testing
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Faucet function for testing (anyone can get 10,000 USDT)
     */
    function faucet() external {
        _mint(msg.sender, 10_000 * 10**6); // 10,000 USDT
    }
}
