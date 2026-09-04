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
import {PcRedirect} from "@/app/components/PcRedirect";
import {parseHomeBands} from "@/app/home/home.bands";

export default async function Home({
                                     searchParams
                                   }: {
  searchParams: Promise<{ os: string, appVersion?: string }>
}) {
  const {os, appVersion} = await searchParams
  // 관리자(Partner/Operator)의 /admin 랜딩은 스플래시가 담당 (GET /auth의 user.type 분기).
  // 여기서 서버 리다이렉트하면 관리자 홈의 '일반 모드로 가기'(navigateMain → /home)와 무한 루프가 되므로 하지 않는다.
  const res = await getHomeAction()
  const hideDialogIds = await getHideDialogIdsAction()
  const locale = await getLocale()
  const cookieStore = await cookies();
  const hasStudioCookie = !!cookieStore.get(studioKey)?.value;
  if ('bands' in res) {
    // 통합 응답({bands}) → 평면 구조로 — 기존 화면 로직은 그대로 쓴다
    const home = parseHomeBands(res);
    const studio = home.myStudio?.studio;
    const firstThumb = home.myStudio?.jumbotrons?.[0]?.thumbnailUrl
      ?? home.myStudio?.bands?.flatMap(b => b.lessons)?.find(l => l.thumbnailUrl)?.thumbnailUrl
      ?? '';

    const content = (
        <div>
          <TrackView event="enter_home" props={{studioId: home.myStudio?.studio?.id ?? null}}/>
          <FcmTokenRequester/>
          {!hasStudioCookie && home.myStudio?.studio?.id && (
            <StudioCookieSetter studioId={home.myStudio.studio.id} />
          )}
          {home.alerts.length > 0 && <HomeAlerts alerts={home.alerts} locale={locale}/>}
          <EventScreen os={os} events={home.events} hideDialogIds={hideDialogIds} hideForeverMessage={await translate('do_not_show_again')}/>
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
              home.myStudio ? (
                  <MyStudioPage res={home.myStudio} bundles={home.bundles} roomSlots={home.roomSlots} myBookings={home.myBookings}/>
              ) : (
                  <NoMyStudioPage studios={home.recommendedStudios}/>
              )}

          </div>
          <div className={`fixed right-4 z-20 ${os === 'Android' ? 'bottom-1' : 'bottom-24'}`}>
            <PassPurchaseButton studioId={home.myStudio?.studio?.id}/>
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
        {/* PC 웹 내 스튜디오의 정식 경로는 /myStudio — 서버가 스튜디오를 정하므로 id 없이 replace.
            리다이렉트 전 블랭크 방지를 위해 아래 PC 폼은 그대로 그려둔다. */}
        <PcRedirect to={KloudScreen.MyStudio}/>
        <div className="hidden lg:block">
          <HomePcForm home={home}/>
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