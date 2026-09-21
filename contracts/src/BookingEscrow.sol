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
 * @notice Handles daybed reservation deposits in native MON or the configured USDT token,
 *         24-hour cancellation refunds, and EIP-712 booking intents.
 */
contract BookingEscrow is ReentrancyGuard, Ownable, EIP712 {
    using SafeERC20 for IERC20;

    bytes32 public constant BOOKING_INTENT_TYPEHASH = keccak256(
        "BookingIntent(address guest,uint8 daybedType,uint64 visitTimestamp,uint256 depositAmount,address paymentToken,uint256 nonce,uint256 deadline)"
    );

    struct Booking {
        uint256 bookingId;
        address guest;
        uint8 daybedType;
        uint64 visitTimestamp;
        uint256 depositAmount;
        address paymentToken;
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

    uint256[4] public baseMinSpendMON = [
        0.01 ether,
        0.05 ether,
        0.10 ether,
        0.005 ether
    ];

    uint256[4] public baseMinSpendUSDT = [
        30 * 10**6,
        150 * 10**6,
        300 * 10**6,
        15 * 10**6
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
    event UsdtTokenUpdated(address indexed token);
    event BaseMinSpendMONUpdated(uint8 indexed daybedType, uint256 amount);
    event BaseMinSpendUSDTUpdated(uint8 indexed daybedType, uint256 amount);

    error InvalidDeposit();
    error DeadlineExpired();
    error InvalidSignature();
    error BookingNotFound();
    error AlreadyProcessed();
    error CancellationPeriodExpired();
    error NotGuest();
    error UnsupportedPaymentToken();
    error InvalidGuest();

    constructor(address _passContract, address _usdtToken, address initialOwner)
        EIP712("WhiteRockBooking", "1")
        Ownable(initialOwner)
    {
        require(_passContract != address(0), "Invalid pass contract address");
        require(_usdtToken != address(0), "Invalid USDT token address");
        require(initialOwner != address(0), "Invalid owner address");
        passContract = IWhiteRockPass(_passContract);
        usdtToken = IERC20(_usdtToken);
    }

    /// @dev Only *new* bookings price against the new token. Existing bookings
    /// carry their own `paymentToken` and are refunded/settled against that, so
    /// a change here cannot strand an in-flight booking. `withdrawToken` exists
    /// for balances of a token that is no longer the configured one.
    function setUsdtToken(address _usdtToken) external onlyOwner {
        require(_usdtToken != address(0), "Invalid USDT token address");
        usdtToken = IERC20(_usdtToken);
        emit UsdtTokenUpdated(_usdtToken);
    }

    /// @notice Sweeps an arbitrary ERC-20 balance to the owner.
    function withdrawToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No token balance to withdraw");
        IERC20(token).safeTransfer(owner(), balance);
    }

    function calculateDeposit(address guest, uint8 daybedType, address token) public view returns (uint256) {
        require(daybedType < 4, "Invalid daybed type");
        if (guest == address(0)) revert InvalidGuest();
        if (token != address(0) && token != address(usdtToken)) revert UnsupportedPaymentToken();

        uint256 baseAmount = token == address(0)
            ? baseMinSpendMON[daybedType]
            : baseMinSpendUSDT[daybedType];

        uint16 discountBps = passContract.getDiscountBpsForUser(guest);
        if (discountBps == 0) return baseAmount;

        uint256 discount = (baseAmount * discountBps) / 10_000;
        return baseAmount - discount;
    }

    function createBooking(
        uint8 daybedType,
        uint64 visitTimestamp,
        address paymentToken
    ) external payable nonReentrant returns (uint256) {
        require(visitTimestamp > uint64(block.timestamp), "Visit must be in the future");
        uint256 requiredDeposit = calculateDeposit(msg.sender, daybedType, paymentToken);

        if (paymentToken == address(0)) {
            if (msg.value < requiredDeposit) revert InvalidDeposit();
        } else {
            if (msg.value != 0) revert InvalidDeposit();
            usdtToken.safeTransferFrom(msg.sender, address(this), requiredDeposit);
        }

        uint256 bookingId = _storeBooking(
            msg.sender,
            daybedType,
            visitTimestamp,
            requiredDeposit,
            paymentToken
        );

        if (paymentToken == address(0) && msg.value > requiredDeposit) {
            (bool sent, ) = payable(msg.sender).call{value: msg.value - requiredDeposit}("");
            require(sent, "Failed to refund excess MON");
        }

        return bookingId;
    }

    /**
     * @notice Execute a booking from a guest-signed EIP-712 intent.
     * @dev The contract, not the signer, remains authoritative for the deposit amount.
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
        if (guest == address(0)) revert InvalidGuest();
        require(visitTimestamp > uint64(block.timestamp), "Visit must be in the future");
        if (block.timestamp > deadline) revert DeadlineExpired();

        uint256 requiredDeposit = calculateDeposit(guest, daybedType, paymentToken);
        if (depositAmount != requiredDeposit) revert InvalidDeposit();

        uint256 nonce = nonces[guest];
        bytes32 structHash = keccak256(
            abi.encode(
                BOOKING_INTENT_TYPEHASH,
                guest,
                daybedType,
                visitTimestamp,
                depositAmount,
                paymentToken,
                nonce,
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        if (signature.length != 65) revert InvalidSignature();
        address signer = ECDSA.recover(digest, signature);
        if (signer != guest) revert InvalidSignature();
        nonces[guest] = nonce + 1;

        if (paymentToken == address(0)) {
            if (msg.value < requiredDeposit) revert InvalidDeposit();
        } else {
            if (msg.value != 0) revert InvalidDeposit();
            usdtToken.safeTransferFrom(guest, address(this), requiredDeposit);
        }

        uint256 bookingId = _storeBooking(
            guest,
            daybedType,
            visitTimestamp,
            requiredDeposit,
            paymentToken
        );

        if (paymentToken == address(0) && msg.value > requiredDeposit) {
            (bool sent, ) = payable(msg.sender).call{value: msg.value - requiredDeposit}("");
            require(sent, "Failed to refund excess MON");
        }

        return bookingId;
    }

    function _storeBooking(
        address guest,
        uint8 daybedType,
        uint64 visitTimestamp,
        uint256 depositAmount,
        address paymentToken
    ) internal returns (uint256 bookingId) {
        bookingId = nextBookingId++;
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
    }

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

    function checkIn(uint256 bookingId) external onlyOwner nonReentrant {
        Booking storage b = bookings[bookingId];
        if (b.bookingId == 0) revert BookingNotFound();
        if (b.checkedIn || b.cancelled || b.settled) revert AlreadyProcessed();

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
        require(amountMON > 0, "Amount must be > 0");
        baseMinSpendMON[daybedType] = amountMON;
        emit BaseMinSpendMONUpdated(daybedType, amountMON);
    }

    function setBaseMinSpendUSDT(uint8 daybedType, uint256 amountUSDT) external onlyOwner {
        require(daybedType < 4, "Invalid daybed type");
        require(amountUSDT > 0, "Amount must be > 0");
        baseMinSpendUSDT[daybedType] = amountUSDT;
        emit BaseMinSpendUSDTUpdated(daybedType, amountUSDT);
    }
}
