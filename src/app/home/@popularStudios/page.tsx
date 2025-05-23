import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { StudioItems } from "@/app/search/StudioItems";
import { getStudioList } from "@/app/home/action/get.studio.list.action";

export default async function PopularStudios() {
  const res = await getStudioList({})
  if (!('studios' in res)) {
    return <div/>
  }
  return (
    <StudioItems studios={res.studios?.slice(0, 5) ?? []}/>
  )
}

export interface GetStudioResult {
  errorMessage?: string,
  studios?: GetStudioResponse[],
}