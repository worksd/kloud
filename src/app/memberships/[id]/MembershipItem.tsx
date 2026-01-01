'use client'
import { CircleImage } from "@/app/components/CircleImage";
import { GetMembershipResponse } from "@/app/endpoint/membership.endpoint";
import { DdayText } from "@/app/components/DdayText";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export const MembershipItem = ({membership, locale, isOnBackground = false}: { membership: GetMembershipResponse, locale: Locale, isOnBackground?: boolean }) => {
  const textColor = isOnBackground ? 'text-white' : 'text-black';
  const subTextColor = isOnBackground ? 'text-white/80' : 'text-gray-500';
  const dateTextColor = isOnBackground ? 'text-white/70' : 'text-[#A4A4A4]';
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className={"flex flex-row items-center space-x-2"}>
            <CircleImage size={24} imageUrl={membership.plan.studio?.profileImageUrl}/>
            <div className={`text-[16px] ${textColor} font-medium`}>{membership.plan.studio?.name}</div>
          </div>

          <h2 className={`text-xl font-semibold ${textColor}`}>{membership.plan.name}</h2>
          {
            membership.status == 'Active' &&
            <div className={`flex items-center space-x-2 ${subTextColor}`}>

              <div className={'flex flex-row space-x-0.5 text-[12px]'}>
                <span className={`${dateTextColor} font-medium`}>{membership.endDate}</span>
                <div className={`${dateTextColor} font-medium`}>{getLocaleString({locale, key: 'until'})}</div>
              </div>
            </div>
          }
          {
            membership.status == 'Expired' &&
            <div className={`text-[12px] flex items-center space-x-2 ${subTextColor}`}>
              <div className={'font-bold'}>{getLocaleString({locale, key: 'expired'})}</div>
              <span className={`${dateTextColor} font-medium`}>|</span>
              <div className={'flex flex-row space-x-0.5'}>
                <span className={`${dateTextColor} font-medium`}>{membership.endDate}</span>
                <div className={`${dateTextColor} font-medium`}>{getLocaleString({locale, key: 'until'})}</div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

