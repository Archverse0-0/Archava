// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @notice Testnet Mock USDT token (6 decimals like real USDT) with a public faucet.
 */
contract MockUSDT is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**DECIMALS; // 1,000 USDT per claim

    mapping(address => uint256) public lastFaucetClaim;
    uint256 public constant FAUCET_COOLDOWN = 1 hours;

    event FaucetClaimed(address indexed user, uint256 amount);

    constructor(address initialOwner) ERC20("Mock Tether USD", "USDT") Ownable(initialOwner) {
        // Mint initial 1,000,000 USDT to contract deployer
        _mint(initialOwner, 1_000_000 * 10**DECIMALS);
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @notice Free public faucet for testing on Monad Testnet.
     * Anyone can claim 1,000 Mock USDT once per hour.
     */
    function faucet() external {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "Faucet cooldown active. Wait 1 hour between claims."
        );
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }

    /**
     * @notice Admin minting function for seeding initial pools or testing.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
