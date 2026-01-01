'use client'

import { GetMembershipPlanResponse } from "@/app/endpoint/membership.endpoint";
import { getLocaleString } from "@/app/components/locale";
import { Locale } from "@/shared/StringResource";

export const MembershipPlanItem = ({item, isSelected, onClickAction, locale}: {
  item: GetMembershipPlanResponse,
  isSelected: boolean,
  locale: Locale,
  onClickAction: (item: GetMembershipPlanResponse) => void
}) => {
  return (
    <div
      className={`group flex flex-col w-full border rounded-[8px] font-bold space-x-2.5 text-[14px] select-none
      transition-all duration-150 ease-in-out transform active:scale-95
      ${isSelected ? 'border-black text-black bg-gray-100' : 'border-[#86898C] text-[#86898C] bg-white'}`}
      onClick={() => {
        onClickAction(item);
      }}>
      <div className="pt-4" />
      {/* Title & Price Container */}
      <div className="flex items-center justify-between w-full pl-2 pr-6 pb-4">
        <div className={'flex flex-col'}>
          <div
            className={`text-[16px] flex-1 transition-colors duration-300 ease-in-out ${isSelected ? 'font-bold' : 'font-medium'}`}>
            {item.name}
          </div>
          {item.description && (
            <div
              className={`${isSelected ? 'font-bold' : 'font-medium'} text-gray-400 text-[12px] mt-1`}>{item.description}</div>
          )}
        </div>

        <div className="text-right transition-colors duration-300 ease-in-out">
          {new Intl.NumberFormat("ko-KR").format(item.price ?? 0)} {getLocaleString({locale, key: 'won'})}
        </div>
      </div>
    </div>
  );
};

