// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/ValidationLib.sol";

/**
 * @title ValidationLibTest
 * @dev Test harness contract that exposes ValidationLib library functions for testing
 */
contract ValidationLibTest {
    using ValidationLib for *;

    function validateAddress(address addr) external pure {
        ValidationLib.validateAddress(addr);
    }

    function validateAmount(uint256 amount) external pure {
        ValidationLib.validateAmount(amount);
    }

    function validateString(string calldata str) external pure {
        ValidationLib.validateString(str);
    }

    function validateDuration(uint256 duration, uint256 minDuration, uint256 maxDuration) external pure {
        ValidationLib.validateDuration(duration, minDuration, maxDuration);
    }

    function validateFundingGoal(uint256 goal, uint256 minGoal, uint256 maxGoal) external pure {
        ValidationLib.validateFundingGoal(goal, minGoal, maxGoal);
    }

    function validateDeadline(uint256 deadline) external view {
        ValidationLib.validateDeadline(deadline);
    }

    function validateNonEmptyArray(bytes32[] calldata arr) external pure {
        ValidationLib.validateNonEmptyArray(arr);
    }

    function validatePitchData(
        string calldata title,
        string calldata ipfsHash,
        uint256 fundingGoal,
        uint256 minGoal,
        uint256 maxGoal
    ) external pure {
        ValidationLib.validatePitchData(title, ipfsHash, fundingGoal, minGoal, maxGoal);
    }

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
    ) external pure {
        ValidationLib.validatePoolParameters(
            name,
            fundingGoal,
            votingDuration,
            fundingDuration,
            minContribution,
            minPoolGoal,
            maxPoolGoal,
            minVotingDuration,
            maxVotingDuration
        );
    }
}
