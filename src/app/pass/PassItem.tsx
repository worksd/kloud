'use client'

import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { useLocale } from "@/hooks/useLocale";

export const PassItem = ({ item, isSelected, onClickAction }: { item: GetPassResponse, isSelected: boolean, onClickAction: (item: GetPassResponse) => void }) => {
  const { t } = useLocale();
  return (
    <div
      className={`group flex flex-col w-full border rounded-[8px] font-bold space-x-2.5 text-[14px] select-none
      transition-all duration-150 ease-in-out transform active:scale-95
      ${isSelected ? 'border-black text-black bg-gray-100' : 'border-[#86898C] text-[#86898C] bg-white'}`}
      onClick={() => {
        onClickAction(item);
      }}>

      {item.isHot ?
        <div className={`text-sm font-bold px-3 py-1 rounded-tl-[7px] rounded-br-[8px] w-[84px] mb-3
          transition-colors duration-300 ease-in-out
          ${isSelected ? 'text-white bg-black' : 'text-[#86898C] bg-[#F2F4F6] group-hover:bg-gray-300'}`}>
          인기 패스
        </div> : <div className="pt-4"/>
      }

      {/* Title & Price Container */}
      <div className="flex items-center justify-between w-full pl-2 pr-6 pb-4">
        <div className={`text-[16px] flex-1 transition-colors duration-300 ease-in-out ${isSelected ? 'font-bold' : 'font-medium'}`}>
          {item.title}
        </div>
        <div className="text-right transition-colors duration-300 ease-in-out">
          {new Intl.NumberFormat("ko-KR").format(item.price ?? 0)} {t('won')}
        </div>
      </div>
    </div>
  );
};
