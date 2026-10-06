'use client';

import Image from "next/image";
import { GetSubscriptionResponse } from "@/app/endpoint/subscription.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const STATUS_KEY: Record<GetSubscriptionResponse['status'], StringResourceKey> = {
  Active: 'active',
  Cancelled: 'cancelled',
  Failed: 'failed',
};

const statusChip = (status: GetSubscriptionResponse['status']) => {
  switch (status) {
    case 'Active': return 'bg-[#191F28] text-white';
    case 'Failed': return 'bg-[#FDECEC] text-[#E55B5B]';
    default: return 'bg-[#F2F4F6] text-[#8B95A1]';
  }
};

// 예약 결제(정기결제) 행 — 수강 내역/패스권 목록과 같은 구조. 썸네일(상품 → 없으면 스튜디오 로고) + 상품명/다음 결제일 + 상태 칩
export const SubscriptionRow = ({ sub, locale }: { sub: GetSubscriptionResponse; locale: Locale }) => {
  const isInactive = sub.status !== 'Active';
  const imageUrl = sub.productImageUrl || sub.studio?.profileImageUrl;
  const subline = sub.status === 'Active' && sub.paymentScheduledAt
    ? `${getLocaleString({ locale, key: 'payment_record_scheduled' })} ${sub.paymentScheduledAt}`
    : sub.endDate ? `${sub.endDate} ${getLocaleString({ locale, key: 'until' })}` : null;

  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.MySubscriptionDetail(sub.subscriptionId)}>
      <div className="px-5 py-4 flex items-center gap-4 active:bg-[#F9FAFB] transition-colors cursor-pointer select-none">
        <div className={`relative w-[56px] h-[56px] rounded-[14px] overflow-hidden bg-[#F2F4F6] shrink-0 ${isInactive ? 'grayscale opacity-60' : ''}`}>
          {imageUrl && <Image src={imageUrl} alt={''} fill sizes={'56px'} quality={50} className="object-cover"/>}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          {sub.studio?.name && (
            <p className={`text-[12.5px] truncate tracking-[-0.2px] ${isInactive ? 'text-[#B0B8C1]' : 'text-[#8B95A1]'}`}>{sub.studio.name}</p>
          )}
          <p className={`text-[15px] font-semibold leading-snug truncate tracking-[-0.3px] ${isInactive ? 'text-[#8B95A1]' : 'text-[#191F28]'}`}>{sub.productName}</p>
          {subline && (
            <p className={`text-[13px] truncate tracking-[-0.2px] ${isInactive ? 'text-[#B0B8C1]' : 'text-[#4E5968]'}`}>{subline}</p>
          )}
        </div>
        <span className={`shrink-0 self-start mt-0.5 px-2 py-[3px] rounded-[6px] text-[11px] font-bold tracking-[-0.1px] whitespace-nowrap ${statusChip(sub.status)}`}>
          {getLocaleString({ locale, key: STATUS_KEY[sub.status] })}
        </span>
      </div>
    </NavigateClickWrapper>
  );
};
