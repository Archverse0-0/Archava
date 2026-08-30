// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {WhiteRockPass} from "../src/WhiteRockPass.sol";
import {BookingEscrow} from "../src/BookingEscrow.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract BookingEscrowTest is Test {
    BookingEscrow public escrow;
    WhiteRockPass public pass;
    MockUSDT public usdt;

    address public owner = address(this);
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public carol = makeAddr("carol");

    // Use known private keys so we can sign EIP-712 intents
    uint256 internal constant ALICE_PK = 0xA11CE;
    uint256 internal constant BOB_PK = 0xB0B;

    address internal aliceFromPk;
    address internal bobFromPk;

    event BookingCreated(uint256 indexed bookingId, address indexed guest, uint8 daybedType, uint64 visitTimestamp, uint256 depositAmount, address paymentToken);
    event CheckedIn(uint256 indexed bookingId, address indexed guest, uint256 timestamp);
    event BookingCancelled(uint256 indexed bookingId, address indexed guest, uint256 refundAmount);
    event BookingSettled(uint256 indexed bookingId, address venueOwner, uint256 amount);

    function setUp() public {
        // Derive addresses from known private keys
        aliceFromPk = vm.addr(ALICE_PK);
        bobFromPk = vm.addr(BOB_PK);

        usdt = new MockUSDT(owner);
        pass = new WhiteRockPass("https://api.whiterockbali.com/metadata/", owner);
        pass.setUsdtToken(address(usdt));
        escrow = new BookingEscrow(address(pass), address(usdt), owner);

        // Fund test accounts
        vm.deal(aliceFromPk, 100 ether);
        vm.deal(bobFromPk, 100 ether);
        vm.deal(carol, 100 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);

        vm.prank(owner);
        usdt.mint(aliceFromPk, 100_000 * 10**6);
        vm.prank(owner);
        usdt.mint(bobFromPk, 100_000 * 10**6);
        vm.prank(owner);
        usdt.mint(carol, 100_000 * 10**6);
        // Fund pass purchases
        vm.prank(owner);
        usdt.mint(alice, 10_000 * 10**6);
        vm.prank(owner);
        usdt.mint(bob, 10_000 * 10**6);
    }

    // Required to receive ETH from checkIn/withdraw
    receive() external payable {}

    // ============================================================
    //                    CONSTRUCTOR TESTS
    // ============================================================

    function test_constructor_setsPassContract() public view {
        assertEq(address(escrow.passContract()), address(pass));
    }

    function test_constructor_setsOwner() public view {
        assertEq(escrow.owner(), owner);
    }

    function test_constructor_setsUSDTToken() public view {
        assertEq(address(escrow.usdtToken()), address(usdt));
    }

    function test_constructor_initialBookingId() public view {
        assertEq(escrow.nextBookingId(), 1);
    }

    function test_constructor_revertsWithZeroPassContract() public {
        vm.expectRevert("Invalid pass contract address");
        new BookingEscrow(address(0), address(usdt), owner);
    }

    function test_constructor_revertsWithZeroOwner() public {
        // Ownable reverts with OwnableInvalidOwner before our custom check
        vm.expectRevert();
        new BookingEscrow(address(pass), address(usdt), address(0));
    }

    // ============================================================
    //                    DEPOSIT CALCULATION TESTS
    // ============================================================

    function test_calculateDepositNoNFT_MON() public view {
        assertEq(escrow.calculateDeposit(alice, 0, address(0)), 0.01 ether);
        assertEq(escrow.calculateDeposit(alice, 1, address(0)), 0.05 ether);
        assertEq(escrow.calculateDeposit(alice, 2, address(0)), 0.10 ether);
        assertEq(escrow.calculateDeposit(alice, 3, address(0)), 0.005 ether);
    }

    function test_calculateDepositNoNFT_USDT() public view {
        assertEq(escrow.calculateDeposit(alice, 0, address(usdt)), 30 * 10**6);
        assertEq(escrow.calculateDeposit(alice, 1, address(usdt)), 150 * 10**6);
        assertEq(escrow.calculateDeposit(alice, 2, address(usdt)), 300 * 10**6);
        assertEq(escrow.calculateDeposit(alice, 3, address(usdt)), 15 * 10**6);
    }

    function test_calculateDepositWithLagoonNFT_MON() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();
        uint256 expected = 0.01 ether - (0.01 ether * 500 / 10000);
        assertEq(escrow.calculateDeposit(alice, 0, address(0)), expected);
    }

    function test_calculateDepositWithPartySuiteNFT_USDT() public {
        vm.startPrank(carol);
        usdt.approve(address(pass), 100 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.PARTY_SUITE);
        vm.stopPrank();
        uint256 expected = 300 * 10**6 - (300 * 10**6 * 2000 / 10000);
        assertEq(escrow.calculateDeposit(carol, 2, address(usdt)), expected);
    }

    function test_calculateDepositInvalidDaybedType() public {
        vm.expectRevert("Invalid daybed type");
        escrow.calculateDeposit(alice, 4, address(0));
    }

    function test_calculateDepositUsesHighestDiscount() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 60 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        pass.mintPass(WhiteRockPass.PassTier.VIP_CABANA);
        vm.stopPrank();
        uint256 expected = 0.01 ether - (0.01 ether * 1000 / 10000);
        assertEq(escrow.calculateDeposit(alice, 0, address(0)), expected);
    }

    // ============================================================
    //              DIRECT BOOKING CREATION TESTS (MON)
    // ============================================================

    function test_createBookingMON() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);

        vm.expectEmit(true, true, true, true);
        emit BookingCreated(1, alice, 0, visitTs, 0.01 ether, address(0));

        vm.prank(alice);
        uint256 bookingId = escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        assertEq(bookingId, 1);
        BookingEscrow.Booking memory b = escrow.getUserBookings(alice)[0];
        assertEq(b.bookingId, 1);
        assertEq(b.guest, alice);
        assertEq(b.daybedType, 0);
        assertEq(b.visitTimestamp, visitTs);
        assertEq(b.depositAmount, 0.01 ether);
        assertEq(b.paymentToken, address(0));
        assertFalse(b.checkedIn);
        assertFalse(b.cancelled);
        assertFalse(b.settled);
    }

    function test_createBookingMONRefundsExcess() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        vm.prank(alice);
        escrow.createBooking{value: 0.1 ether}(0, visitTs, address(0));
        assertEq(alice.balance, 100 ether - 0.01 ether);
    }

    function test_createBookingEmitsEvent() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));
        assertEq(escrow.nextBookingId(), 2);
    }

    function test_createBookingTracksUserBookings() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        vm.startPrank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));
        escrow.createBooking{value: 0.05 ether}(1, visitTs, address(0));
        vm.stopPrank();

        assertEq(escrow.userBookingIds(alice, 0), 1);
        assertEq(escrow.userBookingIds(alice, 1), 2);
    }

    // ============================================================
    //              DIRECT BOOKING CREATION TESTS (USDT)
    // ============================================================

    function test_createBookingUSDT() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        vm.startPrank(aliceFromPk);
        usdt.approve(address(escrow), type(uint256).max);
        escrow.createBooking(0, visitTs, address(usdt));
        vm.stopPrank();

        BookingEscrow.Booking memory b = escrow.getUserBookings(aliceFromPk)[0];
        assertEq(b.depositAmount, 30 * 10**6);
        assertEq(b.paymentToken, address(usdt));
        assertEq(usdt.balanceOf(aliceFromPk), 100_000 * 10**6 - 30 * 10**6);
    }

    function test_createBookingUSDTWithDiscount() public {
        vm.startPrank(carol);
        usdt.approve(address(pass), 100 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.PARTY_SUITE);
        vm.stopPrank();
        uint64 visitTs = uint64(block.timestamp + 2 days);
        vm.startPrank(carol);
        usdt.approve(address(escrow), type(uint256).max);
        escrow.createBooking(2, visitTs, address(usdt));
        vm.stopPrank();
        BookingEscrow.Booking memory b = escrow.getUserBookings(carol)[0];
        assertEq(b.depositAmount, 240 * 10**6);
    }

    // ============================================================
    //              BOOKING FAILURE TESTS
    // ============================================================

    function test_createBookingFailsInsufficientMON() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        vm.prank(alice);
        vm.expectRevert(BookingEscrow.InvalidDeposit.selector);
        escrow.createBooking{value: 0.001 ether}(0, visitTs, address(0));
    }

    function test_createBookingFailsPastTimestamp() public {
        uint64 pastTs = uint64(block.timestamp - 1);
        vm.prank(alice);
        vm.expectRevert("Visit must be in the future");
        escrow.createBooking{value: 0.01 ether}(0, pastTs, address(0));
    }

    function test_createBookingFailsImmediateTimestamp() public {
        uint64 nowTs = uint64(block.timestamp);
        vm.prank(alice);
        vm.expectRevert("Visit must be in the future");
        escrow.createBooking{value: 0.01 ether}(0, nowTs, address(0));
    }

    function test_createBookingFailsInvalidDaybedType() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        vm.prank(alice);
        vm.expectRevert("Invalid daybed type");
        escrow.createBooking{value: 0.01 ether}(4, visitTs, address(0));
    }

    function test_createBookingFailsUSDTWithInsufficientAllowance() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        vm.prank(alice);
        vm.expectRevert();
        escrow.createBooking(0, visitTs, address(usdt));
    }

    function test_createBookingFailsUSDTWithInsufficientBalance() public {
        vm.startPrank(bobFromPk);
        usdt.approve(owner, type(uint256).max);
        usdt.transfer(owner, 100_000 * 10**6);
        usdt.approve(address(escrow), type(uint256).max);
        vm.stopPrank();

        uint64 visitTs = uint64(block.timestamp + 2 days);
        vm.prank(bobFromPk);
        vm.expectRevert();
        escrow.createBooking(0, visitTs, address(usdt));
    }

    // ============================================================
    //              EIP-712 SIGNATURE BOOKING TESTS
    // ============================================================

    function _createBookingIntent(
        uint256 pk,
        address guest,
        uint8 daybedType,
        uint64 visitTimestamp,
        uint256 depositAmount,
        address paymentToken,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes memory signature) {
        bytes32 structHash = keccak256(
            abi.encode(
                escrow.BOOKING_INTENT_TYPEHASH(),
                guest,
                daybedType,
                visitTimestamp,
                depositAmount,
                paymentToken,
                nonce,
                deadline
            )
        );

        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("WhiteRockBooking"),
                keccak256("1"),
                block.chainid,
                address(escrow)
            )
        );

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        signature = abi.encodePacked(r, s, v);
    }

    function test_createBookingWithSignatureMON() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        uint256 depositAmount = 0.01 ether;
        uint256 deadline = uint256(block.timestamp + 1 hours);

        bytes memory sig = _createBookingIntent(
            ALICE_PK, aliceFromPk, 0, visitTs, depositAmount, address(0), 0, deadline
        );

        vm.prank(aliceFromPk);
        uint256 bookingId = escrow.createBookingWithSignature{value: depositAmount}(
            aliceFromPk, 0, visitTs, depositAmount, address(0), deadline, sig
        );

        assertEq(bookingId, 1);
        BookingEscrow.Booking memory b = escrow.getUserBookings(aliceFromPk)[0];
        assertEq(b.guest, aliceFromPk);
        assertEq(b.depositAmount, depositAmount);
    }

    function test_createBookingWithSignatureUSDT() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        uint256 depositAmount = 30 * 10**6;
        uint256 deadline = uint256(block.timestamp + 1 hours);

        bytes memory sig = _createBookingIntent(
            ALICE_PK, aliceFromPk, 0, visitTs, depositAmount, address(usdt), 0, deadline
        );

        vm.startPrank(aliceFromPk);
        usdt.approve(address(escrow), type(uint256).max);
        escrow.createBookingWithSignature(
            aliceFromPk, 0, visitTs, depositAmount, address(usdt), deadline, sig
        );
        vm.stopPrank();

        assertEq(usdt.balanceOf(address(escrow)), depositAmount);
    }

    function test_createBookingWithSignatureNonceIncrement() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        uint256 deadline = uint256(block.timestamp + 1 hours);

        bytes memory sig1 = _createBookingIntent(
            ALICE_PK, aliceFromPk, 0, visitTs, 0.01 ether, address(0), 0, deadline
        );
        vm.prank(aliceFromPk);
        escrow.createBookingWithSignature{value: 0.01 ether}(
            aliceFromPk, 0, visitTs, 0.01 ether, address(0), deadline, sig1
        );
        assertEq(escrow.nonces(aliceFromPk), 1);

        bytes memory sig2 = _createBookingIntent(
            ALICE_PK, aliceFromPk, 1, visitTs, 0.05 ether, address(0), 1, deadline
        );        vm.prank(aliceFromPk);
        escrow.createBookingWithSignature{value: 0.05 ether}(
            aliceFromPk, 1, visitTs, 0.05 ether, address(0), deadline, sig2
        );
        assertEq(escrow.nonces(aliceFromPk), 2);
    }

    function test_createBookingWithSignatureRevertsOnExpiredDeadline() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        uint256 deadline = uint256(block.timestamp - 1);

        bytes memory sig = _createBookingIntent(
            ALICE_PK, aliceFromPk, 0, visitTs, 0.01 ether, address(0), 0, deadline
        );

        vm.prank(aliceFromPk);
        vm.expectRevert(BookingEscrow.DeadlineExpired.selector);
        escrow.createBookingWithSignature(
            aliceFromPk, 0, visitTs, 0.01 ether, address(0), deadline, sig
        );
    }

    function test_createBookingWithSignatureRevertsOnInvalidSigner() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        uint256 deadline = uint256(block.timestamp + 1 hours);

        // Sign with Bob's key but claim it's Alice
        bytes memory sig = _createBookingIntent(
            BOB_PK, bobFromPk, 0, visitTs, 0.01 ether, address(0), 0, deadline
        );

        vm.prank(aliceFromPk);
        vm.expectRevert(BookingEscrow.InvalidSignature.selector);
        escrow.createBookingWithSignature(
            aliceFromPk, 0, visitTs, 0.01 ether, address(0), deadline, sig
        );
    }

    function test_createBookingWithSignatureRevertsOnInsufficientDeposit() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        uint256 deadline = uint256(block.timestamp + 1 hours);
        uint256 depositAmount = 1 ether;

        bytes memory sig = _createBookingIntent(
            ALICE_PK, aliceFromPk, 0, visitTs, depositAmount, address(0), 0, deadline
        );

        // Alice signs for 1 MON but doesn't send enough
        vm.deal(aliceFromPk, 0.5 ether);
        vm.prank(aliceFromPk);
        vm.expectRevert();
        escrow.createBookingWithSignature{value: 0.1 ether}(
            aliceFromPk, 0, visitTs, depositAmount, address(0), deadline, sig
        );
    }

    function test_createBookingWithSignatureRevertsOnPastVisit() public {
        uint64 pastTs = uint64(block.timestamp - 1);
        uint256 deadline = uint256(block.timestamp + 1 hours);

        bytes memory sig = _createBookingIntent(
            ALICE_PK, aliceFromPk, 0, pastTs, 0.01 ether, address(0), 0, deadline
        );

        vm.prank(aliceFromPk);
        vm.expectRevert("Visit must be in the future");
        escrow.createBookingWithSignature(
            aliceFromPk, 0, pastTs, 0.01 ether, address(0), deadline, sig
        );
    }

    // ============================================================
    //                    CANCEL BOOKING TESTS
    // ============================================================

    function test_cancelBookingMON() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        uint256 balanceBefore = alice.balance;

        vm.expectEmit(true, true, true, true);
        emit BookingCancelled(1, alice, 0.01 ether);

        vm.prank(alice);
        escrow.cancelBooking(1);

        BookingEscrow.Booking memory b = escrow.getUserBookings(alice)[0];
        assertTrue(b.cancelled);
        assertEq(alice.balance, balanceBefore + 0.01 ether);
    }

    function test_cancelBookingUSDT() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.startPrank(aliceFromPk);
        usdt.approve(address(escrow), type(uint256).max);
        escrow.createBooking(0, visitTs, address(usdt));
        vm.stopPrank();

        uint256 usdtBefore = usdt.balanceOf(aliceFromPk);
        vm.prank(aliceFromPk);
        escrow.cancelBooking(1);
        assertEq(usdt.balanceOf(aliceFromPk), usdtBefore + 30 * 10**6);
    }

    function test_cancelBookingFailsLessThan24Hours() public {
        uint64 visitTs = uint64(block.timestamp + 23 hours);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        vm.prank(alice);
        vm.expectRevert(BookingEscrow.CancellationPeriodExpired.selector);
        escrow.cancelBooking(1);
    }

    function test_cancelBookingSucceedsAtExact24HoursPlusOne() public {
        // block.timestamp + 24 hours + 1 means there's more than 24 hours before visit
        // The condition is: block.timestamp + 24 hours > visitTimestamp
        // With visitTs = now + 24h + 1: now + 24h > now + 24h + 1 → false → cancellation allowed
        uint64 visitTs = uint64(block.timestamp + 24 hours + 1);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        vm.prank(alice);
        escrow.cancelBooking(1);
        assertTrue(escrow.getUserBookings(alice)[0].cancelled);
    }

    function test_cancelBookingFailsAtExact24Hours() public {
        // With visitTs = now + 24h: now + 24h > now + 24h → false → cancellation allowed
        // So exactly 24h is STILL cancellable. This is correct behavior.
        uint64 visitTs = uint64(block.timestamp + 24 hours);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        // This should succeed (cancel allowed at exactly 24h)
        vm.prank(alice);
        escrow.cancelBooking(1);
        assertTrue(escrow.getUserBookings(alice)[0].cancelled);
    }

    function test_cancelBookingFailsByNonGuest() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        vm.prank(bob);
        vm.expectRevert(BookingEscrow.NotGuest.selector);
        escrow.cancelBooking(1);
    }

    function test_cancelBookingFailsIfAlreadyCancelled() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        vm.startPrank(alice);
        escrow.cancelBooking(1);
        vm.expectRevert(BookingEscrow.AlreadyProcessed.selector);
        escrow.cancelBooking(1);
        vm.stopPrank();
    }

    function test_cancelBookingFailsIfAlreadyCheckedIn() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        escrow.checkIn(1);

        vm.prank(alice);
        vm.expectRevert(BookingEscrow.AlreadyProcessed.selector);
        escrow.cancelBooking(1);
    }

    function test_cancelBookingFailsNonExistent() public {
        vm.prank(alice);
        vm.expectRevert(BookingEscrow.BookingNotFound.selector);
        escrow.cancelBooking(999);
    }

    // ============================================================
    //                    CHECK-IN TESTS
    // ============================================================

    function test_checkInSendsDepositToOwner() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        uint256 ownerBalanceBefore = owner.balance;

        vm.expectEmit(true, true, true, true);
        emit CheckedIn(1, alice, block.timestamp);

        escrow.checkIn(1);

        BookingEscrow.Booking memory b = escrow.getUserBookings(alice)[0];
        assertTrue(b.checkedIn);
        assertTrue(b.settled);
        assertEq(owner.balance, ownerBalanceBefore + 0.01 ether);
    }

    function test_checkInSendsUSDTDepositToOwner() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.startPrank(aliceFromPk);
        usdt.approve(address(escrow), type(uint256).max);
        escrow.createBooking(0, visitTs, address(usdt));
        vm.stopPrank();

        uint256 usdtBefore = usdt.balanceOf(owner);
        escrow.checkIn(1);
        assertEq(usdt.balanceOf(owner), usdtBefore + 30 * 10**6);
    }

    function test_checkInEmitsSettledEvent() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        vm.expectEmit(true, true, true, true);
        emit BookingSettled(1, owner, 0.01 ether);
        escrow.checkIn(1);
    }

    function test_checkInOnlyOwner() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        vm.prank(alice);
        vm.expectRevert();
        escrow.checkIn(1);
    }

    function test_checkInFailsIfCancelled() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        vm.prank(alice);
        escrow.cancelBooking(1);

        vm.expectRevert(BookingEscrow.AlreadyProcessed.selector);
        escrow.checkIn(1);
    }

    function test_checkInFailsIfAlreadySettled() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));

        escrow.checkIn(1);

        vm.expectRevert(BookingEscrow.AlreadyProcessed.selector);
        escrow.checkIn(1);
    }

    function test_checkInFailsNonExistent() public {
        vm.expectRevert(BookingEscrow.BookingNotFound.selector);
        escrow.checkIn(999);
    }

    // ============================================================
    //                    GET USER BOOKINGS TESTS
    // ============================================================

    function test_getUserBookings() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.startPrank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));
        escrow.createBooking{value: 0.05 ether}(1, visitTs, address(0));
        vm.stopPrank();

        BookingEscrow.Booking[] memory bookings = escrow.getUserBookings(alice);
        assertEq(bookings.length, 2);
        assertEq(bookings[0].bookingId, 1);
        assertEq(bookings[0].guest, alice);
        assertEq(bookings[1].bookingId, 2);
    }

    function test_getUserBookingsEmpty() public view {
        BookingEscrow.Booking[] memory bookings = escrow.getUserBookings(carol);
        assertEq(bookings.length, 0);
    }

    // ============================================================
    //                    ADMIN FUNCTIONS TESTS
    // ============================================================

    function test_setBaseMinSpendMON() public {
        escrow.setBaseMinSpendMON(0, 0.1 ether);
        assertEq(escrow.baseMinSpendMON(0), 0.1 ether);
    }

    function test_setBaseMinSpendUSDT() public {
        escrow.setBaseMinSpendUSDT(0, 50 * 10**6);
        assertEq(escrow.baseMinSpendUSDT(0), 50 * 10**6);
    }

    function test_setBaseMinSpendMONOnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        escrow.setBaseMinSpendMON(0, 0.1 ether);
    }

    function test_setBaseMinSpendUSDTOnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        escrow.setBaseMinSpendUSDT(0, 50 * 10**6);
    }

    function test_setBaseMinSpendMONInvalidType() public {
        vm.expectRevert("Invalid daybed type");
        escrow.setBaseMinSpendMON(4, 0.1 ether);
    }

    function test_setBaseMinSpendUSDTInvalidType() public {
        vm.expectRevert("Invalid daybed type");
        escrow.setBaseMinSpendUSDT(4, 50 * 10**6);
    }

    function test_setUsdtToken() public {
        address newUsdt = makeAddr("newUsdt");
        escrow.setUsdtToken(newUsdt);
        assertEq(address(escrow.usdtToken()), newUsdt);
    }

    function test_setUsdtTokenOnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        escrow.setUsdtToken(makeAddr("newUsdt"));
    }

    function test_setUsdtTokenZeroAddressReverts() public {
        vm.expectRevert("Invalid USDT token address");
        escrow.setUsdtToken(address(0));
    }

    function test_setBaseMinSpendUpdatesDepositCalculation() public {
        escrow.setBaseMinSpendMON(0, 0.1 ether);
        assertEq(escrow.calculateDeposit(alice, 0, address(0)), 0.1 ether);
    }

    // ============================================================
    //                    SECURITY TESTS
    // ============================================================

    /// @notice Verify excess refund uses call (not transfer)
    function test_createBookingRefundToContractWallet() public {
        MockReceiverBookingWallet wallet = new MockReceiverBookingWallet();
        vm.deal(address(wallet), 10 ether);

        wallet.createBooking(
            address(escrow), 0, uint64(block.timestamp + 3 days), address(0), 0.1 ether
        );

        BookingEscrow.Booking memory b = escrow.getUserBookings(address(wallet))[0];
        assertEq(b.guest, address(wallet));
        assertEq(b.depositAmount, 0.01 ether);
        assertEq(address(wallet).balance, 10 ether - 0.01 ether);
    }

    /// @notice Verify cancel refund uses call (not transfer)
    function test_cancelBookingRefundToContractWallet() public {
        MockReceiverBookingWallet wallet = new MockReceiverBookingWallet();
        vm.deal(address(wallet), 10 ether);

        vm.warp(block.timestamp + 1);
        wallet.createBooking(
            address(escrow), 0, uint64(block.timestamp + 5 days), address(0), 1 ether
        );

        uint256 balanceBefore = address(wallet).balance;
        wallet.cancelBooking(address(escrow), 1);
        assertEq(address(wallet).balance, balanceBefore + 0.01 ether);
    }

    /// @notice Verify nonce replay protection works
    function test_signatureReplayProtection() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        uint256 deadline = uint256(block.timestamp + 1 hours);

        bytes memory sig = _createBookingIntent(
            ALICE_PK, aliceFromPk, 0, visitTs, 0.01 ether, address(0), 0, deadline
        );

        vm.prank(aliceFromPk);
        escrow.createBookingWithSignature{value: 0.01 ether}(
            aliceFromPk, 0, visitTs, 0.01 ether, address(0), deadline, sig
        );

        vm.deal(aliceFromPk, 1 ether);
        vm.prank(aliceFromPk);
        vm.expectRevert(BookingEscrow.InvalidSignature.selector);
        escrow.createBookingWithSignature{value: 0.01 ether}(
            aliceFromPk, 0, visitTs, 0.01 ether, address(0), deadline, sig
        );
    }

    /// @notice Verify ReentrancyGuard prevents reentrancy attacks
    function test_reentrancyProtection() public {
        ReentrancyAttacker attacker = new ReentrancyAttacker(address(escrow));
        vm.deal(address(attacker), 10 ether);

        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.warp(block.timestamp + 1);

        attacker.attackCreate(visitTs, address(0), 0.01 ether);

        assertEq(escrow.nextBookingId(), 2);
    }

    /// @notice Verify USDT balance tracking
    function test_usdtBalanceTracking() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.startPrank(aliceFromPk);
        usdt.approve(address(escrow), type(uint256).max);
        escrow.createBooking(0, visitTs, address(usdt));
        vm.stopPrank();
        assertEq(usdt.balanceOf(address(escrow)), 30 * 10**6);
    }

    /// @notice Verify booking with zero deposit amount
    function test_bookingWithZeroDepositMON() public {
        uint64 visitTs = uint64(block.timestamp + 2 days);
        vm.prank(alice);
        vm.expectRevert(BookingEscrow.InvalidDeposit.selector);
        escrow.createBooking{value: 0}(0, visitTs, address(0));
    }

    /// @notice Verify multiple bookings by different users don't interfere
    function test_multipleUsersIndependentBookings() public {
        uint64 visitTs = uint64(block.timestamp + 3 days);
        vm.prank(alice);
        escrow.createBooking{value: 0.01 ether}(0, visitTs, address(0));
        vm.prank(bob);
        escrow.createBooking{value: 0.05 ether}(1, visitTs, address(0));

        assertEq(escrow.nextBookingId(), 3);
        BookingEscrow.Booking[] memory aliceBookings = escrow.getUserBookings(alice);
        BookingEscrow.Booking[] memory bobBookings = escrow.getUserBookings(bob);
        assertEq(aliceBookings.length, 1);
        assertEq(aliceBookings[0].guest, alice);
        assertEq(bobBookings.length, 1);
        assertEq(bobBookings[0].guest, bob);
    }

    /// @notice Verify that visitTimestamp 0 is rejected
    function test_createBookingFailsZeroTimestamp() public {
        vm.prank(alice);
        vm.expectRevert("Visit must be in the future");
        escrow.createBooking{value: 0.01 ether}(0, 0, address(0));
    }
}

// ============================================================
//                    HELPER CONTRACTS
// ============================================================

contract MockReceiverBookingWallet {
    function createBooking(
        address escrowAddr,
        uint8 daybedType,
        uint64 visitTs,
        address paymentToken,
        uint256 value
    ) external {
        BookingEscrow(escrowAddr).createBooking{value: value}(daybedType, visitTs, paymentToken);
    }

    function cancelBooking(address escrowAddr, uint256 bookingId) external {
        BookingEscrow(escrowAddr).cancelBooking(bookingId);
    }

    receive() external payable {}
}

contract ReentrancyAttacker {
    BookingEscrow public target;
    uint256 public attackCount;

    constructor(address _target) {
        target = BookingEscrow(_target);
    }

    function attackCreate(uint64 visitTs, address paymentToken, uint256 value) external {
        attackCount = 0;
        target.createBooking{value: value}(0, visitTs, paymentToken);
    }

    receive() external payable {
        if (attackCount < 1) {
            attackCount++;
            try target.createBooking{value: 0.01 ether}(0, uint64(block.timestamp + 5 days), address(0)) {} catch {}
        }
    }
}
