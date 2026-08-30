import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Check, Loader2, Droplets } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Web3BookingButton } from "@/components/web3/Web3BookingButton";
import { MintPassButton } from "@/components/web3/MintPassButton";
import { NFTPassCard } from "@/components/web3/NFTPassCard";
import { DAYBED_TYPES, CONTRACT_ADDRESSES } from "@/web3/contracts";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { useMonPrice } from "@/hooks/useMonPrice";
import { formatUnits } from "viem";

// MockUSDT ABI (faucet + balanceOf)
const MOCK_USDT_ABI = [
  {
    inputs: [],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const DAYBED_DATA = [
  { type: 0, capacity: "4 pax", usdt: 30 },
  { type: 1, capacity: "12 pax", usdt: 270 },
  { type: 2, capacity: "15 pax", usdt: 480 },
  { type: 3, capacity: "2 pax", usdt: 18 },
];

const Booking = () => {
  const navigate = useNavigate();
  const { tf } = useLang();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDaybed, setSelectedDaybed] = useState<number | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const { address, isConnected } = useAccount();
  const { monPriceUsd, usdtToMon } = useMonPrice();
  const { writeContractAsync, isPending: isFauceting } = useWriteContract();

  // Read USDT balance
  const { data: usdtBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.mockUSDT,
    abi: MOCK_USDT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const dateStr = date ? date.toISOString().split("T")[0] : "";
  const balanceFormatted = usdtBalance ? formatUnits(usdtBalance, 6) : "0";

  const handleFaucet = async () => {
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.mockUSDT,
        abi: MOCK_USDT_ABI,
        functionName: "faucet",
      });
      refetchBalance();
    } catch (err) {
      console.error("Faucet failed:", err);
    }
  };

  return (
    <div>
      <PageHero
        eyebrow={{ id: "Reservasi", en: "Reservation", ru: "Бронирование", ko: "예약" }}
        title={{ id: "Reserve VIP Daybed", en: "Reserve VIP Daybed", ru: "Забронировать VIP Daybed", ko: "VIP 데이베드 예약" }}
        subtitle={{
          id: "Bayar dengan Mock USDT (gratis dari faucet). Dana di-amankan di smart contract Monad.",
          en: "Pay with Mock USDT (free from faucet). Funds secured in Monad smart contract.",
          ru: "Оплатите Mock USDT (бесплатно из faucet). Средства защищены смарт-контрактом Monad.",
          ko: "Mock USDT로 결제 (faucet에서 무료). Monad 스마트 컨트랙트에 자금 보관.",
        }}
      />

      <section className="py-16 px-5 md:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* USDT Faucet Banner */}
          {isConnected && (
            <Reveal>
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-500/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-6 w-6 text-emerald-400" />
                    <div>
                      <p className="text-white font-semibold">Mock USDT Faucet</p>
                      <p className="text-xs text-slate-400">Klaim 1,000 USDT gratis (1x per jam)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">Balance: <span className="text-emerald-400 font-bold">{balanceFormatted} USDT</span></span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isFauceting}
                      onClick={handleFaucet}
                      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      {isFauceting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Droplets className="h-4 w-4 mr-1" />
                      )}
                      {tf({ id: "Klaim USDT", en: "Claim USDT", ru: "Получить USDT", ko: "USDT 받기" })}
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Calendar + Daybed Selection */}
            <div className="space-y-6">
              <Reveal>
                <Card className="glow-card glass rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-center text-white text-xl font-cinzel">
                      {tf({ id: "Pilih Tanggal Kunjungan", en: "Select Visit Date", ru: "Выберите дату визита", ko: "방문 날짜 선택" })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-6">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md text-white"
                        disabled={(d) => d < new Date()}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Daybed Type Selection */}
              <Reveal delay={100}>
                <Card className="glow-card glass rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-center text-white text-xl font-cinzel">
                      {tf({ id: "Pilih Tipe Daybed", en: "Select Daybed Type", ru: "Выберите тип Daybed", ko: "데이베드 유형 선택" })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {DAYBED_TYPES.map((daybed, i) => (
                      <button
                        key={daybed.id}
                        onClick={() => setSelectedDaybed(daybed.id)}
                        className={`w-full p-4 rounded-xl border transition-all duration-200 text-left flex items-center justify-between
                          ${selectedDaybed === daybed.id
                            ? 'border-amber-300/50 bg-amber-300/10'
                            : 'border-white/10 bg-white/5 hover:border-amber-300/30 hover:bg-amber-300/5'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {selectedDaybed === daybed.id && (
                            <Check className="h-4 w-4 text-amber-300" />
                          )}
                          <div>
                            <div className="text-white font-semibold text-sm">{daybed.name}</div>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Users className="h-3 w-3" />
                              {DAYBED_DATA[i].capacity}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-300 font-bold text-sm">{daybed.minSpendUsdt}</div>
                          <div className="text-xs text-slate-500">
                            ~{usdtToMon(DAYBED_DATA[i].usdt)} MON
                          </div>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </Reveal>
            </div>

            {/* Right: Web3 Booking + Pass Mint */}
            <div className="space-y-6">
              {/* NFT Pass Display */}
              <Reveal delay={130}>
                <NFTPassCard />
              </Reveal>

              {/* Mint Pass Section */}
              <Reveal delay={150}>
                <MintPassButton />
              </Reveal>

              {/* Booking Button */}
              <Reveal delay={200}>
                <Card className="glow-card glass rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-center text-white text-xl font-cinzel">
                      {tf({ id: "Deposit Escrow", en: "Deposit Escrow", ru: "Депозит в эскроу", ko: "에스크로 입금" })}
                    </CardTitle>
                    <p className="text-center text-slate-400 text-sm">
                      {tf({
                        id: "Bayar pakai Mock USDT. Dana di-amankan di smart contract. Refund 100% jika batal 24 jam sebelumnya.",
                        en: "Pay with Mock USDT. Funds secured in smart contract. 100% refund if cancelled 24h before.",
                        ru: "Оплатите Mock USDT. Средства защищены в смарт-контракте. 100% возврат при отмене за 24ч.",
                        ko: "Mock USDT로 결제. 스마트 컨트랙트에 자금 보관. 24시간 전 취소 시 100% 환불.",
                      })}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {selectedDaybed !== null && dateStr ? (
                      <Web3BookingButton
                        daybedType={selectedDaybed}
                        dateString={dateStr}
                        onSuccess={(id, hash) => {
                          setBookingComplete(true);
                          navigate(`/bookingconfirmation?bookingId=${id}&tx=${hash}&checkin=${dateStr}&room=${DAYBED_TYPES[selectedDaybed].name}`);
                        }}
                      />
                    ) : (
                      <div className="text-center text-slate-500 text-sm py-4">
                        {tf({
                          id: "Pilih tanggal dan tipe daybed terlebih dahulu",
                          en: "Select a date and daybed type first",
                          ru: "Сначала выберите дату и тип daybed",
                          ko: "먼저 날짜와 데이베드 유형을 선택하세요",
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Reveal>

              {/* Back button */}
              <Reveal delay={250}>
                <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-400 w-full justify-center">
                  <ArrowLeft className="h-4 w-4" />
                  {tf({ id: "Kembali ke Home", en: "Back to Home", ru: "Вернуться на главную", ko: "홈으로 돌아가기" })}
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Booking;
