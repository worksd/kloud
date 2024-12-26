import Logo from "../../../public/assets/logo_black.svg";
import { SearchStudioItems } from "@/app/search/simple.studio.item";
import { api } from "@/app/api.client";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { UserStatus } from "@/entities/user/user.status";

export default async function Search() {

  const res = await getStudioList()

  return (
    <div className="bg-white w-screen min-h-screen">
      <div className="w-screen p-4 headline-200">
        검색
      </div>
      <SearchStudioItems studios={res.studios ?? []}/>
    </div>
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