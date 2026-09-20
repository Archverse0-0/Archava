// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {MockUSDT} from "../src/MockUSDT.sol";
import {WhiteRockPass} from "../src/WhiteRockPass.sol";
import {BookingEscrow} from "../src/BookingEscrow.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MockUSDT
        MockUSDT mockUSDT = new MockUSDT(msg.sender);
        console.log("MockUSDT deployed at:", address(mockUSDT));

        // 2. Deploy WhiteRockPass
        string memory baseURI = "https://api.whiterockbali.com/metadata/";
        WhiteRockPass whiteRockPass = new WhiteRockPass(baseURI, msg.sender);
        console.log("WhiteRockPass deployed at:", address(whiteRockPass));

        // Set USDT token on WhiteRockPass
        whiteRockPass.setUsdtToken(address(mockUSDT));
        console.log("WhiteRockPass USDT token set");

        // 3. Deploy BookingEscrow
        BookingEscrow bookingEscrow = new BookingEscrow(
            address(whiteRockPass),
            address(mockUSDT),
            msg.sender
        );
        console.log("BookingEscrow deployed at:", address(bookingEscrow));

        // Mint initial USDT to deployer for testing
        mockUSDT.mint(msg.sender, 1_000_000 * 10**6);
        console.log("Minted 1M USDT to deployer");

        vm.stopBroadcast();

        // Summary
        console.log("=== DEPLOYMENT SUMMARY ===");
        console.log("MockUSDT: ", address(mockUSDT));
        console.log("WhiteRockPass: ", address(whiteRockPass));
        console.log("BookingEscrow: ", address(bookingEscrow));
    }
}
