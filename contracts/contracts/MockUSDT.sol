// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token for testing purposes
 * This is a simple ERC20 token with 6 decimals (matching USDT standard)
 * Only use this on testnets or local networks, NEVER on mainnet
 */
contract MockUSDT is ERC20, Ownable {
    // USDT uses 6 decimals
    uint8 private constant DECIMALS = 6;

    constructor(address initialOwner) ERC20("Mock Tether USD", "mUSDT") Ownable(initialOwner) {
        // Mint initial supply to owner (e.g., 10 million tokens)
        _mint(initialOwner, 10_000_000 * 10**DECIMALS);
    }

    /**
     * @dev Returns the number of decimals used
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @dev Mint tokens to an address (for testing)
     * @param to Address to mint tokens to
     * @param amount Amount to mint (in token units, will be multiplied by decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Mint tokens with 6 decimals (convenience function)
     * @param to Address to mint tokens to
     * @param amount Amount to mint (will be treated as if it already has 6 decimals)
     * Example: mintWithDecimals(user, 1000) mints 1000 USDT (1000 * 10^6)
     */
    function mintWithDecimals(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * 10**DECIMALS);
    }

    /**
     * @dev Burn tokens from an address
     * @param from Address to burn tokens from
     * @param amount Amount to burn
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

