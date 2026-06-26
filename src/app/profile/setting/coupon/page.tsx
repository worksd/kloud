import { CouponRegisterForm } from '@/app/profile/setting/coupon/CouponRegisterForm';
import { getLocale, translate } from '@/utils/translate';
import { api } from '@/app/api.client';

export default async function CouponRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; appVersion?: string }>;
}) {
  const { code, appVersion } = await searchParams;
  // 앱(웹뷰)에서는 네이티브가 헤더를 그리므로, 웹에서만 타이틀 헤더를 렌더한다.
  const isWeb = !appVersion;

  // 토큰에 유저 정보가 있으면 로그인 사용자. 없으면(비로그인) 이름·전화번호를 직접 입력받는다.
  let isLoggedIn = false;
  try {
    const me = await api.user.me({});
    isLoggedIn = 'id' in me;
  } catch {
    // ignore — 비로그인으로 처리
  }

  return (
    <div className="flex flex-col w-screen h-[100dvh] bg-white">
      {isWeb && (
        <div className="flex h-14 shrink-0 items-center justify-center bg-white">
          <h1 className="text-[16px] font-bold text-black">{await translate('coupon_register')}</h1>
        </div>
      )}
      <CouponRegisterForm locale={await getLocale()} initialCode={code} isLoggedIn={isLoggedIn} />
    </div>
  );
}
