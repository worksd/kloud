import { getPassAction } from "@/app/setting/myPass/action/getPassAction";
import { DynamicHeader } from "@/app/components/headers/SimpleHeader";
import { PassTicketUsageHistory } from "@/app/setting/myPass/[id]/PassTicketUsageHistory";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { PassItem } from "@/app/setting/myPass/action/PassItem";
import Divider from "@/app/studios/[id]/studio.divider";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";

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

        <div className={'pl-4 py-5'}>
          <PassItem pass={pass}/>
        </div>

        <Divider/>
        {pass.tickets && pass.tickets.length > 0 && (
          <div className={'py-5'}>
            <PassTicketUsageHistory tickets={pass.tickets}/>
          </div>
        )}
        <Divider/>
        <div className={'py-5'}>
          <PurchaseInformation price={pass.passPlan?.price ?? 0} titleResource={'pass_price_amount'}/>
        </div>
        <Divider/>
        <div className={'py-5 px-6 space-y-6'}>
          {pass.passPlan?.studio && <SellerInformation studio={pass.passPlan.studio}/>}
          <RefundInformation/>
        </div>

      </div>
    )
  }
}