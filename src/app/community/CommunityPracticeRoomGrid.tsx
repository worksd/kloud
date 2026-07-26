'use client';

import React from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { CommunityStudioResponse } from "@/app/endpoint/community.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

// §…§ 로 감싼 강조 구간을 크고 볼드하게 렌더(색은 배지 종류별로 지정).
// 예: '… 중 §40명§이 …' → '40명'만 12px 볼드 강조. 기본 텍스트는 10px/500.
const renderHighlighted = (template: string, highlightColor: string) => {
  const parts = template.split('§');
  return parts.map((p, i) => (i % 2 === 1
    ? <span key={i} className="text-[12px] font-bold leading-none" style={{ color: highlightColor }}>{p}</span>
    : <React.Fragment key={i}>{p}</React.Fragment>));
};

// 커뮤니티 — 우리 스튜디오 근처 연습실(2열 카드). 이미지 위 배지(기준 학원 수강생 이용 인원) + 이름 + 걸어서 N분.
export const CommunityPracticeRoomGrid = ({ studios, locale }: { studios: CommunityStudioResponse[]; locale: Locale }) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  // 세 필드가 모두 undefined인 항목 = 기준 학원 자기 자신. 배지 문구의 학원명으로 쓰고, 카드 목록에선 제외.
  const base = studios.find((s) => s.walkingMinute === undefined && s.distanceMeter === undefined && s.studentBookingCount === undefined);
  const baseName = base?.name;
  const cards = base ? studios.filter((s) => s.id !== base.id) : studios;

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-[#85898C] text-[15px] font-medium">{t('community_no_studios')}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4 px-4 pt-1 pb-12">
      {cards.map((room) => {
        const walkingMinute = room.walkingMinute ?? null;
        const bookingCount = room.studentBookingCount ?? 0;
        // 배지 — 기준 학원명이 있고 이용 인원이 1명 이상일 때만.
        const showBadge = !!baseName && bookingCount > 0;
        const badge = showBadge
          ? t('community_student_used').replace('{studio}', baseName!).replace('{count}', String(bookingCount))
          : null;
        return (
          <button
            key={room.id}
            onClick={() => kloudNav.push(KloudScreen.StudioDetail(room.id))}
            className="flex flex-col rounded-[14px] overflow-hidden bg-[#F4F5F7] text-left active:scale-[0.98] transition-transform"
          >
            {/* 이미지 + 상단 배지 */}
            <div className="relative w-full aspect-[4/5] bg-[#E7E9EC]">
              {room.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={room.imageUrl} alt={room.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
                    <rect x="3" y="5" width="22" height="18" rx="3" stroke="#CDD1D5" strokeWidth="1.5" />
                    <path d="M3 17L9 12L14 16L19 11L25 17" stroke="#CDD1D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              {showBadge && (
                <>
                  {/* 상단 dim 그라디언트 — 흰 글씨 가독성 확보 */}
                  <div className="absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-black/65 via-black/30 to-transparent pointer-events-none" />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start gap-1.5">
                    {/* 기준 학원 로고(썸네일) */}
                    {base?.imageUrl && (
                      <span className="mt-[1px] w-[16px] h-[16px] rounded-[5px] overflow-hidden bg-black/30 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={base.imageUrl} alt="" className="w-full h-full object-cover" />
                      </span>
                    )}
                    {/* 기본 텍스트 스펙: Paperlogy 10px / 500 / line-height 130% / #FFF */}
                    <p className="font-paperlogy text-white text-[10px] font-medium leading-[130%] drop-shadow-sm">
                      {renderHighlighted(badge!, '#F6FFA3')}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* 하단 정보 — 이름 + 주소(첫 구간) + 걸어서 N분 */}
            <div className="px-3 pt-2.5 pb-2">
              <p className="text-[16px] font-bold text-[#171717] leading-tight line-clamp-1">{room.name}</p>
              {room.address?.split(',')[0]?.trim() && (
                <p className="mt-0.5 text-[11px] font-medium text-[#8A949E] leading-snug line-clamp-2">{room.address.split(',')[0].trim()}</p>
              )}
              {walkingMinute != null && walkingMinute <= 30 && (
                <p className="mt-1.5 flex items-center gap-1 text-[13px] font-medium text-[#8A949E]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/ic_foot.svg" alt="" className="w-[14px] h-[14px] shrink-0" />
                  {t('community_walk_minute').replace('{count}', String(walkingMinute))}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
