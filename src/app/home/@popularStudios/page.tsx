import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { StudioItems } from "@/app/search/StudioItems";
import { getStudioList } from "@/app/home/@popularStudios/get.studio.list.action";

export default async function PopularStudios() {
  const res = await getStudioList()
  return (
    <StudioItems studios={res.studios?.slice(0, 5) ?? []}/>
  )
}

export interface GetStudioResult {
  errorMessage?: string,
  studios?: GetStudioResponse[],
}