'use client'

import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { getLocaleString } from "@/app/components/locale";
import { Locale } from "@/shared/StringResource";
export const RecommendedPassPlanItem = ({item, isSelected, onClickAction, locale}: {
  item: GetPassPlanResponse,
  isSelected: boolean,
  locale: Locale,
  onClickAction: (item: GetPassPlanResponse) => void
}) => {
  return (
    <div
      className={`relative flex flex-col w-full select-none cursor-pointer overflow-hidden
        transition-all duration-200 active:scale-[0.98] rounded-2xl
        ${isSelected
        ? 'bg-gradient-to-br from-[#1E2124] to-[#3A3D42] shadow-[0_6px_24px_rgba(0,0,0,0.25)]'
        : 'bg-gradient-to-br from-[#F0EDFF] to-[#E8E4FF] shadow-[0_2px_12px_rgba(91,95,246,0.12)]'}`}
      onClick={() => onClickAction(item)}
    >
      {/* 추천 배지 */}
      <div className="px-5 pt-4 pb-1">
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full
          ${isSelected ? 'bg-[#5B5FF6] text-white' : 'bg-[#5B5FF6] text-white'}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 0.5L7.76 4.06L11.5 4.61L8.75 7.44L9.52 11.5L6 9.56L2.48 11.5L3.25 7.44L0.5 4.61L4.24 4.06L6 0.5Z"/>
          </svg>
          추천
        </span>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex items-center justify-between px-5 pb-4 pt-1">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className={`text-[18px] font-bold transition-colors duration-200
            ${isSelected ? 'text-white' : 'text-[#1E2124]'}`}>
            {item.name}
          </div>
          {item.expireDateStamp && (
            <div className={`text-[12px]
              ${isSelected ? 'text-white/50' : 'text-[#8B85B1]'}`}>
              {item.expireDateStamp}
            </div>
          )}
          {item.type === 'Unlimited' && (
            <div className={`text-[13px] font-medium mt-0.5
              ${isSelected ? 'text-white/70' : 'text-[#6B66A0]'}`}>
              모든 클래스 무제한 이용
            </div>
          )}
          {item.type === 'Count' && item.usageLimit && (
            <div className={`text-[13px] font-medium mt-0.5
              ${isSelected ? 'text-white/70' : 'text-[#6B66A0]'}`}>
              클래스 {item.usageLimit}회 이용 가능
            </div>
          )}
        </div>

        <div className={`text-[20px] font-extrabold tracking-tight whitespace-nowrap ml-4
          ${isSelected ? 'text-white' : 'text-[#1E2124]'}`}>
          {new Intl.NumberFormat("ko-KR").format(item.price ?? 0)}{getLocaleString({locale, key: 'won'})}
        </div>
      </div>
    </div>
  );
};
