'use client'

import { GetMembershipResponse } from "@/app/endpoint/membership.endpoint";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { MembershipItem } from "@/app/memberships/[id]/MembershipItem";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import Image from "next/image";

export const MembershipBand = ({membership, locale}: {
  membership: GetMembershipResponse,
  locale: Locale,
}) => {
  return (
    <div className="px-4 mb-5">
      <div className="text-[18px] font-bold text-black mb-3">
        {getLocaleString({locale, key: 'my_membership'})}
      </div>
      <NavigateClickWrapper method={'push'} route={KloudScreen.MembershipDetail(membership.id)}>
        <div className="relative border border-[#F1F3F6] rounded-[16px] p-4 shadow-sm active:scale-[0.98] transition-all duration-150 select-none overflow-hidden">
          {membership.plan?.imageUrl && (
            <>
              <Image
                src={membership.plan?.imageUrl}
                alt={membership.plan.name}
                fill
                className="object-cover absolute inset-0 z-0"
                quality={60}
              />
              <div className="absolute inset-0 bg-black/30 z-10" />
            </>
          )}
          <div className="relative z-20">
            <MembershipItem membership={membership} locale={locale} isOnBackground={!!membership.plan?.imageUrl} />
          </div>
        </div>
      </NavigateClickWrapper>
    </div>
  )
}

