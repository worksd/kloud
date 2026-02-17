'use client';

import React from 'react';
import Logo from '../../../../../public/assets/logo_black.svg';

type KioskHomeFormProps = {
  studioName: string;
  kioskImageUrl?: string;
  onSelectPayment: () => void;
  onSelectVisit: () => void;
};

export const KioskHomeForm = ({ studioName, kioskImageUrl, onSelectPayment, onSelectVisit }: KioskHomeFormProps) => {
  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden relative">
      {/* 로고 */}
      <div className="absolute top-[24px] right-[40px] z-10">
        <Logo />
      </div>

      {/* 키오스크 이미지 */}
      {kioskImageUrl && (
        <div className="flex-1 min-h-0">
          <img src={kioskImageUrl} alt="" className="w-full h-full object-cover"/>
        </div>
      )}

      {/* 하단 영역 */}
      <div className="shrink-0 px-[40px] pt-[24px] pb-[32px] flex flex-col gap-[16px]">
        {/* 인사말 */}
        <div className="px-[8px]">
          <p className="text-black text-[28px] font-bold leading-[1.4]">
            반가워요! {studioName}입니다.
          </p>
        </div>

        {/* 카드 2개 가로 배치 */}
        <div className="flex gap-[12px]">
          {/* 수업 결제하기 */}
          <div
            onClick={onSelectPayment}
            className="bg-white border-2 border-gray-100 rounded-[16px] p-[20px] flex-1 flex flex-col justify-between cursor-pointer hover:border-black transition-colors min-h-[120px]"
          >
            <div className="flex flex-col gap-[6px]">
              <p className="text-black text-[18px] font-bold">수업 결제하기</p>
              <p className="text-gray-400 text-[14px]">현장에서 수업을 결제할 수 있어요</p>
            </div>
            <div className="flex items-center justify-between mt-[12px]">
              <div className="bg-gray-100 rounded-[6px] px-[8px] py-[3px]">
                <p className="text-gray-500 text-[12px] font-medium">현장 결제</p>
              </div>
              <span className="text-[24px]">💳</span>
            </div>
          </div>

          {/* 방문 기록 남기기 */}
          <div
            onClick={onSelectVisit}
            className="bg-white border-2 border-gray-100 rounded-[16px] p-[20px] flex-1 flex flex-col justify-between cursor-pointer hover:border-black transition-colors min-h-[120px]"
          >
            <div className="flex flex-col gap-[6px]">
              <p className="text-black text-[18px] font-bold">방문 기록 남기기</p>
              <p className="text-gray-400 text-[14px]">회원은 방문 기록을 남길 수 있어요</p>
            </div>
            <div className="flex items-center justify-between mt-[12px]">
              <div className="bg-gray-100 rounded-[6px] px-[8px] py-[3px]">
                <p className="text-gray-500 text-[12px] font-medium">수강생</p>
              </div>
              <span className="text-[24px]">📝</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
