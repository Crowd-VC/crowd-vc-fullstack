// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title CrowdVCProxy
 * @dev Simple wrapper to expose ERC1967Proxy for deployment
 */
contract CrowdVCProxy is ERC1967Proxy {
    constructor(
        address implementation,
        bytes memory data
    ) ERC1967Proxy(implementation, data) {}
}

