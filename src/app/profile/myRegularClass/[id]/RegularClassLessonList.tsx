// 내 정규반 상세 — 수업(회차) 목록. 모바일/PC 공용 서버 컴포넌트.
// 데이터는 GET /passes/:id 의 룰별 수강권(passRule(s)[].tickets) — 이 상품으로 등록된 회차가 곧 내 수업 목록이다.
// 다가오는 수업 / 지난 수업 두 섹션. 행 = 날짜 타일(일 + 월.요일) + 제목 / 시간·홀 + 상태 칩. 탭하면 수강권 상세.
// 수업 일정 변경(RegularClassReschedule, 지금은 목)으로 옮긴 수업은 칩이 '변경됨'으로 바뀌고, 새 일정은 다가오는 수업 맨 뒤에 붙는다.

import React from "react";
import { translate } from "@/utils/translate";
import { Locale } from "@/shared/StringResource";
import { PassRuleTicket } from "@/app/endpoint/pass.endpoint";
import { convertStatusToMessage } from "@/app/endpoint/ticket.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import { chipBase, chipClass, Kind, LessonRow, parts } from "@/app/profile/myRegularClass/[id]/regular.class.lesson.row";
import { RescheduleAwareChip, RescheduledLessonRows } from "@/app/profile/myRegularClass/[id]/RegularClassReschedule";

// 칩 종류 — 취소 > 출석(attendedAt 또는 Used) > 예정(아직 시작 전) > 그 외는 수강권 상태 문구 그대로
const kindOf = (t: PassRuleTicket, isFuture: boolean): Kind => {
  if (t.status === 'Cancelled') return 'cancelled';
  if (t.attendedAt || t.status === 'Used') return 'attended';
  if (isFuture) return 'upcoming';
  return 'other';
};

const Row = ({ ticket, locale, label, kind }: { ticket: PassRuleTicket; locale: Locale; label: string; kind: Kind }) => (
  <LessonRow
    title={ticket.lesson?.title ?? ''}
    startDate={ticket.lesson?.startDate}
    endDate={ticket.lesson?.endDate}
    roomName={ticket.lesson?.room?.name}
    locale={locale}
    isPast={kind !== 'upcoming'}
    route={KloudScreen.TicketDetail(ticket.id, false)}
    chip={<RescheduleAwareChip ticketId={ticket.id}><span className={`${chipBase} ${chipClass[kind]}`}>{label}</span></RescheduleAwareChip>}
  />
);

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
          {/* 일정 변경으로 새로 잡힌 수업 — 규칙상 항상 내 마지막 수업 뒤라 맨 끝에 붙이면 순서가 맞다 */}
          <RescheduledLessonRows/>
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
