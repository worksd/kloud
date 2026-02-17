import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import { PassTicketUsageHistory } from "@/app/profile/myPass/[id]/PassTicketUsageHistory";
import { PassItem } from "@/app/profile/myPass/action/PassItem";
import { AccountTransferComponent } from "@/app/tickets/[id]/AccountTransferComponent";
import { getLocale, translate } from "@/utils/translate";
import { PassPlanTier } from "@/app/endpoint/pass.endpoint";
import PremiumTierIcon from "../../../../../public/assets/ic_premium_pass_plan.svg"
import { DdayText } from "@/app/components/DdayText";


export default async function MyPassDetailPage({params}: {
  params: Promise<{ id: number }>
}) {
  const pass = await getPassAction({id: (await params).id});
  const locale = await getLocale();

  if ('id' in pass) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        {/* 패스 정보 */}
        <div className="flex justify-between items-start px-6 pt-6">
          <PassItem pass={pass} endDate={pass.endDate} locale={locale}/>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
            {pass.passPlan?.tier === PassPlanTier.Premium && <PremiumTierIcon/>}
            {pass.status === 'Active' && (
              <>
                {pass.remainingCount != null && (
                  <span className="text-[11px] font-bold text-black bg-[#F1F3F6] px-2 py-0.5 rounded-full">
                    {pass.remainingCount}{locale === 'ko' ? '회 남음' : ''}
                  </span>
                )}
                <span className="text-[11px] font-bold text-black bg-[#F1F3F6] px-2 py-0.5 rounded-full">
                  <DdayText input={pass.endDate}/>
                </span>
              </>
            )}
          </div>
        </div>

        {/* 패스 혜택 */}
        <div className="px-6 mt-4 mb-4 text-[12px] text-[#AEAEAE] flex flex-col gap-1">
          {pass.passPlan?.type === 'Unlimited' && <div>· 클래스 무제한 수강(일부 클래스 제외)</div>}
          {pass.passPlan?.tier === PassPlanTier.Premium && <div>· 클래스 신청 우선배치</div>}
          {pass.passPlan?.canPreSale === true && <div>· 일반 학생들보다 우선 예약 가능</div>}
          {pass.passPlan?.tag && <div>· {pass.passPlan.tag} 전용 클래스 수강 가능</div>}
        </div>

        {/* Pending: 계좌이체 안내 */}
        {pass.status === 'Pending' && (
          <div className="px-4">
            <AccountTransferComponent
              depositor={pass.passPlan?.studio?.depositor}
              bank={pass.passPlan?.studio?.bank}
              accountNumber={pass.passPlan?.studio?.accountNumber}
              price={pass.passPlan?.price}
            />
          </div>
        )}

        {/* Waiting: 시작 대기 */}
        {pass.status === 'Waiting' && pass.startDate && (
          <div className="mx-6 p-4 bg-[#FFFDF5] rounded-xl border border-[#F59E0B]/20">
            <div className="text-[#F59E0B] font-semibold text-sm">
              {pass.startDate} {await translate('waiting_pass_start_date')}
            </div>
          </div>
        )}

        {/* 구분선 */}
        <div className="w-full h-3 bg-[#F7F8F9] mt-4"/>

        {/* 사용 내역 */}
        <div className="py-5">
          <PassTicketUsageHistory tickets={pass.tickets}/>
        </div>
      </div>
    )
  }
}
