import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import { DynamicHeader } from "@/app/components/headers/SimpleHeader";
import { PassTicketUsageHistory } from "@/app/profile/myPass/[id]/PassTicketUsageHistory";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { PassItem } from "@/app/profile/myPass/action/PassItem";
import Divider from "@/app/studios/[id]/studio.divider";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";
import { AccountTransferComponent } from "@/app/tickets/[id]/AccountTransferComponent";
import { CommonSubmitButton } from "@/app/components/buttons";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { PassPlanTier } from "@/app/endpoint/pass.endpoint";
import PremiumTierIcon from "../../../../../public/assets/ic_premium_pass_plan.svg"


export default async function MyPassDetailPage({params}: {
  params: Promise<{ id: number }>
}) {
  const pass = await getPassAction({id: (await params).id});
  if ('id' in pass) {
    return (
      <div className={"flex flex-col min-h-screen"}>
        <div className="flex justify-between items-center mb-14">
          <DynamicHeader title={pass.passPlan?.name}/>
        </div>

        <div className={'flex flex-row justify-between items-center px-4'}>
          <div className={'flex flex-col'}>
            <div className={'mt-5'}>
              <div className={'flex flex-row'}>
                <PassItem pass={pass} endDate={pass.endDate}/>
              </div>

              {pass.status == 'Pending' &&
                <AccountTransferComponent
                  depositor={pass.passPlan?.studio?.depositor}
                  bank={pass.passPlan?.studio?.bank}
                  accountNumber={pass.passPlan?.studio?.accountNumber}
                  price={pass.passPlan?.price}
                />
              }
            </div>
            {/*<div className={"text-[12px] text-[#A4A4A4] font-paperlogy ml-4 mb-4"}>*/}
            {/*  {pass.paymentId}*/}
            {/*</div>*/}
          </div>
          {pass.passPlan?.tier == PassPlanTier.Premium && <PremiumTierIcon/>}
        </div>

        <div className={'ml-4 mt-4 mb-4 text-[12px] text-[#A4A4A4] font-paperlogy'}>
          {/*//TODO: 문구 수정*/}
          {pass.passPlan?.type == 'Unlimited' && <div> · 클래스 무제한 수강(일부 클래스 제외)</div>}
          {pass.passPlan?.tier == PassPlanTier.Premium && <div> · 클래스 신청 우선배치 </div>}
          {pass.passPlan?.canPreSale == true && <div> · 일반 학생들보다 우선 예약 가능</div>}
          {pass.passPlan?.tag && <div> · {pass.passPlan?.tag} 전용 클래스 수강 가능</div>}

        </div>

        <Divider/>
        <div className={'py-5'}>
          <PassTicketUsageHistory tickets={pass.tickets}/>
        </div>

        <Divider/>
        <div className={'py-5'}>
          <PurchaseInformation price={pass.passPlan?.price ?? 0} titleResource={'pass_price_amount'}/>
        </div>
        <Divider/>
        <div className={'py-5 px-6 space-y-6'}>
          {pass.passPlan?.studio && <SellerInformation studio={pass.passPlan.studio}/>}
          <RefundInformation/>
        </div>

        {pass.status == 'Active' &&
          <div className={"sticky bottom-0 px-6"}>
            <NavigateClickWrapper method={'push'} route={KloudScreen.StudioDetail(pass.passPlan?.studio?.id ?? 0)}>
              <CommonSubmitButton
                disabled={false}
              >
                {await translate('use_pass_go_studio')}
              </CommonSubmitButton>
            </NavigateClickWrapper>
          </div>
        }
      </div>
    )
  }
}