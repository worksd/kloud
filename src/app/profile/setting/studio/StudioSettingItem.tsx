'use client'

import { CircleImage } from "@/app/components/CircleImage";
import React from "react";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";

export const StudioSettingItem = ({ item, isSelected, onSelect }: {
  item: GetStudioResponse,
  isSelected: boolean,
  onSelect: () => void,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`mx-4 mb-3 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all duration-150 select-none border-2 ${
        isSelected
          ? 'bg-[#1E2124] border-[#1E2124] shadow-lg shadow-black/10'
          : 'bg-[#F5F6F8] border-transparent active:bg-[#ECEDF0]'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div className="relative flex-shrink-0">
          <CircleImage imageUrl={item.profileImageUrl} size={52} />
          {isSelected && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#4ADE80] border-2 border-[#1E2124] flex items-center justify-center">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className={`text-[16px] font-bold truncate ${isSelected ? 'text-white' : 'text-[#1E2124]'}`}>
            {item.name}
          </span>
          {item.address && (
            <span className={`text-[12px] truncate ${isSelected ? 'text-white/50' : 'text-[#999]'}`}>
              {item.address}
            </span>
          )}
          {isSelected && (
            <span className="text-[11px] font-semibold text-[#4ADE80] mt-0.5">현재 선택됨</span>
          )}
        </div>
      </div>
    </div>
  );
};
