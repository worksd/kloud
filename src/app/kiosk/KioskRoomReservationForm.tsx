'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { KioskTopBar } from "@/app/kiosk/KioskLessonListForm";
import { getKioskPracticeRoomsAction, getKioskRoomAvailabilityAction } from "@/app/kiosk/kiosk.room.actions";
import { StudioRoomResponse, RoomAvailabilityResponse, TimeSlotResponse } from "@/app/endpoint/studio.room.endpoint";

// 키오스크 연습실 예약 결과 — KioskForm이 이 값으로 패스권 사용(useKioskPassAction) 호출
export type KioskRoomBooking = {
  studioRoomId: number;
  roomName: string;
  unitPrice?: number;
  price: number;        // 선택 시간 기준 총액 (unitPrice × 슬롯 수)
  date: string;         // 표시용 날짜 (avail.date, dot 포맷 YYYY.MM.DD)
  startTime: string;
  endTime: string;
  startDate: string;    // "YYYY.MM.DD HH:mm"
  endDate: string;      // "YYYY.MM.DD HH:mm" (자정 넘기면 +1일)
};

const formatPrice = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
const formatDotDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const DAY_LABELS: Record<Locale, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const minutesOf = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// "09:00" + duration(분) → "09:30"
const calcEndTime = (time: string, duration: number) => {
  const [h, m] = time.split(':').map(Number);
  const end = h * 60 + m + duration;
  return `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
};

// 키오스크용 세로 타임테이블 — PracticeRoomSlotSelector(웹 가로형)의 필터/연속선택/제한 로직을 세로로 재구현.
// 공유 컴포넌트를 건드리지 않기 위해 여기 별도로 둔다. date/room 바뀌면 key로 리셋.
const KioskVerticalTimeTable = ({
  slots,
  minBookingDuration,
  maxBookingDuration,
  dailyBookingLimit,
  myBookings,
  date,
  locale,
  onSelectionChange,
}: {
  slots: TimeSlotResponse[];
  minBookingDuration: number;
  maxBookingDuration?: number | null;
  dailyBookingLimit?: number | null;
  myBookings?: { id: number; startDate: string; endDate: string }[];
  date?: string;
  locale: Locale;
  onSelectionChange: (selection: { startTime: string; endTime: string } | null) => void;
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  // minBookingDuration 배수인 시각만 행으로 (기존 필터와 동일)
  const filteredSlots = slots.filter((s) => {
    const [, m] = s.time.split(':').map(Number);
    return m % minBookingDuration === 0;
  });

  const now = new Date();
  const isToday = !!date && date.replace(/\./g, '-') ===
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const nowHourFloor = now.getHours() * 60;
  const isPastSlot = (time: string) => {
    if (!isToday) return false;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m < nowHourFloor;
  };

  const isMyBooked = (time: string) =>
    (myBookings ?? []).some((b) => {
      const bStart = b.startDate.split(' ')[1] ?? '';
      const bEnd = b.endDate.split(' ')[1] ?? '';
      return time >= bStart && time < bEnd;
    });

  const myBookedMinutes = (myBookings ?? []).reduce((sum, b) => {
    const bStart = b.startDate.split(' ')[1] ?? '0:0';
    const bEnd = b.endDate.split(' ')[1] ?? '0:0';
    const [sh, sm] = bStart.split(':').map(Number);
    const [eh, em] = bEnd.split(':').map(Number);
    return sum + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);

  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const maxSlots = maxBookingDuration ? Math.floor(maxBookingDuration / minBookingDuration) : null;
  const dailyRemainingSlots = dailyBookingLimit ? Math.floor((dailyBookingLimit - myBookedMinutes) / minBookingDuration) : null;
  const effectiveMaxSlots = Math.min(maxSlots ?? Infinity, dailyRemainingSlots ?? Infinity);

  const applySelection = (newSet: Set<number>) => {
    setSelectedIndices(newSet);
    if (newSet.size > 0) {
      const sorted = Array.from(newSet).sort((a, b) => a - b);
      const startTime = filteredSlots[sorted[0]].time;
      const endTime = calcEndTime(filteredSlots[sorted[sorted.length - 1]].time, minBookingDuration);
      onSelectionChange({ startTime, endTime });
    } else {
      onSelectionChange(null);
    }
  };

  const handleClick = (index: number) => {
    const slot = filteredSlots[index];
    if (slot.status !== 'available' || isMyBooked(slot.time) || isPastSlot(slot.time)) return;

    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
      // 연속 체크 — 비연속이면 새로 클릭한 것만
      const sorted = Array.from(newSet).sort((a, b) => a - b);
      let isConsecutive = true;
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1] + 1) { isConsecutive = false; break; }
      }
      if (!isConsecutive) { newSet.clear(); newSet.add(index); }
      // max/daily 초과 시 가장 먼저 선택된 슬롯부터 제거
      while (effectiveMaxSlots !== Infinity && newSet.size > effectiveMaxSlots) {
        const first = Array.from(newSet).sort((a, b) => a - b)[0];
        newSet.delete(first);
      }
    }
    applySelection(newSet);
  };

  if (filteredSlots.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-[#86898C]" style={{ fontSize: 'min(1.4vh, 15px)' }}>
        {t('kiosk_no_rooms')}
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ padding: '4px 24px 8px' }}>
      {effectiveMaxSlots !== Infinity && (
        <div className="flex justify-end mb-[6px]">
          <span className="text-[#86898C]" style={{ fontSize: 'min(1.2vh, 13px)' }}>
            {t('max_booking')} {effectiveMaxSlots * minBookingDuration}{t('minutes')}
          </span>
        </div>
      )}
      <div className="flex flex-col" style={{ gap: 'min(0.8vh, 8px)' }}>
        {filteredSlots.map((slot, index) => {
          const available = slot.status === 'available';
          const mine = isMyBooked(slot.time);
          const past = isPastSlot(slot.time) && !mine;
          const full = slot.status === 'full';
          const closed = slot.status === 'closed';
          const selected = selectedIndices.has(index);
          const disabled = mine || past || !available;
          const badge = mine
            ? t('my_bookings')
            : past
              ? t('slot_booking_closed')
              : full
                ? t('slot_full')
                : closed
                  ? t('slot_unavailable')
                  : t('reservable');
          const bg = selected
            ? 'bg-[#1E2124]'
            : mine
              ? 'bg-[#EEF0F2]'
              : (past || full || closed)
                ? 'bg-[#F7F8F9]'
                : 'bg-white border border-[#EEF0F2]';
          const timeColor = selected ? 'text-white' : disabled ? 'text-[#C4C9CF]' : 'text-[#1E2124]';
          const badgeColor = selected
            ? 'text-white'
            : mine
              ? 'text-[#1E2124]'
              : (past || full || closed)
                ? 'text-[#C4C9CF]'
                : 'text-[#3CC0AF]';
          return (
            <button
              key={slot.time}
              onClick={() => handleClick(index)}
              disabled={disabled}
              className={`w-full flex items-center justify-between rounded-[14px] transition-transform ${bg} ${disabled ? 'cursor-not-allowed' : 'active:scale-[0.99]'}`}
              style={{ height: 'min(8vh, 84px)', padding: '0 min(2.4vh, 24px)' }}
            >
              <span className={`font-bold ${timeColor}`} style={{ fontSize: 'min(2vh, 22px)' }}>
                {slot.time} ~ {calcEndTime(slot.time, minBookingDuration)}
              </span>
              <span className="flex items-center" style={{ gap: 'min(1.2vh, 12px)' }}>
                {available && !mine && !past && (
                  <span className={selected ? 'text-white/60' : 'text-[#86898C]'} style={{ fontSize: 'min(1.3vh, 14px)' }}>
                    {slot.currentCount}/{slot.maxCount}
                  </span>
                )}
                {selected ? (
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 'min(2.2vh, 24px)', height: 'min(2.2vh, 24px)' }}>
                    <path d="M5 12.5L10 17.5L19 8" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className={`font-bold ${badgeColor}`} style={{ fontSize: 'min(1.5vh, 16px)' }}>{badge}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// PracticeRoomPaymentWrapper.buildPracticeRoomInfo와 동일한 날짜 계산
const buildBookingDates = (dateStr: string | undefined, sel: { startTime: string; endTime: string }) => {
  const startDateStr = (dateStr ?? '').replace(/-/g, '.');
  const isNextDay = sel.endTime <= sel.startTime; // 자정 넘김
  let endDateStr = startDateStr;
  if (isNextDay) {
    const [y, m, dd] = startDateStr.split('.').map(Number);
    if (y && m && dd) {
      const next = new Date(y, m - 1, dd);
      next.setDate(next.getDate() + 1);
      endDateStr = formatDotDate(next);
    }
  }
  return {
    startDate: `${startDateStr} ${sel.startTime}`,
    endDate: `${endDateStr} ${sel.endTime}`,
  };
};

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
  const won = t('won');

  const [step, setStep] = useState<'room' | 'slot'>('room');

  // 룸 목록
  const [rooms, setRooms] = useState<StudioRoomResponse[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // 선택
  const today = useRef(new Date()).current;
  const [selectedRoom, setSelectedRoom] = useState<StudioRoomResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [avail, setAvail] = useState<RoomAvailabilityResponse | null>(null);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [selectedTime, setSelectedTime] = useState<{ startTime: string; endTime: string } | null>(null);

  // 이미지 캐러셀
  const [imageIndex, setImageIndex] = useState(0);
  const imageScrollRef = useRef<HTMLDivElement>(null);

  // 룸 목록 조회 (오늘 기준)
  // alive 게이트를 두지 않는다 — dev StrictMode 이중 마운트 시 먼저 끝난 fetch의
  // cleanup으로 alive=false가 되면 목록/로딩이 영영 확정 안 되는 문제 방지.
  useEffect(() => {
    setLoadingRooms(true);
    getKioskPracticeRoomsAction({ studioId, date: toDateStr(new Date()) })
      .then((res) => { if (res && 'studioRooms' in res) setRooms(res.studioRooms); })
      .finally(() => setLoadingRooms(false));
  }, [studioId]);

  // 룸+날짜 가용성 조회
  const fetchAvail = useCallback(async () => {
    if (!selectedRoom) return;
    setLoadingAvail(true);
    setSelectedTime(null);
    try {
      const res = await getKioskRoomAvailabilityAction({ roomId: selectedRoom.id, date: toDateStr(selectedDate) });
      if ('studioRoomId' in res) setAvail(res);
    } finally {
      setLoadingAvail(false);
    }
  }, [selectedRoom, selectedDate]);

  useEffect(() => {
    if (step === 'slot') fetchAvail();
  }, [step, fetchAvail]);

  const dateStrip = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const handleImageScroll = () => {
    if (!imageScrollRef.current) return;
    const scrollLeft = imageScrollRef.current.scrollLeft;
    const width = imageScrollRef.current.clientWidth;
    setImageIndex(Math.round(scrollLeft / width));
  };

  const enterRoom = (room: StudioRoomResponse) => {
    setSelectedRoom(room);
    setSelectedDate(new Date());
    setAvail(null);
    setSelectedTime(null);
    setImageIndex(0);
    setStep('slot');
  };

  const confirm = () => {
    if (!selectedRoom || !avail || !selectedTime) return;
    const dateStr = avail.date; // dot 포맷
    const { startDate, endDate } = buildBookingDates(dateStr, selectedTime);
    // 슬롯 수 × 단가 = 총액 (표시/영수증용). 자정 넘기면 +1440분 보정.
    const startMin = minutesOf(selectedTime.startTime);
    let endMin = minutesOf(selectedTime.endTime);
    if (endMin <= startMin) endMin += 1440;
    const unit = avail.minBookingDuration || 60;
    const slotCount = Math.max(1, Math.round((endMin - startMin) / unit));
    const unitPrice = avail.unitPrice ?? selectedRoom.unitPrice;
    const price = (unitPrice ?? 0) * slotCount;
    onConfirm({
      studioRoomId: selectedRoom.id,
      roomName: avail.name ?? selectedRoom.name,
      unitPrice,
      price,
      date: dateStr,
      startTime: selectedTime.startTime,
      endTime: selectedTime.endTime,
      startDate,
      endDate,
    });
  };

  const roomMeta = (
    r: { maxCap?: number; minBookingDuration?: number | null; unitPrice?: number | null; maxBookingDuration?: number | null; dailyBookingLimit?: number | null },
  ) => (
    <>
      {r.maxCap != null && r.maxCap > 0 && (
        <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vh, 15px)' }}>
          {t('max_capacity')} {r.maxCap}{t('people')}
        </span>
      )}
      {r.minBookingDuration != null && (
        <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vh, 15px)' }}>
          {r.minBookingDuration}{t('minutes')}/{t('slot')}
        </span>
      )}
      {r.unitPrice != null && r.unitPrice > 0 && (
        <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vh, 15px)' }}>
          {formatPrice(r.unitPrice)}{won}/{t('slot')}
        </span>
      )}
      {r.maxBookingDuration != null && (
        <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vh, 15px)' }}>
          {t('max_booking')} {r.maxBookingDuration}{t('minutes')}
        </span>
      )}
      {r.dailyBookingLimit != null && (
        <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vh, 15px)' }}>
          {t('daily_limit')} {r.dailyBookingLimit}{t('minutes')}
        </span>
      )}
    </>
  );

  const emptyRoomIcon = (
    <svg viewBox="0 0 28 28" fill="none" style={{ width: 'min(4vh, 40px)', height: 'min(4vh, 40px)' }}>
      <rect x="3" y="5" width="22" height="18" rx="3" stroke="#CDD1D5" strokeWidth="1.5" />
      <path d="M3 17L9 12L14 16L19 11L25 17" stroke="#CDD1D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="10" r="2" stroke="#CDD1D5" strokeWidth="1.5" />
    </svg>
  );

  // ── 룸 목록 스텝 ──
  if (step === 'room') {
    return (
      <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
        <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onBack={onBack} onHome={onBack} />
        <div className="shrink-0" style={{ padding: '4px 24px 12px' }}>
          <h1 className="font-bold text-black" style={{ fontSize: 'min(2.4vh, 28px)' }}>{t('kiosk_select_room')}</h1>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ padding: '4px 24px 24px' }}>
          {loadingRooms ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-[#86898C]" style={{ fontSize: 'min(1.6vh, 18px)' }}>{t('kiosk_no_rooms')}</div>
          ) : (
            <div className="grid grid-cols-2 gap-[12px]">
              {rooms.map((room) => {
                const maxCap = room.practiceMaxNumber ?? room.maxNumber;
                return (
                  <button
                    key={room.id}
                    onClick={() => enterRoom(room)}
                    className="w-full text-left rounded-[16px] border border-[#EEF0F2] overflow-hidden active:scale-[0.98] transition-transform"
                  >
                    <div className="relative w-full aspect-[4/3] bg-[#F1F3F6]">
                      {room.imageUrls?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={room.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">{emptyRoomIcon}</div>
                      )}
                    </div>
                    <div style={{ padding: 'min(1.4vh, 14px) min(1.6vh, 16px)' }}>
                      <h2 className="font-bold text-black truncate" style={{ fontSize: 'min(1.8vh, 20px)' }}>{room.name}</h2>
                      <div className="flex flex-col mt-[4px]" style={{ gap: '2px' }}>
                        {roomMeta({ maxCap, minBookingDuration: room.minBookingDuration, unitPrice: room.unitPrice, maxBookingDuration: room.maxBookingDuration })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 슬롯 선택 스텝 (StudioRoomDetailClient 미러, 키오스크 밀도) ──
  const images = avail?.imageUrls ?? selectedRoom?.imageUrls ?? [];
  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onBack={() => setStep('room')} onHome={onBack} />

      <div className="flex-1 overflow-y-auto">
        {/* 이미지 — 전체폭이되 높이 캡으로 축소 */}
        <div className="relative w-full bg-[#F1F3F6]" style={{ height: 'min(26vh, 260px)' }}>
          {images.length > 0 ? (
            <>
              <div
                ref={imageScrollRef}
                onScroll={handleImageScroll}
                className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              >
                {images.map((url, i) => (
                  <div key={i} className="w-full flex-shrink-0 snap-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              {images.length > 1 && (
                <div className="absolute left-0 right-0 flex justify-center gap-1 z-10" style={{ bottom: 'min(1.2vh, 12px)' }}>
                  {images.map((_, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full transition-colors ${i === imageIndex ? 'bg-white' : 'bg-white/40'}`} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">{emptyRoomIcon}</div>
          )}
        </div>

        {/* 룸 정보 */}
        {avail && (
          <div style={{ padding: '16px 24px' }}>
            <h1 className="font-bold text-black" style={{ fontSize: 'min(2vh, 24px)' }}>{avail.name}</h1>
            <div className="flex flex-wrap items-center mt-[6px]" style={{ columnGap: 'min(1.6vh, 16px)', rowGap: '4px' }}>
              {roomMeta({
                maxCap: avail.maxCount,
                minBookingDuration: avail.minBookingDuration,
                unitPrice: avail.unitPrice,
                maxBookingDuration: avail.maxBookingDuration,
                dailyBookingLimit: avail.dailyBookingLimit,
              })}
            </div>

            {avail.advanceBookingDays != null && (
              <div className="mt-[10px] rounded-[12px] bg-[#EDEDFF]" style={{ padding: 'min(0.9vh, 10px) min(1.2vh, 14px)' }}>
                <span className="font-medium text-[#5B5FF6]" style={{ fontSize: 'min(1.2vh, 13px)' }}>
                  {avail.advanceBookingDays === 0
                    ? t('same_day_only')
                    : `${avail.advanceBookingDays}${t('advance_booking_info')}${avail.advanceBookingOpenTime ? ` · ${t('advance_booking_open_time')} ${avail.advanceBookingOpenTime}` : ''}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 이용안내 */}
        {avail?.description && avail.description.replace(/<[^>]*>/g, '').trim() !== '' && (
          <div className="rounded-[16px] bg-[#1E2124]" style={{ margin: '0 24px 16px', padding: 'min(1.6vh, 16px) min(1.8vh, 18px)' }}>
            <div className="flex items-center gap-2 mb-2">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.2" />
                <path d="M8 5V8.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.7" fill="white" />
              </svg>
              <span className="font-bold text-white" style={{ fontSize: 'min(1.4vh, 15px)' }}>{t('usage_guide')}</span>
            </div>
            <div className="text-white/70 leading-[1.7]
              [&_h1]:text-[15px] [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-2
              [&_h2]:text-[14px] [&_h2]:font-bold [&_h2]:text-white/90 [&_h2]:mt-1.5
              [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-white/80 [&_h3]:mt-1
              [&_p]:mt-0.5 [&_p:empty]:hidden
              [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mt-1
              [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mt-1
              [&_li]:mt-0.5"
              style={{ fontSize: 'min(1.3vh, 14px)' }}
              dangerouslySetInnerHTML={{ __html: avail.description }}
            />
          </div>
        )}

        <div className="w-full h-2 bg-[#F7F8F9]" />

        {/* 날짜 선택 스트립 */}
        <div style={{ padding: '14px 0 6px' }}>
          <div className="flex overflow-x-auto scrollbar-hide [&>*:first-child]:ml-6 [&>*:last-child]:mr-6" style={{ gap: 'min(0.8vh, 8px)' }}>
            {dateStrip.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              const dayLabel = DAY_LABELS[locale][date.getDay()];
              return (
                <button
                  key={toDateStr(date)}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center gap-0.5 rounded-[12px] flex-shrink-0 transition-all
                    ${isSelected ? 'bg-black' : 'bg-[#F3F4F6] active:scale-[0.97]'}`}
                  style={{ width: 'min(6.4vh, 60px)', padding: 'min(0.8vh, 8px) 0' }}
                >
                  <span className={`font-medium ${isSelected ? 'text-white/60' : 'text-[#86898C]'}`} style={{ fontSize: 'min(1.2vh, 13px)' }}>
                    {dayLabel}
                  </span>
                  <span className={`font-bold ${isSelected ? 'text-white' : 'text-black'}`} style={{ fontSize: 'min(1.7vh, 18px)' }}>
                    {date.getDate()}
                  </span>
                  {isToday && (
                    <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-black'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 시간대 선택 — 키오스크용 세로 타임테이블 (하루 전체 세로로) */}
        {loadingAvail ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          </div>
        ) : avail && avail.slots.length > 0 ? (
          <KioskVerticalTimeTable
            key={`${selectedRoom?.id}-${avail.date}`}
            slots={avail.slots}
            minBookingDuration={avail.minBookingDuration ?? 60}
            maxBookingDuration={avail.maxBookingDuration}
            dailyBookingLimit={avail.dailyBookingLimit}
            locale={locale}
            myBookings={avail.myBookings}
            onSelectionChange={setSelectedTime}
            date={avail.date}
          />
        ) : (
          <div className="flex items-center justify-center py-10 text-[#86898C]" style={{ fontSize: 'min(1.4vh, 15px)' }}>{t('kiosk_no_rooms')}</div>
        )}

        {/* 선택된 시간 표시 (PracticeRoomPaymentWrapper 미러) */}
        {selectedTime && (
          <div className="flex items-center justify-between bg-black rounded-[12px]" style={{ margin: '0 24px 16px', padding: 'min(1.2vh, 14px) min(1.6vh, 18px)' }}>
            <span className="text-white/60" style={{ fontSize: 'min(1.4vh, 15px)' }}>{t('time')}</span>
            <span className="font-bold text-white" style={{ fontSize: 'min(1.6vh, 17px)' }}>{selectedTime.startTime} ~ {selectedTime.endTime}</span>
          </div>
        )}
      </div>

      {/* 하단 CTA */}
      <div className="shrink-0 border-t border-[#F1F3F6]" style={{ padding: '12px 24px min(2vh, 24px)' }}>
        <button
          disabled={!selectedTime}
          onClick={confirm}
          className={`w-full h-[min(7vh,72px)] rounded-[16px] flex items-center justify-center transition-transform ${
            selectedTime ? 'bg-[#1E2124] active:scale-[0.97]' : 'bg-[#E0E0E0] cursor-not-allowed'
          }`}
        >
          <span className={`font-bold ${selectedTime ? 'text-white' : 'text-[#999]'}`} style={{ fontSize: 'min(2vh, 24px)' }}>
            {t('kiosk_next')}
          </span>
        </button>
      </div>
    </div>
  );
};
