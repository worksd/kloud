'use client';

import React, { useEffect, useState } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { CommunityPass } from "@/app/community/community.mock";
import { usePracticeAction } from "@/app/studios/[id]/practice/PracticeActionBar";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
const MAX_VISIBLE = 3;

// 스튜디오에서 구매 가능한 이용권 목록. 선택한 순간 하단 액션 바에 "구매하기" 노출.
// 최대 3개만 노출, "더보기"는 스튜디오 패스권 전체 페이지로 이동(일반 스튜디오와 동일 route).
export function StudioPassList({ passes, studioId, locale }: { passes: CommunityPass[]; studioId: number; locale: Locale }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { setAction, clearAction, activeSource } = usePracticeAction();
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  useEffect(() => {
    if (activeSource && activeSource !== 'pass') setSelectedId(null);
  }, [activeSource]);

  useEffect(() => {
    const pass = passes.find((p) => p.id === selectedId);
    if (pass) {
      setAction({
        source: 'pass',
        label: t('community_buy_pass').replace('{name}', pass.name),
        onConfirm: () => kloudNav.push(KloudScreen.PassPlanPayment(pass.id)),
      });
    } else {
      clearAction('pass');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (!passes.length) return null;

  const visible = passes.slice(0, MAX_VISIBLE);
  const hasMore = passes.length > MAX_VISIBLE;

  return (
    <div className="flex flex-col gap-3">
      {visible.map((p) => {
        const selected = p.id === selectedId;
        return (
          <button
            key={p.id}
            onClick={() => setSelectedId((prev) => (prev === p.id ? null : p.id))}
            className={`w-full text-left rounded-2xl border p-4 transition-colors flex items-center gap-3 ${selected ? 'border-[#3CC0AF] bg-[#EAF7F4]' : 'border-[#EEF0F2] active:bg-[#FAFBFC]'}`}
          >
            {/* 아이콘 (티켓) */}
            <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${selected ? 'bg-white' : 'bg-[#F1F3F6]'}`}>
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M4 8.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a2 2 0 0 0 0 5v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-5v-1Z"
                  stroke={selected ? '#2AA894' : '#8A949E'} strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M14 7v10" stroke={selected ? '#2AA894' : '#8A949E'} strokeWidth="1.6" strokeDasharray="2 2" />
              </svg>
            </div>

            {/* 이름 + 혜택 요약 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {p.tag && (
                  <span className="px-2 py-0.5 rounded-full bg-[#EAF7F4] text-[#2AA894] text-[11px] font-bold shrink-0">{p.tag}</span>
                )}
                <span className="text-[15px] font-bold text-[#171717] truncate">{p.name}</span>
              </div>
              {p.description && (
                <p className="mt-0.5 text-[12px] text-[#86898C] leading-snug line-clamp-1">{p.description}</p>
              )}
            </div>

            {/* 가격 + 유효기간(작게, 오른쪽 아래) */}
            <div className="shrink-0 flex flex-col items-end">
              <span className="text-[16px] font-bold text-[#171717]">{fmt(p.price)}{t('won')}</span>
              {p.period && <span className="mt-0.5 text-[11px] text-[#B0B5BB]">{p.period}</span>}
            </div>
          </button>
        );
      })}

      {hasMore && (
        <button
          onClick={() => kloudNav.push(KloudScreen.PurchasePass(studioId))}
          className="w-full flex items-center justify-center gap-1 py-3 text-[13px] font-bold text-[#4E5968] active:bg-[#FAFBFC] rounded-2xl border border-[#EEF0F2] transition-colors"
        >
          {t('community_pass_view_all')}
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M9 6l6 6-6 6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
