'use client'

import React from "react";
import { useRouter } from "next/navigation";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { Locale } from "@/shared/StringResource";
import { PartnerRoomAvailabilityResponse } from "@/app/endpoint/studio.room.endpoint";

const HOUR_PX = 64;          // 1시간 높이
const COL_W = 156;           // 홀 컬럼 너비
const GUTTER_W = 46;         // 시간축 너비
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

type Labels = {
  closed: string;
  lesson: string;
  noBooking: string;
  individual: string;
  full: string;
};

// 'HH:mm' → 분
const hhmm = (t?: string) => {
  const [h, m] = (t ?? '').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
// 'yyyy.MM.dd HH:mm' → { ymd: 20260722, min: 분 }
const wall = (s?: string) => {
  const [d, t] = (s ?? '').split(' ');
  const [y, mo, da] = (d ?? '').split('.').map(Number);
  const [h, mi] = (t ?? '').split(':').map(Number);
  return { ymd: (y || 0) * 10000 + (mo || 0) * 100 + (da || 0), min: (h || 0) * 60 + (mi || 0) };
};
const isActive = (status?: string) => /active/i.test(status ?? '');
const pad2 = (n: number) => String(n).padStart(2, '0');
// 'HH:mm' 표기(24h 넘어가면 익일 시각으로 환산)
const fmtClock = (mins: number) => `${pad2(Math.floor((mins / 60) % 24))}:${pad2(mins % 60)}`;

const addDays = (ymd: string, delta: number) => {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
};

export const PartnerScheduleBoard = ({
  date,
  rooms,
  locale,
  labels,
  appVersion = '',
}: {
  date: string;                 // 'YYYY-MM-DD'
  rooms: PartnerRoomAvailabilityResponse[];
  locale: Locale;
  labels: Labels;
  appVersion?: string;
}) => {
  const router = useRouter();
  const viewedYmd = Number(date.replace(/-/g, ''));
  const [y, m, d] = date.split('-').map(Number);
  const weekday = new Date(y, m - 1, d).getDay();  // 0=일~6=토
  // 조회일 자정 기준 분 오프셋 (전날 -1440, 익일 +1440)
  const rel = (s?: string) => {
    const w = wall(s);
    return w.min + (w.ymd - viewedYmd) * 1440;
  };
  // 스케줄 셀이 조회일에 적용되는가 — Weekly는 요일 일치, Holiday(day=null)는 항상.
  const cellApplies = (c: { day?: number | null }) => c.day == null || c.day === weekday;

  // 표시 시간 범위 계산 — 운영셀·예약·수업을 모두 담도록
  const allMins: number[] = [];
  rooms.forEach((r) => {
    (r.schedules ?? []).forEach((c) => {
      if (cellApplies(c) && isActive(c.status)) {
        const cm = hhmm(c.startTime);
        allMins.push(cm, cm + 60);
      }
    });
    (r.bookings ?? []).forEach((b) => allMins.push(rel(b.startDate), rel(b.endDate)));
    (r.lessons ?? []).forEach((l) => {
      const s = rel(l.startDate);
      allMins.push(s, s + (l.duration ?? 60));
    });
  });
  let startHour = allMins.length ? Math.floor(Math.min(...allMins) / 60) : 6;
  let endHour = allMins.length ? Math.ceil(Math.max(...allMins) / 60) : 24;
  startHour = Math.max(0, Math.min(startHour, 23));
  endHour = Math.min(30, Math.max(endHour, startHour + 1));
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const totalPx = hours.length * HOUR_PX;

  // 날짜 라벨
  const dayName = DAY_NAMES[weekday];
  const dateLabel = locale === 'ko'
    ? `${m}월 ${d}일 (${dayName})`
    : `${y}.${pad2(m)}.${pad2(d)}`;

  const goDate = (delta: number) => {
    const next = addDays(date, delta);
    const qs = new URLSearchParams({ date: next });
    if (appVersion) qs.set('appVersion', appVersion);
    router.push(`/studioRooms?${qs.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* 날짜 네비게이션 */}
      <div className="flex items-center justify-center gap-4 py-3 border-b border-[#F1F3F6]">
        <button
          onClick={() => goDate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#F1F3F6]"
          aria-label="prev"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="#4E5968" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span className="text-[15px] font-bold text-[#191f28] min-w-[120px] text-center">{dateLabel}</span>
        <button
          onClick={() => goDate(1)}
          className="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#F1F3F6]"
          aria-label="next"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="#4E5968" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* 보드 (가로 스크롤) */}
      <div className="overflow-x-auto flex-1">
        <div className="min-w-max">
          {/* 헤더: 홀 이름 */}
          <div className="flex sticky top-0 z-10 bg-white border-b border-[#EEF0F2]">
            <div style={{ width: GUTTER_W }} className="shrink-0" />
            {rooms.map((r) => (
              <div
                key={r.studioRoomId}
                style={{ width: COL_W }}
                className="shrink-0 px-2 py-2.5 border-l border-[#F1F3F6] text-center"
              >
                <p className="text-[13px] font-bold text-[#191f28] truncate">{r.name ?? `#${r.studioRoomId}`}</p>
                <p className="text-[11px] text-[#8B95A1] mt-0.5">
                  {(r.bookings?.length ?? 0) > 0 ? `${r.bookings!.length}` : labels.noBooking}
                  {(r.bookings?.length ?? 0) > 0 ? '건' : ''}
                </p>
              </div>
            ))}
          </div>

          {/* 바디: 시간축 + 컬럼 */}
          <div className="flex">
            {/* 시간축 */}
            <div style={{ width: GUTTER_W, height: totalPx }} className="shrink-0 relative">
              {hours.map((h, i) => (
                <div
                  key={h}
                  style={{ position: 'absolute', top: i * HOUR_PX, height: HOUR_PX }}
                  className="w-full text-right pr-1.5"
                >
                  <span className="text-[10px] text-[#B0B8C1] -translate-y-1.5 inline-block">{pad2(h % 24)}:00</span>
                </div>
              ))}
            </div>

            {/* 홀 컬럼들 */}
            {rooms.map((r) => {
              // 조회일 요일에 해당하는 셀만
              const dayCells = (r.schedules ?? []).filter(cellApplies);
              const hasSchedule = dayCells.length > 0;
              const activeHours = new Set<number>();
              dayCells.forEach((c) => {
                if (isActive(c.status)) activeHours.add(Math.floor(hhmm(c.startTime) / 60));
              });
              const operating = (h: number) => (hasSchedule ? activeHours.has(h % 24) : true);
              const hasLessons = (r.lessons?.length ?? 0) > 0;

              return (
                <div
                  key={r.studioRoomId}
                  style={{ width: COL_W, height: totalPx }}
                  className="shrink-0 relative border-l border-[#F1F3F6]"
                >
                  {/* 배경: 운영/휴무 시간대 */}
                  {hours.map((h, i) => (
                    <div
                      key={h}
                      style={{ position: 'absolute', top: i * HOUR_PX, height: HOUR_PX }}
                      className={`w-full border-b border-[#F4F5F7] ${operating(h) ? 'bg-white' : 'bg-[#F4F5F7]'}`}
                    >
                      {!operating(h) && (
                        <span className="text-[9px] text-[#C4CAD1] pl-1.5">{labels.closed}</span>
                      )}
                    </div>
                  ))}

                  {/* 예약 블록 (파랑) */}
                  {(r.bookings ?? []).map((b) => {
                    const s = rel(b.startDate);
                    const e = rel(b.endDate);
                    const y0 = Math.max(0, (s / 60 - startHour) * HOUR_PX);
                    const y1 = Math.min(totalPx, (e / 60 - startHour) * HOUR_PX);
                    const height = Math.max(20, y1 - y0);
                    const who = b.user?.nickName ?? b.user?.name ?? b.name ?? '-';
                    const isFull = b.type === 'full';
                    return (
                      <div
                        key={b.id}
                        onClick={() => kloudNav.push(KloudScreen.RoomBookingDetail(b.id))}
                        style={{ top: y0, height, left: 3, right: hasLessons ? '46%' : 3 }}
                        className={`absolute rounded-md px-1.5 py-1 overflow-hidden cursor-pointer active:opacity-80 ${
                          isFull ? 'bg-[#5B6BDF] text-white' : 'bg-[#E8ECFF] text-[#2E3A8C] border border-[#C7D0FF]'
                        }`}
                      >
                        <p className="text-[10px] font-bold leading-tight truncate">{who}</p>
                        {height > 34 && (
                          <p className="text-[9px] leading-tight truncate opacity-80">
                            {fmtClock(s)}~{fmtClock(e)}
                          </p>
                        )}
                        {height > 50 && (
                          <span className="text-[9px] font-medium opacity-70">{isFull ? labels.full : labels.individual}</span>
                        )}
                      </div>
                    );
                  })}

                  {/* 수업 블록 (보라) */}
                  {(r.lessons ?? []).map((l) => {
                    const s = rel(l.startDate);
                    const e = s + (l.duration ?? 60);
                    const y0 = Math.max(0, (s / 60 - startHour) * HOUR_PX);
                    const y1 = Math.min(totalPx, (e / 60 - startHour) * HOUR_PX);
                    const height = Math.max(20, y1 - y0);
                    return (
                      <div
                        key={`l-${l.id}`}
                        style={{ top: y0, height, left: '54%', right: 3 }}
                        className="absolute rounded-md px-1.5 py-1 overflow-hidden bg-[#F3EAFE] text-[#6B34C0] border border-[#E2CEFB]"
                      >
                        <p className="text-[10px] font-bold leading-tight truncate">{l.title}</p>
                        {height > 34 && (
                          <p className="text-[9px] leading-tight truncate opacity-80">
                            {labels.lesson} · {fmtClock(s)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
