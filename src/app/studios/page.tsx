import { StudioItem } from "@/app/search/StudioItem";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { api } from "@/app/api.client";
import { GetStudioResult } from "@/app/home/@popularStudios/page";

export default async function StudioList() {
  const res = await getStudioList()
  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-8 scrollbar-hide">
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader titleResource="studio"/>
        </div>
        <ul className="flex flex-col space-y-4">
          {(res.studios ?? []).map((item) => (
            <StudioItem key={item.id} item={item}/>
          ))}
        </ul>
      </div>
    </div>
  )
}

//TODO: 하나로 합치기
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