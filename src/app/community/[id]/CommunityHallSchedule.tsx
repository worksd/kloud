'use client';

import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import calendarStyles from "@/app/kiosk/CalendarStyles.module.css";
import { kloudNav } from "@/app/lib/kloudNav";
import { CommunityHall, HEEL_DANCE_LABEL } from "@/app/community/community.mock";
import { useCommunityAction } from "@/app/community/[id]/CommunityActionBar";

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 00:00 ~ 23:00
const TICKS = [0, 6, 12, 18, 24];
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// mock: 홀·날짜별로 다른 위치에 예약 "블록"을 배치 (결정적). 긴 연속 빈 시간이 남도록.
const isBooked = (hallId: number, day: number, hour: number) => {
  const seed = (hallId * 31 + day * 17) % 24;
  const b1 = seed % 20;            // 2시간 블록
  const b2 = (seed + 9) % 19;      // 3시간 블록
  return (hour >= b1 && hour < b1 + 2) || (hour >= b2 && hour < b2 + 3);
};

// 홀별 카드(섹션) + 홀 선택 시 그 날짜 일일 시간표. 날짜는 버튼 → 캘린더 바텀시트로 선택.
export function CommunityHallSchedule({ halls }: { halls: CommunityHall[] }) {
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const day = date.getDate();

  const [expandedId, setExpandedId] = useState<number | null>(halls[0]?.id ?? null);

  // 날짜 선택 바텀시트
  const [dateOpen, setDateOpen] = useState(false);
  const [dateClosing, setDateClosing] = useState(false);
  const closeDateSheet = (after?: () => void) => {
    if (dateClosing) return;
    setDateClosing(true);
    setTimeout(() => { setDateOpen(false); setDateClosing(false); after?.(); }, 200);
  };

  // 시간 선택 (연속 슬롯). start~end 시 (inclusive). 인접 슬롯만 확장.
  const [sel, setSel] = useState<{ hallId: number; start: number; end: number } | null>(null);
  const onSlot = (hallId: number, h: number, booked: boolean) => {
    if (booked) return;
    setSel((prev) => {
      if (!prev || prev.hallId !== hallId) return { hallId, start: h, end: h };
      const { start, end } = prev;
      if (h >= start && h <= end) {
        // 이미 선택된 구간 안: 끝단이면 줄이고, 내부면 단일 선택으로 리셋
        if (h === start && h === end) return null;
        if (h === end) return { hallId, start, end: end - 1 };
        if (h === start) return { hallId, start: start + 1, end };
        return { hallId, start: h, end: h };
      }
      // 구간 밖: 인접이면 확장, 아니면 새로 선택
      if (h === start - 1) return { hallId, start: h, end };
      if (h === end + 1) return { hallId, start, end: h };
      return { hallId, start: h, end: h };
    });
  };

  // 선택한 순간 하단 액션 바에 "예약하기" 노출 → 바로 결제 페이지로 이동
  const { setAction, clearAction, activeSource } = useCommunityAction();
  useEffect(() => {
    if (activeSource && activeSource !== 'reservation') setSel(null);
  }, [activeSource]);
  useEffect(() => {
    if (sel) {
      const hall = halls.find((h) => h.id === sel.hallId);
      if (!hall) return;
      const hours = sel.end - sel.start + 1;
      setAction({
        source: 'reservation',
        label: `${hours}시간 · ${fmt(hall.pricePerHour * hours)}원 예약하기`,
        onConfirm: () => kloudNav.push(`/payment?item=practice-room&id=${sel.hallId}&date=${toDateStr(date)}&start=${sel.start}&hours=${hours}`),
      });
    } else {
      clearAction('reservation');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, date]);

  return (
    <div>
      {/* 날짜 칩 버튼 */}
      <button
        onClick={() => setDateOpen(true)}
        className="inline-flex items-center gap-1 h-9 pl-4 pr-3 rounded-full bg-[#F1F3F6] active:bg-[#E7EAEE] transition-colors"
      >
        <span className="text-[14px] font-bold text-[#171717]">
          {date.getMonth() + 1}월 {date.getDate()}일 ({WEEKDAYS[date.getDay()]})
        </span>
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path d="M6 9l6 6 6-6" stroke="#4E5968" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* 홀별 카드 */}
      <div className="mt-4 flex flex-col gap-4">
        {halls.map((hall) => {
          const expanded = hall.id === expandedId;
          const fullyBooked = HOURS.every((h) => isBooked(hall.id, day, h));
          return (
            <div key={hall.id} className="rounded-2xl border border-[#EEF0F2] overflow-hidden">
              {/* 헤더 (탭하면 시간표 펼침) */}
              <button
                onClick={() => { setExpandedId(expanded ? null : hall.id); setSel(null); }}
                className="w-full text-left p-4 active:bg-[#FAFBFC] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-bold text-[#171717]">{hall.name}</p>
                    <p className="mt-1 text-[13px] text-[#86898C]">
                      {hall.dimensions.width}×{hall.dimensions.depth}m · 최대 {hall.maxNumber}명 · {HEEL_DANCE_LABEL[hall.heelDance]}
                    </p>
                    <p className={`mt-1 text-[13px] font-bold ${fullyBooked ? 'text-[#C4C9CF]' : 'text-[#171717]'}`}>
                      {fullyBooked ? '예약 마감' : `시간당 ${fmt(hall.pricePerHour)}원`}
                    </p>
                  </div>
                  {hall.imageUrl && (
                    <div className="w-[92px] h-[92px] rounded-2xl overflow-hidden bg-[#F1F3F6] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={hall.imageUrl} alt={hall.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* 얇은 시간 바 (요약) */}
                <div className="mt-3 flex gap-[2px] items-center">
                  {HOURS.map((h) => (
                    <span
                      key={h}
                      className={`flex-1 h-[3px] rounded-full ${isBooked(hall.id, day, h) ? 'bg-[#E4E8EC]' : 'bg-[#3CC0AF]'}`}
                    />
                  ))}
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex-1 flex justify-between text-[11px] text-[#A0A5AB] pr-3">
                    {TICKS.map((t) => <span key={t}>{t}시</span>)}
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

              {/* 펼침: 일일 시간표 */}
              {expanded && (
                <div className="border-t border-[#F1F3F6] px-4 pt-3 pb-2">
                  <p className="text-[13px] font-bold text-[#171717] mb-1">
                    {date.getMonth() + 1}월 {date.getDate()}일 시간표
                  </p>
                  <div className="flex flex-col divide-y divide-[#F5F6F7]">
                    {HOURS.map((h) => {
                      const booked = isBooked(hall.id, day, h);
                      const selected = sel?.hallId === hall.id && h >= sel.start && h <= sel.end;
                      return (
                        <button
                          key={h}
                          disabled={booked}
                          onClick={() => onSlot(hall.id, h, booked)}
                          className={`flex items-center justify-between py-3 px-3 -mx-3 rounded-lg transition-colors disabled:cursor-not-allowed ${selected ? 'bg-[#EAF7F4]' : 'active:bg-[#FAFBFC]'}`}
                        >
                          <span className={`text-[15px] font-medium ${booked ? 'text-[#C4C9CF]' : selected ? 'text-[#1E9E8A]' : 'text-[#171717]'}`}>
                            {String(h).padStart(2, '0')}:00 ~ {String(h + 1).padStart(2, '0')}:00
                          </span>
                          <span className={`text-[13px] font-bold ${booked ? 'text-[#C4C9CF]' : selected ? 'text-[#1E9E8A]' : 'text-[#3CC0AF]'}`}>
                            {booked ? '예약 마감' : selected ? '선택됨' : '예약 가능'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 날짜 선택 바텀시트 (캘린더) */}
      {dateOpen && (
        <div className={`fixed inset-0 z-50 flex items-end ${dateClosing ? 'animate-[fadeOut_200ms_ease-in_forwards]' : 'animate-[fadeIn_180ms_ease-out]'}`}>
          <div className="absolute inset-0 bg-black/50" onClick={() => closeDateSheet()} />
          <div className={`relative w-full bg-white rounded-t-3xl px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] ${dateClosing ? 'animate-[slideDown_220ms_ease-in_forwards]' : 'animate-[slideUp_220ms_ease-out]'}`}>
            <div className="w-10 h-1 rounded-full bg-[#E6E8EA] mx-auto mb-3" />
            <p className="text-[17px] font-bold text-[#171717] mb-3">날짜 선택</p>
            <div className={calendarStyles.calendarWrapper}>
              <Calendar
                onChange={(v) => {
                  const d = Array.isArray(v) ? v[0] : v;
                  if (d instanceof Date) {
                    d.setHours(0, 0, 0, 0);
                    setDate(d);
                    closeDateSheet();
                  }
                }}
                value={date}
                formatDay={(_locale, d) => String(d.getDate())}
                locale="ko-KR"
                calendarType="gregory"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
