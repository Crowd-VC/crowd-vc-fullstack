// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title FeeCalculator
 * @dev Library for calculating fees and distributions
 */
library FeeCalculator {
    uint256 private constant BASIS_POINTS = 10000; // 100% = 10000 basis points
    uint256 private constant MAX_FEE = 1000; // Max 10% platform fee

    error FeeTooHigh(uint256 fee);
    error InvalidPercentage(uint256 percentage);

    /**
     * @dev Calculate platform fee from an amount
     * @param amount The total amount
     * @param feePercent Fee in basis points (500 = 5%)
     * @return fee The calculated fee amount
     */
    function calculatePlatformFee(uint256 amount, uint256 feePercent) internal pure returns (uint256) {
        if (feePercent > MAX_FEE) revert FeeTooHigh(feePercent);
        return (amount * feePercent) / BASIS_POINTS;
    }

    /**
     * @dev Calculate net amount after deducting fee
     * @param amount The total amount
     * @param feePercent Fee in basis points
     * @return net The amount after fee deduction
     */
    function calculateNetAmount(uint256 amount, uint256 feePercent) internal pure returns (uint256) {
        uint256 fee = calculatePlatformFee(amount, feePercent);
        return amount - fee;
    }

    /**
     * @dev Calculate proportional distribution among winners
     * @param totalAmount Total amount to distribute
     * @param voteWeights Array of vote weights for each winner
     * @return distributions Array of amounts for each winner
     */
    function calculateProportionalDistribution(
        uint256 totalAmount,
        uint256[] memory voteWeights
    ) internal pure returns (uint256[] memory) {
        uint256 totalVotes = 0;
        uint256 length = voteWeights.length;

        // Calculate total votes
        for (uint256 i = 0; i < length; i++) {
            totalVotes += voteWeights[i];
        }

        require(totalVotes > 0, "No votes to distribute");

        uint256[] memory distributions = new uint256[](length);
        uint256 distributed = 0;

        // Calculate proportional amounts (allocate to last winner any rounding dust)
        for (uint256 i = 0; i < length - 1; i++) {
            distributions[i] = (totalAmount * voteWeights[i]) / totalVotes;
            distributed += distributions[i];
        }

        // Last winner gets remaining (handles rounding)
        distributions[length - 1] = totalAmount - distributed;

        return distributions;
    }

    /**
     * @dev Calculate allocation percentages in basis points
     * @param voteWeights Array of vote weights
     * @return percentages Array of percentages in basis points
     */
    function calculateAllocationPercents(
        uint256[] memory voteWeights
    ) internal pure returns (uint256[] memory) {
        uint256 totalVotes = 0;
        uint256 length = voteWeights.length;

        for (uint256 i = 0; i < length; i++) {
            totalVotes += voteWeights[i];
        }

        require(totalVotes > 0, "No votes");

        uint256[] memory percentages = new uint256[](length);
        uint256 totalPercent = 0;

        for (uint256 i = 0; i < length - 1; i++) {
            percentages[i] = (voteWeights[i] * BASIS_POINTS) / totalVotes;
            totalPercent += percentages[i];
        }

        // Last gets remainder to ensure total = 10000
        percentages[length - 1] = BASIS_POINTS - totalPercent;

        return percentages;
    }

    /**
     * @dev Calculate early withdrawal penalty
     * @param amount The contribution amount
     * @param penaltyPercent Penalty in basis points (1000 = 10%)
     * @return penalty The penalty amount
     * @return refund The refund amount after penalty
     */
    function calculateEarlyWithdrawalPenalty(
        uint256 amount,
        uint256 penaltyPercent
    ) internal pure returns (uint256 penalty, uint256 refund) {
        if (penaltyPercent > BASIS_POINTS) revert InvalidPercentage(penaltyPercent);
        penalty = (amount * penaltyPercent) / BASIS_POINTS;
        refund = amount - penalty;
        return (penalty, refund);
    }
}
