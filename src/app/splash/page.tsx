import { SplashScreen } from "@/app/splash/splash.screen";
import { syncCookiesFromNativeAction } from "@/app/splash/sync.cookies.action";

export default async function Splash({searchParams}: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  console.log('[Splash] searchParams:', JSON.stringify(params));
  const { os = '', link } = params;

  // 네이티브가 query로 전달한 쿠키 값들을 180일 만료로 갱신
  // (값이 있는 키만 갱신. 없는 키는 건드리지 않음)
  await syncCookiesFromNativeAction({
    accessToken: params.accessToken,
    userID: params.userID,
    udid: params.udid,
    fcmToken: params.fcmToken,
    locale: params.locale,
    studio: params.studio,
    depositor: params.depositor,
    kioskSelectedId: params.kioskSelectedId,
    hideDialogIdList: params.hideDialogIdList,
  });

  return (
    <SplashScreen os={os} link={link}/>
  );
}
