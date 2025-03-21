import { getMyPassAction } from "@/app/setting/myPass/action/get.my.pass.action";
import { DynamicHeader } from "@/app/components/headers/SimpleHeader";
import { PassTicketUsageHistory } from "@/app/setting/myPass/[id]/PassTicketUsageHistory";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";

export default async function MyPassDetailPage({params}: {
  params: Promise<{ id: number }>
}) {
  const res = await getMyPassAction()
  return (
    <div className={"flex flex-col min-h-screen px-6"}>
      <div className="flex justify-between items-center mb-14">
        <DynamicHeader title={res.title}/>
      </div>

      <PassTicketUsageHistory tickets={res.tickets}/>
      {res.plan.studio && <SellerInformation studio={res.plan.studio}/>}
      <RefundInformation/>
    </div>
  )
}