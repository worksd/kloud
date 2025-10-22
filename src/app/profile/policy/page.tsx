import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import React from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { MenuItem } from "@/app/profile/setting.menu.item";

export default async function PolicyPage() {

  return (
    <div className={'flex flex-col'}>
      <div className={'mt-4'}>
        <NavigateClickWrapper method={'push'} route={KloudScreen.Terms}>
          <MenuItem label={'service_terms_agreement'}/>
        </NavigateClickWrapper>
        <NavigateClickWrapper method={'push'} route={KloudScreen.Privacy}>
          <MenuItem label={'privacy_agreement'}/>
        </NavigateClickWrapper>
      </div>


    </div>
  )
}