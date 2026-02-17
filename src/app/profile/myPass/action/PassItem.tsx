'use client'
import { CircleImage } from "@/app/components/CircleImage";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { DdayText } from "@/app/components/DdayText";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export const PassItem = ({pass, endDate, locale}: { pass: GetPassResponse, endDate?: string, locale: Locale }) => {
  const status = pass.status;

  return (
    <div className="flex flex-col gap-2.5">
      {/* 스튜디오 */}
      <div className="flex items-center gap-2">
        <CircleImage size={24} imageUrl={pass.passPlan?.studio?.profileImageUrl}/>
        <span className="text-[14px] text-[#86898C] font-medium">{pass.passPlan?.studio?.name}</span>
      </div>

      {/* 패스권 이름 */}
      <h2 className="text-[18px] font-bold text-black">{pass.passPlan?.name}</h2>

      {/* Active 상태 */}
      {status === 'Active' && pass.endDate && (
        <span className="text-[13px] text-[#AEAEAE] font-medium">
          {pass.endDate} {getLocaleString({locale, key: 'until'})}
        </span>
      )}

      {/* Pending 상태: 입금 대기 */}
      {status === 'Pending' && (
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#86898C] opacity-75"/>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#86898C]"/>
            </span>
            <span className="text-[14px] font-bold text-[#86898C]">
              {getLocaleString({locale, key: 'pending_account_transfer'})}
            </span>
          </div>
          {pass.passPlan?.price != null && (
            <div className="text-[13px] text-[#999] font-medium">
              {getLocaleString({locale, key: 'deposit_amount'})}: <span className="text-[#86898C] font-bold">{new Intl.NumberFormat("ko-KR").format(pass.passPlan.price)}원</span>
            </div>
          )}
        </div>
      )}

      {/* Waiting 상태: 시작 대기 */}
      {status === 'Waiting' && (
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"/>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F59E0B]"/>
            </span>
            <span className="text-[14px] font-bold text-[#F59E0B]">
              {getLocaleString({locale, key: 'waiting_pass_status'})}
            </span>
          </div>
          {pass.startDate && (
            <span className="text-[13px] text-[#999] font-medium">
              {pass.startDate} 시작 예정
            </span>
          )}
        </div>
      )}

      {/* Done 상태 */}
      {status === 'Done' && (
        <div className="flex items-center gap-2 text-[13px]">
          <span className="font-bold text-[#86898C]">{getLocaleString({locale, key: 'used_complete'})}</span>
          {(endDate || pass.endDate) && (
            <>
              <span className="text-[#D5D5D5]">|</span>
              <span className="text-[#AEAEAE] font-medium">
                {endDate || pass.endDate} {getLocaleString({locale, key: 'until'})}
              </span>
            </>
          )}
        </div>
      )}

      {/* Expired 상태 */}
      {status === 'Expired' && (
        <div className="flex items-center gap-2 text-[13px]">
          <span className="font-bold text-[#86898C]">{getLocaleString({locale, key: 'expired'})}</span>
          {(endDate || pass.endDate) && (
            <>
              <span className="text-[#D5D5D5]">|</span>
              <span className="text-[#AEAEAE] font-medium">
                {endDate || pass.endDate} {getLocaleString({locale, key: 'until'})}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
