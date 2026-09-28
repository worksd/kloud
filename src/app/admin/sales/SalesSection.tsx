'use client';

import React, { useRef, useState } from 'react';
import { getRecentSalesAction } from '@/app/admin/sales/recent.sales.action';
import { RecentSales, SALES_RANGES, SalesRange } from '@/app/admin/sales/sales.range';
import { SalesBarChart } from '@/app/admin/sales/SalesBarChart';

/**
 * 기간 선택 + 매출 그래프.
 *
 * 첫 구간(7일)은 서버에서 렌더해 내려오고, 기간을 바꾸면 서버 액션으로 다시 집계한다.
 * 페이지 이동이 아니라 부분 갱신이라 아래 결제내역 리스트가 초기화되지 않는다.
 * 한 번 불러온 구간은 캐시해 되돌아올 때 재조회하지 않는다.
 */
export function SalesSection({ initial }: { initial: RecentSales }) {
  const [range, setRange] = useState<SalesRange>(initial.rangeDays as SalesRange);
  const [data, setData] = useState<RecentSales>(initial);
  const [loading, setLoading] = useState(false);
  const cache = useRef<Partial<Record<SalesRange, RecentSales>>>({ [initial.rangeDays as SalesRange]: initial });
  // 느린 응답이 늦게 도착해 나중 선택을 덮어쓰지 않게 — 마지막 선택만 반영
  const latest = useRef<SalesRange>(range);

  const select = async (next: SalesRange) => {
    if (next === range) return;
    setRange(next);
    latest.current = next;

    const cached = cache.current[next];
    if (cached) { setData(cached); setLoading(false); return; }

    setLoading(true);
    try {
      const res = await getRecentSalesAction(next);
      cache.current[next] = res;
      if (latest.current === next) setData(res);
    } finally {
      if (latest.current === next) setLoading(false);
    }
  };

  return (
    <>
      {/* 기간 필터 — 그래프 위 한 줄 */}
      <div className={'mx-4 mt-3 flex gap-1.5'}>
        {SALES_RANGES.map((r) => {
          const on = r === range;
          return (
            <button
              key={r}
              type={'button'}
              onClick={() => select(r)}
              aria-pressed={on}
              className={`h-[34px] px-3.5 rounded-full text-[13px] font-semibold transition-colors ${
                on
                  ? 'bg-[#1F1F1F] text-white'
                  : 'bg-white text-[#4E5968] border border-[#EEF0F2] active:bg-[#F4F5F7]'
              }`}
            >
              {r}일
            </button>
          );
        })}
      </div>

      <div className={loading ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
        <SalesBarChart data={data}/>
      </div>
    </>
  );
}
