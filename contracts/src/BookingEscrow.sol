// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IWhiteRockPass {
    function getDiscountBpsForUser(address user) external view returns (uint16);
}

/**
 * @title BookingEscrow
 * @notice Handles daybed reservation deposits in native MON or Mock USDT, 24-hour cancellation refunds, and AI Agent EIP-712 intent execution.
 */
contract BookingEscrow is ReentrancyGuard, Ownable, EIP712 {
    using SafeERC20 for IERC20;

    bytes32 public constant BOOKING_INTENT_TYPEHASH = keccak256(
        "BookingIntent(address guest,uint8 daybedType,uint64 visitTimestamp,uint256 depositAmount,address paymentToken,uint256 nonce,uint256 deadline)"
    );

    struct Booking {
        uint256 bookingId;
        address guest;
        uint8 daybedType;     // 0: Lagoon, 1: VIP Cabana, 2: Party Suite, 3: Single Sofa
        uint64 visitTimestamp;// Unix timestamp for visit date (00:00 UTC)
        uint256 depositAmount;// Deposited MON (18 dec) or USDT (6 dec) amount
        address paymentToken; // address(0) for native MON, or ERC20 address (e.g. MockUSDT)
        bool checkedIn;
        bool cancelled;
        bool settled;
    }

    IWhiteRockPass public immutable passContract;
    IERC20 public usdtToken;
    uint256 public nextBookingId = 1;

    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public userBookingIds;
    mapping(address => uint256) public nonces;

    // Base deposit in MON (18 dec) for daybed types: [Lagoon, VIP Cabana, Party Suite, Single Sofa]
    uint256[4] public baseMinSpendMON = [
        0.01 ether,  // Lagoon Bed (0.01 MON)
        0.05 ether,  // VIP Cabana (0.05 MON)
        0.10 ether,  // Party Executive Suite (0.10 MON)
        0.005 ether  // Single Sofa (0.005 MON)
    ];

    // Base deposit in Mock USDT (6 dec): [Lagoon = 30 USDT, VIP Cabana = 150 USDT, Party Suite = 300 USDT, Single Sofa = 15 USDT]
    uint256[4] public baseMinSpendUSDT = [
        30 * 10**6,  // Lagoon Bed (30 USDT)
        150 * 10**6, // VIP Cabana (150 USDT)
        300 * 10**6, // Party Executive Suite (300 USDT)
        15 * 10**6   // Single Sofa (15 USDT)
    ];

    event BookingCreated(
        uint256 indexed bookingId,
        address indexed guest,
        uint8 daybedType,
        uint64 visitTimestamp,
        uint256 depositAmount,
        address paymentToken
    );
    event CheckedIn(uint256 indexed bookingId, address indexed guest, uint256 timestamp);
    event BookingCancelled(uint256 indexed bookingId, address indexed guest, uint256 refundAmount);
    event BookingSettled(uint256 indexed bookingId, address venueOwner, uint256 amount);

    error InvalidDeposit();
    error DeadlineExpired();
    error InvalidSignature();
    error BookingNotFound();
    error AlreadyProcessed();
    error CancellationPeriodExpired();
    error NotGuest();

    constructor(address _passContract, address _usdtToken, address initialOwner)
        EIP712("WhiteRockBooking", "1")
        Ownable(initialOwner)
    {
        require(_passContract != address(0), "Invalid pass contract address");
        require(initialOwner != address(0), "Invalid owner address");
        passContract = IWhiteRockPass(_passContract);
        usdtToken = IERC20(_usdtToken);
    }

    function setUsdtToken(address _usdtToken) external onlyOwner {
        require(_usdtToken != address(0), "Invalid USDT token address");
        usdtToken = IERC20(_usdtToken);
    }

    /**
     * @notice Calculates required deposit after inspecting user's NFT membership discount on-chain.
     */
    function calculateDeposit(address guest, uint8 daybedType, address token) public view returns (uint256) {
        require(daybedType < 4, "Invalid daybed type");
        uint256 baseAmount = (token == address(0)) ? baseMinSpendMON[daybedType] : baseMinSpendUSDT[daybedType];

        if (address(passContract) != address(0)) {
            uint16 discountBps = passContract.getDiscountBpsForUser(guest);
            if (discountBps > 0) {
                uint256 discount = (baseAmount * discountBps) / 10000;
                return baseAmount - discount;
            }
        }
        return baseAmount;
    }

    /**
     * @notice Direct booking deposit in native MON or ERC20 (Mock USDT).
     */
    function createBooking(uint8 daybedType, uint64 visitTimestamp, address paymentToken) external payable nonReentrant returns (uint256) {
        require(visitTimestamp > uint64(block.timestamp), "Visit must be in the future");
        uint256 requiredDeposit = calculateDeposit(msg.sender, daybedType, paymentToken);

        if (paymentToken == address(0)) {
            if (msg.value < requiredDeposit) revert InvalidDeposit();
        } else {
            IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), requiredDeposit);
        }

        uint256 bookingId = nextBookingId++;
        bookings[bookingId] = Booking({
            bookingId: bookingId,
            guest: msg.sender,
            daybedType: daybedType,
            visitTimestamp: visitTimestamp,
            depositAmount: requiredDeposit,
            paymentToken: paymentToken,
            checkedIn: false,
            cancelled: false,
            settled: false
        });

        userBookingIds[msg.sender].push(bookingId);
        emit BookingCreated(bookingId, msg.sender, daybedType, visitTimestamp, requiredDeposit, paymentToken);

        // Refund excess native MON using low-level call to support smart contract wallets
        if (paymentToken == address(0) && msg.value > requiredDeposit) {
            (bool sent, ) = payable(msg.sender).call{value: msg.value - requiredDeposit}("");
            require(sent, "Failed to refund excess MON");
        }

        return bookingId;
    }

    /**
     * @notice Execute booking via user EIP-712 signed intent (Generated by AI Ava).
     */
    function createBookingWithSignature(
        address guest,
        uint8 daybedType,
        uint64 visitTimestamp,
        uint256 depositAmount,
        address paymentToken,
        uint256 deadline,
        bytes calldata signature
    ) external payable nonReentrant returns (uint256) {
        require(visitTimestamp > uint64(block.timestamp), "Visit must be in the future");
        if (block.timestamp > deadline) revert DeadlineExpired();

        bytes32 structHash = keccak256(
            abi.encode(
                BOOKING_INTENT_TYPEHASH,
                guest,
                daybedType,
                visitTimestamp,
                depositAmount,
                paymentToken,
                nonces[guest]++,
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        if (signer != guest) revert InvalidSignature();

        if (paymentToken == address(0)) {
            if (msg.value < depositAmount) revert InvalidDeposit();
        } else {
            IERC20(paymentToken).safeTransferFrom(guest, address(this), depositAmount);
        }

        uint256 bookingId = nextBookingId++;
        bookings[bookingId] = Booking({
            bookingId: bookingId,
            guest: guest,
            daybedType: daybedType,
            visitTimestamp: visitTimestamp,
            depositAmount: depositAmount,
            paymentToken: paymentToken,
            checkedIn: false,
            cancelled: false,
            settled: false
        });

        userBookingIds[guest].push(bookingId);
        emit BookingCreated(bookingId, guest, daybedType, visitTimestamp, depositAmount, paymentToken);

        if (paymentToken == address(0) && msg.value > depositAmount) {
            (bool sent, ) = payable(msg.sender).call{value: msg.value - depositAmount}("");
            require(sent, "Failed to refund excess MON");
        }

        return bookingId;
    }

    /**
     * @notice Guest can cancel and get 100% refund up to 24 hours prior to visit date.
     */
    function cancelBooking(uint256 bookingId) external nonReentrant {
        Booking storage b = bookings[bookingId];
        if (b.bookingId == 0) revert BookingNotFound();
        if (b.guest != msg.sender) revert NotGuest();
        if (b.checkedIn || b.cancelled || b.settled) revert AlreadyProcessed();

        if (block.timestamp + 24 hours > b.visitTimestamp) revert CancellationPeriodExpired();

        b.cancelled = true;

        if (b.paymentToken == address(0)) {
            (bool sent, ) = payable(b.guest).call{value: b.depositAmount}("");
            require(sent, "Failed to refund guest");
        } else {
            IERC20(b.paymentToken).safeTransfer(b.guest, b.depositAmount);
        }

        emit BookingCancelled(bookingId, b.guest, b.depositAmount);
    }

    /**
     * @notice Admin / Venue Staff triggers check-in on guest arrival, releasing escrow funds to venue.
     */
    function checkIn(uint256 bookingId) external onlyOwner {
        Booking storage b = bookings[bookingId];
        if (b.bookingId == 0) revert BookingNotFound();
        if (b.cancelled || b.settled) revert AlreadyProcessed();

        b.checkedIn = true;
        b.settled = true;

        if (b.paymentToken == address(0)) {
            (bool sent, ) = payable(owner()).call{value: b.depositAmount}("");
            require(sent, "Failed to transfer deposit to owner");
        } else {
            IERC20(b.paymentToken).safeTransfer(owner(), b.depositAmount);
        }

        emit CheckedIn(bookingId, b.guest, block.timestamp);
        emit BookingSettled(bookingId, owner(), b.depositAmount);
    }

    function getUserBookings(address user) external view returns (Booking[] memory) {
        uint256[] memory ids = userBookingIds[user];
        Booking[] memory result = new Booking[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = bookings[ids[i]];
        }
        return result;
    }

    function setBaseMinSpendMON(uint8 daybedType, uint256 amountMON) external onlyOwner {
        require(daybedType < 4, "Invalid daybed type");
        baseMinSpendMON[daybedType] = amountMON;
    }

    function setBaseMinSpendUSDT(uint8 daybedType, uint256 amountUSDT) external onlyOwner {
        require(daybedType < 4, "Invalid daybed type");
        baseMinSpendUSDT[daybedType] = amountUSDT;
    }
}
