'use client';

import React from "react";

export type TopTabItem<T extends string> = { key: T; label: string };

/**
 * 상단 세그먼트 탭 — 밑줄형. 목록 페이지를 탭으로 나눌 때 공용으로 쓴다.
 * 탭 상태는 호출부가 들고(쿼리스트링 등), 여기는 그리기와 onChange 만.
 */
export function TopTabs<T extends string>({ tabs, value, onChange, className = '' }: {
  tabs: TopTabItem<T>[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={`flex border-b border-[#EEF0F2] ${className}`}>
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`relative flex-1 py-3 text-[15px] font-bold transition-colors ${active ? 'text-[#171717]' : 'text-[#9AA0A6] active:text-[#4E5968]'}`}
          >
            {t.label}
            {active && <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#171717] rounded-full" />}
          </button>
        );
      })}
    </div>
  );
}
