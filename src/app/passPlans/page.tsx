import { PurchasePassForm } from "@/app/passPlans/PurchasePassForm";
import { getStudioList } from "@/app/home/@popularStudios/get.studio.list.action";

export default async function PassPage() {
  const res = await getStudioList({hasPass: true})
  if ('studios' in res) {
    return (
      <PurchasePassForm studios={res.studios ?? []}/>
    )
  }
}