'use server'

import { api } from '@/app/api.client';
import { PaymentRecordStatus } from '@/app/endpoint/payment.record.endpoint';

export type DailySales = {
  /** 'YYYY-MM-DD' (KST) */
  key: string;
  /** 요일 한 글자 */
  weekday: string;
  /** 일(day) 숫자 */
  day: number;
  amount: number;
  count: number;
  isToday: boolean;
};

export type RecentSales = {
  days: DailySales[];
  total: number;
  count: number;
  /** 집계 구간 라벨 — 'M/D ~ M/D' */
  range: string;
  /** 페이지 상한에 걸려 더 오래된 기록을 못 봤을 수 있음 */
  truncated: boolean;
};

// /paymentRecords 는 날짜 필터가 없어 최신 페이지부터 훑는다.
// 구간을 벗어난 기록이 나오면 즉시 중단하고, 그래도 안 끝나면 상한에서 끊는다.
const MAX_PAGES = 6;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * createdAt 은 KST 벽시계 문자열('2026.09.22 17:59')로 내려온다.
 * Vercel 서버는 UTC라 new Date()로 파싱하면 날짜가 하루 밀릴 수 있어 y/m/d만 문자열에서 직접 뽑는다.
 */
const dateKeyOf = (createdAt?: string): string | undefined => {
  const m = createdAt?.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  return m ? `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}` : undefined;
};

/** UTC+9로 옮겨두고 getUTC*로 읽으면 KST 기준 날짜가 된다 (서버 타임존 무관) */
const kstDate = (offsetDays = 0): Date => {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays));
};

const keyOf = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/** 매출로 잡는 상태 — 취소/실패/대기는 제외 */
const COUNTED: string[] = [PaymentRecordStatus.Completed, PaymentRecordStatus.Settled];

/**
 * 최근 N일 일별 매출 집계. 결제내역 목록을 최신 페이지부터 읽어 일자별로 합산한다.
 * 조회 실패해도 화면은 떠야 하므로 0으로 채운 구간을 돌려준다.
 */
export const getRecentSalesAction = async (days = 7): Promise<RecentSales> => {
  const buckets = new Map<string, { amount: number; count: number }>();
  const frame: Date[] = [];
  for (let i = days - 1; i >= 0; i--) frame.push(kstDate(-i));
  frame.forEach((d) => buckets.set(keyOf(d), { amount: 0, count: 0 }));

  const oldestKey = keyOf(frame[0]);
  let truncated = false;

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await api.paymentRecord.list({ page });
      if (!('paymentRecords' in res)) break;
      const list = res.paymentRecords;
      if (list.length === 0) break;

      // 최신순 응답이므로, 구간보다 오래된 기록이 나온 시점에서 더 볼 필요가 없다
      let passedWindow = false;
      for (const r of list) {
        const key = dateKeyOf(r.createdAt);
        if (!key) continue;
        if (key < oldestKey) { passedWindow = true; continue; }
        const bucket = buckets.get(key);
        if (!bucket || !COUNTED.includes(r.status)) continue;
        bucket.amount += r.amount ?? 0;
        bucket.count += 1;
      }
      if (passedWindow) break;
      if (page === MAX_PAGES) truncated = true;
    }
  } catch {
    // 집계 실패 — 빈 그래프로 렌더하고 결제내역 리스트는 클라이언트에서 따로 불러온다
  }

  const todayKey = keyOf(kstDate(0));
  const daysOut: DailySales[] = frame.map((d) => {
    const key = keyOf(d);
    const b = buckets.get(key)!;
    return {
      key,
      weekday: WEEKDAYS[d.getUTCDay()],
      day: d.getUTCDate(),
      amount: b.amount,
      count: b.count,
      isToday: key === todayKey,
    };
  });

  const first = frame[0];
  const last = frame[frame.length - 1];

  return {
    days: daysOut,
    total: daysOut.reduce((sum, d) => sum + d.amount, 0),
    count: daysOut.reduce((sum, d) => sum + d.count, 0),
    range: `${first.getUTCMonth() + 1}/${first.getUTCDate()} ~ ${last.getUTCMonth() + 1}/${last.getUTCDate()}`,
    truncated,
  };
};
