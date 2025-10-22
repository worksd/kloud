import { getMyPassListAction } from "@/app/profile/myPass/action/get.my.pass.list.action";
import { MyPassForm } from "@/app/profile/myPass/MyPassForm";
import { translate } from "@/utils/translate";

export default async function MyPassPage() {
  const res = await getMyPassListAction({order: 'newest'})
  if ('passes' in res) {
    return (
      <div className="flex flex-col h-screen">
        <MyPassForm
          passes={res.passes}
          myActivePassesText={await translate('my_active_passes')}
          myUsedPassesText={await translate('my_used_passes')}
          noActiveMessageText={await translate('no_active_passes_message')}
          noUsedMessageText={await translate('no_used_passes_message')}
        />
      </div>
    )
  }
}