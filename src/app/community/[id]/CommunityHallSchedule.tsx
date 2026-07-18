'use client';

import React, { useEffect, useRef, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import calendarStyles from "@/app/kiosk/CalendarStyles.module.css";
import { kloudNav } from "@/app/lib/kloudNav";
import { StudioRoomResponse, TimeSlotResponse } from "@/app/endpoint/studio.room.endpoint";
import { getCommunityRoomsAction } from "@/app/community/community.actions";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const LOCALE_TAG: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US', jp: 'ja-JP', zh: 'zh-CN' };
const fmtMonthDayWeekday = (d: Date, locale: Locale) =>
  new Intl.DateTimeFormat(LOCALE_TAG[locale], { month: 'long', day: 'numeric', weekday: 'short' }).format(d);
const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const roomCap = (r: StudioRoomResponse) => r.practiceMaxNumber ?? r.maxNumber;

// 예약은 1시간 간격 — 정시(:00) 슬롯만 노출/선택
const hourlyOnly = (slots: TimeSlotResponse[]) => slots.filter((s) => s.time.endsWith(':00'));

// 홀 카드 탭 → 시간표 바텀시트(슬롯 선택 + 예약하기). 예약하기 누르면 시트 닫으며 결제 페이지 이동.
export function CommunityHallSchedule({ rooms: initialRooms, studioId, locale }: { rooms: StudioRoomResponse[]; studioId: number; locale: Locale }) {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const [date, setDate] = useState<Date>(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; });
  const [rooms, setRooms] = useState<StudioRoomResponse[]>(initialRooms);

  // 날짜 변경 시 그 날짜의 슬롯으로 목록 갱신
  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => {
    if (firstLoad) { setFirstLoad(false); return; }
    let alive = true;
    getCommunityRoomsAction({ studioId, date: toDateStr(date) })
      .then((res) => { if (alive && 'studioRooms' in res) setRooms(res.studioRooms); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // 날짜 선택 캘린더 시트
  const [dateOpen, setDateOpen] = useState(false);
  const [dateClosing, setDateClosing] = useState(false);
  const closeDateSheet = (after?: () => void) => {
    if (dateClosing) return;
    setDateClosing(true);
    setTimeout(() => { setDateOpen(false); setDateClosing(false); after?.(); }, 200);
  };

  // 시간표 바텀시트 (홀 탭 시) — 드래그로 내려서 닫기 지원
  const [sheetRoomId, setSheetRoomId] = useState<number | null>(null);
  const [sel, setSel] = useState<{ start: number; end: number } | null>(null);
  const [dragY, setDragY] = useState(0);        // 드래그 중 아래로 이동한 거리(px)
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  const closingRef = useRef(false);
  const sheetRoom = sheetRoomId != null ? rooms.find((r) => r.id === sheetRoomId) : undefined;

  // entered=false → 화면 아래(offscreen), true → 제자리. transform+transition으로 open/close 애니메이션.
  const [entered, setEntered] = useState(false);
  const openSheet = (roomId: number) => { setSel(null); setDragY(0); closingRef.current = false; setSheetRoomId(roomId); };
  const closeSheet = (after?: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    setDragging(false);
    dragStart.current = null;
    setEntered(false); // → 아래로 슬라이드 다운
    setTimeout(() => { setSheetRoomId(null); setSel(null); setDragY(0); closingRef.current = false; after?.(); }, 300);
  };

  // 시트 마운트 후 다음 프레임에 entered=true → 아래에서 위로 슬라이드 업
  useEffect(() => {
    if (sheetRoomId == null) return;
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [sheetRoomId]);

  // 드래그 핸들러 (핸들/헤더 영역)
  const onSheetDragStart = (e: React.TouchEvent) => { dragStart.current = e.touches[0].clientY; setDragging(true); };
  const onSheetDragMove = (e: React.TouchEvent) => {
    if (dragStart.current == null) return;
    const dy = e.touches[0].clientY - dragStart.current;
    setDragY(dy > 0 ? dy : 0);
  };
  const onSheetDragEnd = () => {
    if (dragStart.current == null) return;
    dragStart.current = null;
    setDragging(false);
    if (dragY > 120) closeSheet();  // 충분히 내리면 닫기
    else setDragY(0);               // 아니면 원위치로 스냅백
  };

  // 날짜 바뀌면 선택 초기화 (슬롯 인덱스가 달라짐)
  useEffect(() => { setSel(null); }, [date]);

  // 바텀시트(시간표/캘린더) 열려 있으면 배경 스크롤 잠금 — dim 영역 스크롤 방지
  useEffect(() => {
    if (sheetRoomId == null && !dateOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [sheetRoomId, dateOpen]);

  // 정시 슬롯 시작시각 → 종료시각(1시간 뒤, 24시는 00:00으로 → 자정 넘김)
  const calcEndTime = (time: string) => {
    const [h] = time.split(':').map(Number);
    return `${String((h + 1) % 24).padStart(2, '0')}:00`;
  };

  // 결제 페이지에 startTime/endTime을 'YYYY-MM-DDTHH:mm'(KST, 자정 넘기면 +1일)로 전달.
  // 서버가 이 구간으로 최종금액 계산 (GET /payment는 startTime/endTime 쿼리 필수)
  const goPay = (roomId: number, startHHmm: string, endHHmm: string) => {
    const startDateStr = toDateStr(date);
    const crossesMidnight = endHHmm <= startHHmm; // 예: 23:00~00:00
    const endD = new Date(date);
    if (crossesMidnight) endD.setDate(endD.getDate() + 1);
    const startTime = `${startDateStr}T${startHHmm}`;
    const endTime = `${toDateStr(endD)}T${endHHmm}`;
    kloudNav.push(`/payment?item=practice-room&id=${roomId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`);
  };

  // 예약 가능: 상태 available + 가격 존재(price가 null이면 예약 불가 슬롯)
  const isOpen = (s: TimeSlotResponse) => s.status === 'available' && s.price != null;

  // 연속 슬롯 선택(인접만 확장)
  const onSlot = (idx: number, slots: TimeSlotResponse[]) => {
    if (!isOpen(slots[idx])) return;
    setSel((prev) => {
      if (!prev) return { start: idx, end: idx };
      const { start, end } = prev;
      if (idx >= start && idx <= end) {
        if (idx === start && idx === end) return null;
        if (idx === end) return { start, end: end - 1 };
        if (idx === start) return { start: start + 1, end };
        return { start: idx, end: idx };
      }
      if (idx === start - 1) return { start: idx, end };
      if (idx === end + 1) return { start, end: idx };
      return { start: idx, end: idx };
    });
  };

  return (
    <div>
      {/* 날짜 칩 버튼 */}
      <button
        onClick={() => setDateOpen(true)}
        className="inline-flex items-center gap-1 h-9 pl-4 pr-3 rounded-full bg-[#F1F3F6] active:bg-[#E7EAEE] transition-colors"
      >
        <span className="text-[14px] font-bold text-[#171717]">{fmtMonthDayWeekday(date, locale)}</span>
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path d="M6 9l6 6 6-6" stroke="#4E5968" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* 홀별 카드 — 탭하면 시간표 바텀시트 */}
      <div className="mt-4 flex flex-col gap-4">
        {rooms.map((room) => {
          const slots = hourlyOnly(room.slots ?? []);
          const fullyBooked = slots.length > 0 && slots.every((s) => !isOpen(s));
          const tickTimes = slots.length > 0
            ? [...new Set([0, Math.floor(slots.length * 0.25), Math.floor(slots.length * 0.5), Math.floor(slots.length * 0.75), slots.length - 1])]
                .map((i) => t('community_hour').replace('{h}', String(parseInt(slots[i].time, 10))))
            : [];
          return (
            <button
              key={room.id}
              onClick={() => openSheet(room.id)}
              className="w-full text-left rounded-2xl border border-[#EEF0F2] p-4 active:bg-[#FAFBFC] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-bold text-[#171717]">{room.name}</p>
                  <p className="mt-1 text-[13px] text-[#86898C]">
                    {t('community_max_people').replace('{count}', String(roomCap(room)))}
                    {room.minBookingDuration ? ` · ${t('community_min_unit').replace('{min}', String(room.minBookingDuration))}` : ''}
                  </p>
                  <p className={`mt-1 text-[13px] font-bold ${fullyBooked ? 'text-[#C4C9CF]' : 'text-[#171717]'}`}>
                    {fullyBooked ? t('community_reservation_closed') : t('community_available')}
                  </p>
                </div>
                {room.imageUrls?.[0] && (
                  <div className="w-[92px] h-[92px] rounded-2xl overflow-hidden bg-[#F1F3F6] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={room.imageUrls[0]} alt={room.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* 얇은 시간 바 (요약) + 시간대 눈금 */}
              {slots.length > 0 && (
                <div className="mt-3 flex gap-[2px] items-center">
                  {slots.map((s) => (
                    <span key={s.time} className={`flex-1 h-[3px] rounded-full ${isOpen(s) ? 'bg-[#3CC0AF]' : 'bg-[#E4E8EC]'}`} />
                  ))}
                </div>
              )}
              {tickTimes.length > 0 && (
                <div className="mt-1.5 flex justify-between text-[10px] text-[#A0A5AB]">
                  {tickTimes.map((tt, i) => <span key={i}>{tt}</span>)}
                </div>
              )}
            </button>
          );
        })}
        {rooms.length === 0 && (
          <p className="py-10 text-center text-[14px] text-[#A0A5AB]">{t('community_no_rooms')}</p>
        )}
      </div>

      {/* 시간표 바텀시트 — 핸들/헤더를 아래로 끌면 닫힘 */}
      {sheetRoom && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/50 touch-none"
            style={{ opacity: entered ? 1 : 0, transition: 'opacity 300ms ease' }}
            onClick={() => closeSheet()}
          />
          <div
            className="relative w-full bg-white rounded-t-3xl flex flex-col max-h-[85vh]"
            style={{
              transform: `translateY(${entered ? dragY : (typeof window !== 'undefined' ? window.innerHeight : 1000)}px)`,
              transition: dragging ? 'none' : 'transform 300ms cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            {/* 드래그 핸들 + 헤더 (이 영역을 아래로 끌면 닫힘) */}
            <div className="shrink-0 touch-none" onTouchStart={onSheetDragStart} onTouchMove={onSheetDragMove} onTouchEnd={onSheetDragEnd}>
              <div className="w-10 h-1 rounded-full bg-[#E6E8EA] mx-auto mt-3 mb-2" />

              {/* 헤더: 홀 이름 + 닫기(X) + 날짜 칩 */}
              <div className="px-5 pt-1 pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  {sheetRoom.imageUrls?.[0] && (
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#F1F3F6] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sheetRoom.imageUrls[0]} alt={sheetRoom.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-[18px] font-bold text-[#171717] truncate">{sheetRoom.name}</p>
                </div>
                <button
                  onClick={() => closeSheet()}
                  aria-label="close"
                  className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full active:bg-[#F1F3F6] transition-colors shrink-0"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M6 6l12 12M18 6L6 18" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setDateOpen(true)}
                className="mt-2 inline-flex items-center gap-1 h-8 pl-3 pr-2 rounded-full bg-[#F1F3F6] active:bg-[#E7EAEE] transition-colors"
              >
                <span className="text-[13px] font-bold text-[#171717]">{fmtMonthDayWeekday(date, locale)}</span>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" stroke="#4E5968" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              </div>
            </div>

            {/* 슬롯 리스트 (1시간 간격) */}
            <div className="px-5 flex-1 overflow-y-auto overscroll-contain">
              {hourlyOnly(sheetRoom.slots ?? []).length === 0 ? (
                <p className="py-10 text-center text-[13px] text-[#A0A5AB]">{t('community_no_slots')}</p>
              ) : (
                <div className="flex flex-col divide-y divide-[#F5F6F7]">
                  {hourlyOnly(sheetRoom.slots ?? []).map((s, idx, arr) => {
                    const open = isOpen(s);
                    const selected = sel != null && idx >= sel.start && idx <= sel.end;
                    return (
                      <button
                        key={s.time}
                        disabled={!open}
                        onClick={() => onSlot(idx, arr)}
                        className={`flex items-center justify-between py-3 px-3 rounded-lg transition-colors disabled:cursor-not-allowed ${selected ? 'bg-[#EAF7F4]' : open ? 'active:bg-[#FAFBFC]' : ''}`}
                      >
                        <span className={`text-[15px] font-medium ${!open ? 'text-[#C4C9CF]' : selected ? 'text-[#1E9E8A]' : 'text-[#171717]'}`}>
                          {s.time}
                          {open && s.price != null ? <span className="ml-2 text-[12px] font-normal text-[#86898C]">{fmt(s.price)}{t('won')}</span> : null}
                        </span>
                        <span className={`text-[13px] font-bold ${!open ? 'text-[#C4C9CF]' : selected ? 'text-[#1E9E8A]' : 'text-[#3CC0AF]'}`}>
                          {!open ? t('closed') : selected ? t('community_selected') : t('community_available')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 하단 예약하기 — 누르면 시트 닫으며 결제 이동 */}
            <div className="px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] shrink-0 border-t border-[#F1F3F6]">
              <button
                disabled={!sel}
                onClick={() => {
                  if (!sel) return;
                  const arr = hourlyOnly(sheetRoom.slots ?? []);
                  const startTime = arr[sel.start].time;
                  const endTime = calcEndTime(arr[sel.end].time);
                  closeSheet(() => goPay(sheetRoom.id, startTime, endTime));
                }}
                className={`w-full h-14 rounded-2xl flex items-center justify-center transition-transform ${sel ? 'bg-[#171717] active:scale-[0.98]' : 'bg-[#E4E8EC]'}`}
              >
                <span className={`text-[16px] font-bold ${sel ? 'text-white' : 'text-[#A0A5AB]'}`}>
                  {sel ? t('community_reserve_hours').replace('{count}', String(sel.end - sel.start + 1)) : t('reserve')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 날짜 선택 캘린더 시트 (시간표 시트 위에 뜨도록 z 상위) */}
      {dateOpen && (
        <div className={`fixed inset-0 z-[60] flex items-end ${dateClosing ? 'animate-[fadeOut_200ms_ease-in_forwards]' : 'animate-[fadeIn_180ms_ease-out]'}`}>
          <div className="absolute inset-0 bg-black/50 touch-none" onClick={() => closeDateSheet()} />
          <div className={`relative w-full bg-white rounded-t-3xl px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] ${dateClosing ? 'animate-[slideDown_220ms_ease-in_forwards]' : 'animate-[slideUp_220ms_ease-out]'}`}>
            <div className="w-10 h-1 rounded-full bg-[#E6E8EA] mx-auto mb-3" />
            <div className="flex items-center justify-between mb-3">
              <p className="text-[17px] font-bold text-[#171717]">{t('community_select_date')}</p>
              <button
                onClick={() => closeDateSheet()}
                aria-label="close"
                className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full active:bg-[#F1F3F6] transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M6 6l12 12M18 6L6 18" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
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
                locale={LOCALE_TAG[locale]}
                calendarType="gregory"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
