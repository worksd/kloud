import {getHomeAction} from "@/app/home/get.home.action";
import React from "react";
import Logo from "../../../public/assets/logo_black.svg";
import {PassPurchaseButton} from "@/app/profile/PassPurchaseButton";
import MyStudioPage from "@/app/home/MyStudioPage";
import {NoMyStudioPage} from "@/app/home/NoMyStudioPage";
import {getHideDialogIdsAction} from "@/app/home/get.hide.dialog.ids.action";
import EventScreen from "@/app/home/eventScreen";
import {handleApiError} from "@/utils/handle.api.error";
import {TokenExpiredRedirect} from "@/app/components/TokenExpiredRedirect";
import {CircleImage} from "@/app/components/CircleImage";
import {NavigateClickWrapper} from "@/utils/NavigateClickWrapper";
import {KloudScreen} from "@/shared/kloud.screen";
import ArrowDownIcon from "../../../public/assets/arrow-down.svg";
import {FcmTokenRequester} from "@/app/home/FcmTokenRequester";
import {HomeAlerts} from "@/app/home/HomeAlerts";
import {cookies} from "next/headers";
import {fcmTokenKey} from "@/shared/cookies.key";
import {HomeAlphaBgProvider} from "@/app/home/HomeAlphaBg";
import {HomeHeader} from "@/app/home/HomeHeader";

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
    const firstThumb = res.myStudio?.bands
      ?.flatMap(b => b.lessons)
      ?.find(l => l.thumbnailUrl)?.thumbnailUrl ?? '';

    const content = (
        <div>
          <FcmTokenRequester hasFcmToken={hasFcmToken}/>
          {res.alerts && res.alerts.length > 0 && <HomeAlerts alerts={res.alerts}/>}
          <EventScreen os={os} events={res.events ?? []} hideDialogIds={hideDialogIds}/>
          <HomeHeader hasStudio={!!studio}>
            {studio ? (
              <NavigateClickWrapper method={'showBottomSheet'} route={KloudScreen.StudioSettingSheet}>
                <div className="flex items-center gap-2.5 cursor-pointer active:opacity-70 transition-opacity">
                  <CircleImage imageUrl={studio.profileImageUrl} size={28}/>
                  <span className="text-[18px] font-medium text-black">{studio.name}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </NavigateClickWrapper>
            ) : (
              <Logo className="scale-[0.7] origin-left"/>
            )}
          </HomeHeader>
          <div className="mt-24">
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
    );

    return studio && firstThumb
      ? <HomeAlphaBgProvider initialImage={firstThumb}>{content}</HomeAlphaBgProvider>
      : content;
  } else {
    const result = await handleApiError(res, 'GET /home');
    if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect />;
  }
}