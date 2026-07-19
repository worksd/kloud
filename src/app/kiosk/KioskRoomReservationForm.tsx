'use client';

import React, { useEffect, useRef, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { KioskTopBar } from "@/app/kiosk/KioskLessonListForm";
import { getKioskStudioRoomsAction, getKioskRoomsAvailabilityAction } from "@/app/kiosk/kiosk.room.actions";
import { RoomAvailabilityRowResponse, RoomScheduleResponse } from "@/app/endpoint/studio.room.endpoint";

// 키오스크 대관 예약 결과 — KioskForm이 이 값으로 결제(카드/현금/패스) 호출. 기존 계약 유지.
export type KioskRoomBooking = {
  studioRoomId: number;
  roomName: string;
  unitPrice?: number;
  price: number;        // 선택 구간 시간대별 가격 합산
  date: string;         // 표시용 날짜 (dot 포맷 YYYY.MM.DD)
  startTime: string;
  endTime: string;
  startDate: string;    // KST ISO "YYYY-MM-DDTHH:mm:ss+09:00"
  endDate: string;      // KST ISO (자정 넘기면 +1일)
};

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0~23
const pad = (n: number) => String(n).padStart(2, '0');
const formatPrice = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toDotDate = (d: Date) =>
  `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;

const DAY_LABELS: Record<Locale, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// 결제 API에 넘길 예약 시간대 — KST ISO(YYYY-MM-DDTHH:mm:ss+09:00). 자정 넘기면 종료일 +1.
const buildBookingDates = (dateStr: string, sel: { startTime: string; endTime: string }) => {
  const startDay = dateStr; // YYYY-MM-DD
  const isNextDay = sel.endTime <= sel.startTime; // 자정 넘김 (예: 23:00~00:00)
  let endDay = startDay;
  if (isNextDay) {
    const [y, m, dd] = startDay.split('-').map(Number);
    if (y && m && dd) {
      const next = new Date(y, m - 1, dd);
      next.setDate(next.getDate() + 1);
      endDay = toDateStr(next);
    }
  }
  return {
    startDate: `${startDay}T${sel.startTime}:00+09:00`,
    endDate: `${endDay}T${sel.endTime}:00+09:00`,
  };
};

// 대관 예약 — 홀(행) × 0~23시(열) 그리드. 한 홀 안에서 연속 구간 선택.
export const KioskRoomReservationForm = ({
  studioId,
  locale,
  onBack,
  onConfirm,
  onChangeLocale,
}: {
  studioId: number;
  locale: Locale;
  onBack: () => void;
  onConfirm: (booking: KioskRoomBooking) => void;
  onChangeLocale: (locale: Locale) => void;
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const today = useRef(new Date()).current;
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [roomIds, setRoomIds] = useState<string>('');
  const [rows, setRows] = useState<RoomAvailabilityRowResponse[]>([]);
  // 홀별 가격 원본 — slot.price가 null일 때 이걸로 계산 (LIST 응답의 schedules)
  const [schedulesByRoom, setSchedulesByRoom] = useState<Record<number, RoomScheduleResponse[]>>({});
  // 홀별 최대 예약 시간(분, 60/120/180…). 설정 시 그만큼만 연속 선택 허용
  const [maxDurByRoom, setMaxDurByRoom] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  // 선택 구간 — 한 홀 안에서만 연속. start/end = 시(0~23) inclusive.
  const [sel, setSel] = useState<{ roomId: number; start: number; end: number } | null>(null);

  // 1) 홀 목록 → id + schedules(가격 원본) 확보
  useEffect(() => {
    getKioskStudioRoomsAction({ studioId, date: toDateStr(new Date()) })
      .then((res) => {
        if (res && 'studioRooms' in res) {
          setRoomIds(res.studioRooms.map((r) => r.id).join(','));
          const map: Record<number, RoomScheduleResponse[]> = {};
          const maxMap: Record<number, number> = {};
          res.studioRooms.forEach((r) => {
            if (r.schedules) map[r.id] = r.schedules;
            if (r.maxBookingDuration) maxMap[r.id] = r.maxBookingDuration;
          });
          setSchedulesByRoom(map);
          setMaxDurByRoom(maxMap);
        }
      });
  }, [studioId]);

  // 2) 그 날짜의 전체 홀 슬롯 (다중 조회)
  useEffect(() => {
    if (!roomIds) { setLoading(false); return; }
    setLoading(true);
    setSel(null);
    getKioskRoomsAvailabilityAction({ studioRoomIds: roomIds, date: toDateStr(selectedDate) })
      .then((res) => { if (res && 'rooms' in res) setRows(res.rooms); })
      .finally(() => setLoading(false));
  }, [roomIds, selectedDate]);

  const dateStrip = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  // 예약 가능 여부는 서버 slot.status만 신뢰 (과거 시각 등 별도 프론트 판정 없음)
  const isPastHour = (_h: number) => false;

  const hourSlot = (row: RoomAvailabilityRowResponse, h: number) =>
    (row.slots ?? []).find((s) => s.time === `${pad(h)}:00`);

  // 슬롯 가격: slot.price가 있으면 그대로, 없으면(null) schedules에서 요일·시각으로 계산
  const dow = selectedDate.getDay(); // 0=일 ~ 6=토
  const scheduledPrice = (schedules: RoomScheduleResponse[] | undefined, time: string): number | null => {
    const m = schedules?.find((s) => s.dayType === 'Weekly' && s.day === dow && s.startTime === time && s.status === 'Active');
    return m?.price ?? null;
  };
  const slotPrice = (row: RoomAvailabilityRowResponse, h: number): number | null => {
    const s = hourSlot(row, h);
    return s?.price ?? scheduledPrice(row.schedules ?? schedulesByRoom[row.studioRoomId], `${pad(h)}:00`);
  };

  const isSelectable = (row: RoomAvailabilityRowResponse, h: number) => {
    const s = hourSlot(row, h);
    return !!s && s.status === 'available' && !isPastHour(h);
  };

  // 홀별 최대 선택 칸수(1칸=1시간). 미설정이면 무제한
  const maxSlotsFor = (roomId: number) => {
    const d = maxDurByRoom[roomId];
    return d ? Math.floor(d / 60) : Infinity;
  };

  // pickBlock — 한 홀 안 연속 구간 (가이드 3-1). maxBookingDuration만큼만 연장 허용
  const onCell = (roomId: number, h: number, row: RoomAvailabilityRowResponse) => {
    if (!isSelectable(row, h)) return;
    const maxSlots = maxSlotsFor(roomId);
    setSel((prev) => {
      if (!prev || prev.roomId !== roomId) return { roomId, start: h, end: h };
      const { start, end } = prev;
      const curLen = end - start + 1;
      if (h === end + 1) return curLen + 1 > maxSlots ? prev : { roomId, start, end: h };   // 바로 뒤 → 연장(최대 캡)
      if (h === start - 1) return curLen + 1 > maxSlots ? prev : { roomId, start: h, end };  // 바로 앞 → 연장(최대 캡)
      if (h === start && start === end) return null;            // 단일 재클릭 → 해제
      if (h === start) return { roomId, start: start + 1, end };// 첫 칸 → 앞 축소
      if (h > start && h <= end) return { roomId, start, end: h - 1 }; // 중간/마지막 → 뒤 해제
      return { roomId, start: h, end: h };                     // 떨어진 칸 → 새로
    });
  };

  const selRow = sel ? rows.find((r) => r.studioRoomId === sel.roomId) : undefined;
  const selHours = sel ? sel.end - sel.start + 1 : 0;
  const selPrices = sel && selRow
    ? HOURS.slice(sel.start, sel.end + 1).map((h) => slotPrice(selRow, h))
    : [];
  const priceOk = sel != null && selPrices.length > 0 && selPrices.every((p) => p != null);
  const totalPrice = priceOk ? selPrices.reduce((a, p) => a + (p as number), 0) : 0;

  const confirm = () => {
    // 가격(price)이 응답에 없어도 진행 — 최종금액은 결제 시 서버가 계산
    if (!sel || !selRow) return;
    const startTime = `${pad(sel.start)}:00`;
    const endTime = `${pad((sel.end + 1) % 24)}:00`; // 종료 배타적, 24시는 00:00
    const { startDate, endDate } = buildBookingDates(toDateStr(selectedDate), { startTime, endTime });
    onConfirm({
      studioRoomId: selRow.studioRoomId,
      roomName: selRow.name,
      price: totalPrice,
      date: toDotDate(selectedDate),
      startTime,
      endTime,
      startDate,
      endDate,
    });
  };

  // ── 셀 스타일 ──
  const cellW = 'min(6.4vw, 60px)';
  const cellH = 'min(6.6vh, 58px)';
  const nameW = 'min(16vw, 128px)';

  const renderCell = (row: RoomAvailabilityRowResponse, h: number) => {
    const s = hourSlot(row, h);
    const selected = !!sel && sel.roomId === row.studioRoomId && h >= sel.start && h <= sel.end;
    const past = isPastHour(h);
    const closed = !s || s.status === 'closed';
    const full = !!s && s.status === 'full';
    const available = !!s && s.status === 'available' && !past;
    const price = slotPrice(row, h);

    let bg = 'bg-[#F2F4F6]'; // closed
    if (selected) bg = 'bg-[#1E2124]';
    else if (past) bg = 'bg-[#F7F8F9]';
    else if (full) bg = 'bg-[#FDECEC]';
    else if (available) bg = 'bg-white border border-[#E4E8EC]';

    return (
      <button
        key={h}
        disabled={!available}
        onClick={() => onCell(row.studioRoomId, h, row)}
        className={`flex-shrink-0 flex items-center justify-center ${bg} ${available ? 'active:scale-95' : 'cursor-not-allowed'}`}
        style={{ width: cellW, height: cellH }}
      >
        {selected ? (
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 'min(2vh, 20px)', height: 'min(2vh, 20px)' }}>
            <path d="M5 12.5L10 17.5L19 8" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : available ? (
          <span className="text-[#3CC0AF] whitespace-nowrap" style={{ fontSize: 'min(1vh, 10px)', fontWeight: 600 }}>{t('community_available')}</span>
        ) : past ? (
          <span className="text-[#C4C9CF]" style={{ fontSize: 'min(1vh, 10px)', fontWeight: 600 }}>{t('slot_past')}</span>
        ) : full ? (
          <span className="text-[#E0533F]" style={{ fontSize: 'min(1vh, 10px)', fontWeight: 700 }}>{t('slot_full')}</span>
        ) : closed ? (
          <span className="text-[#C4C9CF]" style={{ fontSize: 'min(1vh, 10px)', fontWeight: 600 }}>{t('slot_closed')}</span>
        ) : null}
      </button>
    );
  };

  // 셀 종류 판정 (연속 병합용)
  const cellKind = (row: RoomAvailabilityRowResponse, h: number): 'available' | 'past' | 'full' | 'closed' => {
    const s = hourSlot(row, h);
    if (isPastHour(h)) return 'past';
    if (!s || s.status === 'closed') return 'closed';
    if (s.status === 'full') return 'full';
    if (s.status === 'available') return 'available';
    return 'closed';
  };

  // 연속된 비활성(휴무/마감/지남) 구간을 하나의 블록으로 병합해 라벨 1회 표시
  const renderMergedBlock = (kind: 'past' | 'full' | 'closed', startH: number, span: number) => {
    const bg = kind === 'past' ? 'bg-[#F7F8F9]' : kind === 'full' ? 'bg-[#FDECEC]' : 'bg-[#F2F4F6]';
    const label = kind === 'past' ? t('slot_past') : kind === 'full' ? t('slot_full') : t('slot_closed');
    const color = kind === 'full' ? 'text-[#E0533F]' : 'text-[#C4C9CF]';
    return (
      <div key={`m-${startH}`} className={`flex-shrink-0 flex items-center justify-center ${bg} cursor-not-allowed`}
        style={{ width: `calc(${cellW} * ${span})`, height: cellH }}>
        <span className={color} style={{ fontSize: 'min(1.2vh, 12px)', fontWeight: kind === 'full' ? 700 : 600 }}>{label}</span>
      </div>
    );
  };

  // 한 홀의 24시간을 렌더: available은 개별(선택), 나머지는 연속 병합
  const renderRow = (row: RoomAvailabilityRowResponse) => {
    const out: React.ReactNode[] = [];
    let h = 0;
    while (h < 24) {
      const kind = cellKind(row, h);
      if (kind === 'available') {
        out.push(renderCell(row, h));
        h++;
      } else {
        let end = h;
        while (end + 1 < 24 && cellKind(row, end + 1) === kind) end++;
        out.push(renderMergedBlock(kind, h, end - h + 1));
        h = end + 1;
      }
    }
    return out;
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onBack={onBack} onHome={onBack} />

      <div className="shrink-0" style={{ padding: '4px 24px 8px' }}>
        <h1 className="font-bold text-black" style={{ fontSize: 'min(2.4vh, 28px)' }}>{t('kiosk_rental_title')}</h1>
        <p className="text-[#86898C] mt-[2px]" style={{ fontSize: 'min(1.4vh, 15px)' }}>{t('kiosk_rental_select_hint')}</p>
      </div>

      {/* 날짜 선택 스트립 */}
      <div className="shrink-0" style={{ padding: '2px 0 8px' }}>
        <div className="flex overflow-x-auto scrollbar-hide [&>*:first-child]:ml-6 [&>*:last-child]:mr-6" style={{ gap: 'min(0.8vh, 8px)' }}>
          {dateStrip.map((d) => {
            const isSelected = isSameDay(d, selectedDate);
            const isTodayCell = isSameDay(d, today);
            return (
              <button
                key={toDateStr(d)}
                onClick={() => setSelectedDate(d)}
                className={`flex flex-col items-center gap-0.5 rounded-[12px] flex-shrink-0 transition-all ${isSelected ? 'bg-black' : 'bg-[#F3F4F6] active:scale-[0.97]'}`}
                style={{ width: 'min(6.4vh, 60px)', padding: 'min(0.8vh, 8px) 0' }}
              >
                <span className={`font-medium ${isSelected ? 'text-white/60' : 'text-[#86898C]'}`} style={{ fontSize: 'min(1.2vh, 13px)' }}>
                  {DAY_LABELS[locale][d.getDay()]}
                </span>
                <span className={`font-bold ${isSelected ? 'text-white' : 'text-black'}`} style={{ fontSize: 'min(1.7vh, 18px)' }}>{d.getDate()}</span>
                {isTodayCell && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-black'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full h-2 bg-[#F7F8F9] shrink-0" />

      {/* 홀 × 24시간 그리드 */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-[#86898C]" style={{ fontSize: 'min(1.6vh, 18px)' }}>{t('kiosk_no_rooms')}</div>
        ) : (
          <div className="inline-block min-w-full" style={{ padding: '0 0 8px' }}>
            {/* 시간 헤더 */}
            <div className="flex sticky top-0 z-20 bg-white border-b border-[#EEF0F2]">
              <div className="sticky left-0 z-10 bg-white shrink-0" style={{ width: nameW }} />
              {HOURS.map((h) => (
                <div key={h} className="flex-shrink-0 flex items-center justify-center text-[#86898C]" style={{ width: cellW, height: 'min(3.4vh, 32px)', fontSize: 'min(1.2vh, 12px)', fontWeight: 600 }}>
                  {pad(h)}
                </div>
              ))}
            </div>
            {/* 홀 행 */}
            {rows.map((row) => (
              <div key={row.studioRoomId} className="flex border-b border-[#F5F6F7]">
                <div className="sticky left-0 z-10 bg-white shrink-0 flex flex-col justify-center border-r border-[#EEF0F2]" style={{ width: nameW, paddingLeft: 'min(1.6vh, 16px)', paddingRight: '8px' }}>
                  <span className="font-bold text-black truncate" style={{ fontSize: 'min(1.6vh, 17px)' }}>{row.name}</span>
                  {maxDurByRoom[row.studioRoomId] ? (
                    <span className="text-[#86898C] truncate" style={{ fontSize: 'min(1.2vh, 12px)', marginTop: 2 }}>
                      {t('kiosk_max_hours').replace('{count}', String(Math.floor(maxDurByRoom[row.studioRoomId] / 60)))}
                    </span>
                  ) : null}
                </div>
                {renderRow(row)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 선택 요약 */}
      {sel && selRow && (
        <div className="shrink-0 flex items-center justify-between bg-black" style={{ margin: '10px 24px 0', borderRadius: '12px', padding: 'min(1.2vh, 14px) min(1.6vh, 18px)' }}>
          <span className="font-bold text-white truncate" style={{ fontSize: 'min(1.6vh, 17px)' }}>{selRow.name}</span>
          <span className="text-white/90" style={{ fontSize: 'min(1.5vh, 16px)', fontWeight: 600 }}>
            {pad(sel.start)}:00 ~ {pad((sel.end + 1) % 24)}:00
            {!priceOk && <span className="text-white/50" style={{ marginLeft: 8, fontSize: 'min(1.3vh, 13px)' }}>{t('kiosk_price_unset')}</span>}
          </span>
        </div>
      )}

      {/* 하단 CTA */}
      <div className="shrink-0 border-t border-[#F1F3F6]" style={{ padding: '12px 24px min(2vh, 24px)' }}>
        <button
          disabled={!sel || !selRow}
          onClick={confirm}
          className={`w-full h-[min(7vh,72px)] rounded-[16px] flex items-center justify-center transition-transform ${sel && selRow ? 'bg-[#1E2124] active:scale-[0.97]' : 'bg-[#E0E0E0] cursor-not-allowed'}`}
        >
          <span className={`font-bold ${sel && selRow ? 'text-white' : 'text-[#999]'}`} style={{ fontSize: 'min(2vh, 24px)' }}>
            {priceOk
              ? t('kiosk_rental_reserve').replace('{count}', String(selHours)).replace('{amount}', formatPrice(totalPrice))
              : sel
                ? t('community_reserve_hours').replace('{count}', String(selHours))
                : t('kiosk_next')}
          </span>
        </button>
      </div>
    </div>
  );
};
