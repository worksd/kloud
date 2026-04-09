'use client'

import React, { useState, useRef, useEffect, useCallback } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { getRoomAvailabilityAction } from "@/app/schedule/get.practice.rooms.action";
import { RoomAvailabilityResponse, TimeSlotResponse } from "@/app/endpoint/studio.room.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { RoomBookingDialog, RoomBookingInfo } from "@/app/components/RoomBookingDialog";

const getHeatColor = (current: number, max: number) => {
  if (current === 0) return '#F3F4F6';
  const ratio = current / max;
  if (ratio >= 0.8) return '#EF4444';
  if (ratio >= 0.6) return '#F59E0B';
  if (ratio >= 0.4) return '#818CF8';
  if (ratio >= 0.2) return '#A5B4FC';
  return '#C7D2FE';
};

const slotColor = (slot: TimeSlotResponse) => {
  if (slot.status === 'closed') return '#F3F4F6';
  if (slot.status === 'full') return '#EF4444';
  return getHeatColor(slot.currentCount, slot.maxCount);
};

const calcEndTime = (time: string, duration: number) => {
  const [h, m] = time.split(':').map(Number);
  const end = h * 60 + m + duration;
  return `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
};

const formatPrice = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

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

export const StudioRoomDetailClient = ({ roomId, locale }: {
  roomId: number;
  locale: Locale;
}) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [room, setRoom] = useState<RoomAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const imageScrollRef = useRef<HTMLDivElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<RoomBookingInfo | null>(null);
  const won = getLocaleString({ locale, key: 'won' });

  // 날짜 변경 시 API 재호출
  const fetchRoom = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRoomAvailabilityAction(roomId, toDateStr(selectedDate));
      if ('studioRoomId' in res) {
        setRoom(res);
      }
    } finally {
      setLoading(false);
    }
  }, [roomId, selectedDate]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // 날짜 스트립 (오늘 ~ +13일)
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

  const images = room?.practiceImageUrls ?? room?.imageUrls ?? [];
  const hourlySlots = room?.slots.filter(s => s.time.endsWith(':00')) ?? [];
  const myBookings = room?.myBookings ?? [];

  const getMyBooking = (time: string) =>
    myBookings.find(b => {
      const bStart = b.startDate.split(' ')[1] ?? '';
      const bEnd = b.endDate.split(' ')[1] ?? '';
      return time >= bStart && time < bEnd;
    });

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      {/* 이미지 영역 (항상 고정) */}
      <div className="relative w-full aspect-[16/9] bg-[#F1F3F6]">
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
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                {images.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imageIndex ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="5" width="22" height="18" rx="3" stroke="#CDD1D5" strokeWidth="1.5"/>
              <path d="M3 17L9 12L14 16L19 11L25 17" stroke="#CDD1D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="10" r="2" stroke="#CDD1D5" strokeWidth="1.5"/>
            </svg>
          </div>
        )}
      </div>

      {/* 룸 정보 */}
      {room && (
        <div className="px-6 pt-5 pb-4">
          <h1 className="text-[22px] font-bold text-black">{room.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            {(room.maxCount) > 0 && (
              <span className="text-[13px] text-[#86898C]">
                {getLocaleString({ locale, key: 'max_capacity' })} {room.maxCount}{getLocaleString({ locale, key: 'people' })}
              </span>
            )}
            <span className="text-[13px] text-[#86898C]">
              {room.slotDurationMinutes}{getLocaleString({ locale, key: 'minutes' })}/{getLocaleString({ locale, key: 'slot' })}
            </span>
            {room.unitPrice != null && room.unitPrice > 0 && (
              <span className="text-[13px] text-[#86898C]">
                {formatPrice(room.unitPrice)}{won}/{getLocaleString({ locale, key: 'slot' })}
              </span>
            )}
          </div>
          {room.description && room.description !== '<p></p>' && room.description.trim() !== '' && (
            <p className="text-[13px] text-[#86898C] mt-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: room.description }}
            />
          )}
        </div>
      )}

      <div className="w-full h-2 bg-[#F7F8F9]" />

      {/* 날짜 선택 스트립 */}
      <div className="pt-4 pb-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide
          [&>*:first-child]:ml-4 [&>*:last-child]:mr-4">
          {dateStrip.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const dayLabel = DAY_LABELS[locale][date.getDay()];

            return (
              <button
                key={toDateStr(date)}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center gap-0.5 w-[46px] py-2 rounded-xl flex-shrink-0 transition-all
                  ${isSelected
                    ? 'bg-black'
                    : 'bg-[#F3F4F6] active:scale-[0.97]'
                  }`}
              >
                <span className={`text-[11px] font-medium ${isSelected ? 'text-white/60' : 'text-[#86898C]'}`}>
                  {dayLabel}
                </span>
                <span className={`text-[15px] font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
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

      {/* 히트맵 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-6 pt-2">
          <div className="flex items-center justify-end gap-1 mb-3 flex-wrap">
            {myBookings.length > 0 && (
              <>
                <span className="text-[9px] text-[#9CA3AF]">{getLocaleString({ locale, key: 'my_bookings' })}</span>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E2124]" />
              </>
            )}
            <span className="text-[9px] text-[#9CA3AF] ml-1">{getLocaleString({ locale, key: 'reservable' })}</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#C7D2FE]" />
            <span className="text-[9px] text-[#9CA3AF] ml-1">{getLocaleString({ locale, key: 'slot_full' })}</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" />
            <span className="text-[9px] text-[#9CA3AF] ml-1">{getLocaleString({ locale, key: 'slot_unavailable' })}</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#F3F4F6]" />
          </div>

          <div className="flex gap-1.5">
            <div className="flex flex-col gap-0.5">
              {hourlySlots.map((slot) => (
                <div key={slot.time} className="h-[32px] flex items-center justify-end pr-1">
                  <span className="text-[10px] text-[#9CA3AF] whitespace-nowrap">{slot.time}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              {hourlySlots.map((slot) => {
                const isClosed = slot.status === 'closed';
                const isFull = slot.status === 'full';
                const myBooking = getMyBooking(slot.time);
                const isMine = !!myBooking;

                return (
                  <div
                    key={slot.time}
                    onClick={() => {
                      if (isMine && myBooking && room) {
                        setSelectedBooking({
                          id: myBooking.id,
                          roomName: room.name,
                          roomImageUrl: images[0],
                          startDate: myBooking.startDate,
                          endDate: myBooking.endDate,
                        });
                      }
                    }}
                    className={`h-[32px] rounded-md flex items-center px-3 ${
                      isMine ? 'bg-[#1E2124] cursor-pointer active:opacity-80'
                        : isClosed ? 'bg-[#F3F4F6]'
                          : isFull ? 'bg-[#EF4444]'
                            : 'bg-[#C7D2FE]'
                    }`}
                  >
                    <span className={`text-[11px] font-medium ${
                      isMine ? 'text-white'
                        : isClosed ? 'text-[#BFBFBF]'
                          : isFull ? 'text-white'
                            : 'text-[#4338CA]'
                    }`}>
                      {isMine
                        ? getLocaleString({ locale, key: 'my_bookings' })
                        : isClosed
                          ? getLocaleString({ locale, key: 'slot_unavailable' })
                          : isFull
                            ? getLocaleString({ locale, key: 'slot_full' })
                            : getLocaleString({ locale, key: 'reservable' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* buttons */}
      {room?.buttons && room.buttons.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white">
          <div className="flex flex-col gap-2">
            {room.buttons.map((btn, i) => (
              <button
                key={i}
                disabled={!btn.route}
                onClick={() => btn.route && kloudNav.push(btn.route)}
                className={`w-full py-3.5 rounded-xl text-[15px] font-bold transition-transform ${
                  btn.route
                    ? 'bg-black text-white active:scale-[0.98]'
                    : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed'
                }`}
              >
                {btn.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 예약 상세 다이얼로그 */}
      {selectedBooking && (
        <RoomBookingDialog
          booking={selectedBooking}
          locale={locale}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};
