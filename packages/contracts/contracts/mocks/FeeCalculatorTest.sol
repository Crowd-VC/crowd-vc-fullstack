// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/FeeCalculator.sol";

/**
 * @title FeeCalculatorTest
 * @dev Test harness contract that exposes FeeCalculator library functions for testing
 */
contract FeeCalculatorTest {
    using FeeCalculator for uint256;

    function calculatePlatformFee(uint256 amount, uint256 feePercent) external pure returns (uint256) {
        return FeeCalculator.calculatePlatformFee(amount, feePercent);
    }

    function calculateNetAmount(uint256 amount, uint256 feePercent) external pure returns (uint256) {
        return FeeCalculator.calculateNetAmount(amount, feePercent);
    }

    function calculateProportionalDistribution(
        uint256 totalAmount,
        uint256[] memory voteWeights
    ) external pure returns (uint256[] memory) {
        return FeeCalculator.calculateProportionalDistribution(totalAmount, voteWeights);
    }

    function calculateAllocationPercents(
        uint256[] memory voteWeights
    ) external pure returns (uint256[] memory) {
        return FeeCalculator.calculateAllocationPercents(voteWeights);
    }

    function calculateEarlyWithdrawalPenalty(
        uint256 amount,
        uint256 penaltyPercent
    ) external pure returns (uint256 penalty, uint256 refund) {
        return FeeCalculator.calculateEarlyWithdrawalPenalty(amount, penaltyPercent);
    }
}
