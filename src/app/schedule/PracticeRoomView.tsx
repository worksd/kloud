'use client'

import React, { useState, useMemo, useEffect, useRef } from "react";
import { kloudNav } from "@/app/lib/kloudNav";

type TimeSlot = {
  hour: number;
  currentUsers: number;
  maxUsers: number;
  available: boolean;
}

const ROOMS = ['A홀', 'B홀', 'C홀', 'D홀', 'E홀', 'F홀', 'G홀'];
const HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

const generateMockData = (): Record<string, TimeSlot[]> => {
  const data: Record<string, TimeSlot[]> = {};
  for (const room of ROOMS) {
    data[room] = HOURS.map(hour => {
      const currentUsers = Math.floor(Math.random() * 5);
      return { hour, currentUsers, maxUsers: 5, available: currentUsers < 5 };
    });
  }
  return data;
};

const getHeatColor = (current: number, max: number) => {
  if (current === 0) return '#F3F4F6';
  const ratio = current / max;
  if (ratio >= 0.8) return '#EF4444';
  if (ratio >= 0.6) return '#F59E0B';
  if (ratio >= 0.4) return '#818CF8';
  if (ratio >= 0.2) return '#A5B4FC';
  return '#C7D2FE';
};

const formatDate = (d: Date) => {
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday})`;
};

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const PracticeRoomView = ({ selectedDate, onChangeDate }: {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
}) => {
  const [selectedSlot, setSelectedSlot] = useState<{ room: string; hour: number } | null>(null);
  const [closingSlot, setClosingSlot] = useState(false);
  const roomData = useMemo(() => generateMockData(), [selectedDate]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragCurrentY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    if (sheetRef.current) sheetRef.current.style.transition = 'none';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    dragCurrentY.current = e.touches[0].clientY;
    const dy = Math.max(0, dragCurrentY.current - dragStartY.current);
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${dy}px)`;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dy = dragCurrentY.current - dragStartY.current;
    if (dy > 80) {
      // 닫기: 현재 위치에서 아래로 슬라이드
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'transform 150ms ease-in';
        sheetRef.current.style.transform = 'translateY(100%)';
      }
      setTimeout(() => {
        setSelectedSlot(null);
        setClosingSlot(false);
      }, 150);
    } else {
      // 원위치
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'transform 150ms ease-out';
        sheetRef.current.style.transform = 'translateY(0)';
      }
    }
  };

  useEffect(() => {
    if (closingSlot) {
      const timer = setTimeout(() => {
        setSelectedSlot(null);
        setClosingSlot(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [closingSlot]);

  // 바텀시트 열렸을 때 배경 스크롤 방지
  useEffect(() => {
    if (selectedSlot) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [selectedSlot]);

  const handleSlotClick = (room: string, slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlot({ room, hour: slot.hour });
  };

  const handleReserve = () => {
    if (!selectedSlot) return;
    setClosingSlot(true);
    const roomId = ROOMS.indexOf(selectedSlot.room) + 1;
    setTimeout(() => {
      kloudNav.push(`/payment?type=practice&id=${roomId}&date=${toDateStr(selectedDate)}&hour=${selectedSlot.hour}`);
    }, 150);
  };

  return (
    <div className="flex flex-col bg-white pb-10">
      {/* 히트맵 */}
      <div className="px-4 pt-3">
        <div className="border border-[#E6E8EA] rounded-2xl p-4">
          <span className="text-sm font-bold text-[#191F28]">{formatDate(selectedDate)} 이용 현황</span>
          <div className="mt-3 flex gap-0.5">
            {/* 시간 라벨 */}
            <div className="flex flex-col gap-0.5 pr-1 pt-[18px]">
              {HOURS.map((h) => (
                <div key={h} className="h-[22px] flex items-center justify-end">
                  <span className="text-[9px] text-[#9CA3AF] leading-none">{h}시</span>
                </div>
              ))}
            </div>
            {/* 연습실별 격자 */}
            {ROOMS.map((room) => (
              <div key={room} className="flex-1 flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-[#6D7882] font-bold h-[14px]">{room}</span>
                {(roomData[room] ?? []).map((slot) => {
                  const isSelected = selectedSlot?.room === room && selectedSlot?.hour === slot.hour;
                  return (
                    <div
                      key={slot.hour}
                      onClick={() => handleSlotClick(room, slot)}
                      className={`w-full h-[22px] rounded-sm transition-all cursor-pointer relative ${
                        isSelected ? 'scale-125 z-10 shadow-lg rounded-md' : ''
                      } ${!slot.available ? 'opacity-30 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: getHeatColor(slot.currentUsers, slot.maxUsers) }}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 rounded-md border-2 border-white shadow-[0_0_0_2px_#1E2124] pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {/* 범례 */}
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[9px] text-[#9CA3AF]">여유</span>
            {[0, 1, 2, 3, 4].map((v) => (
              <div key={v} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatColor(v, 5) }} />
            ))}
            <span className="text-[9px] text-[#9CA3AF]">혼잡</span>
          </div>
        </div>
      </div>

      {/* 선택된 슬롯 바텀시트 */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50" onClick={() => setClosingSlot(true)}>
          <div className={`absolute inset-0 bg-black/40 ${closingSlot ? 'animate-[fadeOut_150ms_ease-in_forwards]' : 'animate-[fadeIn_150ms_ease-out]'}`} />
          <div
            ref={sheetRef}
            className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl pb-8 touch-none ${closingSlot ? 'animate-[slideDown_150ms_ease-in_forwards]' : 'animate-[slideUp_150ms_ease-out]'}`}
            onClick={e => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-[#DDD]" />
            </div>

            <div className="px-6">
              <span className="text-[17px] font-bold text-black">예약 정보</span>

              <div className="flex flex-col gap-2.5 text-[14px] mt-4">
                <div className="flex justify-between">
                  <span className="text-[#888]">연습실</span>
                  <span className="font-semibold text-black">{selectedSlot.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">날짜</span>
                  <span className="font-semibold text-black">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">시간</span>
                  <span className="font-semibold text-black">{selectedSlot.hour}:00 - {selectedSlot.hour + 1}:00 (1시간)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">현재 이용</span>
                  <span className="font-semibold text-black">
                    {roomData[selectedSlot.room]?.find(s => s.hour === selectedSlot.hour)?.currentUsers ?? 0}명 / 5명
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/20">
                <p className="text-[12px] text-[#92400E] font-medium leading-relaxed">
                  • 예약 시간 10분 전까지 취소 가능합니다{'\n'}
                  • 다른 이용자와 함께 사용할 수 있습니다{'\n'}
                  • 연습실 내 음식물 반입은 금지됩니다
                </p>
              </div>

              <button
                onClick={handleReserve}
                className="w-full mt-4 py-3.5 rounded-xl bg-black text-white text-[15px] font-bold active:scale-[0.98] transition-transform"
              >
                예약하기
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
      `}</style>
    </div>
  );
};
