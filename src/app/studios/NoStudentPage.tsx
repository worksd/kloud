'use server'
import { StudioItem } from "@/app/search/StudioItem";
import { getStudioList } from "@/app/home/action/get.studio.list.action";
import { translate } from "@/utils/translate";

export default async function NoStudentPage() {
  const res = await getStudioList({})
  if (res.studios) {
    return (
      <div className={'flex flex-col'}>
        <div
          className={'px-4 text-[20px] font-medium text-black'}
          dangerouslySetInnerHTML={{__html: (await translate('no_student_message')).replace(/\n/g, '<br />')}}
        />
        <ul className="flex flex-col space-y-4">
          {(res.studios ?? []).map((item) => (
            <StudioItem key={item.id} item={item}/>
          ))}
        </ul>
      </div>
    )
  }
}