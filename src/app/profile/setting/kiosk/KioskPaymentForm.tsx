'use client';

import React, { useState, useEffect } from 'react';
import Logo from '../../../../../public/assets/logo_black.svg';
import BackArrowIcon from '../../../../../public/assets/ic_back_arrow.svg';
import {GetLessonResponse} from "@/app/endpoint/lesson.endpoint";

type Lesson = {
  id: number;
  date: string;
  time: string;
  location: string;
  instructor: string;
  title: string;
  image?: string;
  isEnded?: boolean;
};

type KioskPaymentFormProps = {
  lessons: GetLessonResponse[];
  onBack: () => void;
  onComplete: () => void;
};

export const KioskPaymentForm = ({ lessons, onBack, onComplete }: KioskPaymentFormProps) => {
  const [countdown, setCountdown] = useState(180); // 180초 = 3분

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onBack(); // 첫 화면으로 돌아가기
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
    return `${mins}분 ${secs}초`;
  };

  const totalPrice = lessons.length * 130000; // Mock 가격
  const remainingPrice = 190000; // Mock 남은 결제 금액

  return (
    <div className="bg-white w-full h-screen overflow-hidden flex flex-col">
      {/* 헤더 */}
      <div className="h-[100px] px-[48px] flex items-center justify-between shrink-0">
        <div className="h-[27px] w-[200px]">
          <Logo className="w-full h-full" />
        </div>
        <div className="flex items-center justify-end gap-[10px] w-[600px]">
          <p className="text-gray-500 text-[20px] text-right tracking-[-0.6px]">
            프로젝트리 댄스학원
          </p>
        </div>
      </div>

      {/* 네비게이션 바 */}
      <div className="h-[120px] px-[48px] flex items-center justify-between shrink-0">
        <button onClick={onBack} className="w-[52px] h-[52px] flex items-center justify-center">
          <BackArrowIcon className="w-full h-full" />
        </button>
        <div className="w-[52px] h-[52px] flex items-center justify-center">
          {/* 설정 아이콘 */}
        </div>
      </div>

      {/* 제목 */}
      <div className="px-[64px] pt-[80px] pb-[60px] flex items-center gap-[10px] shrink-0">
        <div className="flex-1 flex flex-col items-start justify-center">
          <p className="text-black text-[48px] font-bold tracking-[-1.44px]">
            총 {lessons.length}건, 이대로 신청할까요?
          </p>
        </div>
      </div>

      {/* 수업 목록 - 스크롤 가능 영역 */}
      <div className="flex-1 overflow-y-auto px-[48px] py-0 min-h-0">
        <div className="flex flex-col gap-[40px] py-[20px]">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between w-full">
              <div className="flex-1 flex items-center gap-[20px]">
                {/* 수업 이미지 */}
                <div className="h-[165px] w-[125px] rounded-[20px] overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                  <span className="text-gray-400 text-4xl">🕺</span>
                </div>

                {/* 수업 정보 */}
                <div className="flex-1 flex flex-col gap-[10px] items-start">
                  <p className="text-gray-500 text-[20px] font-medium tracking-[-0.6px] w-full">
                    {lesson.date}
                  </p>
                  <p className="text-black text-[28px] font-bold w-full">{lesson.title}</p>
                  <p className="text-black text-[20px] font-medium tracking-[-0.6px] w-full">
                    {lesson.artists?.[0]?.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 결제 영역 */}
      <div className="p-[40px] flex flex-col gap-[20px] shrink-0 border-t border-gray-200">
        {/* 카운트다운 */}
        <div className="flex items-center justify-center pb-[20px]">
          <p className="text-[24px] text-center tracking-[-0.72px]">
            <span className="font-semibold text-black">{formatTime(countdown)} 뒤 </span>
            <span className="text-gray-300">첫 화면으로 돌아갑니다</span>
          </p>
        </div>

        {/* 남은 결제 금액 */}
        <div className="px-[10px] py-0 flex flex-col items-start w-[340px]">
          <p className="text-gray-500 text-[24px] font-medium tracking-[-0.72px] w-full">
            남은 결제 금액
          </p>
          <p className="text-black text-[40px] font-bold tracking-[-1.2px] w-full">
            {remainingPrice.toLocaleString()}원
          </p>
        </div>

        {/* 신청하기 버튼 */}
        <div className="flex flex-col gap-[20px] items-start shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)] w-full">
          <button
            onClick={onComplete}
            className="bg-white border-2 border-gray-100 rounded-[28px] h-[120px] w-full flex items-center justify-center gap-[10px] hover:border-black transition-colors"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center">
              {/* 결제 아이콘 */}
              <span className="text-2xl">💳</span>
            </div>
            <p className="text-black text-[32px] font-medium tracking-[-0.96px]">신청하기</p>
          </button>
        </div>
      </div>
    </div>
  );
};

