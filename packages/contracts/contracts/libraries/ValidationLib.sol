// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ValidationLib
 * @dev Library for input validation
 */
library ValidationLib {
    error InvalidAddress();
    error InvalidAmount();
    error InvalidString();
    error InvalidDuration();
    error InvalidFundingGoal();
    error DeadlineInPast();
    error EmptyArray();

    /**
     * @dev Validate address is not zero
     */
    function validateAddress(address addr) internal pure {
        if (addr == address(0)) revert InvalidAddress();
    }

    /**
     * @dev Validate amount is greater than zero
     */
    function validateAmount(uint256 amount) internal pure {
        if (amount == 0) revert InvalidAmount();
    }

    /**
     * @dev Validate string is not empty
     */
    function validateString(string calldata str) internal pure {
        if (bytes(str).length == 0) revert InvalidString();
    }

    /**
     * @dev Validate duration is reasonable (between min and max)
     */
    function validateDuration(uint256 duration, uint256 minDuration, uint256 maxDuration) internal pure {
        if (duration < minDuration || duration > maxDuration) revert InvalidDuration();
    }

    /**
     * @dev Validate funding goal is within acceptable range
     */
    function validateFundingGoal(uint256 goal, uint256 minGoal, uint256 maxGoal) internal pure {
        if (goal < minGoal || goal > maxGoal) revert InvalidFundingGoal();
    }

    /**
     * @dev Validate deadline is in the future
     */
    function validateDeadline(uint256 deadline) internal view {
        if (deadline <= block.timestamp) revert DeadlineInPast();
    }

    /**
     * @dev Validate array is not empty
     */
    function validateNonEmptyArray(bytes32[] calldata arr) internal pure {
        if (arr.length == 0) revert EmptyArray();
    }

    /**
     * @dev Validate pitch submission data
     */
    function validatePitchData(
        string calldata title,
        string calldata ipfsHash,
        uint256 fundingGoal,
        uint256 minGoal,
        uint256 maxGoal
    ) internal pure {
        validateString(title);
        validateString(ipfsHash);
        validateFundingGoal(fundingGoal, minGoal, maxGoal);
    }

    /**
     * @dev Validate pool creation parameters
     */
    function validatePoolParameters(
        string calldata name,
        uint256 fundingGoal,
        uint256 votingDuration,
        uint256 fundingDuration,
        uint256 minContribution,
        uint256 minPoolGoal,
        uint256 maxPoolGoal,
        uint256 minVotingDuration,
        uint256 maxVotingDuration
    ) internal pure {
        validateString(name);
        validateFundingGoal(fundingGoal, minPoolGoal, maxPoolGoal);
        validateDuration(votingDuration, minVotingDuration, maxVotingDuration);
        validateDuration(fundingDuration, minVotingDuration, maxVotingDuration);
        validateAmount(minContribution);
    }
}
