import { api } from "@/app/api.client";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { StudioItems } from "@/app/search/StudioItems";

export default async function PopularStudios() {
  const res = await getStudioList()
  return (
    <StudioItems studios={res.studios?.slice(0,5) ?? []}/>
  )
}


async function getStudioList(): Promise<GetStudioResult> {
  const res = await api.studio.list({});

  if ('studios' in res) {
    return {
      studios: res.studios
    }
  } else {
    return {
      errorMessage: res.message,
    }
  }
}

export interface GetStudioResult {
  errorMessage?: string,
  studios?: GetStudioResponse[],
}