'use client'

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { PracticeRoomView } from "@/app/schedule/PracticeRoomView";

type ScheduleTab = 'lesson' | 'practice';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const formatShortDate = (d: Date) => {
  return `${d.getMonth() + 1}/${d.getDate()}(${DAY_LABELS[d.getDay()]})`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const SchedulePageClient = ({
  studioImageUrl,
  children,
}: {
  studioImageUrl?: string;
  children: React.ReactNode;
}) => {
  const [activeTab, setActiveTab] = useState<ScheduleTab>('lesson');
  const today = useMemo(() => new Date(), []);
  const [practiceDate, setPracticeDate] = useState(today);
  const [showDateSheet, setShowDateSheet] = useState(false);
  const [closingSheet, setClosingSheet] = useState(false);

  const closeSheet = () => {
    setClosingSheet(true);
    setTimeout(() => {
      setShowDateSheet(false);
      setClosingSheet(false);
    }, 150);
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* 헤더 (sticky) */}
      <div className="sticky top-0 z-20 bg-white flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex items-center gap-4">
          {studioImageUrl && (
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
              <Image src={studioImageUrl} alt="" width={28} height={28} className="object-cover w-full h-full" />
            </div>
          )}
          <button
            onClick={() => setActiveTab('lesson')}
            className={`transition-all duration-200 ${
              activeTab === 'lesson'
                ? 'text-[20px] text-black font-bold'
                : 'text-[16px] text-gray-400 font-medium'
            }`}
          >
            수업
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`transition-all duration-200 ${
              activeTab === 'practice'
                ? 'text-[20px] text-black font-bold'
                : 'text-[16px] text-gray-400 font-medium'
            }`}
          >
            연습실
          </button>
        </div>

        {/* 날짜 선택 (연습실 탭일 때만) */}
        {activeTab === 'practice' && (
          <button
            onClick={() => setShowDateSheet(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E6E8EA] active:bg-[#F9FAFB] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1.5" y="2.5" width="11" height="9.5" rx="1.5" stroke="#333" strokeWidth="1.1"/>
              <path d="M1.5 5.5H12.5" stroke="#333" strokeWidth="1.1"/>
              <path d="M4.5 1V3" stroke="#333" strokeWidth="1.1" strokeLinecap="round"/>
              <path d="M9.5 1V3" stroke="#333" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            <span className="text-[13px] font-medium text-black">{formatShortDate(practiceDate)}</span>
          </button>
        )}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'lesson' ? children : (
        <PracticeRoomView selectedDate={practiceDate} onChangeDate={setPracticeDate} />
      )}

      {/* 날짜 선택 달력 바텀시트 */}
      {showDateSheet && (
        <CalendarSheet
          selectedDate={practiceDate}
          today={today}
          closing={closingSheet}
          onSelect={(date) => { setPracticeDate(date); closeSheet(); }}
          onClose={closeSheet}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

// 달력 바텀시트
const WEEKDAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토'];

const CalendarSheet = ({
  selectedDate,
  today,
  closing,
  onSelect,
  onClose,
}: {
  selectedDate: Date;
  today: Date;
  closing: boolean;
  onSelect: (date: Date) => void;
  onClose: () => void;
}) => {
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className={`absolute inset-0 bg-black/40 ${closing ? 'animate-[fadeOut_150ms_ease-in_forwards]' : 'animate-[fadeIn_150ms_ease-out]'}`} />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl pb-8 ${closing ? 'animate-[slideDown_150ms_ease-in_forwards]' : 'animate-[slideUp_150ms_ease-out]'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[#DDD]" />
        </div>

        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between px-6 py-2">
          <button onClick={goPrev} className="p-1 active:opacity-50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#464C53" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-[16px] font-bold text-[#1E2124]">{viewYear}년 {viewMonth + 1}월</span>
          <button onClick={goNext} className="p-1 active:opacity-50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="#464C53" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 px-6">
          {WEEKDAY_HEADERS.map(d => (
            <div key={d} className="flex items-center justify-center py-2">
              <span className="text-[12px] text-[#9CA3AF] font-medium">{d}</span>
            </div>
          ))}
        </div>

        {/* 날짜 격자 */}
        <div className="grid grid-cols-7 px-6 pb-4">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const date = new Date(viewYear, viewMonth, day);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            return (
              <button
                key={i}
                onClick={() => !isPast && onSelect(date)}
                disabled={isPast}
                className="flex items-center justify-center py-1.5"
              >
                <div className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                  isSelected ? 'bg-[#1E2124]'
                    : isToday ? 'border border-[#E6E8EA]'
                      : ''
                }`}>
                  <span className={`text-[14px] ${
                    isPast ? 'text-[#D1D5DB]'
                      : isSelected ? 'font-semibold text-white'
                        : 'text-[#33363D]'
                  }`}>
                    {day}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
