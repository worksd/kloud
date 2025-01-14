import { StudioItem } from "@/app/search/StudioItem";
import { getStudioList } from "@/app/search/page";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";

export default async function StudioList() {
  const res = await getStudioList()
  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-8 scrollbar-hide">
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader title="스튜디오"/>
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