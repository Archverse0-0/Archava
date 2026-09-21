// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title WhiteRockPass
 * @notice Tiered NFT Membership Pass for White Rock Beach Club on Monad Testnet.
 */
contract WhiteRockPass is ERC721Enumerable, Ownable {
    using Strings for uint256;
    using SafeERC20 for IERC20;

    enum PassTier { LAGOON, VIP_CABANA, PARTY_SUITE }

    struct TierConfig {
        uint256 price;          // USDT price in 6 decimals
        uint16 discountBps;
        uint32 maxSupply;
        uint32 currentSupply;
        bool active;
    }

    mapping(PassTier => TierConfig) public tierConfigs;
    mapping(PassTier => uint256) public nativePriceMON;
    mapping(uint256 => PassTier) public tokenTiers;
    string private _baseTokenURI;
    IERC20 public usdtToken;

    event PassMinted(address indexed minter, uint256 indexed tokenId, PassTier tier);
    event TierConfigUpdated(PassTier indexed tier, uint256 price, uint16 discountBps, uint32 maxSupply, bool active);
    event NativePriceUpdated(PassTier indexed tier, uint256 priceMON);
    event UsdtTokenUpdated(address indexed token);

    constructor(string memory baseURI, address initialOwner)
        ERC721("White Rock VIP Pass", "WRPASS")
        Ownable(initialOwner)
    {
        require(initialOwner != address(0), "Invalid owner address");
        _baseTokenURI = baseURI;

        tierConfigs[PassTier.LAGOON] = TierConfig({
            price: 10 * 10**6,
            discountBps: 500,
            maxSupply: 500,
            currentSupply: 0,
            active: true
        });

        tierConfigs[PassTier.VIP_CABANA] = TierConfig({
            price: 50 * 10**6,
            discountBps: 1000,
            maxSupply: 150,
            currentSupply: 0,
            active: true
        });

        tierConfigs[PassTier.PARTY_SUITE] = TierConfig({
            price: 100 * 10**6,
            discountBps: 2000,
            maxSupply: 50,
            currentSupply: 0,
            active: true
        });

        // Native MON minting is intentionally disabled until the owner explicitly
        // configures a MON price for each tier. This prevents treating a 6-decimal
        // USDT price as wei.
    }

    /// @dev Bookings are always settled in the token recorded on the booking
    /// itself, so repointing `usdtToken` never strands an existing booking. A
    /// balance of a superseded token is recoverable through `withdrawToken`.
    function setUsdtToken(address _usdtToken) external onlyOwner {
        require(_usdtToken != address(0), "Invalid USDT token address");
        usdtToken = IERC20(_usdtToken);
        emit UsdtTokenUpdated(_usdtToken);
    }

    function mintPass(PassTier tier) external {
        TierConfig storage config = tierConfigs[tier];
        require(config.active, "Tier is not active");
        require(config.currentSupply < config.maxSupply, "Tier sold out");
        require(address(usdtToken) != address(0), "USDT token not set");

        usdtToken.safeTransferFrom(msg.sender, address(this), config.price);

        config.currentSupply++;
        uint256 tokenId = totalSupply() + 1;
        tokenTiers[tokenId] = tier;
        _safeMint(msg.sender, tokenId);

        emit PassMinted(msg.sender, tokenId, tier);
    }

    function mintPassWithMON(PassTier tier) external payable {
        TierConfig storage config = tierConfigs[tier];
        uint256 nativePrice = nativePriceMON[tier];

        require(config.active, "Tier is not active");
        require(config.currentSupply < config.maxSupply, "Tier sold out");
        require(nativePrice > 0, "Native MON mint disabled");
        require(msg.value >= nativePrice, "Insufficient MON sent");

        config.currentSupply++;
        uint256 tokenId = totalSupply() + 1;
        tokenTiers[tokenId] = tier;
        _safeMint(msg.sender, tokenId);

        emit PassMinted(msg.sender, tokenId, tier);

        if (msg.value > nativePrice) {
            (bool sent, ) = payable(msg.sender).call{value: msg.value - nativePrice}("");
            require(sent, "Failed to refund excess MON");
        }
    }

    function setNativePriceMON(PassTier tier, uint256 priceMON) external onlyOwner {
        require(priceMON > 0, "Price must be > 0");
        nativePriceMON[tier] = priceMON;
        emit NativePriceUpdated(tier, priceMON);
    }

    function getDiscountBpsForUser(address user) external view returns (uint16 maxDiscount) {
        uint256 balance = balanceOf(user);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            PassTier tier = tokenTiers[tokenId];
            uint16 bps = tierConfigs[tier].discountBps;
            if (bps > maxDiscount) maxDiscount = bps;
        }
    }

    function setTierConfig(
        PassTier tier,
        uint256 price,
        uint16 discountBps,
        uint32 maxSupply,
        bool active
    ) external onlyOwner {
        require(price > 0, "Price must be > 0");
        require(discountBps <= 10_000, "Discount cannot exceed 100%");
        require(maxSupply > 0, "Max supply must be > 0");
        require(maxSupply >= tierConfigs[tier].currentSupply, "Max supply below minted supply");

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
        require(address(usdtToken) != address(0), "USDT token not set");
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance > 0, "No USDT balance to withdraw");
        usdtToken.safeTransfer(owner(), balance);
    }

    /// @notice Sweeps an arbitrary ERC-20 balance to the owner.
    /// @dev `setUsdtToken` repoints the contract at a new token, so any balance
    /// left of the previous one would be unreachable by `withdrawUSDT`, which
    /// only ever reads the *current* token. This escape hatch keeps a token
    /// migration from permanently stranding funds (and also recovers tokens sent
    /// here by mistake).
    function withdrawToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No token balance to withdraw");
        IERC20(token).safeTransfer(owner(), balance);
    }
}
