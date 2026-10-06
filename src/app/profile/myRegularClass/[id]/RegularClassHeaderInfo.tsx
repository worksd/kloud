// 내 정규반 상세 헤더 안쪽 — 학원 로고 + 반 이름/학원명 + QR, 기간·요일·수강 방식 표. 모바일/PC 공용(배경·여백은 바깥에서).
// 데이터는 GET /passes/:id 그대로 — passPlan.regularClass 가 반, passPlan 이 수강 방식(가격정책).

import React from "react";
import { translate } from "@/utils/translate";
import { Locale } from "@/shared/StringResource";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { CircleImage } from "@/app/components/CircleImage";
import { PassQRCode } from "@/app/profile/myPass/[id]/PassQRCode";
import { resolvePassQrValue } from "@/app/profile/myPass/[id]/pass.qr";
import { PassDaysChip } from "@/app/components/PassDaysChip";
import { formatPassDays } from "@/utils/pass.days";

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-[13px] text-[#86898C] shrink-0">{label}</span>
    <span className="text-[15px] font-bold text-black text-right truncate">{children}</span>
  </div>
);

export const RegularClassHeaderInfo = async ({ pass, locale, variant }: { pass: GetPassResponse; locale: Locale; variant: 'mobile' | 'pc' }) => {
  const plan = pass.passPlan;
  const studio = plan?.studio;
  const className = plan?.regularClass?.name ?? plan?.name ?? '';
  const qrValue = resolvePassQrValue(pass);
  const pc = variant === 'pc';

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {studio?.profileImageUrl ? (
            <CircleImage size={44} imageUrl={studio.profileImageUrl}/>
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#F1F3F6] shrink-0"/>
          )}
          <div className="flex flex-col min-w-0">
            <h1 className={`${pc ? 'text-[20px]' : 'text-[18px]'} font-bold text-black truncate`}>{className}</h1>
            <span className="text-[13px] text-[#86898C] truncate">{studio?.name}</span>
          </div>
        </div>
        {/* QR — 기한이 남은(Active) 상품만. 출석 체크용, 패스 상세와 같은 규칙 */}
        {qrValue && (
          <PassQRCode url={qrValue} hint={await translate('pass_qr_scan_hint')} closeLabel={await translate('confirm')}/>
        )}
      </div>

      <div className={`mt-4 px-4 py-3.5 rounded-xl bg-white/70 ${pc ? '' : 'backdrop-blur-sm'} flex flex-col gap-2.5`}>
        <InfoRow label={await translate('pass_period')}>{pass.startDate} ~ {pass.endDate}</InfoRow>
        {formatPassDays(pass.days) && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-[#86898C]">{await translate('pass_days_label')}</span>
            <PassDaysChip days={pass.days} locale={locale}/>
          </div>
        )}
        {/* 수강 방식(가격정책) — 반 이름과 다를 때만 (같으면 중복) */}
        {plan?.name && plan.name !== className && (
          <InfoRow label={await translate('regular_class_pass_plan')}>{plan.name}</InfoRow>
        )}
      </div>
    </>
  );
};
