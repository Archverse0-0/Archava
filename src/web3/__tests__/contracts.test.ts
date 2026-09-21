import { describe, it, expect } from "vitest";
import { getAddress } from "viem";
import {
  CONTRACT_ADDRESSES,
  WHITE_ROCK_PASS_ABI,
  BOOKING_ESCROW_ABI,
  DAYBED_TYPES,
  PASS_TIERS,
} from "../contracts";

/**
 * These constants are hand-maintained mirrors of the deployed Solidity. A copy
 * that drifts from the contract does not fail to compile — it reverts at
 * runtime, or worse, renders a price the chain will never charge. The
 * assertions below pin the parts of the mirror the UI depends on.
 */

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const VALID_SOLIDITY_TYPES = new Set([
  "uint8",
  "uint16",
  "uint32",
  "uint64",
  "uint256",
  "address",
  "bool",
  "string",
  "tuple",
  "tuple[]",
]);

describe("contract addresses", () => {
  it("are all well-formed 20-byte hex literals", () => {
    for (const [name, address] of Object.entries(CONTRACT_ADDRESSES)) {
      expect(address, `${name} must be a hex literal`).toMatch(ADDRESS_PATTERN);
      expect(address, `${name} must not be the zero address`).not.toBe(
        "0x0000000000000000000000000000000000000000",
      );
    }
  });

  it("are each a well-formed address, and any mixed-case literal is a correct checksum", () => {
    // `whiteRockPass` is stored EIP-55 mixed case while the other two are
    // lowercase. Both forms are valid, but a typo inside a mixed-case literal
    // only surfaces when viem rejects the checksum — and a silently wrong
    // address means deposits land somewhere unrecoverable. `getAddress` throws
    // on a malformed literal, and it returns the canonical form, so a mixed-case
    // value is additionally required to already be canonical.
    for (const [name, address] of Object.entries(CONTRACT_ADDRESSES)) {
      const canonical = getAddress(address);
      expect(canonical, `${name} must canonicalise to a 20-byte address`).toHaveLength(42);
      expect(canonical.toLowerCase()).toBe(address.toLowerCase());
      if (address !== address.toLowerCase()) {
        expect(canonical, `${name} has a bad EIP-55 checksum`).toBe(address);
      }
    }
  });

  it("covers every contract the frontend talks to", () => {
    expect(Object.keys(CONTRACT_ADDRESSES).sort()).toEqual([
      "bookingEscrow",
      "mockUSDT",
      "whiteRockPass",
    ]);
  });
});

describe("ABI integrity", () => {
  const abis = { WHITE_ROCK_PASS_ABI, BOOKING_ESCROW_ABI };

  it.each(Object.entries(abis))("%s declares only known ABI entry types", (name, abi) => {
    for (const entry of abi) {
      expect(["function", "event"]).toContain(entry.type);
    }
  });

  it.each(Object.entries(abis))("%s uses only Solidity types viem can encode", (name, abi) => {
    const walk = (params: readonly { type: string }[]) => {
      for (const param of params) {
        expect(VALID_SOLIDITY_TYPES.has(param.type), `${param.type} is not a known ABI type`).toBe(true);
      }
    };
    for (const entry of abi) {
      walk(entry.inputs);
      if (entry.type === "function") walk(entry.outputs);
      for (const input of entry.inputs) {
        if (input.type === "tuple[]" && "components" in input) {
          walk((input.components ?? []) as readonly { type: string }[]);
        }
      }
    }
  });

  it.each(Object.entries(abis))("%s has no duplicate function names", (name, abi) => {
    const names = abi.filter((e) => e.type === "function").map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("exposes the booking read/write surface Web3BookingButton and MyBookings call", () => {
    const names = BOOKING_ESCROW_ABI.filter((e) => e.type === "function").map((e) => e.name);
    for (const fn of ["createBooking", "calculateDeposit", "getUserBookings", "cancelBooking"]) {
      expect(names, `BookingEscrow ABI is missing ${fn}`).toContain(fn);
    }
    const bookingCreated = BOOKING_ESCROW_ABI.find(
      (e) => e.type === "event" && e.name === "BookingCreated",
    );
    expect(bookingCreated, "BookingCreated event must be declared for receipt parsing").toBeTruthy();
  });

  it("exposes the pass read surface the pass card and mint button call", () => {
    const names = WHITE_ROCK_PASS_ABI.filter((e) => e.type === "function").map((e) => e.name);
    for (const fn of [
      "mintPass",
      "getDiscountBpsForUser",
      "balanceOf",
      "tokenURI",
      "tierConfigs",
    ]) {
      expect(names, `WhiteRockPass ABI is missing ${fn}`).toContain(fn);
    }
  });

  it("keeps the ERC-721 view functions non-payable and the mutators payable/nonpayable as the contract does", () => {
    const createBooking = BOOKING_ESCROW_ABI.find(
      (e) => e.type === "function" && e.name === "createBooking",
    );
    // BookingEscrow.createBooking is `payable` because MON deposits arrive as
    // msg.value; declaring it nonpayable would make every MON booking revert
    // with no value forwarded.
    expect(createBooking?.stateMutability).toBe("payable");

    const mintPass = WHITE_ROCK_PASS_ABI.find(
      (e) => e.type === "function" && e.name === "mintPass",
    );
    // WhiteRockPass.mintPass settles in USDT via safeTransferFrom, so it must
    // stay nonpayable — a payable declaration would let a caller strand MON.
    expect(mintPass?.stateMutability).toBe("nonpayable");

    for (const entry of [...WHITE_ROCK_PASS_ABI, ...BOOKING_ESCROW_ABI]) {
      if (entry.type === "function" && entry.name.startsWith("get")) {
        expect(entry.stateMutability, `${entry.name} must be a view`).toBe("view");
      }
    }
  });
});

describe("DAYBED_TYPES", () => {
  it("has exactly four tiers with contiguous zero-based ids", () => {
    // BookingEscrow validates `daybedType < 4`, and Web3BookingButton guards
    // with `daybedType >= DAYBED_TYPES.length`. Both must describe the same
    // range, otherwise the UI guard and the contract check disagree.
    expect(DAYBED_TYPES).toHaveLength(4);
    expect(DAYBED_TYPES.map((t) => t.id)).toEqual([0, 1, 2, 3]);
  });

  it("names each tier uniquely", () => {
    const names = DAYBED_TYPES.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("quotes both a MON and a USDT minimum spend for every tier", () => {
    for (const tier of DAYBED_TYPES) {
      expect(tier.minSpend).toMatch(/^\d+(\.\d+)? MON$/);
      expect(tier.minSpendUsdt).toMatch(/^\d+ USDT$/);
    }
  });

  it("mirrors the baseMinSpend arrays BookingEscrow charges per tier", () => {
    // BookingEscrow.sol:
    //   uint256[4] baseMinSpendMON  = [0.01e18, 0.05e18, 0.10e18, 0.005e18];
    //   uint256[4] baseMinSpendUSDT = [30e6,    150e6,   300e6,   15e6];
    // These are the numbers the guest is quoted in the booking modal, so the
    // mirror must match the chain exactly. Tier 3 (Single Sofa) is deliberately
    // the cheapest — the ids are category codes, not a price ranking, which is
    // why this asserts values rather than an ordering.
    const expectedMon = ["0.01", "0.05", "0.10", "0.005"];
    const expectedUsdt = [30, 150, 300, 15];
    DAYBED_TYPES.forEach((tier, index) => {
      expect(Number.parseFloat(tier.minSpend), `tier ${tier.id} MON min spend`).toBe(
        Number.parseFloat(expectedMon[index]),
      );
      expect(Number.parseFloat(tier.minSpendUsdt), `tier ${tier.id} USDT min spend`).toBe(
        expectedUsdt[index],
      );
    });
  });
});

describe("PASS_TIERS", () => {
  it("has three tiers matching the WhiteRockPass.PassTier enum order", () => {
    // enum PassTier { LAGOON, VIP_CABANA, PARTY_SUITE }
    expect(PASS_TIERS.map((t) => t.id)).toEqual([0, 1, 2]);
    expect(PASS_TIERS.map((t) => t.name)).toEqual([
      "Lagoon Pass",
      "VIP Cabana Pass",
      "Party Suite Pass",
    ]);
  });

  it("mirrors the discountBps the contract assigns to each tier", () => {
    // WhiteRockPass constructor: LAGOON 500bps, VIP_CABANA 1000bps,
    // PARTY_SUITE 2000bps. The UI prints these as percentages, so a drift here
    // would advertise a discount the chain does not grant.
    const expectedBps = [500, 1000, 2000];
    PASS_TIERS.forEach((tier, index) => {
      const advertisedPercent = Number.parseFloat(tier.discount.replace("%", ""));
      expect(advertisedPercent * 100).toBe(expectedBps[index]);
    });
  });

  it("mirrors the USDT price the contract charges for each tier", () => {
    // WhiteRockPass constructor: 10e6, 50e6, 100e6 with 6 decimals.
    const expectedPrices = [10, 50, 100];
    PASS_TIERS.forEach((tier, index) => {
      const advertisedPrice = Number.parseFloat(tier.price.replace(" USDT", ""));
      expect(advertisedPrice).toBe(expectedPrices[index]);
    });
  });
});
