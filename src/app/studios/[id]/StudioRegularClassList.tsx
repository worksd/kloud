'use client';

import React from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { StudioRegularClassResponse } from "@/app/endpoint/studio.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

/** 상세에서 보여줄 최대 개수. BE도 상위 4건만 내리지만 전체 목록 페이지가 같은 컴포넌트를 쓰므로 여기서도 자른다 */
const MAX_VISIBLE = 4;

/**
 * 스튜디오 상세 — 정규반 카드 목록 (판매중 상위 4건, BE가 잘라서 내려줌).
 * 탭하면 바로 결제 페이지로 — 그 반의 패스권(가격정책)을 결제 화면 안에서 고른다.
 *
 * 카드 = 썸네일 + 제목 + 설명.
 *  - 썸네일: 강사(artist)가 있으면 강사 프로필, 없으면 학원 로고. artist 는 null 이 정상 데이터(강사 미정/삭제).
 *  - 설명이 없으면 제목만 세로 중앙 정렬.
 *  - 상세(showAll=false)는 4개까지 + '정규반 전체보기'. 전체 목록 페이지는 showAll 로 전부.
 */
export function StudioRegularClassList({ classes, studioId, studioImageUrl, locale, layout = 'list', showAll = false }: {
  classes: StudioRegularClassResponse[];
  studioId: number;
  /** 강사가 없는 반의 썸네일 폴백 — 학원 로고 */
  studioImageUrl?: string;
  locale: Locale;
  /** list=세로 행(모바일) / grid=2열 카드(PC) */
  layout?: 'list' | 'grid';
  /** true면 개수 제한·더보기 없이 전부 (전체 목록 페이지) */
  showAll?: boolean;
}) {
  if (!classes.length) return null;

  const visible = showAll ? classes : classes.slice(0, MAX_VISIBLE);
  // BE가 상위 4건으로 잘라 내리므로 4건이 꽉 찼으면 더 있을 수 있다고 보고 전체보기를 연다
  const hasMore = !showAll && classes.length >= MAX_VISIBLE;
  const wrap = layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3';

  return (
    <div className="flex flex-col gap-3">
    <div className={wrap}>
      {visible.map((c) => {
        const thumbUrl = c.artist?.profileImageUrl || studioImageUrl;
        const thumbAlt = c.artist ? (c.artist.nickName || c.artist.name || c.name) : c.name;
        return (
          <button
            key={c.id}
            onClick={() => kloudNav.push(KloudScreen.RegularClassPayment(studioId, c.id))}
            className="w-full text-left rounded-2xl border border-[#EEF0F2] p-3 flex items-center gap-3 cursor-pointer transition-colors active:bg-[#FAFBFC] hover:bg-[#FAFBFC]"
          >
            {/* 썸네일 — 강사 프로필, 없으면 학원 로고, 그것도 없으면 회색 박스 */}
            <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#F1F3F6]">
              {thumbUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbUrl} alt={thumbAlt} className="w-full h-full object-cover" />
              )}
            </div>

            {/* 제목 + 설명. 설명이 없으면 제목만 세로 중앙 */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
              <span className="text-[15px] font-bold text-[#171717] truncate">{c.name}</span>
              {c.description && (
                <p className="text-[12px] text-[#86898C] leading-snug line-clamp-2">{c.description}</p>
              )}
            </div>

            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
              <path d="M9 6l6 6-6 6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        );
      })}
    </div>

      {hasMore && (
        <button
          onClick={() => kloudNav.push(KloudScreen.StudioRegularClasses(studioId))}
          className="w-full flex items-center justify-center gap-1 py-3 text-[13px] font-bold text-[#4E5968] active:bg-[#FAFBFC] hover:bg-[#FAFBFC] rounded-2xl border border-[#EEF0F2] transition-colors"
        >
          {getLocaleString({ locale, key: 'regular_class_view_all' })}
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M9 6l6 6-6 6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
