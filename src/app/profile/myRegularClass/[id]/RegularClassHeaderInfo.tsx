// 내 정규반 상세 헤더 안쪽 — 학원 로고 + 반 이름/가격정책/학원명(+PC 는 ⋮ 수업 일정 변경 메뉴), 반 설명·담당 강사, 기간·요일 표.
// 출석 QR 은 패스 상세와 달리 안 보여준다.
// 모바일/PC 공용(배경·여백은 바깥에서). 반 이미지는 모바일은 폼의 히어로, PC 는 여기서 헤더 위 배너.
// 반 이름은 정규반 상세(GET /regular-classes/:id), 기간·요일은 GET /passes/:id. 가격정책(passPlan) 이름은 반 이름 아래 작게.

import React from "react";
import { translate } from "@/utils/translate";
import { Locale } from "@/shared/StringResource";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { RegularClassDetailResponse } from "@/app/endpoint/studio.endpoint";
import { CircleImage } from "@/app/components/CircleImage";
import { PassDaysChip } from "@/app/components/PassDaysChip";
import { formatPassDays } from "@/utils/pass.days";
import { RescheduleMenuButton } from "@/app/profile/myRegularClass/[id]/RegularClassReschedule";
import { resolveRegularClassImage } from "@/utils/regular.class.image";

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-[13px] text-[#86898C] shrink-0">{label}</span>
    <span className="text-[15px] font-bold text-black text-right truncate">{children}</span>
  </div>
);

export const RegularClassHeaderInfo = async ({ pass, regularClass, locale, variant }: {
  pass: GetPassResponse;
  regularClass: RegularClassDetailResponse | null;
  locale: Locale;
  variant: 'mobile' | 'pc';
}) => {
  const plan = pass.passPlan;
  const studio = plan?.studio;
  // 반 이름 — 정규반 상세 > pass 의 passPlan.regularClass > (둘 다 없으면) 가격정책 이름
  const className = regularClass?.name || plan?.regularClass?.name || plan?.name || '';
  // 가격정책 이름은 반 이름과 다를 때만 아래 작게 (같으면 중복)
  const planName = plan?.name && plan.name !== className ? plan.name : null;
  const pc = variant === 'pc';

  const artist = regularClass?.artist;
  const artistName = artist ? (artist.nickName || artist.name) : '';
  // 반 설명 — 비어 있으면 생략
  const description = regularClass?.description?.trim();
  // PC 배너 이미지 — 반 이미지 > 담당 강사 프로필 > 학원 로고 (모바일 히어로와 같은 규칙)
  const bannerUrl = pc ? resolveRegularClassImage(regularClass, studio) : null;

  return (
    <>
      {/* PC — 반 이미지 배너 (모바일은 폼에서 풀블리드 히어로) */}
      {bannerUrl && (
        <div className="-mx-6 -mt-6 mb-5 aspect-[3/1] overflow-hidden rounded-t-2xl bg-[#F1F3F6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bannerUrl} alt="" className="w-full h-full object-cover"/>
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {studio?.profileImageUrl ? (
            <CircleImage size={44} imageUrl={studio.profileImageUrl}/>
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#F1F3F6] shrink-0"/>
          )}
          <div className="flex flex-col min-w-0">
            <h1 className={`${pc ? 'text-[20px]' : 'text-[18px]'} font-bold text-black truncate`}>{className}</h1>
            {planName && <span className="text-[12px] text-[#4E5968] truncate">{planName}</span>}
            <span className="text-[13px] text-[#86898C] truncate">{studio?.name}</span>
          </div>
        </div>
        {/* ⋮ — 수업 일정 변경 메뉴. PC 만 여기, 모바일은 RegularClassTopBar */}
        {pc && <div className="shrink-0"><RescheduleMenuButton/></div>}
      </div>

      {description && (
        <p className="mt-3.5 text-[13.5px] leading-[1.55] text-[#4E5968] tracking-[-0.2px] whitespace-pre-line line-clamp-3">{description}</p>
      )}

      {/* 담당 강사 — 안 정했으면(null) 줄째 생략 */}
      {artist && artistName && (
        <div className="mt-3 flex items-center gap-2 min-w-0">
          {artist.profileImageUrl
            ? <CircleImage size={24} imageUrl={artist.profileImageUrl}/>
            : <span className="w-6 h-6 rounded-full bg-[#F1F3F6] shrink-0"/>}
          <span className="text-[13px] text-[#86898C]">{await translate('regular_class_artist')}</span>
          <span className="text-[13px] font-semibold text-[#191F28] truncate">{artistName}</span>
        </div>
      )}

      <div className={`mt-4 px-4 py-3.5 rounded-xl bg-white/70 ${pc ? '' : 'backdrop-blur-sm'} flex flex-col gap-2.5`}>
        {/* TODO(2026-10-30): 이용기한 — 정규반 상세에선 이 표시(라벨·기간 값)를 고쳐야 한다. 지금은 pass 의 startDate~endDate 를 패스 상세 그대로 */}
        <InfoRow label={await translate('pass_period')}>{pass.startDate} ~ {pass.endDate}</InfoRow>
        {formatPassDays(pass.days) && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-[#86898C]">{await translate('pass_days_label')}</span>
            <PassDaysChip days={pass.days} locale={locale}/>
          </div>
        )}
      </div>
    </>
  );
};
