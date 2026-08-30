# 🎓 Guide Smart Contract Archava — Dari Nol Sampai Paham

> **Target:** Pemula yang mau paham smart contract Archava
> **Network:** Monad Testnet (Chain ID: 10143)

---

## 📌 Apa Itu Smart Contract?

Bayangin kayak **mesin vending machine digital**. Lo setor uang → mesin kasih barang. Tapi ini jalan di blockchain (Monad Testnet), jadi:

- **Gak bisa diubah** setelah deploy
- **Transparan** — siapapun bisa audit kode-nya
- **Otomatis** — gak perlu perantara

---

## 🏗️ Arsitektur Archava

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│    MockUSDT      │     │    WhiteRockPass      │     │  BookingEscrow  │
│                  │     │                       │     │                 │
│  Token palsu     │     │  NFT membership       │     │  Escrow booking │
│  (kupon testnet) │     │  (kartu VIP)          │     │  (rekening      │
│                  │     │                       │     │   bersama)       │
└────────┬────────┘     └──────────┬────────────┘     └────────┬────────┘
         │                         │                           │
         │  user approve           │  cek diskon               │
         │  USDT ke escrow         │  via getDiscountBps       │
         └─────────────────────────┼───────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  User booking:               │
                    │  1. Punya NFT? → diskon auto │
                    │  2. Bayar USDT → terkunci    │
                    │  3. Check-in → uang lepas    │
                    │  4. Cancel → refund          │
                    └──────────────────────────────┘
```

---

## 📋 Istilah Penting

| Istilah | Artinya |
|---------|---------|
| **Blockchain** | Database terdistribusi yang gak bisa diubah |
| **Smart Contract** | Program yang jalan di blockchain |
| **NFT** | Token unik (satu token = satu gambar/atribut) |
| **ERC-721** | Standar NFT |
| **ERC-20** | Standar token (kayak USDT, DAI) |
| **Wei** | Unit terkecil ETH/MON (1 MON = 10^18 wei) |
| **BPS** | Basis Points (500 BPS = 5%) |
| **Escrow** | Rekening bersama (uang ditahan sampai syarat terpenuhi) |
| **Reentrancy** | Serangan dimana hacker panggil fungsi berulang sebelum selesai |
| **EIP-712** | Standar signing data di Ethereum |

---

## 📄 Contract 1: MockUSDT.sol (Token Palsu)

**File:** `contracts/src/MockUSDT.sol` (49 baris)

### Analogi Sederhana

Bayangin ini **kupon diskon buatan lo sendiri** buat event di White Rock Beach Club. Lo cetak sendiri, siapapun bisa ambil gratis, tapi cuma bisa dipake di tempat lo.

### Kenapa Butuh Ini?

Di testnet, orang gak punya uang asli. Jadi kita buat token palsu (USDT) biar bisa test booking tanpa bayar beneran.

### Kode per Kode

```solidity
contract MockUSDT is ERC20, Ownable {
```

> "MockUSDT" adalah token yang **mewarisi** dari ERC20 (standar token Ethereum) dan Ownable (cuma owner yang bisa akses fungsi admin).
> Kayak bilang: "Token ini nurut standar ERC20 + punya pemilik"

```solidity
    uint8 private constant DECIMALS = 6;
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**DECIMALS;
```

> **DECIMALS = 6** — Real USDT juga 6 desimal (bukan 18 kayak ETH). Jadi `1 USDT = 1_000_000` di blockchain.
> **FAUCET_AMOUNT = 1,000 USDT** — Setiap orang bisa ambil 1000 USDT gratis.

```solidity
    mapping(address => uint256) public lastFaucetClaim;
    uint256 public constant FAUCET_COOLDOWN = 1 hours;
```

> **Mapping** kayak spreadsheet: `alamat wallet → waktu terakhir ambil faucet`
> **Cooldown 1 jam** — biar orang gak spam ambil terus.

```solidity
    constructor(address initialOwner) ERC20("Mock Tether USD", "USDT") Ownable(initialOwner) {
        _mint(initialOwner, 1_000_000 * 10**DECIMALS);
    }
```

> Pas deploy, **cetak 1,000,000 USDT** ke wallet owner. Ini stok awal.

```solidity
    function faucet() external {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "Faucet cooldown active. Wait 1 hour between claims."
        );
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
```

> **Fungsi faucet** — Siapapun bisa panggil, tapi:
> 1. Cek apakah sudah lewat 1 jam dari terakhir klaim
> 2. Kalau belum → revert (gagal)
> 3. Kalau sudah → catat waktu klaim + cetak 1000 USDT ke wallet yang klaim

```solidity
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
```

> **Cuma owner** yang bisa cetak token tambahan. Berguna buat seeding pool atau testing.

### Flow MockUSDT

```
User klik "Claim USDT"
  → panggil faucet()
  → cek cooldown (1 jam?)
  → cetak 1000 USDT ke wallet user
  → user punya 1000 USDT buat test booking
```

### Angka yang Perlu Diingat

| Item | Nilai |
|------|-------|
| Desimal | 6 (sama kayak real USDT) |
| Faucet per klaim | 1,000 USDT |
| Cooldown | 1 jam |
| Stok awal | 1,000,000 USDT |
| Deployed | `0x53aF9A9440d268e8D6e57608B82ef147E105D8bf` |

---

## 📄 Contract 2: WhiteRockPass.sol (NFT Membership)

**File:** `contracts/src/WhiteRockPass.sol` (154 baris)

### Analogi Sederhana

Bayangin **kartu member VIP** White Rock Beach Club. Ada 3 level:

| Tier | Harga | Diskon | Max Supply |
|------|-------|--------|------------|
| 🏖️ Lagoon | 10 USDT | 5% | 500 kartu |
| 🌴 VIP Cabana | 50 USDT | 10% | 150 kartu |
| 🎉 Party Suite | 100 USDT | 20% | 50 kartu |

Lo beli kartu ini sekali, dapet NFT (gambar digital unik), dan diskon itu **terkoneksi otomatis** ke booking lo selanjutnya.

### Kenapa Pakai NFT?

Karena NFT itu **bisa dibuktikan dimiliki** secara on-chain. Smart contract BookingEscrow bisa langsung cek "oh orang ini punya VIP Cabana Pass" → otomatis kasih diskon 10%.

### Kode per Kode

```solidity
contract WhiteRockPass is ERC721Enumerable, Ownable {
```

> **ERC721** = standar NFT (satu token = satu gambar unik)
> **ERC721Enumerable** = bisa iterate semua token (cari semua NFT yang dimiliki seseorang)
> **Ownable** = ada pemilik yang bisa admin

```solidity
    enum PassTier { LAGOON, VIP_CABANA, PARTY_SUITE }
```

> **Enum** = tipe data yang cuma boleh salah satu dari daftar ini.
> LAGOON = 0, VIP_CABANA = 1, PARTY_SUITE = 2

```solidity
    struct TierConfig {
        uint256 price;       // Harga dalam wei (1 MON = 10^18 wei)
        uint16 discountBps;  // Diskon dalam Basis Points (500 = 5%)
        uint32 maxSupply;    // Max jumlah yang bisa dicetak
        uint32 currentSupply;// Sudah berapa tercetak
        bool active;         // Masih aktif atau enggak
    }
```

> **Struct** = kotak data yang gabungin beberapa variabel jadi satu.
> **Basis Points (BPS)** = cara bilang persen dengan angka bulat.
> - 500 BPS = 5.00%
> - 1000 BPS = 10.00%
> - 2000 BPS = 20.00%
> Kenapa gak pakai persen langsung? Karena di blockchain, desimal harus presisi.

```solidity
    mapping(PassTier => TierConfig) public tierConfigs;
    mapping(uint256 => PassTier) public tokenTiers;
```

> **tierConfigs**: LAGOON → {price: 0.05, discount: 500, ...}
> **tokenTiers**: tokenId #1 → VIP_CABANA (NFT ini adalah VIP Cabana pass)

```solidity
    constructor(string memory baseURI, address initialOwner)
        ERC721("White Rock VIP Pass", "WRPASS")
        Ownable(initialOwner)
    {
        _baseTokenURI = baseURI;

        tierConfigs[PassTier.LAGOON] = TierConfig({
            price: 10 * 10**6,   // 10 USDT
            discountBps: 500,    // 5% diskon
            maxSupply: 500,      // Max 500 kartu
            currentSupply: 0,
            active: true
        });

        tierConfigs[PassTier.VIP_CABANA] = TierConfig({
            price: 50 * 10**6,   // 50 USDT
            discountBps: 1000,   // 10% diskon
            maxSupply: 150,      // Max 150 kartu
            currentSupply: 0,
            active: true
        });

        tierConfigs[PassTier.PARTY_SUITE] = TierConfig({
            price: 100 * 10**6,  // 100 USDT
            discountBps: 2000,   // 20% diskon
            maxSupply: 50,       // Max 50 kartu
            currentSupply: 0,
            active: true
        });
    }
```

> Pas deploy, langsung setup 3 tier membership.

### Fungsi `mintPass` (Beli Kartu Member)

```solidity
    function mintPass(PassTier tier) external {
        TierConfig storage config = tierConfigs[tier];
        require(config.active, "Tier is not active");
        require(config.currentSupply < config.maxSupply, "Tier sold out");
        require(address(usdtToken) != address(0), "USDT token not set");

        // Transfer USDT dari user ke contract
        usdtToken.safeTransferFrom(msg.sender, address(this), config.price);

        config.currentSupply++;
        uint256 tokenId = totalSupply() + 1;
        tokenTiers[tokenId] = tier;

        _safeMint(msg.sender, tokenId);
        emit PassMinted(msg.sender, tokenId, tier);
    }
```

> **Cek 3 hal:**
> 1. Tier masih aktif?
> 2. Belum sold out?
> 3. Uang yang dikirim cukup?
>
> **Proses minting:**
> 1. Tambah counter tier
> 2. Hitung token ID baru
> 3. Catat: "Token #5 ini adalah VIP Cabana"
> 4. Mint NFT ke wallet user
> 5. Emit event (log di blockchain)
>
> **Refund kelebihan:** Kalau user kirim 0.1 MON tapi harga cuma 0.05 MON, sisanya dikembalikan.
> Pakai `call{value}` bukan `transfer()` karena `transfer()` cuma kasih 2300 gas — gak cukup buat wallet contract (EIP-4337).

### Fungsi `getDiscountBpsForUser` (Cek Diskon)

```solidity
    function getDiscountBpsForUser(address user) external view returns (uint16 maxDiscount) {
        uint256 balance = balanceOf(user);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            PassTier tier = tokenTiers[tokenId];
            uint16 bps = tierConfigs[tier].discountBps;
            if (bps > maxDiscount) {
                maxDiscount = bps;
            }
        }
        return maxDiscount;
    }
```

> **Loop semua NFT yang dimiliki user** → cari diskon tertinggi.
> Misal: User punya 2 NFT (Lagoon 5% + VIP Cabana 10%) → return 10% (yang tertinggi).

### Fungsi `setTierConfig` (Admin Update Harga)

```solidity
    function setTierConfig(...) external onlyOwner {
        require(price > 0, "Price must be > 0");
        require(discountBps <= 10000, "Discount cannot exceed 100%");
        require(maxSupply > 0, "Max supply must be > 0");
        // ... update config
    }
```

> **Cuma owner** yang bisa ubah harga. Plus validasi: harga > 0, diskon ≤ 100%, supply > 0.

### Flow WhiteRockPass

```
User klik "Mint VIP Cabana Pass"
  → approve 50 USDT ke WhiteRockPass
  → panggil mintPass()
  → cek: aktif? cukup uang? belum sold out?
  → cetak NFT #1 ke wallet user
  → refund kelebihan (kalau ada)
  → sekarang user punya NFT VIP Cabana
  → bookingEscrow.auto-detect diskon 10%
```

### Angka yang Perlu Diingat

| Item | Nilai |
|------|-------|
| Nama | "White Rock VIP Pass" |
| Simbol | "WRPASS" |
| Standard | ERC-721 Enumerable |
| Payment | USDT (ERC20) |
| Tier | 3 (Lagoon 10 USDT, VIP Cabana 50 USDT, Party Suite 100 USDT) |
| Deployed | `0x5Bb5A242A2Db2a40592407676FcfcEe94ce7342E` |

---

## 📄 Contract 3: BookingEscrow.sol (Escrow Booking)

**File:** `contracts/src/BookingEscrow.sol` (277 baris)

### Analogi Sederhana

Bayangin **rekening bersama** (escrow) kayak di marketplace:
1. User mau booking daybed → **setor uang ke rekening bersama**
2. Uang dikunci di smart contract (gak bisa diambil siapapun)
3. Kalau user datang → **uang dilepas ke venue** (owner)
4. Kalau user cancel > 24 jam sebelumnya → **uang dikembalikan ke user**

### Kenapa Pakai Escrow?

- **Adil** — Uang gak langsung ke venue, jadi user aman kalau venue cancel
- **Otomatis** — Refund 24 jam dijalanin blockchain, gak perlu admin
- **Transparan** — Siapapun bisa cek status booking di explorer

### Data Structure

```solidity
    struct Booking {
        uint256 bookingId;
        address guest;          // Wallet yang booking
        uint8 daybedType;       // 0=Lagoon, 1=VIP Cabana, 2=Party Suite, 3=Single Sofa
        uint64 visitTimestamp;  // Kapan mau datang
        uint256 depositAmount;  // Berapa uang yang disetor
        address paymentToken;   // address(0)=MON, atau alamat USDT
        bool checkedIn;         // Sudah check-in?
        bool cancelled;         // Sudah cancel?
        bool settled;           // Uang sudah dilepas?
    }
```

### Harga yang Ditetapkan

```solidity
    uint256[4] public baseMinSpendUSDT = [
        30 * 10**6,   // Lagoon = 30 USDT
        150 * 10**6,  // VIP Cabana = 150 USDT
        300 * 10**6,  // Party Suite = 300 USDT
        15 * 10**6    // Single Sofa = 15 USDT
    ];
```

> `10**6` = 10^6 = 1,000,000 (USDT punya 6 desimal)

### Fungsi `calculateDeposit` (Hitung Harga)

```solidity
    function calculateDeposit(address guest, uint8 daybedType, address token) public view returns (uint256) {
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
```

> **Logika:**
> 1. Pilih harga berdasarkan token (MON atau USDT)
> 2. Cek apakah user punya NFT pass → ambil diskon
> 3. Hitung: `baseAmount - (baseAmount × discountBps / 10000)`
> 
> **Contoh:** VIP Cabana 150 USDT + punya VIP Cabana Pass (10% diskon):
> - `150 - (150 × 1000 / 10000) = 150 - 15 = 135 USDT`

### Fungsi `createBooking` (Booking Langsung)

```solidity
    function createBooking(uint8 daybedType, uint64 visitTimestamp, address paymentToken) 
        external payable nonReentrant returns (uint256) 
    {
        require(visitTimestamp > uint64(block.timestamp), "Visit must be in the future");
        uint256 requiredDeposit = calculateDeposit(msg.sender, daybedType, paymentToken);
```

> **Cek 2 hal:**
> 1. Tanggal kunjungan harus masa depan (gak bisa booking kemarin)
> 2. Hitung deposit yang harus dibayar

```solidity
        if (paymentToken == address(0)) {
            if (msg.value < requiredDeposit) revert InvalidDeposit();
        } else {
            IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), requiredDeposit);
        }
```

> **Bayar:**
> - Kalau pakai MON → cek `msg.value` (uang yang dikirim)
> - Kalau pakai USDT → panggil `transferFrom` (ambil dari wallet user ke contract)

```solidity
        uint256 bookingId = nextBookingId++;
        bookings[bookingId] = Booking({...});
        userBookingIds[msg.sender].push(bookingId);
        emit BookingCreated(...);
```

> **Simpan booking:**
> 1. Buat ID baru (1, 2, 3, ...)
> 2. Simpan semua data booking
> 3. Catat: "User ini punya booking #1"
> 4. Emit event (log di blockchain)

### Fungsi `cancelBooking` (Cancel + Refund)

```solidity
    function cancelBooking(uint256 bookingId) external nonReentrant {
        Booking storage b = bookings[bookingId];
        if (b.bookingId == 0) revert BookingNotFound();
        if (b.guest != msg.sender) revert NotGuest();
        if (b.checkedIn || b.cancelled || b.settled) revert AlreadyProcessed();
        if (block.timestamp + 24 hours > b.visitTimestamp) revert CancellationPeriodExpired();
```

> **Cek 4 hal:**
> 1. Booking ada?
> 2. Yang cancel = yang booking?
> 3. Belum check-in / cancel / settle?
> 4. Masih > 24 jam sebelum kunjungan?

```solidity
        b.cancelled = true;

        if (b.paymentToken == address(0)) {
            (bool sent, ) = payable(b.guest).call{value: b.depositAmount}("");
            require(sent, "Failed to refund guest");
        } else {
            IERC20(b.paymentToken).safeTransfer(b.guest, b.depositAmount);
        }

        emit BookingCancelled(bookingId, b.guest, b.depositAmount);
    }
```

> **Refund:**
> - Tandai booking sebagai cancelled
> - Kalau pakai MON → kirim balik ke wallet user
> - Kalau pakai USDT → transfer balik ke wallet user
> - Emit event

### Fungsi `checkIn` (Admin Check-In)

```solidity
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
```

> **Cuma admin (owner) yang bisa check-in:**
> 1. Tandai: checkedIn = true, settled = true
> 2. Lepas uang escrow ke wallet owner (venue)
> 3. Emit 2 event

### Flow BookingEscrow

```
1. USER MAU BOOKING
   User klik "Book VIP Cabana" → kirim 135 USDT ke contract
   → calculateDeposit() hitung: 150 - 10% = 135
   → createBooking() simpan booking #1
   → uang terkunci di contract (escrow)

2. USER DATANG (H-0)
   Staff klik "Check-In" → masukin booking ID #1
   → checkIn() lepas 135 USDT ke wallet venue
   → booking selesai

ATAU

2. USER CANCEL (H-24)
   User klik "Cancel" → panggil cancelBooking(#1)
   → cek: masih > 24 jam? ✓
   → kembaliin 135 USDT ke wallet user
   → booking dibatalkan
```

### Angka yang Perlu Diingat

| Item | Nilai |
|------|-------|
| Daybed Types | 4 (Lagoon, VIP Cabana, Party Suite, Single Sofa) |
| Cancel Window | > 24 jam sebelum kunjungan |
| Payment | MON (native) atau USDT (ERC20) |
| Deployed | `0xE1589000752d7e4458e41e8618296843037C8081` |

---

## 🔗 Hubungan 3 Contract

```
User mint NFT (WhiteRockPass)
  → dapet diskon on-chain

User booking (BookingEscrow)
  → panggil calculateDeposit()
  → WhiteRockPass.getDiscountBpsForUser(user) → diskon auto
  → bayar USDT → uang terkunci

Staff check-in (BookingEscrow)
  → uang dilepas ke venue

User cancel (BookingEscrow)
  → uang dikembalikan otomatis
```

---

## 🛡️ Kenapa Aman? (Security)

### 1. Reentrancy Attack

**Masalah:** Hacker panggil fungsi berulang kali sebelum transaksi selesai.

**Solusi:**
```solidity
function cancelBooking(uint256 bookingId) external nonReentrant {
    // nonReentrant = gak bisa dipanggil berulang
    b.cancelled = true;  // State di-update DULU
    payable(b.guest).call{value: b.depositAmount}("");  // Baru kirim uang
}
```

**Prinsip:** `Checks-Effects-Interactions`
1. **Checks** — Cek semua kondisi
2. **Effects** — Update state DULU
3. **Interactions** — Baru kirim uang

### 2. Transfer Gas Limit (2300 Gas)

**Masalah:** `transfer()` cuma kasih 2300 gas. Smart contract wallet gak cukup.

**Solusi:**
```solidity
// ❌ JANGAN PAKAI INI
payable(msg.sender).transfer(amount);

// ✅ PAKAI INI
(bool sent, ) = payable(msg.sender).call{value: amount}("");
require(sent, "Failed to send");
```

### 3. Booking Tanggal Kemarin

```solidity
require(visitTimestamp > uint64(block.timestamp), "Visit must be in the future");
```

### 4. Diskon Lebih dari 100%

```solidity
require(discountBps <= 10000, "Discount cannot exceed 100%");
```

### 5. Harga Nol

```solidity
require(price > 0, "Price must be > 0");
require(maxSupply > 0, "Max supply must be > 0");
```

### 6. Zero Address

```solidity
require(_passContract != address(0), "Invalid pass contract address");
require(initialOwner != address(0), "Invalid owner address");
require(_usdtToken != address(0), "Invalid USDT token address");
```

### 7. Signature Replay

```solidity
nonces[guest]++  // Nonce di-increment setiap pemakaian
```

### 8. Admin Abuse

```solidity
// Cuma owner yang bisa:
function withdraw() external onlyOwner { ... }
function checkIn(uint256 bookingId) external onlyOwner { ... }
function setTierConfig(...) external onlyOwner { ... }
```

### 9. Deadline Expired

```solidity
if (block.timestamp > deadline) revert DeadlineExpired();
```

---

## 📊 Test Coverage

| Tool | Result |
|------|--------|
| Unit Tests | 153/153 PASS |
| Fuzz Testing | 10,000 runs PASS |
| Coverage | 96-100% |
| Slither | No critical/high/medium |
| Certora | 12 formal verification rules submitted |

---

## 📍 Deployed Contracts

| Contract | Address | Network |
|----------|---------|---------|
| MockUSDT | `0x53aF9A9440d268e8D6e57608B82ef147E105D8bf` | Monad Testnet |
| WhiteRockPass | `0x5Bb5A242A2Db2a40592407676FcfcEe94ce7342E` | Monad Testnet |
| BookingEscrow | `0x7FB626bcF2722f45e25EEd445385e2Da34B1077e` | Monad Testnet |

---

## 🔗 Useful Links

- **Monad Explorer:** https://testnet.monadexplorer.com
- **Certora WhiteRockPass:** https://prover.certora.com/output/1177248/0f05f9bcfd79460fad6d9ef316f3863c
- **Certora BookingEscrow:** https://prover.certora.com/output/1177248/55df2b83250644ec98ed0a31c3b1adc1
