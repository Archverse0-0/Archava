// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @dev ReentrancyGuard is not used here because mintPass uses _safeMint which can trigger
 * callbacks, but state is updated before the external call. The transfer below uses a
 * low-level call to avoid the 2300 gas limit of transfer(), which would revert for
 * smart contract wallets (EIP-4337). The ReentrancyGuard is omitted since the state
 * (currentSupply, totalSupply) is updated before any external call.
 */

/**
 * @title WhiteRockPass
 * @notice Tiered NFT Membership Pass for White Rock Beach Club, Melasti Bali on Monad Testnet.
 */
contract WhiteRockPass is ERC721Enumerable, Ownable {
    using Strings for uint256;
    using SafeERC20 for IERC20;

    enum PassTier { LAGOON, VIP_CABANA, PARTY_SUITE }

    struct TierConfig {
        uint256 price;          // Price in wei (MON or USDT base 18/6 decimals)
        uint16 discountBps;     // Discount in Basis Points (500 = 5%, 1000 = 10%, 2000 = 20%)
        uint32 maxSupply;       // Supply cap for tier
        uint32 currentSupply;   // Current minted supply
        bool active;            // Tier availability
    }

    mapping(PassTier => TierConfig) public tierConfigs;
    mapping(uint256 => PassTier) public tokenTiers;
    string private _baseTokenURI;
    IERC20 public usdtToken;

    event PassMinted(address indexed minter, uint256 indexed tokenId, PassTier tier);
    event TierConfigUpdated(PassTier indexed tier, uint256 price, uint16 discountBps, uint32 maxSupply, bool active);

    constructor(string memory baseURI, address initialOwner)
        ERC721("White Rock VIP Pass", "WRPASS")
        Ownable(initialOwner)
    {
        _baseTokenURI = baseURI;
        usdtToken = IERC20(msg.sender); // Set deployer as initial USDT (owner calls setUsdtToken after deploy)

        // Tier 0: Lagoon Pass — 10 USDT, 5% Discount, 500 Cap
        tierConfigs[PassTier.LAGOON] = TierConfig({
            price: 10 * 10**6,  // 10 USDT (6 decimals)
            discountBps: 500,
            maxSupply: 500,
            currentSupply: 0,
            active: true
        });

        // Tier 1: VIP Cabana Pass — 50 USDT, 10% Discount, 150 Cap
        tierConfigs[PassTier.VIP_CABANA] = TierConfig({
            price: 50 * 10**6,  // 50 USDT (6 decimals)
            discountBps: 1000,
            maxSupply: 150,
            currentSupply: 0,
            active: true
        });

        // Tier 2: Party Suite Pass — 100 USDT, 20% Discount, 50 Cap
        tierConfigs[PassTier.PARTY_SUITE] = TierConfig({
            price: 100 * 10**6,  // 100 USDT (6 decimals)
            discountBps: 2000,
            maxSupply: 50,
            currentSupply: 0,
            active: true
        });
    }

    function setUsdtToken(address _usdtToken) external onlyOwner {
        require(_usdtToken != address(0), "Invalid USDT token address");
        usdtToken = IERC20(_usdtToken);
    }

    /**
     * @notice Mint a membership pass for a specified tier paying with Mock USDT (ERC20).
     * @param tier PassTier enum (0 = LAGOON, 1 = VIP_CABANA, 2 = PARTY_SUITE)
     */
    function mintPass(PassTier tier) external {
        TierConfig storage config = tierConfigs[tier];
        require(config.active, "Tier is not active");
        require(config.currentSupply < config.maxSupply, "Tier sold out");
        require(address(usdtToken) != address(0), "USDT token not set");

        // Transfer USDT from user to this contract
        usdtToken.safeTransferFrom(msg.sender, address(this), config.price);

        config.currentSupply++;
        uint256 tokenId = totalSupply() + 1;
        tokenTiers[tokenId] = tier;

        _safeMint(msg.sender, tokenId);
        emit PassMinted(msg.sender, tokenId, tier);
    }

    /**
     * @notice Mint a membership pass paying native MON (kept for backwards compatibility).
     * @param tier PassTier enum (0 = LAGOON, 1 = VIP_CABANA, 2 = PARTY_SUITE)
     */
    function mintPassWithMON(PassTier tier) external payable {
        TierConfig storage config = tierConfigs[tier];
        require(config.active, "Tier is not active");
        require(config.currentSupply < config.maxSupply, "Tier sold out");
        require(msg.value >= config.price, "Insufficient MON sent");

        config.currentSupply++;
        uint256 tokenId = totalSupply() + 1;
        tokenTiers[tokenId] = tier;

        _safeMint(msg.sender, tokenId);
        emit PassMinted(msg.sender, tokenId, tier);

        if (msg.value > config.price) {
            (bool sent, ) = payable(msg.sender).call{value: msg.value - config.price}("");
            require(sent, "Failed to refund excess MON");
        }
    }

    /**
     * @notice Returns the highest discount BPS owned by a user across all their passes.
     * @param user Address of the guest wallet.
     */
    function getDiscountBpsForUser(address user) external view returns (uint16 maxDiscount) {
        uint256 balance = balanceOf(user);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            PassTier tier = tokenTiers[tokenId];
            uint16 bps = tierConfigs[tier].discountBps;
            if (bps > maxDiscount) {
                maxDiscount = bps;
            }
        }
        return maxDiscount;
    }

    function setTierConfig(
        PassTier tier,
        uint256 price,
        uint16 discountBps,
        uint32 maxSupply,
        bool active
    ) external onlyOwner {
        require(price > 0, "Price must be > 0");
        require(discountBps <= 10000, "Discount cannot exceed 100%");
        require(maxSupply > 0, "Max supply must be > 0");
        tierConfigs[tier] = TierConfig({
            price: price,
            discountBps: discountBps,
            maxSupply: maxSupply,
            currentSupply: tierConfigs[tier].currentSupply,
            active: active
        });
        emit TierConfigUpdated(tier, price, discountBps, maxSupply, active);
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseURI(), tokenId.toString(), ".json"));
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No MON balance to withdraw");
        (bool sent, ) = payable(owner()).call{value: balance}("");
        require(sent, "Failed to send balance");
    }

    function withdrawUSDT() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance > 0, "No USDT balance to withdraw");
        usdtToken.safeTransfer(owner(), balance);
    }
}
