// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CrowdVCTreasury
 * @notice Holds platform fees collected from various CrowdVC pools.
 * @dev Optimized with Custom Errors for gas efficiency.
 */
contract CrowdVCTreasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    /// @notice Thrown when the target recipient address is the zero address
    error InvalidRecipient();

    /// @notice Thrown when attempting to withdraw more native ETH than the contract holds
    /// @param available The current balance of the contract
    /// @param requested The amount requested for withdrawal
    error InsufficientBalance(uint256 available, uint256 requested);

    /// @notice Thrown when the native ETH transfer call fails
    error NativeTransferFailed();

    /// @notice Thrown when attempting to withdraw more tokens than the contract holds
    /// @param available The current token balance
    /// @param requested The amount requested
    error InsufficientTokenBalance(uint256 available, uint256 requested);

    /// @notice Thrown when trying to rescue tokens but the balance is zero
    error NoTokensToRescue();

    // --- Events ---
    event NativeReceived(address indexed sender, uint256 amount);
    event NativeWithdrawn(address indexed recipient, uint256 amount);
    event TokenWithdrawn(address indexed token, address indexed recipient, uint256 amount);

    // --- Constructor ---
    constructor(address initialOwner) Ownable(initialOwner) {}

    // --- Receive Logic ---
    
    receive() external payable {
        emit NativeReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        emit NativeReceived(msg.sender, msg.value);
    }

    // --- Withdrawal Logic (Admin Only) ---

    /**
     * @notice Withdraw native blockchain currency (ETH, BNB, MATIC).
     */
    function withdrawNative(address payable _recipient, uint256 _amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        if (_recipient == address(0)) {
            revert InvalidRecipient();
        }
        
        if (address(this).balance < _amount) {
            revert InsufficientBalance(address(this).balance, _amount);
        }

        (bool success, ) = _recipient.call{value: _amount}("");
        
        if (!success) {
            revert NativeTransferFailed();
        }

        emit NativeWithdrawn(_recipient, _amount);
    }

    /**
     * @notice Withdraw ERC20 tokens (USDC, USDT, etc.).
     */
    function withdrawToken(address _token, address _recipient, uint256 _amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        if (_recipient == address(0)) {
            revert InvalidRecipient();
        }
        
        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));
        
        if (balance < _amount) {
            revert InsufficientTokenBalance(balance, _amount);
        }

        token.safeTransfer(_recipient, _amount);

        emit TokenWithdrawn(_token, _recipient, _amount);
    }

    /**
     * @notice Emergency function to withdraw all balance of a specific token.
     */
    function rescueAllTokens(address _token, address _recipient) 
        external 
        onlyOwner 
        nonReentrant 
    {
        if (_recipient == address(0)) {
            revert InvalidRecipient();
        }

        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));
        
        if (balance == 0) {
            revert NoTokensToRescue();
        }

        token.safeTransfer(_recipient, balance);

        emit TokenWithdrawn(_token, _recipient, balance);
    }
}