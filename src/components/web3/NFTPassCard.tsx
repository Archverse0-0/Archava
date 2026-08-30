import { useAccount, useReadContract } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";
import { CONTRACT_ADDRESSES, WHITE_ROCK_PASS_ABI, PASS_TIERS } from "@/web3/contracts";
import { Shield, Sparkles, Check } from "lucide-react";

export const NFTPassCard = () => {
  const { address } = useAccount();
  const { tf } = useLang();

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.whiteRockPass,
    abi: WHITE_ROCK_PASS_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: discountBps } = useReadContract({
    address: CONTRACT_ADDRESSES.whiteRockPass,
    abi: WHITE_ROCK_PASS_ABI,
    functionName: "getDiscountBpsForUser",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  if (!address || !balance || balance === 0n) return null;

  const discountPercent = discountBps ? Number(discountBps) / 100 : 0;

  return (
    <Card className="glass rounded-2xl border-amber-300/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-300 text-lg">
          <Shield className="h-5 w-5" />
          {tf({ id: "VIP Pass Kamu", en: "Your VIP Pass", ru: "Ваш VIP-пропуск", ko: "회원님의 VIP 패스" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">{tf({ id: "Total Pass", en: "Total Passes", ru: "Всего пропусков", ko: "총 패스" })}</span>
          <span className="text-white font-bold">{String(balance)}</span>
        </div>
        {discountBps !== undefined && discountBps > 0n && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">{tf({ id: "Diskon Aktif", en: "Active Discount", ru: "Активная скидка", ko: "활성 할인" })}</span>
            <Badge className="bg-emerald-500/20 text-emerald-400">
              <Sparkles className="h-3 w-3 mr-1" />
              {discountPercent}% OFF
            </Badge>
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          {PASS_TIERS.map((tier) => (
            <div key={tier.id} className="flex items-center gap-1 text-xs text-slate-500">
              <Check className="h-3 w-3" />
              {tier.name}: {tier.discount}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
