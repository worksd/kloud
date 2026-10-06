'use client';

// 마이페이지 '내 정규반' 한 줄 — 모바일(ProfileForm)·PC(ProfilePcForm) 공용.
// getLocaleString 이 'use client' 모듈이라 서버 컴포넌트에서 직접 부르면 터진다 — 패스권 목록 행(PassListRow)처럼 클라이언트 컴포넌트로 둔다.
//
// 보유 패스권 카드와 같은 밝은 카드 행. 썸네일(담당 강사 → 학원 로고 → 반 이름 첫 글자) + 반 이름 / '매주 화·목 · 9.15부터 수강 중' 한 줄(작게).
// 종료일은 목록에 안 그린다 — '언제부터 다니는 반인지'만 알려주고 나머지는 상세에서.
// 단 종료가 임박(D-5 이하)하면 오른쪽에 D-day 칩만 작게 — 연장·결제를 챙기라는 신호. 응답에 다음 결제일은 없어 종료일 기준이다.
// 탭하면 내 정규반 상세(/profile/myRegularClass/:passId) — 혜택 대신 수업 목록을 보여주는 화면.

import React from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { MyRegularClassResponse } from "@/app/endpoint/user.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { formatPassDays } from "@/utils/pass.days";
import { ChevronRightIcon } from "@/app/profile/ActivityIcons";
import { ddayLabel } from "@/app/profile/profile.format";

// 'yyyy-MM-dd' → 'yyyy.M.d' — 작은 보조 문구라 0 패딩 없이 짧게
const shortDate = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  if (!y || !m || !day) return d;
  return `${y}.${m}.${day}`;
};

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

  // 보조 한 줄: '매주 화·목 · 2026.9.15부터 수강 중'. 요일 없는 반은 날짜만, 시작일 없으면 요일만
  const daysLabel = formatPassDays(item.days, locale);
  const weekly = daysLabel ? getLocaleString({ locale, key: 'every_week_days' }).replace('{days}', daysLabel) : null;
  const since = (() => {
    if (!item.startDate) return null;
    const date = shortDate(item.startDate);
    return item.status === 'Waiting'
      ? `${date} ${getLocaleString({ locale, key: 'start_scheduled' })}`
      : getLocaleString({ locale, key: 'regular_class_since' }).replace('{date}', date);
  })();
  const meta = [weekly, since].filter(Boolean).join(' · ');

  // 종료 임박 D-day — 쓸 수 있는 줄에서 D-5 이하일 때만. 멀면 안 그린다(목록은 시작일 중심)
  const DDAY_SHOW_WITHIN = 5;
  const dday = (() => {
    if (!isActive) return null;
    const label = ddayLabel(item.endDate);
    if (!label) return null;
    const n = label === 'D-Day' ? 0 : Number(label.replace('D-', ''));
    return n <= DDAY_SHOW_WITHIN ? label : null;
  })();

  const pc = variant === 'pc';
  const shell = pc
    ? 'flex items-center gap-4 rounded-[20px] px-4 py-3.5 cursor-pointer bg-[#F9FAFB] hover:bg-[#F2F4F6] transition-colors'
    : 'flex items-center gap-3.5 rounded-[20px] px-4 py-3.5 bg-[#F9FAFB] active:scale-[0.985] transition-all duration-150';
  const thumb = pc ? 'w-14 h-14' : 'w-[52px] h-[52px]';

  return (
    <NavigateClickWrapper method="push" route={KloudScreen.MyRegularClassDetail(item.id)}>
      <div className={`${shell} ${isActive ? '' : 'opacity-60'}`}>
        {thumbUrl ? (
          <div className={`relative ${thumb} rounded-[14px] overflow-hidden shrink-0 ${isActive ? '' : 'grayscale'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          // 강사도 학원 로고도 없으면 반 이름 첫 글자 — 아이콘보다 어느 반인지 바로 보인다
          <span className={`${thumb} rounded-[14px] bg-[#EEF1F5] text-[#4E5968] text-[18px] font-bold flex items-center justify-center shrink-0 select-none`}>
            {title.trim().charAt(0)}
          </span>
        )}
        <div className="flex flex-col min-w-0 flex-1 gap-[3px]">
          <span className="text-[15px] font-semibold text-[#191F28] truncate tracking-[-0.3px] leading-snug">{title}</span>
          {meta && (
            <span className="text-[12px] text-[#8B95A1] truncate tracking-[-0.2px] leading-snug">{meta}</span>
          )}
        </div>
        {dday && (
          <span className="shrink-0 px-2 py-[3px] rounded-[6px] bg-[#191F28] text-white text-[11px] font-bold font-paperlogy tracking-wide">
            {dday}
          </span>
        )}
        {isUnpaid && (
          <span className="shrink-0 px-2 py-[3px] rounded-[6px] bg-[#FFF8EC] text-[#A05A00] text-[11px] font-bold tracking-[-0.1px] whitespace-nowrap">
            {getLocaleString({ locale, key: 'pass_status_unpaid' })}
          </span>
        )}
        <ChevronRightIcon className="text-[#D1D6DB] shrink-0 -ml-1"/>
      </div>
    </NavigateClickWrapper>
  );
};
