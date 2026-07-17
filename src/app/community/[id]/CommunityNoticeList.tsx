'use client';

import React, { useState } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { CommunityNotice } from "@/app/community/community.mock";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const fmtDate = (s: string) => {
  const [y, m, d] = s.split('-');
  return `${y}.${m}.${d}`;
};

const MAX_VISIBLE = 3;

// 스튜디오 공지사항. 각 항목 탭 시 내용 펼침 (아코디언).
// 최대 3개만 노출, "전체보기"는 스튜디오 공지 전체 페이지로 이동(일반 스튜디오와 동일 route).
export function CommunityNoticeList({ notices, studioId, locale }: { notices: CommunityNotice[]; studioId: number; locale: Locale }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  if (!notices.length) return null;

  const visible = notices.slice(0, MAX_VISIBLE);
  const hasMore = notices.length > MAX_VISIBLE;

  return (
    <div className="rounded-2xl border border-[#EEF0F2] overflow-hidden divide-y divide-[#F1F3F6]">
      {visible.map((n, i) => {
        const open = i === openIdx;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIdx(open ? null : i)}
              className="w-full text-left px-4 py-3.5 active:bg-[#FAFBFC] transition-colors"
            >
              <div className="flex items-center gap-2">
                {n.date && <span className="text-[12px] font-medium text-[#A0A5AB] shrink-0">{fmtDate(n.date)}</span>}
                <span className="flex-1 min-w-0 text-[14px] font-bold text-[#171717] truncate">{n.title}</span>
                <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
            {open && n.content && (
              <div className="px-4 pb-4 -mt-1">
                <p className="text-[13px] text-[#4E5968] leading-relaxed whitespace-pre-line">{n.content}</p>
              </div>
            )}
          </div>
        );
      })}

      {hasMore && (
        <button
          onClick={() => kloudNav.push(KloudScreen.AnnouncementList(studioId))}
          className="w-full flex items-center justify-center gap-1 py-3 text-[13px] font-bold text-[#4E5968] active:bg-[#FAFBFC] transition-colors"
        >
          {getLocaleString({ locale, key: 'community_notice_view_all' })}
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M9 6l6 6-6 6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
