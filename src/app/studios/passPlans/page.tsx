import { TranslatableText } from "@/utils/TranslatableText";
import { StudioArrowItem } from "@/app/passPlans/StudioArrowItem";
import React from "react";
import { getStudioList } from "@/app/home/action/get.studio.list.action";
import { translate } from "@/utils/translate";

export default async function StudioPassPlansPage() {
  const res = await getStudioList({hasPass: true})
  if ('studios' in res) {
    return (
      <div className={"flex flex-col w-full overflow-x-hidden"}>
        <div className={"text-black text-[20px] font-bold px-6 mb-10"}>
          {await translate('select_purchase_pass_plan_studio')}
        </div>
        {res.studios && res.studios.length > 0 ?
          <ul className="flex flex-col">
            {res.studios.map((item) => (
              <StudioArrowItem key={item.id} item={item}/>
            ))}
          </ul> : <div className="flex justify-center items-center h-64">
            <TranslatableText
              className="text-black text-center text-base"
              titleResource="no_studio_pass_plan_message"
            />
          </div>}
      </div>
    )
  } else {
    return (
      <div className={"flex flex-col w-full text-black"}>No Data</div>
    )
  }
}