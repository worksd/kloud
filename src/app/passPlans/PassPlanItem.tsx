'use client'

import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { getLocaleString } from "@/app/components/locale";
import { Locale } from "@/shared/StringResource";

export const PassPlanItem = ({item, isSelected, onClickAction, locale}: {
  item: GetPassPlanResponse,
  isSelected: boolean,
  locale: Locale,
  onClickAction: (item: GetPassPlanResponse) => void
}) => {
  return (
    <div
      className={`relative flex flex-col w-full rounded-2xl select-none cursor-pointer overflow-hidden
        transition-all duration-200 active:scale-[0.98]
        ${isSelected
        ? 'border-[1.5px] border-black bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]'
        : 'border border-[#E8E8E8] bg-white'}`}
      onClick={() => onClickAction(item)}
    >
      {/* 인기 배지 */}
      {item.isPopular && (
        <div className={`self-start text-[12px] font-bold px-3 py-1.5 rounded-br-xl
          ${isSelected ? 'text-white bg-black' : 'text-[#999] bg-[#F2F4F6]'}`}>
          {getLocaleString({locale, key: 'popular_pass'})}
        </div>
      )}

      <div className={`flex items-center justify-between w-full px-5 ${item.isPopular ? 'pt-3 pb-5' : 'py-5'}`}>
        <div className="flex flex-col gap-1">
          <div className={`text-[16px] transition-colors duration-200
            ${isSelected ? 'font-bold text-black' : 'font-medium text-[#555]'}`}>
            {item.name}
          </div>
          {item.expireDateStamp && (
            <div className={`text-[12px] ${isSelected ? 'text-[#888]' : 'text-[#ACACAC]'}`}>
              {item.expireDateStamp}
            </div>
          )}
        </div>

        <div className={`text-[16px] font-bold transition-colors duration-200
          ${isSelected ? 'text-black' : 'text-[#999]'}`}>
          {new Intl.NumberFormat("ko-KR").format(item.price ?? 0)}{getLocaleString({locale, key: 'won'})}
        </div>
      </div>
    </div>
  );
};
