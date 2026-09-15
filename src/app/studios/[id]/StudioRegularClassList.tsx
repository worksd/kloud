'use client';

import React from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { StudioRegularClassResponse } from "@/app/endpoint/studio.endpoint";

/**
 * 스튜디오 상세 — 정규반 카드 목록 (판매중 상위 4건, BE가 잘라서 내려줌).
 * 탭하면 바로 결제 페이지로 — 그 반의 패스권(가격정책)을 결제 화면 안에서 고른다.
 *
 * 카드는 이미지 + 이름 + 강사 줄만. artist 는 null 이 정상 데이터(강사 미정/삭제) — 그 경우 강사 줄을 숨기고 카드는 그대로.
 * 강사 이름은 `nickName || name` — name 이 null 이 아니라 빈 문자열로 오므로 `??` 로 고르면 안 된다.
 */
export function StudioRegularClassList({ classes, studioId, layout = 'list' }: {
  classes: StudioRegularClassResponse[];
  studioId: number;
  /** list=세로 행(모바일) / grid=2열 카드(PC) */
  layout?: 'list' | 'grid';
}) {
  if (!classes.length) return null;

  const wrap = layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3';

  return (
    <div className={wrap}>
      {classes.map((c) => {
        const artistLabel = c.artist ? (c.artist.nickName || c.artist.name) : '';
        return (
          <button
            key={c.id}
            onClick={() => kloudNav.push(KloudScreen.RegularClassPayment(studioId, c.id))}
            className="w-full text-left rounded-2xl border border-[#EEF0F2] p-3 flex items-center gap-3 cursor-pointer transition-colors active:bg-[#FAFBFC] hover:bg-[#FAFBFC]"
          >
            {/* 반 대표 이미지 — 없으면 회색 박스 */}
            <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#F1F3F6]">
              {c.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="text-[15px] font-bold text-[#171717] truncate">{c.name}</span>
              {/* 담당 강사 — 있을 때만. 아바타(없으면 기본 사람 아이콘) + 예명/본명 */}
              {artistLabel && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="shrink-0 w-5 h-5 rounded-full overflow-hidden bg-[#E9EBEE] flex items-center justify-center">
                  {c.artist?.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.artist.profileImageUrl} alt={artistLabel} className="w-full h-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                      <circle cx="12" cy="8" r="3.5" stroke="#8A949E" strokeWidth="1.6" />
                      <path d="M5 19.5c1.2-3.3 3.9-5 7-5s5.8 1.7 7 5" stroke="#8A949E" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span className="text-[12px] font-medium text-[#4E5968] truncate">{artistLabel}</span>
              </div>
              )}
            </div>

            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
              <path d="M9 6l6 6-6 6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
