import { PurchasePassForm } from "@/app/passPlans/PurchasePassForm";
import { getStudioList } from "@/app/home/@popularStudios/get.studio.list.action";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { PurchaseStudioPassForm } from "@/app/passPlans/PurchaseStudioPassForm";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { NO_DATA_ID } from "@/shared/kloud.screen";

export default async function PassPage({searchParams}: { searchParams: Promise<{ studioId: number }> }) {
  const {studioId} = await searchParams;
  const res = await getStudioList({hasPass: true})

  if (studioId != NO_DATA_ID) {
    const studio = await getStudioDetail(studioId);
    if ('id' in studio) {
      return <div className={'flex flex-col'}>
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader titleResource="purchase_pass"/>
        </div>
        <PurchaseStudioPassForm studio={studio}/>
      </div>

    }
  } else if ('studios' in res) {
    return (
      <PurchasePassForm studios={res.studios ?? []}/>
    )
  }
}