// 내 정규반 상세 — 수업(회차) 목록. 모바일/PC 공용 서버 컴포넌트.
// 다가오는 수업 / 지난 수업 두 섹션. 행 = 날짜 타일(월.일 + 요일) + 제목 / 시간·홀 + 출석 칩.
// isMock 이면 위에 Mock 띠를 띄우고, 가짜 id 라 탭해도 이동하지 않는다.

import React from "react";
import { translate } from "@/utils/translate";
import { Locale } from "@/shared/StringResource";
import { MyRegularClassLessonResponse } from "@/app/endpoint/studio.endpoint";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

const WEEKDAYS: Record<string, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};

// 'yyyy.MM.dd HH:mm' → 구성 요소. 서버(UTC)에서 렌더돼도 문자열 그대로 읽어 흔들리지 않는다
const parts = (s: string) => {
  const m = s.match(/(\d{4})[.-](\d{1,2})[.-](\d{1,2})(?:\D+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  return { month: Number(mo), day: Number(d), weekday: date.getDay(), time: hh != null ? `${hh.padStart(2, '0')}:${mm}` : null };
};
const timeOf = (s?: string) => (s ? parts(s)?.time ?? null : null);

// 출석 칩 — 수강 내역 상태 칩과 같은 톤. 예정만 검정, 출석은 연녹, 결석은 연빨강, 휴강은 회색
const chip = (a: MyRegularClassLessonResponse['attendance']) => {
  switch (a) {
    case 'Upcoming': return 'bg-[#191F28] text-white';
    case 'Attended': return 'bg-[#EAF7EE] text-[#1B7F3B]';
    case 'Absent': return 'bg-[#FDECEC] text-[#E55B5B]';
    default: return 'bg-[#F2F4F6] text-[#8B95A1]';
  }
};
const CHIP_KEY = {
  Upcoming: 'attendance_upcoming',
  Attended: 'attendance_attended',
  Absent: 'attendance_absent',
  Cancelled: 'attendance_cancelled',
} as const;

const Row = ({ lesson, locale, label, mock }: { lesson: MyRegularClassLessonResponse; locale: Locale; label: string; mock: boolean }) => {
  const p = parts(lesson.startDate);
  const isPast = lesson.attendance !== 'Upcoming';
  const end = timeOf(lesson.endDate);
  const sub = [p?.time && (end ? `${p.time} ~ ${end}` : p.time), lesson.room?.name].filter(Boolean).join(' · ');
  const wd = (WEEKDAYS[locale] ?? WEEKDAYS.en)[p?.weekday ?? 0];

  const body = (
    <div className={`flex items-center gap-4 py-3.5 ${mock ? '' : 'active:bg-[#F9FAFB] cursor-pointer'} transition-colors`}>
      {/* 날짜 타일 */}
      <div className={`w-[48px] h-[52px] rounded-[12px] flex flex-col items-center justify-center shrink-0 ${isPast ? 'bg-[#F7F8FA]' : 'bg-[#191F28]'}`}>
        <span className={`text-[16px] font-bold font-paperlogy leading-none ${isPast ? 'text-[#8B95A1]' : 'text-white'}`}>{p?.day ?? '-'}</span>
        <span className={`text-[10.5px] font-semibold mt-1 leading-none ${isPast ? 'text-[#B0B8C1]' : 'text-white/70'}`}>{p ? `${p.month}.${wd}` : ''}</span>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className={`text-[15px] font-semibold truncate tracking-[-0.3px] ${isPast ? 'text-[#8B95A1]' : 'text-[#191F28]'}`}>{lesson.title}</p>
        {sub && <p className={`text-[12.5px] truncate tracking-[-0.2px] ${isPast ? 'text-[#B0B8C1]' : 'text-[#4E5968]'}`}>{sub}</p>}
      </div>
      <span className={`shrink-0 px-2 py-[3px] rounded-[6px] text-[11px] font-bold tracking-[-0.1px] whitespace-nowrap ${chip(lesson.attendance)}`}>{label}</span>
    </div>
  );
  // mock 은 가짜 id — 수업 상세로 보내지 않는다
  if (mock) return body;
  return <NavigateClickWrapper method="push" route={KloudScreen.LessonDetail(lesson.id)}>{body}</NavigateClickWrapper>;
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

export const RegularClassLessonList = async ({ lessons, locale, isMock = false }: {
  lessons: MyRegularClassLessonResponse[];
  locale: Locale;
  isMock?: boolean;
}) => {
  const labels = {
    Upcoming: await translate(CHIP_KEY.Upcoming),
    Attended: await translate(CHIP_KEY.Attended),
    Absent: await translate(CHIP_KEY.Absent),
    Cancelled: await translate(CHIP_KEY.Cancelled),
  };
  const upcoming = lessons.filter((l) => l.attendance === 'Upcoming');
  // 지난 수업은 최근 것부터
  const past = lessons.filter((l) => l.attendance !== 'Upcoming').reverse();

  return (
    <div className="flex flex-col gap-6">
      {/* Mock 띠 — API 연동 전 임시 데이터임을 화면에서 바로 알 수 있게 */}
      {isMock && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#FFF8EC] border border-[#F5D9A8]">
          <span className="shrink-0 px-1.5 py-[2px] rounded-[5px] bg-[#A05A00] text-white text-[10px] font-extrabold tracking-wide">MOCK</span>
          <span className="text-[12px] text-[#A05A00] font-medium">{await translate('mock_data_notice')}</span>
        </div>
      )}

      {lessons.length === 0 ? (
        <p className="py-12 text-center text-[14px] text-[#8B95A1]">{await translate('regular_class_no_lessons')}</p>
      ) : (
        <>
          {upcoming.length > 0 && (
            <Section title={await translate('upcoming_lessons')} count={upcoming.length}>
              {upcoming.map((l) => <Row key={l.id} lesson={l} locale={locale} label={labels[l.attendance]} mock={isMock}/>)}
            </Section>
          )}
          {past.length > 0 && (
            <Section title={await translate('past_lessons')} count={past.length}>
              {past.map((l) => <Row key={l.id} lesson={l} locale={locale} label={labels[l.attendance]} mock={isMock}/>)}
            </Section>
          )}
        </>
      )}
    </div>
  );
};
