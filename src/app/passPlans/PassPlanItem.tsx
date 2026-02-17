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
      className={`relative flex w-full select-none cursor-pointer overflow-hidden
        transition-all duration-200 active:scale-[0.98] rounded-2xl
        ${isSelected
        ? 'bg-black shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
        : 'bg-[#F2F4F6]'}`}
      onClick={() => onClickAction(item)}
    >
      {/* 왼쪽: 티켓 메인 영역 */}
      <div className="flex-1 flex flex-col justify-center px-5 py-4">
        {/* 인기 배지 */}
        {item.isPopular && (
          <span className={`self-start text-[11px] font-bold px-2 py-0.5 rounded-full mb-2
            ${isSelected ? 'bg-white text-black' : 'bg-black text-white'}`}>
            {getLocaleString({locale, key: 'popular_pass'})}
          </span>
        )}

        <div className={`text-[16px] font-bold transition-colors duration-200
          ${isSelected ? 'text-white' : 'text-black'}`}>
          {item.name}
        </div>

        {item.expireDateStamp && (
          <div className={`text-[12px] mt-1
            ${isSelected ? 'text-white/60' : 'text-[#999]'}`}>
            {item.expireDateStamp}
          </div>
        )}
      </div>

      {/* 점선 구분 + 반원 노치 */}
      <div className="relative flex items-center w-0">
        <div className={`absolute -top-3 -translate-x-1/2 w-6 h-6 rounded-full
          ${isSelected ? 'bg-white' : 'bg-white'}`}/>
        <div className={`absolute -bottom-3 -translate-x-1/2 w-6 h-6 rounded-full
          ${isSelected ? 'bg-white' : 'bg-white'}`}/>
        <div className={`h-[60%] border-l border-dashed
          ${isSelected ? 'border-white/30' : 'border-[#D5D5D5]'}`}/>
      </div>

      {/* 오른쪽: 가격 영역 */}
      <div className="flex items-center justify-center px-5 py-4 min-w-[130px]">
        <span className={`text-[18px] font-extrabold tracking-tight transition-colors duration-200 whitespace-nowrap
          ${isSelected ? 'text-white' : 'text-black'}`}>
          {new Intl.NumberFormat("ko-KR").format(item.price ?? 0)}{getLocaleString({locale, key: 'won'})}
        </span>
      </div>
    </div>
  );
};
