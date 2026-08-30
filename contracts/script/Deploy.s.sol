// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MockUSDT.sol";
import "../src/WhiteRockPass.sol";
import "../src/BookingEscrow.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Monad Testnet Deployment ===");
        console.log("Deployer Address:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Mock USDT (6 decimals + Faucet)
        MockUSDT usdt = new MockUSDT(deployer);
        console.log("MockUSDT deployed to:", address(usdt));

        // 2. Deploy NFT Membership Pass Contract
        WhiteRockPass pass = new WhiteRockPass("https://api.whiterockbali.com/metadata/", deployer);
        console.log("WhiteRockPass deployed to:", address(pass));

        // 3. Deploy Booking Escrow Contract (supporting MON + MockUSDT)
        BookingEscrow escrow = new BookingEscrow(address(pass), address(usdt), deployer);
        console.log("BookingEscrow deployed to:", address(escrow));

        vm.stopBroadcast();
    }
}
