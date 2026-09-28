import React from 'react';
import { RecentSales } from '@/app/admin/sales/sales.range';

// 매출 탭의 유일한 그래프 — 기간별 일별 매출 세로 막대.
// 단일 시리즈라 범례 없음(제목이 시리즈를 지칭). 값 라벨은 최고액 막대에만 붙인다.
const BAR_COLOR = '#4B58D8';   // 흰 카드 대비 3:1 이상 (팔레트 검증 통과)
const EMPTY_BAR = '#EDEFF5';   // 매출 0원인 날의 자리 표시

const PLOT_HEIGHT = 116;
const MIN_BAR = 3;             // 0원이 아닌데 안 보이는 일 방지

const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

/** 막대 위 값 라벨 — 좁은 화면이라 만원 단위로 줄인다 */
const short = (n: number) => {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1).replace(/\.0$/, '')}억`;
  if (n >= 10_000) return `${Math.round(n / 10_000)}만`;
  return fmt(n);
};

export function SalesBarChart({ data }: { data: RecentSales }) {
  const max = Math.max(...data.days.map((d) => d.amount));
  const peakKey = max > 0 ? data.days.find((d) => d.amount === max)?.key : undefined;

  // 30일치를 다 적으면 축이 뭉개진다 — 기간이 길면 요일을 빼고 날짜도 띄엄띄엄.
  const dense = data.days.length > 14;
  const labelStep = dense ? 5 : 1;
  const barGap = dense ? 'gap-px' : 'gap-0.5';
  const barWidth = dense ? 'w-[72%]' : 'w-[62%]';

  return (
    <section className={'mx-4 mt-3 rounded-2xl bg-white border border-[#EEF0F2] p-5'}>
      <div className={'flex items-baseline justify-between gap-2'}>
        <h2 className={'text-[15px] font-bold text-[#191F28]'}>최근 {data.rangeDays}일 매출</h2>
        <span className={'text-[12px] font-semibold text-[#8B95A1] shrink-0'}>{data.range}</span>
      </div>

      <p className={'mt-2 text-[28px] font-bold text-[#191F28] tracking-[-0.6px] leading-none'}>
        {fmt(data.total)}<span className={'text-[18px] font-bold'}>원</span>
      </p>
      <p className={'mt-1.5 text-[12.5px] font-semibold text-[#8B95A1]'}>
        결제 {data.count}건{data.truncated && ' · 일부 기간은 최근 기록만 집계'}
      </p>

      {/* 막대 영역 — 값 라벨 자리를 위로 비워둔다 */}
      <div className={`mt-5 flex items-end ${barGap}`} style={{ height: PLOT_HEIGHT + 18 }}>
        {data.days.map((d) => {
          const ratio = max > 0 ? d.amount / max : 0;
          const height = d.amount > 0 ? Math.max(MIN_BAR, Math.round(ratio * PLOT_HEIGHT)) : 2;
          return (
            <div key={d.key} className={'flex-1 min-w-0 flex flex-col items-center justify-end gap-1'}>
              {d.key === peakKey && (
                <span className={'text-[10.5px] font-bold text-[#4B58D8] leading-none whitespace-nowrap'}>
                  {short(d.amount)}
                </span>
              )}
              <div
                className={`${barWidth} rounded-t-[4px]`}
                style={{ height, backgroundColor: d.amount > 0 ? BAR_COLOR : EMPTY_BAR }}
              />
            </div>
          );
        })}
      </div>

      {/* 축 — 막대와 같은 트랙 폭으로 요일/일자 */}
      <div className={`mt-2 pt-2 border-t border-[#F1F3F6] flex items-start ${barGap}`}>
        {data.days.map((d, i) => {
          // 띄엄띄엄 찍을 땐 오늘(마지막)은 항상 보이게 끝에서부터 센다
          const fromEnd = data.days.length - 1 - i;
          const show = fromEnd % labelStep === 0;
          return (
            <div key={d.key} className={'flex-1 min-w-0 text-center'}>
              {!dense && (
                <p className={`text-[11px] font-semibold leading-tight ${d.isToday ? 'text-[#4B58D8]' : 'text-[#8B95A1]'}`}>
                  {d.weekday}
                </p>
              )}
              {show && (
                <p className={`text-[11px] leading-tight ${d.isToday ? 'font-bold text-[#4B58D8]' : 'text-[#B0B8C1]'}`}>
                  {d.day}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {data.total === 0 && (
        <p className={'mt-3 text-center text-[12.5px] text-[#8B95A1]'}>이 기간에 완료된 결제가 없어요</p>
      )}
    </section>
  );
}
