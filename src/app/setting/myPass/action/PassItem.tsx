'use client'
import { CircleImage } from "@/app/components/CircleImage";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { calculateDDays, calculateDdaysWithDay } from "@/utils";
import { TranslatableText } from "@/utils/TranslatableText";

export const PassItem = ({pass}: { pass: GetPassResponse }) => {
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
              {pass.passPlan?.usageLimit && pass.tickets &&
                <div className={'space-x-2'}>
                <span
                  className={'text-[#A4A4A4] font-medium'}>{(pass.passPlan?.usageLimit ?? 0) - (pass.tickets?.length ?? 0)}회 남음</span>
                  <span className={'text-[#A4A4A4] font-medium'}>|</span>
                </div>
              }

              <span className={'text-[#FF434F] font-bold'}>{calculateDdaysWithDay(pass.endDate)}</span>
              <span className={'text-[#A4A4A4] font-medium'}>|</span>
              <div className={'flex flex-row space-x-0.5'}>
                <span className={'text-[#A4A4A4] font-medium'}>{pass.endDate}</span>
                <TranslatableText className={'text-[#A4A4A4] font-medium'} titleResource={'until'}/>
              </div>

            </div>
          }
          {
            pass.status == 'Pending' &&
            <div className="flex items-center space-x-2 text-gray-500">
              <TranslatableText className={'text-[#FF434F] font-bold'} titleResource={'pending_account_transfer'}/>
            </div>
          }
          {
            pass.status == 'Done' &&
            <div className="text-[12px] flex items-center space-x-2 text-gray-500">
              <TranslatableText className={'font-bold'} titleResource={'used_complete'}/>
              <span className={'text-[#A4A4A4] font-medium'}>|</span>
              <div className={'flex flex-row space-x-0.5'}>
                <span className={'text-[#A4A4A4] font-medium'}>{pass.endDate}</span>
                <TranslatableText className={'text-[#A4A4A4] font-medium'} titleResource={'until'}/>
              </div>
            </div>
          }
          {
            pass.status == 'Expired' &&
            <div className="text-[12px] flex items-center space-x-2 text-gray-500">
              <TranslatableText className={'font-bold'} titleResource={'expired'}/>
              <span className={'text-[#A4A4A4] font-medium'}>|</span>
              <div className={'flex flex-row space-x-0.5'}>
                <span className={'text-[#A4A4A4] font-medium'}>{pass.endDate}</span>
                <TranslatableText className={'text-[#A4A4A4] font-medium'} titleResource={'until'}/>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}