import {getHomeAction} from "@/app/home/get.home.action";
import React from "react";
import Logo from "../../../public/assets/logo_black.svg";
import {PassPurchaseButton} from "@/app/profile/PassPurchaseButton";
import MyStudioPage from "@/app/home/MyStudioPage";
import {NoMyStudioPage} from "@/app/home/NoMyStudioPage";
import {getHideDialogIdsAction} from "@/app/home/get.hide.dialog.ids.action";
import EventScreen from "@/app/home/eventScreen";
import {CircleImage} from "@/app/components/CircleImage";
import {NavigateClickWrapper} from "@/utils/NavigateClickWrapper";
import {KloudScreen} from "@/shared/kloud.screen";
import ArrowDownIcon from "../../../public/assets/arrow-down.svg";
import {FcmTokenRequester} from "@/app/home/FcmTokenRequester";
import {cookies} from "next/headers";
import {fcmTokenKey} from "@/shared/cookies.key";

export default async function Home({
                                     searchParams
                                   }: {
  searchParams: Promise<{ os: string }>
}) {
  const {os} = await searchParams
  const res = await getHomeAction()
  const hideDialogIds = await getHideDialogIdsAction()
  const hasFcmToken = !!(await cookies()).get(fcmTokenKey)?.value
  if ('studios' in res) {
    const studio = res.myStudio?.studio;
    return (
        <div>
          <FcmTokenRequester hasFcmToken={hasFcmToken}/>
          <EventScreen os={os} events={res.events ?? []} hideDialogIds={hideDialogIds}/>
          <div
              className="fixed top-0 left-0 right-0 flex flex-row items-center justify-between h-16 px-6 py-2 bg-white z-10">
            {studio ? (
              <NavigateClickWrapper method={'showBottomSheet'} route={KloudScreen.StudioSettingSheet}>
                <div className="flex items-center gap-2.5 cursor-pointer active:opacity-70 transition-opacity">
                  <CircleImage imageUrl={studio.profileImageUrl} size={36}/>
                  <span className="text-[18px] font-bold text-black">{studio.name}</span>
                  <ArrowDownIcon/>
                </div>
              </NavigateClickWrapper>
            ) : (
              <Logo className="scale-[0.7] origin-left"/>
            )}
          </div>
          <div className={'mt-20'}>
            {
              res.myStudio ? (
                  <MyStudioPage res={res.myStudio}/>
              ) : (
                  <NoMyStudioPage studios={res.recommendedStudios}/>
              )}

          </div>
          <div className={'fixed bottom-4 right-4 z-10'}>
            <PassPurchaseButton studioId={res.myStudio?.studio?.id}/>
          </div>
        </div>

    )
  } else {
    throw Error()
  }
}