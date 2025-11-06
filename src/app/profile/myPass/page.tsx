import { getMyPassListAction } from "@/app/profile/myPass/action/get.my.pass.list.action";
import { MyPassForm } from "@/app/profile/myPass/MyPassForm";
import { getLocale, translate } from "@/utils/translate";

export default async function MyPassPage() {
  const res = await getMyPassListAction({order: 'newest'})
  if ('passes' in res) {
    return (
      <div className="flex flex-col h-screen">
        <MyPassForm
          passes={res.passes}
          locale={await getLocale()}
        />
      </div>
    )
  }
}