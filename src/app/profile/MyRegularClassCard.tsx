'use client';

// 마이페이지 '내 정규반' 한 줄 — 모바일(ProfileForm)·PC(ProfilePcForm) 공용.
// getLocaleString 이 'use client' 모듈이라 서버 컴포넌트에서 직접 부르면 터진다 — 패스권 목록 행(PassListRow)처럼 클라이언트 컴포넌트로 둔다.
// 보유 패스권 카드와 같은 밝은 카드 행. 썸네일(담당 강사 → 학원 로고, 스튜디오 상세 정규반 카드와 같은 순서) + 반 이름 / 학원·기간 + D-day·요일 칩.
// 탭하면 패스 상세(GET /passes/:id) — 정규반 상품도 상세 조회는 막지 않는다.

import React from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { MyRegularClassResponse } from "@/app/endpoint/user.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { PassDaysChip } from "@/app/components/PassDaysChip";
import { PassFlatIcon, ChevronRightIcon } from "@/app/profile/ActivityIcons";
import { ddayLabel, formatEndDate } from "@/app/profile/profile.format";

// 'yyyy-MM-dd' → 'yyyy.MM.dd' — 패스권 목록 행(PassListRow)의 시작 예정 문구와 같은 표기
const dot = (d: string) => d.replace(/-/g, '.');

export const MyRegularClassCard = ({ item, locale, variant = 'mobile' }: {
  item: MyRegularClassResponse;
  locale: Locale;
  /** mobile=눌림 스케일 / pc=호버 배경 */
  variant?: 'mobile' | 'pc';
}) => {
  const rc = item.regularClass;
  // 미납 유예(Unpaid)도 쓸 수 있는 상태 — 사용중처럼 그리고 '미납' 칩만 덧붙인다
  const isUnpaid = item.status === 'Unpaid';
  const isActive = item.status === 'Active' || isUnpaid;
  const title = rc?.name || item.passPlan?.name || '';
  const thumbUrl = rc?.artist?.profileImageUrl || item.studio?.profileImageUrl;
  const dday = isActive ? ddayLabel(item.endDate) : null;

  // 보조 문구 — 대기중(Waiting)은 시작일, 입금 확인중(Pending)은 상태, 그 외는 종료일
  const subline = (() => {
    switch (item.status) {
      case 'Waiting':
        return item.startDate ? `${dot(item.startDate)} ${getLocaleString({ locale, key: 'start_scheduled' })}` : null;
      case 'Pending':
        return getLocaleString({ locale, key: 'pending_account_transfer' });
      default:
        return item.endDate ? formatEndDate(item.endDate, locale) : null;
    }
  })();
  // 학원 이름 · 기간을 한 줄에. 둘 중 있는 것만
  const meta = [item.studio?.name, subline].filter(Boolean).join(' · ');

  const pc = variant === 'pc';
  const shell = pc
    ? 'flex items-center gap-4 rounded-[20px] px-4 py-3.5 cursor-pointer bg-[#F9FAFB] hover:bg-[#F2F4F6] transition-colors'
    : 'flex items-center gap-3.5 rounded-[20px] px-4 py-3.5 bg-[#F9FAFB] active:scale-[0.985] transition-all duration-150';
  const thumb = pc ? 'w-14 h-14' : 'w-[52px] h-[52px]';

  return (
    <NavigateClickWrapper method="push" route={KloudScreen.MyPassDetail(item.id)}>
      <div className={`${shell} ${isActive ? '' : 'opacity-60'}`}>
        {thumbUrl ? (
          <div className={`relative ${thumb} rounded-[14px] overflow-hidden shrink-0 ${isActive ? '' : 'grayscale'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <span className={`${thumb} rounded-[14px] bg-white flex items-center justify-center shrink-0`}>
            <PassFlatIcon size={pc ? 30 : 28}/>
          </span>
        )}
        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
          <span className="text-[15px] font-semibold text-[#191F28] truncate tracking-[-0.3px]">{title}</span>
          {meta && (
            <span className="text-[12.5px] text-[#8B95A1] truncate tracking-[-0.2px]">{meta}</span>
          )}
          {/* 다니는 요일 — 요일이 정해진 반만 */}
          <PassDaysChip days={item.days} locale={locale} className="self-start mt-0.5"/>
        </div>
        {isUnpaid && (
          <span className="shrink-0 px-2 py-[3px] rounded-[6px] bg-[#FFF8EC] text-[#A05A00] text-[11px] font-bold tracking-[-0.1px] whitespace-nowrap">
            {getLocaleString({ locale, key: 'pass_status_unpaid' })}
          </span>
        )}
        {dday && (
          <span className="shrink-0 px-2 py-[3px] rounded-[6px] bg-[#191F28] text-white text-[11px] font-bold font-paperlogy tracking-wide">
            {dday}
          </span>
        )}
        <ChevronRightIcon className="text-[#D1D6DB] shrink-0 -ml-1"/>
      </div>
    </NavigateClickWrapper>
  );
};
