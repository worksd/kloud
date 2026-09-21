'use client'

import React from "react";
import { CircleImage } from "@/app/components/CircleImage";
import { PassDaysChip } from "@/app/components/PassDaysChip";
import { PassPlanBenefits } from "@/app/payment/PassPlanBenefits";
import { Locale } from "@/shared/StringResource";
import { useRegularClassPayment } from "@/app/payment/RegularClassPaymentContext";

/**
 * 정규반 결제 — 선택된 패스권의 헤더(이미지·학원·이름·기간·시작일·요일·혜택).
 * page.tsx / PaymentPcForm 의 일반 pass-plan 헤더와 같은 마크업이지만, 컨텍스트의 현재 견적을 보고 그린다.
 * variant: mobile(본문 풀폭) / pc(우측 요약 카드)
 */
export const RegularClassPassPlanHeader = ({ locale, startsOnLabel, variant }: {
  locale: Locale;
  /** '{date}부터 시작' — 서버에서 번역해 넘긴다 */
  startsOnLabel: string;
  variant: 'mobile' | 'pc';
}) => {
  const ctx = useRegularClassPayment();
  if (!ctx) return null;
  const { payment } = ctx;
  const plan = payment.passPlan;
  if (!plan) return null;

  const title = plan.name;
  const studioName = plan.studio?.name;
  const studioImageUrl = plan.studio?.profileImageUrl;
  const startsOn = payment.startDate ? startsOnLabel.replace('{date}', payment.startDate) : null;

  if (variant === 'pc') {
    return (
      <>
        {plan.imageUrl && (
          <div className="w-full aspect-[1/1] max-w-[260px] mx-auto rounded-xl overflow-hidden bg-[#F1F3F6]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={plan.imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            {studioImageUrl && <CircleImage size={20} imageUrl={studioImageUrl} />}
            <span className="text-[13px] font-medium text-[#86898C]">{studioName}</span>
          </div>
          <p className="text-[17px] font-bold text-black">{title}</p>
          <div className="flex items-center gap-2">
            {plan.expireDateStamp && <p className="text-[12px] text-[#86898C] font-medium">{plan.expireDateStamp}</p>}
            {startsOn && <p className="text-[12px] text-[#4E5968] font-medium">{startsOn}</p>}
            <PassDaysChip days={plan.days} locale={locale}/>
          </div>
          <PassPlanBenefits passPlan={plan} locale={locale} />
        </div>
      </>
    );
  }

  return (
    <div className="px-5 pt-4 pb-3">
      {plan.imageUrl && (
        <div className="w-full aspect-[1/1] rounded-2xl overflow-hidden bg-[#F1F3F6] mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={plan.imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex items-center gap-2.5 mb-3">
        {studioImageUrl && <CircleImage size={24} imageUrl={studioImageUrl} />}
        <span className="text-[13px] font-medium text-[#86898C]">{studioName}</span>
      </div>
      <p className="text-[20px] font-bold text-black mb-1">{title}</p>
      <div className="flex items-center gap-2 mb-4">
        {plan.expireDateStamp && <p className="text-[13px] text-[#86898C] font-medium">{plan.expireDateStamp}</p>}
        {startsOn && <p className="text-[13px] text-[#4E5968] font-medium">{startsOn}</p>}
        <PassDaysChip days={plan.days} locale={locale}/>
      </div>
      <PassPlanBenefits passPlan={plan} locale={locale} />
    </div>
  );
};
