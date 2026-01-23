'use client'
import { CircleImage } from "@/app/components/CircleImage";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { DdayText } from "@/app/components/DdayText";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export const PassItem = ({pass, endDate, locale}: { pass: GetPassResponse, endDate?: string, locale: Locale }) => {
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className={"flex flex-row items-center space-x-2"}>
            <CircleImage size={24} imageUrl={pass.passPlan?.studio?.profileImageUrl}/>
            <div className={"text-[16px] text-black font-medium"}>{pass.passPlan?.studio?.name}</div>
          </div>

          <h2 className="text-xl font-semibold text-black">{pass.passPlan?.name}</h2>
          {
            pass.status == 'Active' &&
            <div className="flex items-center space-x-2 text-gray-500">
              {pass.remainingCount &&
                <div className="flex items-center space-x-2 text-[#A4A4A4] font-medium">
                  <div className="flex flex-row items-center">
                    <div>{pass.remainingCount}</div>
                    <div>{getLocaleString({locale, key: 'remaining_count'})}</div>
                  </div>
                  <span>|</span>
                </div>
              }

              <DdayText input={pass.endDate}/>

              {endDate &&
                <div className={'flex flex-row space-x-0.5'}>
                  <span className={'text-[#A4A4A4] font-medium'}>|</span>
                  <span className={'text-[#A4A4A4] font-medium'}>{endDate}</span>
                  <div className={'text-[#A4A4A4] font-medium'}>{getLocaleString({locale, key: 'until'})}</div>
                </div>
              }

            </div>
          }
          {
            pass.status == 'Pending' &&
            <div className="flex items-center space-x-2 text-gray-500">
              <div className={'text-[#FF434F] font-bold'}>{getLocaleString({locale, key: 'pending_account_transfer'})}</div>
            </div>
          }
          {
            pass.status == 'Waiting' &&
            <div className="flex items-center space-x-2 text-gray-500">
              <div className={'text-[#F59E0B] font-bold'}>{getLocaleString({locale, key: 'waiting_pass_status'})}</div>
            </div>
          }
          {
            pass.status == 'Done' &&
            <div className="text-[12px] flex items-center space-x-2 text-gray-500">
              <div className={'font-bold'}>{getLocaleString({locale, key: 'used_complete'})}</div>
              <span className={'text-[#A4A4A4] font-medium'}>|</span>
              <div className={'flex flex-row space-x-0.5'}>
                <span className={'text-[#A4A4A4] font-medium'}>{pass.endDate}</span>
                <div className={'text-[#A4A4A4] font-medium'}>{getLocaleString({locale, key: 'until'})}</div>
              </div>
            </div>
          }
          {
            pass.status == 'Expired' &&
            <div className="text-[12px] flex items-center space-x-2 text-gray-500">
              <div className={'font-bold'}>{getLocaleString({locale, key: 'expired'})}</div>
              <span className={'text-[#A4A4A4] font-medium'}>|</span>
              <div className={'flex flex-row space-x-0.5'}>
                <span className={'text-[#A4A4A4] font-medium'}>{pass.endDate}</span>
                <div className={'text-[#A4A4A4] font-medium'}>{getLocaleString({locale, key: 'until'})}</div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}