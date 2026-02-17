'use client';

import React, {useState, useEffect} from 'react';
import BackArrowIcon from '../../../../../public/assets/ic_back_arrow.svg';
import {GetLessonResponse} from "@/app/endpoint/lesson.endpoint";
import {Thumbnail} from '@/app/components/Thumbnail';

const toAmPm = (time: string): string => {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour12}:${String(m).padStart(2, '0')}`;
};

const formatLessonTime = (lesson: GetLessonResponse): string | null => {
  if (lesson.startDate) {
    const timePart = lesson.startDate.split(' ')[1];
    if (timePart) {
      const start = toAmPm(timePart);
      if (lesson.duration) {
        const [h, m] = timePart.split(':').map(Number);
        const endMinutes = h * 60 + m + lesson.duration;
        const endH = Math.floor(endMinutes / 60) % 24;
        const endM = endMinutes % 60;
        const end = toAmPm(`${endH}:${String(endM).padStart(2, '0')}`);
        return `${start} - ${end}`;
      }
      return start;
    }
  }
  if (lesson.formattedDate) {
    return `${toAmPm(lesson.formattedDate.startTime)} - ${toAmPm(lesson.formattedDate.endTime)}`;
  }
  return null;
};

type KioskPaymentFormProps = {
  studioName: string;
  lessons: GetLessonResponse[];
  onBack: () => void;
  onComplete: () => void;
};

export const KioskPaymentForm = ({studioName, lessons, onBack, onComplete}: KioskPaymentFormProps) => {
  const [countdown, setCountdown] = useState(180);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onBack]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${String(secs).padStart(2, '0')}초`;
  };

  const totalPrice = lessons.reduce((sum, l) => sum + (l.price ?? 0), 0);

  return (
      <div className="bg-white w-full h-screen overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="h-[70px] px-[48px] flex items-center justify-between shrink-0 border-b border-gray-100">
          <button onClick={onBack}
                  className="w-[40px] h-[40px] flex items-center justify-center active:opacity-70 transition-opacity">
            <BackArrowIcon className="w-full h-full"/>
          </button>
          <p className="text-black text-[20px] font-bold">결제 확인</p>
          <p className="text-gray-500 text-[16px] tracking-[-0.48px]">
            {studioName}
          </p>
        </div>

        {/* 메인 영역 */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-[48px] py-[40px]">
          {/* 제목 */}
          <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[40px]">
            총 {lessons.length}건, 이대로 신청할까요?
          </p>

          {/* 계산내역 카드 */}
          <div className="w-full max-w-[700px] bg-gray-50 rounded-[20px] p-[32px] flex flex-col gap-[16px]">
            {/* 수업 항목들 */}
            <div className="flex flex-col gap-[12px] max-h-[300px] overflow-y-auto scrollbar-hide">
              {lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-[16px]">
                    {/* 썸네일 */}
                    <div className="w-[52px] h-[68px] rounded-[10px] overflow-hidden shrink-0 bg-gray-200">
                      {lesson.thumbnailUrl ? (
                          <Thumbnail url={lesson.thumbnailUrl} className="w-full h-full" aspectRatio={52 / 68}/>
                      ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-lg">🕺</span>
                          </div>
                      )}
                    </div>
                    {/* 정보 */}
                    <div className="flex-1 flex flex-col gap-[2px] min-w-0">
                      <p className="text-black text-[17px] font-bold truncate">{lesson.title}</p>
                      <p className="text-gray-400 text-[14px]">
                        {[formatLessonTime(lesson), lesson.artists?.[0]?.nickName].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    {/* 가격 */}
                    <p className="text-black text-[17px] font-bold shrink-0">
                      {(lesson.price ?? 0).toLocaleString()}원
                    </p>
                  </div>
              ))}
            </div>

            {/* 구분선 + 합계 */}
            <div className="border-t border-gray-300 pt-[16px] flex items-center justify-between">
              <p className="text-black text-[20px] font-bold">합계</p>
              <p className="text-black text-[28px] font-bold tracking-[-0.84px]">
                {totalPrice.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div className="px-[48px] pb-[40px] flex flex-col items-center gap-[20px] shrink-0">
          {/* 카운트다운 */}
          <p className="text-[18px] tracking-[-0.54px]">
            <span className="font-semibold text-black">{formatTime(countdown)}</span>
            <span className="text-gray-300"> 뒤 첫 화면으로 돌아갑니다</span>
          </p>

          {/* 신청 버튼 */}
          <button
              onClick={onComplete}
              className="w-full max-w-[700px] h-[80px] rounded-[20px] bg-black text-white flex items-center justify-center gap-[10px] hover:bg-gray-900 transition-colors"
          >
            <p className="text-[24px] font-medium tracking-[-0.72px]">신청하기</p>
          </button>
        </div>
      </div>
  );
};
