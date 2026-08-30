// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract MockUSDTTest is Test {
    MockUSDT public usdt;
    address public owner = address(this);
    address public alice = makeAddr("alice");

    event FaucetClaimed(address indexed user, uint256 amount);

    function setUp() public {
        usdt = new MockUSDT(owner);
        // Warp time forward so faucet works (default block.timestamp is 1, faucet needs >= 3600)
        vm.warp(3600);
    }

    function test_constructor_mintsToOwner() public view {
        assertEq(usdt.balanceOf(owner), 1_000_000 * 10**6);
    }

    function test_constructor_setsNameAndSymbol() public view {
        assertEq(usdt.name(), "Mock Tether USD");
        assertEq(usdt.symbol(), "USDT");
    }

    function test_constructor_setsDecimals() public view {
        assertEq(usdt.decimals(), 6);
    }

    function test_faucet_mintsAmount() public {
        vm.prank(alice);
        usdt.faucet();
        assertEq(usdt.balanceOf(alice), 1000 * 10**6);
    }

    function test_faucet_emitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit FaucetClaimed(alice, 1000 * 10**6);

        vm.prank(alice);
        usdt.faucet();
    }

    function test_faucet_cooldownEnforced() public {
        vm.startPrank(alice);
        usdt.faucet();
        vm.expectRevert("Faucet cooldown active. Wait 1 hour between claims.");
        usdt.faucet();
        vm.stopPrank();
    }

    function test_faucet_cooldownExpiresAfter1Hour() public {
        vm.startPrank(alice);
        usdt.faucet();
        assertEq(usdt.balanceOf(alice), 1000 * 10**6);

        vm.warp(block.timestamp + 1 hours);
        usdt.faucet();
        assertEq(usdt.balanceOf(alice), 2000 * 10**6);
        vm.stopPrank();
    }

    function test_faucet_multipleUsersIndependent() public {
        address bob = makeAddr("bob");

        vm.prank(alice);
        usdt.faucet();

        vm.prank(bob);
        usdt.faucet();

        assertEq(usdt.balanceOf(alice), 1000 * 10**6);
        assertEq(usdt.balanceOf(bob), 1000 * 10**6);
    }

    function test_mint_onlyOwner() public {
        usdt.mint(alice, 5000 * 10**6);
        assertEq(usdt.balanceOf(alice), 5000 * 10**6);
    }

    function test_mint_revertsIfNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        usdt.mint(alice, 5000 * 10**6);
    }

    function test_transfer_works() public {
        vm.prank(owner);
        usdt.mint(alice, 1000 * 10**6);

        vm.prank(alice);
        usdt.transfer(makeAddr("carol"), 500 * 10**6);

        assertEq(usdt.balanceOf(makeAddr("carol")), 500 * 10**6);
        assertEq(usdt.balanceOf(alice), 500 * 10**6);
    }
}
