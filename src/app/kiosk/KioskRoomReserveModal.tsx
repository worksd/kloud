'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { StudioRoomResponse, RoomAvailabilityResponse, TimeSlotResponse } from "@/app/endpoint/studio.room.endpoint";
import { getRoomAvailabilityAction } from "@/app/kiosk/kiosk.actions";
import { handleKioskTokenExpired } from "@/app/kiosk/kiosk.error";
import { KioskTopBar } from "@/app/kiosk/KioskLessonListForm";

const INTL_LOCALE: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US', jp: 'ja-JP', zh: 'zh-CN' };

const formatApiDate = (d: Date): string =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

const calcEndTime = (time: string, duration: number): string => {
  const [h, m] = time.split(':').map(Number);
  const end = h * 60 + m + duration;
  return `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
};

export type RoomReservationDraft = {
  studioRoomId: number;
  startDate: string;   // 'yyyy.MM.dd HH:mm'
  endDate: string;     // 'yyyy.MM.dd HH:mm'
  roomName: string;
  timeLabel: string;   // 영수증/요약 표시용
  price: number;
};

type Props = {
  studioRoom: StudioRoomResponse;
  locale: Locale;
  onBack: () => void;
  onHome: () => void;
  onChangeLocale: (locale: Locale) => void;
  onConfirm: (draft: RoomReservationDraft) => void;
};

export const KioskRoomReserveModal = ({ studioRoom, locale, onBack, onHome, onChangeLocale, onConfirm }: Props) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const dateOptions = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, []);
  const [selectedDate, setSelectedDate] = useState<Date>(dateOptions[0]);
  const [availability, setAvailability] = useState<RoomAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const dateLabel = (d: Date) => `${d.getMonth() + 1}.${d.getDate()} (${d.toLocaleDateString(INTL_LOCALE[locale], { weekday: 'short' })})`;

  // 날짜 변경 시 가용 슬롯 재조회 + 선택 초기화
  useEffect(() => {
    setLoading(true);
    setSelectedIndices(new Set());
    getRoomAvailabilityAction(studioRoom.id, formatApiDate(selectedDate))
      .then(async (res) => {
        // 진단: 슬롯이 비어 보일 때 실제 응답(에러/빈 slots/슬롯 시각)을 콘솔에서 확인
        console.log('[room-availability]', studioRoom.id, formatApiDate(selectedDate), res);
        if (await handleKioskTokenExpired(res)) return;
        if ('slots' in res) setAvailability(res as RoomAvailabilityResponse);
        else setAvailability(null);
      })
      .finally(() => setLoading(false));
  }, [studioRoom.id, selectedDate]);

  // minBookingDuration이 0/누락이면 m % 0 = NaN 으로 모든 슬롯이 탈락 → 60분으로 안전 폴백
  const rawMinDuration = availability?.minBookingDuration ?? studioRoom.minBookingDuration ?? 60;
  const minDuration = rawMinDuration > 0 ? rawMinDuration : 60;
  const unitPrice = availability?.unitPrice ?? studioRoom.unitPrice ?? 0;

  // minBookingDuration 단위로 나누어떨어지는 슬롯만 노출
  const filteredSlots: TimeSlotResponse[] = useMemo(
    () => (availability?.slots ?? []).filter((s) => {
      const [, m] = s.time.split(':').map(Number);
      return m % minDuration === 0;
    }),
    [availability, minDuration],
  );

  // 오늘 날짜면 지난 시간 비활성
  const now = new Date();
  const isToday = formatApiDate(selectedDate) === formatApiDate(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isPast = (time: string) => {
    if (!isToday) return false;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m < nowMinutes;
  };
  const isMyBooked = (time: string) =>
    (availability?.myBookings ?? []).some((b) => {
      const bs = b.startDate.split(' ')[1] ?? '';
      const be = b.endDate.split(' ')[1] ?? '';
      return time >= bs && time < be;
    });

  const maxSlots = availability?.maxBookingDuration ? Math.floor(availability.maxBookingDuration / minDuration) : Infinity;

  const handleClick = (index: number) => {
    const slot = filteredSlots[index];
    if (slot.status !== 'available' || isPast(slot.time) || isMyBooked(slot.time)) return;
    const next = new Set(selectedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
      // 비연속 선택이면 새로 누른 것만 남김
      const sorted = Array.from(next).sort((a, b) => a - b);
      let consecutive = true;
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1] + 1) { consecutive = false; break; }
      }
      if (!consecutive) { next.clear(); next.add(index); }
      // 최대 예약 시간 초과 시 가장 앞 슬롯부터 제거
      while (maxSlots !== Infinity && next.size > maxSlots) {
        next.delete(Array.from(next).sort((a, b) => a - b)[0]);
      }
    }
    setSelectedIndices(next);
  };

  const sortedSel = Array.from(selectedIndices).sort((a, b) => a - b);
  const startTime = sortedSel.length ? filteredSlots[sortedSel[0]].time : null;
  const endTime = sortedSel.length ? calcEndTime(filteredSlots[sortedSel[sortedSel.length - 1]].time, minDuration) : null;
  const durationMin = sortedSel.length * minDuration;
  const price = unitPrice ? Math.round((unitPrice * durationMin) / 60) : 0;

  const handleConfirm = () => {
    if (!startTime || !endTime) return;
    const dateStr = formatApiDate(selectedDate);
    // 종료가 시작보다 작거나 같으면 자정 넘김 → 종료 날짜 +1
    let endDateStr = dateStr;
    if (endTime <= startTime) {
      const nd = new Date(selectedDate);
      nd.setDate(nd.getDate() + 1);
      endDateStr = formatApiDate(nd);
    }
    onConfirm({
      studioRoomId: studioRoom.id,
      startDate: `${dateStr} ${startTime}`,
      endDate: `${endDateStr} ${endTime}`,
      roomName: studioRoom.name,
      timeLabel: `${dateLabel(selectedDate)} ${startTime} ~ ${endTime}`,
      price,
    });
  };

  const slotColor = (slot: TimeSlotResponse, selected: boolean, disabled: boolean) => {
    if (selected) return '#1E2124';
    if (disabled) return '#F0F0F0';
    if (slot.status !== 'available') return '#F0F0F0';
    return '#EEF1F4';
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onBack={onBack} onHome={onHome} />

      {/* 방 이름 */}
      <div className="shrink-0 px-[5.6%] pt-[min(1vw,12px)] pb-[min(1.4vw,16px)]">
        <p className="text-black font-bold leading-tight" style={{ fontSize: 'min(3vh, 34px)' }}>{studioRoom.name}</p>
        {unitPrice > 0 && (
          <p className="text-[#86898C] mt-[6px]" style={{ fontSize: 'min(1.8vh, 20px)' }}>
            {t('kiosk_per_hour')} {new Intl.NumberFormat('ko-KR').format(unitPrice)}{t('won')}
          </p>
        )}
      </div>

      {/* 날짜 pill */}
      <div className="shrink-0 flex gap-[10px] overflow-x-auto scrollbar-hide px-[5.6%] pb-[min(1.4vw,16px)]">
        {dateOptions.map((d) => {
          const active = formatApiDate(d) === formatApiDate(selectedDate);
          return (
            <button
              key={formatApiDate(d)}
              onClick={() => setSelectedDate(d)}
              className={`shrink-0 rounded-[16px] px-[min(2.4vw,26px)] py-[min(1.2vw,14px)] font-bold transition-colors active:scale-[0.97] ${active ? 'bg-[#1E2124] text-white' : 'bg-[#F2F4F6] text-[#6D7882]'}`}
              style={{ fontSize: 'min(1.8vh, 20px)' }}
            >
              {dateLabel(d)}
            </button>
          );
        })}
      </div>

      {/* 슬롯 영역 */}
      <div className="flex-1 overflow-y-auto px-[5.6%] py-[min(1.4vw,16px)]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_loading')}</div>
        ) : filteredSlots.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_no_slots')}</div>
        ) : (
          <div className="grid grid-cols-6 gap-[10px]">
            {filteredSlots.map((slot, index) => {
              const selected = selectedIndices.has(index);
              const booked = isMyBooked(slot.time);
              const past = isPast(slot.time);
              const disabled = slot.status !== 'available' || past || booked;
              return (
                <button
                  key={slot.time}
                  onClick={() => handleClick(index)}
                  disabled={disabled}
                  className={`rounded-[14px] flex items-center justify-center font-bold transition-all ${disabled ? 'cursor-not-allowed' : 'active:scale-[0.95]'}`}
                  style={{
                    height: 'min(7vh, 76px)',
                    backgroundColor: slotColor(slot, selected, disabled),
                    color: selected ? '#fff' : disabled ? '#C0C4C8' : '#1E2124',
                    fontSize: 'min(1.8vh, 20px)',
                  }}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단 요약 + 예약 버튼 */}
      <div className="shrink-0 border-t border-[#F2F4F6] px-[5.6%] py-[min(2vw,22px)]">
        <div className="flex items-center justify-between mb-[min(1.4vw,16px)]" style={{ minHeight: 'min(3.4vh, 36px)' }}>
          {startTime && endTime ? (
            <>
              <span className="text-black font-bold" style={{ fontSize: 'min(2.2vh, 24px)' }}>
                {startTime} ~ {endTime}
                <span className="text-[#86898C] ml-[10px]" style={{ fontSize: 'min(1.6vh, 18px)' }}>
                  {durationMin}{t('minutes')}
                </span>
              </span>
              {price > 0 && (
                <span className="text-black font-bold" style={{ fontSize: 'min(2.2vh, 24px)' }}>
                  {new Intl.NumberFormat('ko-KR').format(price)}{t('won')}
                </span>
              )}
            </>
          ) : (
            <span className="text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('select_time')}</span>
          )}
        </div>
        {/* 연습실은 패스권으로만 결제 가능 안내 */}
        <p className="text-[#86898C] text-center mb-[min(1.4vw,16px)]" style={{ fontSize: 'min(1.5vh, 16px)' }}>
          {t('kiosk_room_pass_only')}
        </p>
        <button
          onClick={handleConfirm}
          disabled={!startTime}
          className={`w-full rounded-[20px] flex items-center justify-center active:scale-[0.98] transition-all ${startTime ? 'bg-[#1E2124]' : 'bg-[#CDD1D5]'}`}
          style={{ height: 'min(8vh, 88px)' }}
        >
          <span className="text-white font-bold" style={{ fontSize: 'min(2.4vh, 26px)' }}>{t('kiosk_reserve')}</span>
        </button>
      </div>
    </div>
  );
};
