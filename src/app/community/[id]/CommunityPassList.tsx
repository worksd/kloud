'use client';

import React, { useEffect, useState } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { CommunityPass } from "@/app/community/community.mock";
import { useCommunityAction } from "@/app/community/[id]/CommunityActionBar";

const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

// 스튜디오에서 구매 가능한 이용권 목록. 선택한 순간 하단 액션 바에 "구매하기" 노출.
export function CommunityPassList({ passes }: { passes: CommunityPass[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { setAction, clearAction, activeSource } = useCommunityAction();

  useEffect(() => {
    if (activeSource && activeSource !== 'pass') setSelectedId(null);
  }, [activeSource]);

  useEffect(() => {
    const pass = passes.find((p) => p.id === selectedId);
    if (pass) {
      setAction({
        source: 'pass',
        label: `${pass.name} 구매하기`,
        onConfirm: () => kloudNav.push(`/payment?item=pass-plan&id=${pass.id}`),
      });
    } else {
      clearAction('pass');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (!passes.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {passes.map((p) => {
        const selected = p.id === selectedId;
        return (
          <button
            key={p.id}
            onClick={() => setSelectedId((prev) => (prev === p.id ? null : p.id))}
            className={`text-left rounded-2xl border p-4 transition-colors ${selected ? 'border-[#3CC0AF] bg-[#EAF7F4]' : 'border-[#EEF0F2] active:bg-[#FAFBFC]'}`}
          >
            <div className="flex items-center gap-2">
              {p.tag && (
                <span className="px-2 py-0.5 rounded-full bg-[#EAF7F4] text-[#2AA894] text-[11px] font-bold">{p.tag}</span>
              )}
              <span className="text-[16px] font-bold text-[#171717]">{p.name}</span>
            </div>
            {p.description && (
              <p className="mt-1 text-[13px] text-[#86898C] leading-snug">{p.description}</p>
            )}
            <div className="mt-3 flex items-end justify-between gap-2">
              <div className="flex flex-col">
                {p.period && <span className="text-[12px] text-[#A0A5AB]">유효기간 {p.period}</span>}
                <span className="text-[18px] font-bold text-[#171717]">{fmt(p.price)}원</span>
              </div>
              {selected && (
                <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#1E9E8A]">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path d="M5 12.5 10 17l9-10" stroke="#1E9E8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  선택됨
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
