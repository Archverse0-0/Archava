// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BookingEscrow} from "../src/BookingEscrow.sol";
import {WhiteRockPass} from "../src/WhiteRockPass.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract SecurityRegressionTest is Test {
    BookingEscrow internal escrow;
    WhiteRockPass internal pass;
    MockUSDT internal usdt;

    uint256 internal alicePk = 0xA11CE;
    address internal alice;

    function setUp() public {
        alice = vm.addr(alicePk);
        usdt = new MockUSDT(address(this));
        pass = new WhiteRockPass("https://example.invalid/metadata/", address(this));
        pass.setUsdtToken(address(usdt));
        escrow = new BookingEscrow(address(pass), address(usdt), address(this));
        usdt.mint(alice, 10_000 * 10**6);
        vm.deal(alice, 100 ether);
    }

    function test_rejectsArbitraryErc20AsPaymentToken() public {
        MockUSDT attackerToken = new MockUSDT(address(this));
        attackerToken.mint(alice, 10_000 * 10**6);

        vm.startPrank(alice);
        attackerToken.approve(address(escrow), type(uint256).max);
        vm.expectRevert(BookingEscrow.UnsupportedPaymentToken.selector);
        escrow.createBooking(0, uint64(block.timestamp + 2 days), address(attackerToken));
        vm.stopPrank();
    }

    function test_tamperedDaybedTypeReturnsInvalidDeposit() public {
        uint8 signedDaybedType = 1; // signed for type 1
        uint64 visitTimestamp = uint64(block.timestamp + 2 days);
        uint256 deadline = block.timestamp + 1 hours;
        uint256 depositForType1 = 150 * 10**6; // canonical for daybed 1
        uint256 nonce = escrow.nonces(alice);

        bytes32 structHash = keccak256(
            abi.encode(
                escrow.BOOKING_INTENT_TYPEHASH(),
                alice,
                signedDaybedType,
                visitTimestamp,
                depositForType1,
                address(usdt),
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
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(alicePk, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.startPrank(alice);
        usdt.approve(address(escrow), type(uint256).max);
        // Caller claims daybed 0 but signed for daybed 1; deposit invariant catches mismatch first
        vm.expectRevert(BookingEscrow.InvalidDeposit.selector);
        escrow.createBookingWithSignature(
            alice,
            0, // daybedType passed here differs from signed daybed type
            visitTimestamp,
            depositForType1,
            address(usdt),
            deadline,
            signature
        );
        vm.stopPrank();
    }

    function test_tamperedDepositAmountReturnsInvalidDeposit() public {
        uint8 daybedType = 0;
        uint64 visitTimestamp = uint64(block.timestamp + 2 days);
        uint256 deadline = block.timestamp + 1 hours;
        uint256 fakeDeposit = 1 * 10**6;
        uint256 nonce = escrow.nonces(alice);

        bytes32 structHash = keccak256(
            abi.encode(
                escrow.BOOKING_INTENT_TYPEHASH(),
                alice,
                daybedType,
                visitTimestamp,
                fakeDeposit,
                address(usdt),
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
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(alicePk, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.startPrank(alice);
        usdt.approve(address(escrow), type(uint256).max);
        // Deposit check fires before signature verification; fake amount fails invariant
        vm.expectRevert(BookingEscrow.InvalidDeposit.selector);
        escrow.createBookingWithSignature(
            alice,
            daybedType,
            visitTimestamp,
            fakeDeposit, // signed low amount
            address(usdt),
            deadline,
            signature
        );
        vm.stopPrank();
    }

    function test_zeroDepositSignedIntentFails() public {
        uint8 daybedType = 0;
        uint64 visitTimestamp = uint64(block.timestamp + 2 days);
        uint256 deadline = block.timestamp + 1 hours;
        uint256 zeroDeposit = 0;
        uint256 nonce = escrow.nonces(alice);

        bytes32 structHash = keccak256(
            abi.encode(
                escrow.BOOKING_INTENT_TYPEHASH(),
                alice,
                daybedType,
                visitTimestamp,
                zeroDeposit,
                address(usdt),
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
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(alicePk, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.startPrank(alice);
        usdt.approve(address(escrow), type(uint256).max);
        vm.expectRevert(BookingEscrow.InvalidDeposit.selector);
        escrow.createBookingWithSignature(
            alice,
            daybedType,
            visitTimestamp,
            zeroDeposit,
            address(usdt),
            deadline,
            signature
        );
        vm.stopPrank();
    }

    function test_correctSignedDepositSucceeds() public {
        uint8 daybedType = 0;
        uint64 visitTimestamp = uint64(block.timestamp + 2 days);
        uint256 deadline = block.timestamp + 1 hours;
        uint256 canonicalDeposit = 30 * 10**6;
        uint256 nonce = escrow.nonces(alice);

        bytes32 structHash = keccak256(
            abi.encode(
                escrow.BOOKING_INTENT_TYPEHASH(),
                alice,
                daybedType,
                visitTimestamp,
                canonicalDeposit,
                address(usdt),
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
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(alicePk, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.startPrank(alice);
        usdt.approve(address(escrow), type(uint256).max);
        uint256 bookingId = escrow.createBookingWithSignature(
            alice,
            daybedType,
            visitTimestamp,
            canonicalDeposit,
            address(usdt),
            deadline,
            signature
        );
        vm.stopPrank();

        assertGt(bookingId, 0);
        assertEq(escrow.getUserBookings(alice).length, 1);
    }

    function test_invalidSignatureReverts() public {
        uint8 daybedType = 0;
        uint64 visitTimestamp = uint64(block.timestamp + 2 days);
        uint256 deadline = block.timestamp + 1 hours;
        uint256 deposit = 30 * 10**6;

        bytes memory invalidSignature = bytes("0xdeadbeef");

        vm.startPrank(alice);
        usdt.approve(address(escrow), type(uint256).max);
        vm.expectRevert(BookingEscrow.InvalidSignature.selector);
        escrow.createBookingWithSignature(
            alice,
            daybedType,
            visitTimestamp,
            deposit,
            address(usdt),
            deadline,
            invalidSignature
        );
        vm.stopPrank();
    }

    function test_regressionSignedIntentCannotChooseLowerDeposit() public {
        uint8 daybedType = 0;
        uint64 visitTimestamp = uint64(block.timestamp + 2 days);
        uint256 deadline = block.timestamp + 1 hours;
        uint256 fakeDeposit = 1 * 10**6;
        uint256 nonce = escrow.nonces(alice);

        bytes32 structHash = keccak256(
            abi.encode(
                escrow.BOOKING_INTENT_TYPEHASH(),
                alice,
                daybedType,
                visitTimestamp,
                fakeDeposit,
                address(usdt),
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
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(alicePk, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.startPrank(alice);
        usdt.approve(address(escrow), type(uint256).max);
        vm.expectRevert(BookingEscrow.InvalidDeposit.selector);
        escrow.createBookingWithSignature(
            alice,
            daybedType,
            visitTimestamp,
            fakeDeposit,
            address(usdt),
            deadline,
            signature
        );
        vm.stopPrank();
    }

    function test_nativeMintDisabledUntilExplicitlyPriced() public {
        vm.prank(alice);
        vm.expectRevert("Native MON mint disabled");
        pass.mintPassWithMON{value: 1 ether}(WhiteRockPass.PassTier.LAGOON);

        pass.setNativePriceMON(WhiteRockPass.PassTier.LAGOON, 0.2 ether);

        vm.prank(alice);
        pass.mintPassWithMON{value: 0.2 ether}(WhiteRockPass.PassTier.LAGOON);
        assertEq(pass.balanceOf(alice), 1);
    }
}
