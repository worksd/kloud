// 내 정규반 상세 — 수업(회차) 목록. 모바일/PC 공용 서버 컴포넌트.
// 데이터는 GET /passes/:id 의 룰별 수강권(passRule(s)[].tickets) — 이 상품으로 등록된 회차가 곧 내 수업 목록이다.
// 다가오는 수업 / 지난 수업 두 섹션. 행 = 날짜 타일(일 + 월.요일) + 제목 / 시간·홀 + 상태 칩. 탭하면 수강권 상세.

import React from "react";
import { translate } from "@/utils/translate";
import { Locale } from "@/shared/StringResource";
import { PassRuleTicket } from "@/app/endpoint/pass.endpoint";
import { convertStatusToMessage } from "@/app/endpoint/ticket.endpoint";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

const WEEKDAYS: Record<string, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};

// 'yyyy.MM.dd HH:mm' → 구성 요소 + KST epoch. 서버(UTC)에서 렌더돼도 문자열을 KST 로 고정 해석
const parts = (s?: string) => {
  const m = s?.match(/(\d{4})[.-](\d{1,2})[.-](\d{1,2})(?:\D+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, hh = '0', mm = '0'] = m;
  const at = new Date(`${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00+09:00`).getTime();
  const weekday = new Date(Number(y), Number(mo) - 1, Number(d)).getDay();
  return { month: Number(mo), day: Number(d), weekday, time: m[4] != null ? `${hh.padStart(2, '0')}:${mm}` : null, at };
};

type Kind = 'upcoming' | 'attended' | 'cancelled' | 'other';
// 칩 종류 — 취소 > 출석(attendedAt 또는 Used) > 예정(아직 시작 전) > 그 외는 수강권 상태 문구 그대로
const kindOf = (t: PassRuleTicket, isFuture: boolean): Kind => {
  if (t.status === 'Cancelled') return 'cancelled';
  if (t.attendedAt || t.status === 'Used') return 'attended';
  if (isFuture) return 'upcoming';
  return 'other';
};
const chipClass: Record<Kind, string> = {
  upcoming: 'bg-[#191F28] text-white',
  attended: 'bg-[#EAF7EE] text-[#1B7F3B]',
  cancelled: 'bg-[#FDECEC] text-[#E55B5B]',
  other: 'bg-[#F2F4F6] text-[#8B95A1]',
};

const Row = ({ ticket, locale, label, kind }: { ticket: PassRuleTicket; locale: Locale; label: string; kind: Kind }) => {
  const p = parts(ticket.lesson?.startDate);
  const end = parts(ticket.lesson?.endDate)?.time;
  const isPast = kind !== 'upcoming';
  const sub = [p?.time && (end ? `${p.time} ~ ${end}` : p.time), ticket.lesson?.room?.name].filter(Boolean).join(' · ');
  const wd = (WEEKDAYS[locale] ?? WEEKDAYS.en)[p?.weekday ?? 0];

  return (
    <NavigateClickWrapper method="push" route={KloudScreen.TicketDetail(ticket.id, false)}>
      <div className="flex items-center gap-4 py-3.5 active:bg-[#F9FAFB] cursor-pointer transition-colors">
        {/* 날짜 타일 */}
        <div className={`w-[48px] h-[52px] rounded-[12px] flex flex-col items-center justify-center shrink-0 ${isPast ? 'bg-[#F7F8FA]' : 'bg-[#191F28]'}`}>
          <span className={`text-[16px] font-bold font-paperlogy leading-none ${isPast ? 'text-[#8B95A1]' : 'text-white'}`}>{p?.day ?? '-'}</span>
          <span className={`text-[10.5px] font-semibold mt-1 leading-none ${isPast ? 'text-[#B0B8C1]' : 'text-white/70'}`}>{p ? `${p.month}.${wd}` : ''}</span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className={`text-[15px] font-semibold truncate tracking-[-0.3px] ${isPast ? 'text-[#8B95A1]' : 'text-[#191F28]'}`}>{ticket.lesson?.title ?? ''}</p>
          {sub && <p className={`text-[12.5px] truncate tracking-[-0.2px] ${isPast ? 'text-[#B0B8C1]' : 'text-[#4E5968]'}`}>{sub}</p>}
        </div>
        <span className={`shrink-0 px-2 py-[3px] rounded-[6px] text-[11px] font-bold tracking-[-0.1px] whitespace-nowrap ${chipClass[kind]}`}>{label}</span>
      </div>
    </NavigateClickWrapper>
  );
};

const Section = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
  <section>
    <div className="flex items-baseline gap-2 mb-1">
      <h3 className="text-[15px] font-bold text-[#191F28] tracking-[-0.3px]">{title}</h3>
      <span className="text-[12.5px] font-semibold text-[#B0B8C1] font-paperlogy">{count}</span>
    </div>
    <div className="flex flex-col divide-y divide-[#F2F4F6]">{children}</div>
  </section>
);

export const RegularClassLessonList = async ({ tickets, locale }: { tickets: PassRuleTicket[]; locale: Locale }) => {
  const now = Date.now();
  const rows = tickets
    .map((t) => {
      const at = parts(t.lesson?.startDate)?.at ?? 0;
      const kind = kindOf(t, at > now);
      return { t, at, kind };
    })
    .sort((a, b) => a.at - b.at);
  const upcoming = rows.filter((r) => r.kind === 'upcoming');
  // 지난 수업은 최근 것부터
  const past = rows.filter((r) => r.kind !== 'upcoming').reverse();

  const labelOf = async (r: { t: PassRuleTicket; kind: Kind }) => {
    switch (r.kind) {
      case 'upcoming': return translate('attendance_upcoming');
      case 'attended': return translate('attendance_attended');
      case 'cancelled': return translate('purchase_cancel');
      default: return translate(convertStatusToMessage({ status: r.t.status }));
    }
  };
  const upcomingLabels = await Promise.all(upcoming.map(labelOf));
  const pastLabels = await Promise.all(past.map(labelOf));

  if (rows.length === 0) {
    return <p className="py-12 text-center text-[14px] text-[#8B95A1]">{await translate('regular_class_no_lessons')}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {upcoming.length > 0 && (
        <Section title={await translate('upcoming_lessons')} count={upcoming.length}>
          {upcoming.map((r, i) => <Row key={r.t.id} ticket={r.t} locale={locale} label={upcomingLabels[i]} kind={r.kind}/>)}
        </Section>
      )}
      {past.length > 0 && (
        <Section title={await translate('past_lessons')} count={past.length}>
          {past.map((r, i) => <Row key={r.t.id} ticket={r.t} locale={locale} label={pastLabels[i]} kind={r.kind}/>)}
        </Section>
      )}
    </div>
  );
};
