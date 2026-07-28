'use client';

import React, { useEffect, useState } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { CommunityNotice } from "@/app/community/community.mock";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const fmtDate = (s: string) => {
  const [y, m, d] = s.split('-');
  return `${y}.${m}.${d}`;
};

// 'yyyy.MM.dd HH:mm'(KST) 또는 ISO → Date. 실패 시 null.
const parseCreatedAt = (s: string): Date | null => {
  const m = s.match(/^(\d{4})\.(\d{2})\.(\d{2})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

// 작성 시각 → 상대 표기(방금/N분/N시간/N일 전), 7일 이상은 날짜. 다국어.
const formatTimeAgo = (s: string, locale: Locale): string => {
  const d = parseCreatedAt(s);
  if (!d) return '';
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return t('time_ago_just_now');
  if (min < 60) return t('time_ago_minutes').replace('{count}', String(min));
  const hr = Math.floor(min / 60);
  if (hr < 24) return t('time_ago_hours').replace('{count}', String(hr));
  const day = Math.floor(hr / 24);
  if (day < 7) return t('time_ago_days').replace('{count}', String(day));
  if (day < 30) return t('time_ago_weeks').replace('{count}', String(Math.floor(day / 7)));
  if (day < 365) return t('time_ago_months').replace('{count}', String(Math.floor(day / 30)));
  return t('time_ago_years').replace('{count}', String(Math.floor(day / 365)));
};

const MAX_VISIBLE = 3;

// 스튜디오 공지사항. 각 항목 탭 시 내용 펼침 (아코디언).
// 최대 3개만 노출, "전체보기"는 스튜디오 공지 전체 페이지로 이동(일반 스튜디오와 동일 route).
export function PracticeNoticeList({ notices, studioId, locale }: { notices: CommunityNotice[]; studioId: number; locale: Locale }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  // 상대 시각은 '지금' 기준이라 SSR/클라 하이드레이션 미스매치 방지용 마운트 가드
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
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
            {open && (n.content || n.imageUrl || n.createdAt) && (
              <div className="px-4 pb-4 -mt-1">
                {n.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.imageUrl} alt="" className="w-full rounded-xl mb-2 object-cover" />
                )}
                {n.content && (
                  <p className="text-[13px] text-[#4E5968] leading-relaxed whitespace-pre-line">{n.content}</p>
                )}
                {mounted && n.createdAt && (
                  <p className="mt-2 text-right text-[11px] font-medium text-[#A0A5AB]">
                    {formatTimeAgo(n.createdAt, locale)}
                  </p>
                )}
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
