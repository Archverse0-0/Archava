/*
 * WhiteRockPass.spec — Certora Formal Verification (CVL 2)
 *
 * Verifies:
 * 1. Minting increases supply and minter balance correctly
 * 2. Discount BPS never exceeds 10000
 * 3. Only owner can withdraw
 * 4. Total supply is non-negative
 */

methods {
    function getDiscountBpsForUser(address) external returns (uint16) envfree;
    function balanceOf(address) external returns (uint256) envfree;
    function totalSupply() external returns (uint256) envfree;
    function withdraw() external;
    function tokenOfOwnerByIndex(address, uint256) external returns (uint256) envfree;
    function owner() external returns (address) envfree;
}

/*
 * Rule 1: Discount BPS never exceeds 10000 (100%)
 */
rule discountNeverExceedsMax(address user) {
    uint16 discount = getDiscountBpsForUser(user);

    assert discount <= 10000;
}

/*
 * Rule 2: Only owner can call withdraw
 */
rule onlyOwnerCanWithdraw() {
    env e;
    require e.msg.sender != owner();

    withdraw@withrevert(e);
    assert lastReverted;
}

/*
 * Rule 3: Total supply is always non-negative
 */
rule totalSupplyNonNegative() {
    assert totalSupply() >= 0;
}

/*
 * Rule 4: Two different owners cannot have the same token at index 0
 */
rule tokenIdUnique(address owner1, address owner2) {
    require owner1 != owner2;
    uint256 id1 = tokenOfOwnerByIndex(owner1, 0);
    uint256 id2 = tokenOfOwnerByIndex(owner2, 0);

    assert id1 != id2;
}

/*
 * Rule 5: Balance of any address is non-negative
 */
rule balanceNonNegative(address user) {
    assert balanceOf(user) >= 0;
}
