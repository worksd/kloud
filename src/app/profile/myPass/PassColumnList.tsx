'use client'

import { GetPassResponse, PassPlanTier } from "@/app/endpoint/pass.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import PremiumTierIcon from "../../../../public/assets/ic_premium_pass_plan.svg"
import { PassItem } from "@/app/profile/myPass/action/PassItem";
import { kloudNav } from "@/app/lib/kloudNav";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export const PassColumnList = ({
                                 passItems,
                                 isActivePass,
                                 locale
                               }: {
  passItems: GetPassResponse[],
  isActivePass: boolean,
  locale: Locale,
}) => {
  if (passItems && passItems.length > 0) {
    return (
      <div className={"flex flex-col text-black"}>
        <div className="flex flex-col space-y-4 py-4">
          {passItems.map((item) => (
            <ActivePassItem
              key={item.id}
              pass={item}
              locale={locale}
            />
          ))}
        </div>
      </div>
    )
  } else {
    return (
      <div className={'flex flex-col justify-center pt-36 items-center space-y-4 text-center'}>
        {isActivePass && <div
          className={'text-[14px] text-black font-bold border rounded-full border-black px-4 py-3 active:scale-[0.98] active:bg-gray-100 transition-transform duration-150 text-center'}
          onClick={() => kloudNav.push(KloudScreen.HasPassStudioList)}>{getLocaleString({locale, key: 'go_purchase_pass_title'})}</div>}
        <div
          className={'text-[#85898C] font-medium text-[16px] text-center whitespace-pre-line'}>
          {isActivePass ? getLocaleString({locale, key: 'no_active_passes_message'}) : getLocaleString({locale, key: 'no_used_passes_message'})}
        </div>
      </div>
    )
  }
}

export const ActivePassItem = ({pass, locale}: { pass: GetPassResponse, locale: Locale }) => {
  const borderColor =
    pass.passPlan?.tier === PassPlanTier.Premium ? 'border-[#E1CBFE]' : 'border-[#F1F3F6]'

  const backgroundColor = pass.passPlan?.tier === PassPlanTier.Premium ? 'bg-[#FBFBFF]' : 'bg-white'

  return (
    <div
      className={`${backgroundColor} rounded-2xl p-6 border ${borderColor} active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none`}
      onClick={() => kloudNav.push(KloudScreen.MyPassDetail(pass.id))}
    >
      <div className="flex justify-between items-center space-x-4">
        <PassItem pass={pass} locale={locale}/>
        {pass.passPlan?.tier === PassPlanTier.Premium &&
          <PremiumTierIcon/>
        }
      </div>
    </div>
  )
}