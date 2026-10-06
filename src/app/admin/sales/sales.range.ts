// 매출 탭의 기간/집계 타입.
// 'use server' 파일은 async 함수만 export할 수 있어서(상수를 두면 빌드 에러),
// 상수와 타입은 여기 따로 둔다.

/** 매출 탭에서 고를 수 있는 기간 */
export const SALES_RANGES = [7, 14, 30] as const;
export type SalesRange = (typeof SALES_RANGES)[number];

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
  /** 집계한 일수 — 그래프 제목과 축 라벨 밀도에 쓴다 */
  rangeDays: number;
  days: DailySales[];
  total: number;
  count: number;
  /** 집계 구간 라벨 — 'M/D ~ M/D' */
  range: string;
  /** 페이지 상한에 걸려 더 오래된 기록을 못 봤을 수 있음 */
  truncated: boolean;
};
