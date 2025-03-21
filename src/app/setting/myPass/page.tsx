import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { getMyPassListAction } from "@/app/setting/myPass/action/get.my.pass.list.action";
import { MyPassForm } from "@/app/setting/myPass/MyPassForm";

export default async function MyPassPage() {
  const res = await getMyPassListAction({order: 'newest'})

  return (
    <div className="flex flex-col h-screen">
      {/* Header Section - Fixed Height */}
      <div className="flex-none">
        <div className="px-6 mb-14">
          <SimpleHeader titleResource={'my_pass'}/>
        </div>
      </div>

      {/* Content Section - Remaining Height */}
      <div className="flex-1 overflow-hidden">
        <MyPassForm passes={[]}/>
      </div>
    </div>
  )
}