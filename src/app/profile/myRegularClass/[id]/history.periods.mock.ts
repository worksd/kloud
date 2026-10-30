// TODO(2026-10-30): 정규반 수강 내역 '결제 회차' 목 — UI 확인용 임시 코드. 서버가 결제 회차 목록(기간·결제 id)과 회차별 수강 내역 API 를 주면
// main 배포 전 반드시 교체할 것. 지금은 pass 의 이용 기간을 한 회차로 보고, 같은 길이로 앞 두 회차를 만들어 낸다.
// 지난 회차 수강 내역은 실제 수강 내역에 그 기간 수업이 있으면 그걸 쓰고, 없으면 반 요일·시간으로 가짜 행(출석)을 만든다.
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { parts } from "@/app/profile/myRegularClass/[id]/regular.class.lesson.row";

export type PaymentPeriod = {
  /** 1부터 — 가장 오래된 회차가 1 */
  index: number;
  /** 'yyyy.MM.dd' */
  startDate: string;
  endDate: string;
  /** 지금 pass 의 기간(현재 회차) */
  current: boolean;
};

const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (ms: number) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())}`;
};
const dayUtc = (s?: string) => {
  const p = parts(s);
  return p ? Date.UTC(p.year, p.month - 1, p.day) : null;
};
const DAY = 86400000;
/** 만들어 낼 지난 회차 수 */
const MOCK_PREVIOUS_PERIODS = 2;

/** 결제 회차 목록 — 최신(현재) 회차가 앞. pass 기간을 못 읽으면 빈 배열(내비게이션 없이 그린다) */
export const buildPaymentPeriodsMock = (pass: GetPassResponse): PaymentPeriod[] => {
  const start = dayUtc(pass.startDate);
  const end = dayUtc(pass.endDate);
  if (start == null || end == null || end < start) return [];
  const length = end - start + DAY;
  const total = MOCK_PREVIOUS_PERIODS + 1;
  const periods: PaymentPeriod[] = [];
  for (let back = 0; back < total; back++) {
    const s = start - length * back;
    periods.push({ index: total - back, startDate: fmt(s), endDate: fmt(s + length - DAY), current: back === 0 });
  }
  return periods;
};

/** 수업 시작일이 회차 기간 안인지 (날짜만 비교) */
export const inPeriod = (ticket: TicketResponse, period: PaymentPeriod) => {
  const d = dayUtc(ticket.lesson?.startDate);
  const s = dayUtc(period.startDate);
  const e = dayUtc(period.endDate);
  return d != null && s != null && e != null && d >= s && d <= e;
};

/**
 * 지난 회차의 가짜 수강 내역 — 반 요일(days, 0=일~6=토)마다 한 행씩, 시간·제목·홀·강사는 실제 수강권 하나(template)를 따라 한다.
 * 요일이 없으면 template 의 요일, 그것도 없으면 화요일. 전부 출석(Used). id 는 음수로 실제 수강권과 겹치지 않게.
 */
export const mockTicketsForPeriod = (period: PaymentPeriod, template: TicketResponse | null, days: number[]): TicketResponse[] => {
  const s = dayUtc(period.startDate);
  const e = dayUtc(period.endDate);
  if (s == null || e == null) return [];
  const tp = parts(template?.lesson?.startDate);
  const allowed = days.length > 0 ? days : [tp?.weekday ?? 2];
  const time = tp?.time ?? '19:00';
  const out: TicketResponse[] = [];
  for (let d = s; d <= e; d += DAY) {
    if (!allowed.includes(new Date(d).getUTCDay())) continue;
    const date = fmt(d);
    out.push({
      id: -(period.index * 100000 + out.length + 1),
      status: 'Used',
      lesson: template?.lesson
        ? { ...template.lesson, id: -(period.index * 100000 + out.length + 1), startDate: `${date} ${time}` }
        : undefined,
    });
  }
  // 최근 순
  return out.reverse();
};
