import React, { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseUnits } from 'viem';
import { CONTRACT_ADDRESSES, WHITE_ROCK_PASS_ABI, PASS_TIERS } from '@/web3/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Shield, Sparkles } from 'lucide-react';
import { useLang } from '@/lib/i18n';

// MockUSDT ERC20 ABI (just approve + allowance)
const USDT_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface MintPassButtonProps {
  compact?: boolean;
}

export const MintPassButton: React.FC<MintPassButtonProps> = ({ compact = false }) => {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending, isSuccess, error } = useWriteContract();
  const { tf } = useLang();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [step, setStep] = useState<'idle' | 'approving' | 'minting'>('idle');

  // Check if user already owns a pass
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.whiteRockPass,
    abi: WHITE_ROCK_PASS_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const hasPass = balance !== undefined && balance > 0n;

  const handleMint = (tierId: number) => {
    if (!address) return;
    const tier = PASS_TIERS[tierId];
    const priceUsdt = parseUnits(tierId === 0 ? '10' : tierId === 1 ? '50' : '100', 6);

    setSelectedTier(tierId);
    setStep('approving');

    // Step 1: Approve USDT to WhiteRockPass contract
    writeContract({
      address: CONTRACT_ADDRESSES.mockUSDT,
      abi: USDT_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.whiteRockPass, priceUsdt],
      onSuccess: () => {
        // Step 2: Mint pass (after approval succeeds)
        setStep('minting');
        writeContract({
          address: CONTRACT_ADDRESSES.whiteRockPass,
          abi: WHITE_ROCK_PASS_ABI,
          functionName: 'mintPass',
          args: [tierId],
          onSuccess: () => setStep('idle'),
          onError: () => setStep('idle'),
        });
      },
      onError: () => setStep('idle'),
    });
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-slate-400 text-sm">
          {tf({ id: 'Hubungkan wallet untuk mint Pass', en: 'Connect wallet to mint Pass', ru: 'Подключите кошелёк для mint Pass', ko: '지갑을 연결하여 Pass를 민팅하세요' })}
        </p>
        <ConnectButton label={tf({ id: 'Hubungkan Wallet', en: 'Connect Wallet', ru: 'Подключить кошелёк', ko: '지갑 연결' })} />
      </div>
    );
  }

  if (hasPass) {
    return (
      <div className="flex items-center gap-2 text-emerald-400">
        <Check className="h-5 w-5" />
        <span className="text-sm font-semibold">
          {tf({ id: 'Kamu sudah punya VIP Pass!', en: 'You already own a VIP Pass!', ru: 'У вас уже есть VIP-пропуск!', ko: '이미 VIP 패스를 보유하고 있습니다!' })}
        </span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-slate-400">
          {tf({ id: 'Mint VIP Pass untuk diskon', en: 'Mint VIP Pass for discounts', ru: 'Mint VIP-пропуск для скидок', ko: 'VIP 패스를 민팅하여 할인을 받으세요' })}
        </p>
        <div className="flex gap-2">
          {PASS_TIERS.map((tier) => (
            <Button
              key={tier.id}
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleMint(tier.id)}
              className="border-amber-300/30 text-amber-300 hover:bg-amber-300/10 text-xs"
            >
              {isPending && selectedTier === tier.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                tier.name.split(' ')[0]
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="glass border-amber-300/20 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-300 text-lg">
          <Shield className="h-5 w-5" />
          {tf({ id: 'Mint VIP Membership Pass', en: 'Mint VIP Membership Pass', ru: 'Mint VIP-пропуск', ko: 'VIP 멤버십 패스 민팅' })}
        </CardTitle>
        <p className="text-slate-400 text-sm">
          {tf({ id: 'Mint NFT pass untuk diskon hingga 20% di semua reservasi', en: 'Mint an NFT pass for up to 20% off all reservations', ru: 'Mint NFT-пропуск для скидки до 20% на все бронирования', ko: 'NFT 패스를 민팅하면 모든 예약에서 최대 20% 할인' })}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {PASS_TIERS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => handleMint(tier.id)}
              disabled={isPending}
              className={`relative p-4 rounded-xl border transition-all duration-200 text-left
                ${selectedTier === tier.id && isPending
                  ? 'border-amber-300/50 bg-amber-300/10'
                  : 'border-white/10 bg-white/5 hover:border-amber-300/30 hover:bg-amber-300/5'
                }`}
            >
              {isPending && selectedTier === tier.id && (
                <Loader2 className="absolute top-2 right-2 h-4 w-4 animate-spin text-amber-300" />
              )}
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                {tier.name.split(' ')[0]}
              </div>
              <div className="text-amber-300 font-bold text-sm">{tier.price}</div>
              <div className="flex items-center gap-1 mt-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span className="text-xs text-amber-400">{tier.discount} off</span>
              </div>
            </button>
          ))}
        </div>

        {step === 'approving' && (
          <div className="flex items-center gap-2 text-amber-300 text-xs p-2 rounded-lg bg-amber-300/10">
            <Loader2 className="h-3 w-3 animate-spin" />
            Approving USDT spend...
          </div>
        )}

        {step === 'minting' && (
          <div className="flex items-center gap-2 text-amber-300 text-xs p-2 rounded-lg bg-amber-300/10">
            <Loader2 className="h-3 w-3 animate-spin" />
            Minting NFT Pass...
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm p-3 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
            <Check className="h-4 w-4" />
            {tf({ id: 'VIP Pass berhasil dimint!', en: 'VIP Pass minted successfully!', ru: 'VIP-пропуск успешно заминчен!', ko: 'VIP 패스 민팅 성공!' })}
          </div>
        )}

        {error && (
          <div className="text-rose-400 text-xs p-3 rounded-lg bg-rose-400/10 border border-rose-400/20">
            Error: {error.message?.slice(0, 100)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
