import {getHomeAction} from "@/app/home/get.home.action";
import React from "react";
import Logo from "../../../public/assets/logo_black.svg";
import {PassPurchaseButton} from "@/app/profile/PassPurchaseButton";
import MyStudioPage from "@/app/home/MyStudioPage";
import {NoMyStudioPage} from "@/app/home/NoMyStudioPage";
import {getHideDialogIdsAction} from "@/app/home/get.hide.dialog.ids.action";
import {getLocale, translate} from "@/utils/translate";
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
import {studioKey} from "@/shared/cookies.key";
import {StudioCookieSetter} from "@/app/home/StudioCookieSetter";
import {HomeAlphaBgProvider} from "@/app/home/HomeAlphaBg";
import {HomeHeader} from "@/app/home/HomeHeader";
import {TrackView} from "@/app/components/TrackView";
import {HomePcForm} from "@/app/home/HomePcForm";

export default async function Home({
                                     searchParams
                                   }: {
  searchParams: Promise<{ os: string, appVersion?: string }>
}) {
  const {os, appVersion} = await searchParams
  const res = await getHomeAction()
  const hideDialogIds = await getHideDialogIdsAction()
  const locale = await getLocale()
  const cookieStore = await cookies();
  const hasStudioCookie = !!cookieStore.get(studioKey)?.value;
  if ('studios' in res) {
    const studio = res.myStudio?.studio;
    const firstThumb = res.myStudio?.jumbotrons?.[0]?.thumbnailUrl
      ?? res.myStudio?.bands?.flatMap(b => b.lessons)?.find(l => l.thumbnailUrl)?.thumbnailUrl
      ?? '';

    const content = (
        <div>
          <TrackView event="enter_home" props={{studioId: res.myStudio?.studio?.id ?? null}}/>
          <FcmTokenRequester/>
          {!hasStudioCookie && res.myStudio?.studio?.id && (
            <StudioCookieSetter studioId={res.myStudio.studio.id} />
          )}
          {res.alerts && res.alerts.length > 0 && <HomeAlerts alerts={res.alerts} locale={locale}/>}
          <EventScreen os={os} events={res.events ?? []} hideDialogIds={hideDialogIds} hideForeverMessage={await translate('do_not_show_again')}/>
          <HomeHeader hasStudio={!!studio} os={os}>
            {studio ? (
              <NavigateClickWrapper method={'push'} route={KloudScreen.StudioDetail(studio.id)}>
                <div className="flex items-center gap-2.5 cursor-pointer active:opacity-70 transition-opacity">
                  <CircleImage imageUrl={studio.profileImageUrl} size={28}/>
                  <span className="text-[18px] font-bold text-black">{studio.name}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </NavigateClickWrapper>
            ) : (
              <Logo className="scale-[0.7] origin-left"/>
            )}
          </HomeHeader>
          <div className={os === 'Android' ? 'mt-16' : 'mt-28'}>
            {
              res.myStudio ? (
                  <MyStudioPage res={res.myStudio} bundles={res.bundles} roomSlots={res.roomSlots} myBookings={res.myBookings}/>
              ) : (
                  <NoMyStudioPage studios={res.recommendedStudios}/>
              )}

          </div>
          <div className={`fixed right-4 z-20 ${os === 'Android' ? 'bottom-1' : 'bottom-24'}`}>
            <PassPurchaseButton studioId={res.myStudio?.studio?.id}/>
          </div>
        </div>
    );

    const mobile = studio && firstThumb
      ? <HomeAlphaBgProvider initialImage={firstThumb}>{content}</HomeAlphaBgProvider>
      : content;

    // 웹 직접 접근 + viewport ≥1024px(lg)이면 PC 홈 — 모바일 홈의 fixed 헤더/플로팅 버튼이
    // PC 크롬(탑바·LNB)을 덮는 문제를 피한다. 앱 웹뷰/좁은 웹은 기존 렌더 그대로.
    const isWeb = appVersion === '' || appVersion == null;
    if (!isWeb) return mobile;

    return (
      <>
        <div className="hidden lg:block">
          <HomePcForm home={res}/>
        </div>
        <div className="lg:hidden">
          {mobile}
        </div>
      </>
    );
  } else {
    const result = await handleApiError(res, 'GET /home');
    if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect />;
  }
}