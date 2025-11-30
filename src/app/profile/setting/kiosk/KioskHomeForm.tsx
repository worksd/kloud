'use client';

import React, { useState, useEffect } from 'react';
import Logo from '../../../../../public/assets/logo_black.svg';

type KioskHomeFormProps = {
  onSelectPayment: () => void;
  onSelectVisit: () => void;
};

export const KioskHomeForm = ({ onSelectPayment, onSelectVisit }: KioskHomeFormProps) => {
  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      {/* 상단 인사말 */}
      <div className="pt-[100px] px-[64px] pb-[40px] flex items-center gap-[10px] shrink-0">
        <div className="flex-1 flex flex-col items-start justify-center">
          <div className="text-black text-[40px] font-bold leading-[1.5]">
            <p className="mb-0">반가워요!</p>
            <p>프로젝트리댄스학원입니다.</p>
          </div>
        </div>
      </div>

      {/* 메인 카드 영역 */}
      <div className="flex-1 min-h-0 px-[40px] pb-[10px] flex items-center justify-center gap-[20px] overflow-y-auto">
        {/* 수업 결제하기 카드 */}
        <div
          onClick={onSelectPayment}
          className="bg-white border-2 border-gray-100 rounded-[20px] p-[30px] flex-1 max-w-[500px] max-h-[420px] min-h-[380px] flex flex-col items-end justify-between cursor-pointer hover:border-black transition-colors shrink-0"
        >
          <div className="flex flex-col h-full items-start justify-between w-full">
            <div className="flex flex-col gap-[12px]">
              <p className="text-black text-[22px] font-medium leading-[1.5]">
                수업 결제하기
              </p>
              <p className="text-gray-500 text-[16px] font-medium leading-[1.5]">
                현장에서 수업을 결제할 수 있어요
              </p>
            </div>
            <div className="bg-gray-100 rounded-[8px] px-[8px] py-[4px] flex items-center justify-center gap-[10px]">
              <p className="text-gray-500 text-[14px] font-medium leading-[1.5]">
                현장 결제
              </p>
            </div>
          </div>
          <div className="w-[60px] h-[60px] shrink-0">
            {/* 아이콘 영역 - 필요시 아이콘 추가 */}
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-2xl">💳</span>
            </div>
          </div>
        </div>

        {/* 방문 기록 남기기 카드 */}
        <div
          onClick={onSelectVisit}
          className="bg-white border-2 border-gray-100 rounded-[20px] p-[30px] flex-1 max-w-[500px] max-h-[420px] min-h-[380px] flex flex-col items-end justify-between cursor-pointer hover:border-black transition-colors shrink-0"
        >
          <div className="flex flex-col h-full items-start justify-between w-full">
            <div className="flex flex-col gap-[12px]">
              <p className="text-black text-[22px] font-medium leading-[1.5]">
                방문 기록 남기기
              </p>
              <p className="text-gray-500 text-[16px] font-medium leading-[1.5] whitespace-pre-wrap">
                로우그래피 회원은 방문 기록을 남길 수 있어요.
              </p>
            </div>
            <div className="bg-gray-100 rounded-[8px] px-[8px] py-[4px] flex items-center justify-center gap-[10px]">
              <p className="text-gray-500 text-[14px] font-medium leading-[1.5]">
                수강생
              </p>
            </div>
          </div>
          <div className="w-[60px] h-[60px] shrink-0">
            {/* 아이콘 영역 - 필요시 아이콘 추가 */}
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-2xl">📝</span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 로고 */}
      <div className="pb-[40px] pt-[10px] px-0 flex items-center justify-center shrink-0">
        <div className="">
          <Logo className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

