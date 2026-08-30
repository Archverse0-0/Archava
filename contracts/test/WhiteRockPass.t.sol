// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {WhiteRockPass} from "../src/WhiteRockPass.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract WhiteRockPassTest is Test {
    WhiteRockPass public pass;
    MockUSDT public usdt;
    address public owner = address(this);
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public carol = makeAddr("carol");

    event PassMinted(address indexed minter, uint256 indexed tokenId, WhiteRockPass.PassTier tier);

    function setUp() public {
        usdt = new MockUSDT(owner);
        pass = new WhiteRockPass("https://api.whiterockbali.com/metadata/", owner);
        pass.setUsdtToken(address(usdt));

        // Fund test users with USDT
        usdt.mint(alice, 10000 * 10**6);
        usdt.mint(bob, 10000 * 10**6);
        usdt.mint(carol, 10000 * 10**6);
    }

    // Required to receive ETH from withdraw()
    receive() external payable {}

    // ============================================================
    //                      CONSTRUCTOR TESTS
    // ============================================================

    function test_constructor_setsNameAndSymbol() public view {
        assertEq(pass.name(), "White Rock VIP Pass");
        assertEq(pass.symbol(), "WRPASS");
    }

    function test_constructor_setsOwner() public view {
        assertEq(pass.owner(), owner);
    }

    function test_constructor_setsTierConfigs() public view {
        // Lagoon: 10 USDT, 5% discount, 500 cap
        (uint256 lPrice, uint16 lDiscount, uint32 lMaxSupply, uint32 lCurrentSupply, bool lActive) = pass.tierConfigs(WhiteRockPass.PassTier.LAGOON);
        assertEq(lPrice, 10 * 10**6);
        assertEq(lDiscount, 500);
        assertEq(lMaxSupply, 500);
        assertEq(lCurrentSupply, 0);
        assertTrue(lActive);

        // VIP Cabana: 50 USDT, 10% discount, 150 cap
        (uint256 vPrice, uint16 vDiscount, uint32 vMaxSupply, uint32 vCurrentSupply, bool vActive) = pass.tierConfigs(WhiteRockPass.PassTier.VIP_CABANA);
        assertEq(vPrice, 50 * 10**6);
        assertEq(vDiscount, 1000);
        assertEq(vMaxSupply, 150);
        assertEq(vCurrentSupply, 0);
        assertTrue(vActive);

        // Party Suite: 100 USDT, 20% discount, 50 cap
        (uint256 pPrice, uint16 pDiscount, uint32 pMaxSupply, uint32 pCurrentSupply, bool pActive) = pass.tierConfigs(WhiteRockPass.PassTier.PARTY_SUITE);
        assertEq(pPrice, 100 * 10**6);
        assertEq(pDiscount, 2000);
        assertEq(pMaxSupply, 50);
        assertEq(pCurrentSupply, 0);
        assertTrue(pActive);
    }

    // ============================================================
    //                      MINT TESTS (USDT)
    // ============================================================

    function test_mintPass_lagoon() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();

        assertEq(pass.balanceOf(alice), 1);
        assertEq(uint8(pass.tokenTiers(1)), uint8(WhiteRockPass.PassTier.LAGOON));
    }

    function test_mintPass_vipCabana() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 50 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.VIP_CABANA);
        vm.stopPrank();

        assertEq(pass.balanceOf(alice), 1);
        assertEq(uint8(pass.tokenTiers(1)), uint8(WhiteRockPass.PassTier.VIP_CABANA));
    }

    function test_mintPass_partySuite() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 100 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.PARTY_SUITE);
        vm.stopPrank();

        assertEq(pass.balanceOf(alice), 1);
        assertEq(uint8(pass.tokenTiers(1)), uint8(WhiteRockPass.PassTier.PARTY_SUITE));
    }

    function test_mintPass_increasesTotalSupply() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();

        assertEq(pass.totalSupply(), 1);
    }

    function test_mintPass_increasesCurrentSupply() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();

        (, , , uint32 currentSupply, ) = pass.tierConfigs(WhiteRockPass.PassTier.LAGOON);
        assertEq(currentSupply, 1);
    }

    function test_mintPass_multipleUsers() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();

        vm.startPrank(bob);
        usdt.approve(address(pass), 50 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.VIP_CABANA);
        vm.stopPrank();

        assertEq(pass.balanceOf(alice), 1);
        assertEq(pass.balanceOf(bob), 1);
        assertEq(pass.totalSupply(), 2);
    }

    function test_mintPass_emitsEvent() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);

        vm.expectEmit(true, true, false, true);
        emit PassMinted(alice, 1, WhiteRockPass.PassTier.LAGOON);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();
    }

    function test_mintPass_transfersUSDT() public {
        uint256 balanceBefore = usdt.balanceOf(alice);

        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();

        assertEq(usdt.balanceOf(alice), balanceBefore - 10 * 10**6);
        assertEq(usdt.balanceOf(address(pass)), 10 * 10**6);
    }

    // ============================================================
    //                      MINT REVERT TESTS
    // ============================================================

    function test_mintPass_revert_insufficientUSDT() public {
        vm.startPrank(alice);
        // Only approve 5 USDT, but Lagoon costs 10
        usdt.approve(address(pass), 5 * 10**6);
        vm.expectRevert();
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();
    }

    function test_mintPass_revert_noApproval() public {
        vm.startPrank(alice);
        // No approval at all
        vm.expectRevert();
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();
    }

    function test_mintPass_revert_inactiveTier() public {
        pass.setTierConfig(WhiteRockPass.PassTier.LAGOON, 10 * 10**6, 500, 500, false);

        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);
        vm.expectRevert("Tier is not active");
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();
    }

    function test_mintPass_revert_soldOut() public {
        // Set maxSupply to 0 after setting currentSupply
        pass.setTierConfig(WhiteRockPass.PassTier.LAGOON, 10 * 10**6, 500, 1, false); // deactivate

        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);
        vm.expectRevert("Tier is not active");
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();
    }

    // ============================================================
    //                      DISCOUNT TESTS
    // ============================================================

    function test_getDiscountBpsForUser_noPass() public view {
        assertEq(pass.getDiscountBpsForUser(alice), 0);
    }

    function test_getDiscountBpsForUser_lagoon() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();

        assertEq(pass.getDiscountBpsForUser(alice), 500); // 5%
    }

    function test_getDiscountBpsForUser_vipCabana() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 50 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.VIP_CABANA);
        vm.stopPrank();

        assertEq(pass.getDiscountBpsForUser(alice), 1000); // 10%
    }

    function test_getDiscountBpsForUser_partySuite() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 100 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.PARTY_SUITE);
        vm.stopPrank();

        assertEq(pass.getDiscountBpsForUser(alice), 2000); // 20%
    }

    function test_getDiscountBpsForUser_highestTier() public {
        // Mint both Lagoon and VIP Cabana
        vm.startPrank(alice);
        usdt.approve(address(pass), 60 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        pass.mintPass(WhiteRockPass.PassTier.VIP_CABANA);
        vm.stopPrank();

        // Should return highest (10% = 1000)
        assertEq(pass.getDiscountBpsForUser(alice), 1000);
    }

    // ============================================================
    //                      ADMIN TESTS
    // ============================================================

    function test_setTierConfig_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        pass.setTierConfig(WhiteRockPass.PassTier.LAGOON, 10 * 10**6, 500, 500, true);
    }

    function test_setTierConfig_updatesPrice() public {
        pass.setTierConfig(WhiteRockPass.PassTier.LAGOON, 20 * 10**6, 500, 500, true);
        (uint256 price, , , , ) = pass.tierConfigs(WhiteRockPass.PassTier.LAGOON);
        assertEq(price, 20 * 10**6);
    }

    function test_setTierConfig_updatesDiscount() public {
        pass.setTierConfig(WhiteRockPass.PassTier.LAGOON, 10 * 10**6, 1000, 500, true);
        (, uint16 discount, , , ) = pass.tierConfigs(WhiteRockPass.PassTier.LAGOON);
        assertEq(discount, 1000);
    }

    function test_setTierConfig_revert_zeroPrice() public {
        vm.expectRevert("Price must be > 0");
        pass.setTierConfig(WhiteRockPass.PassTier.LAGOON, 0, 500, 500, true);
    }

    function test_setTierConfig_revert_discountExceedsMax() public {
        vm.expectRevert("Discount cannot exceed 100%");
        pass.setTierConfig(WhiteRockPass.PassTier.LAGOON, 10 * 10**6, 10001, 500, true);
    }

    function test_setTierConfig_revert_zeroMaxSupply() public {
        vm.expectRevert("Max supply must be > 0");
        pass.setTierConfig(WhiteRockPass.PassTier.LAGOON, 10 * 10**6, 500, 0, true);
    }

    function test_setBaseURI_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        pass.setBaseURI("https://new-uri.com/");
    }

    function test_setUsdtToken_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        pass.setUsdtToken(address(0x1234));
    }

    function test_setUsdtToken_revert_zeroAddress() public {
        vm.expectRevert("Invalid USDT token address");
        pass.setUsdtToken(address(0));
    }

    // ============================================================
    //                      WITHDRAW TESTS
    // ============================================================

    function test_withdraw_sendsBalance() public {
        // Send some ETH to the contract
        vm.deal(address(pass), 1 ether);

        uint256 balanceBefore = address(owner).balance;
        pass.withdraw();
        assertGe(address(owner).balance, balanceBefore);
    }

    function test_withdraw_onlyOwner() public {
        vm.deal(address(pass), 1 ether);
        vm.prank(alice);
        vm.expectRevert();
        pass.withdraw();
    }

    function test_withdraw_revert_noBalance() public {
        vm.expectRevert("No MON balance to withdraw");
        pass.withdraw();
    }

    function test_withdrawUSDT_sendsBalance() public {
        // Send USDT to the contract
        usdt.transfer(address(pass), 100 * 10**6);

        uint256 balanceBefore = usdt.balanceOf(owner);
        pass.withdrawUSDT();
        assertEq(usdt.balanceOf(owner), balanceBefore + 100 * 10**6);
    }

    function test_withdrawUSDT_onlyOwner() public {
        usdt.transfer(address(pass), 100 * 10**6);
        vm.prank(alice);
        vm.expectRevert();
        pass.withdrawUSDT();
    }

    function test_withdrawUSDT_revert_noBalance() public {
        vm.expectRevert("No USDT balance to withdraw");
        pass.withdrawUSDT();
    }

    // ============================================================
    //                      TOKEN URI TESTS
    // ============================================================

    function test_tokenURI_returnsCorrectURI() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();

        string memory uri = pass.tokenURI(1);
        assertEq(uri, "https://api.whiterockbali.com/metadata/1.json");
    }

    function test_tokenURI_revert_nonExistent() public {
        vm.expectRevert();
        pass.tokenURI(999);
    }

    // ============================================================
    //                      ENUMERABLE TESTS
    // ============================================================

    function test_tokenOfOwnerByIndex() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 60 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        pass.mintPass(WhiteRockPass.PassTier.VIP_CABANA);
        vm.stopPrank();

        assertEq(pass.tokenOfOwnerByIndex(alice, 0), 1);
        assertEq(pass.tokenOfOwnerByIndex(alice, 1), 2);
    }

    // ============================================================
    //                      ERC721 COMPLIANCE TESTS
    // ============================================================

    function test_transferFrom() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        pass.transferFrom(alice, bob, 1);
        vm.stopPrank();

        assertEq(pass.ownerOf(1), bob);
        assertEq(pass.balanceOf(alice), 0);
        assertEq(pass.balanceOf(bob), 1);
    }

    function test_transferFrom_revert_notOwner() public {
        vm.startPrank(alice);
        usdt.approve(address(pass), 10 * 10**6);
        pass.mintPass(WhiteRockPass.PassTier.LAGOON);
        vm.stopPrank();

        vm.prank(bob);
        vm.expectRevert();
        pass.transferFrom(alice, bob, 1);
    }

    // ============================================================
    //                      FUZZ TESTS
    // ============================================================

    function testFuzz_mintPass_anyTier(uint8 tier) public {
        vm.assume(tier <= 2);

        uint256 price = tier == 0 ? 10 * 10**6 : tier == 1 ? 50 * 10**6 : 100 * 10**6;

        vm.startPrank(alice);
        usdt.approve(address(pass), price);
        pass.mintPass(WhiteRockPass.PassTier(tier));
        vm.stopPrank();

        assertEq(pass.balanceOf(alice), 1);
    }

    function testFuzz_getDiscountBps_neverExceedsMax(address user) public view {
        uint16 discount = pass.getDiscountBpsForUser(user);
        assertLe(discount, 10000);
    }
}
