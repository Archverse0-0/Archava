// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title WhiteRockVIPPass NFT
 * @notice Official VIP Daybed & Suite NFT Pass for White Rock Beach Club Melasti, Bali.
 * @dev Deployed on Monad Testnet (Chain ID: 10143)
 */
interface IERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event VIPPassMinted(uint256 indexed tokenId, address indexed owner, string daybedType, string visitDate);
}

contract WhiteRockVIPPass is IERC721 {
    string public name = "White Rock VIP Pass";
    string public symbol = "WR-VIP";
    uint256 public totalSupply;
    
    // Chain Info: Monad Testnet (10143)
    uint256 public constant MONAD_CHAIN_ID = 10143;
    address public owner;

    struct VIPPass {
        uint256 tokenId;
        string daybedType;
        string visitDate;
        uint256 mintedAt;
    }

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256[]) public userPasses;
    mapping(uint256 => VIPPass) public passDetails;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Mint a VIP Daybed Pass NFT on Monad Testnet
     */
    function mintVIPPass(
        address to, 
        string memory daybedType, 
        string memory visitDate
    ) external payable returns (uint256) {
        totalSupply++;
        uint256 newTokenId = totalSupply + 1000; // Passes start from Token ID 1001

        ownerOf[newTokenId] = to;
        userPasses[to].push(newTokenId);
        
        passDetails[newTokenId] = VIPPass({
            tokenId: newTokenId,
            daybedType: daybedType,
            visitDate: visitDate,
            mintedAt: block.timestamp
        });

        emit Transfer(address(0), to, newTokenId);
        emit VIPPassMinted(newTokenId, to, daybedType, visitDate);

        return newTokenId;
    }

    function getUserPasses(address user) external view returns (uint256[] memory) {
        return userPasses[user];
    }
}
