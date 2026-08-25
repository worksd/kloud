import { MenuItem } from "@/app/profile/setting.menu.item";
import React from "react";
import { VersionMenu } from "@/app/profile/setting/version.menu";
import { DialogClickWrapper } from "@/utils/DialogClickWrapper";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";
import { QRScannerMenu } from "@/app/profile/setting/QRScannerMenu";

export default async function AccountSetting({
                                               searchParams
                                             }: {
  searchParams: Promise<{ appVersion: string, os: string }>
}) {
  const { os, appVersion } = await searchParams

  // 메뉴 리스트 — 모바일/PC 공용
  const menuList = (
    <>
      <NavigateClickWrapper method={'push'} route={KloudScreen.StudioSetting}>
        <MenuItem label="studio_setting"/>
      </NavigateClickWrapper>
      <NavigateClickWrapper method={'push'} route={KloudScreen.MyAccount}>
        <MenuItem label="my_account"/>
      </NavigateClickWrapper>
      <NavigateClickWrapper method={'push'} route={KloudScreen.LanguageSetting}>
        <MenuItem label="language_setting"/>
      </NavigateClickWrapper>
      <NavigateClickWrapper method={'push'} route={KloudScreen.NotificationSetting}>
        <MenuItem label="notification_setting"/>
      </NavigateClickWrapper>
      <NavigateClickWrapper method={'push'} route={KloudScreen.CouponRegister}>
        <MenuItem label="coupon_register"/>
      </NavigateClickWrapper>
      <VersionMenu
        title={await translate('app_version')}
        version={appVersion}/>
      <NavigateClickWrapper method={'push'} route={KloudScreen.BusinessInfo}>
        <MenuItem label={'business_info'}/>
      </NavigateClickWrapper>

      <NavigateClickWrapper method={'push'} route={KloudScreen.Policy}>
        <MenuItem label="terms_and_policy"/>
      </NavigateClickWrapper>

      {os === 'Android' &&
        <NavigateClickWrapper method={'push'} route={KloudScreen.Inquiry}>
          <MenuItem label="inquiry"/>
        </NavigateClickWrapper>
      }

      <DialogClickWrapper id={"Logout"}>
        <MenuItem label="log_out"/>
      </DialogClickWrapper>

      <QRScannerMenu/>
    </>
  );

  const mobile = (
    <div className="flex flex-col w-screen min-h-screen bg-white mx-auto">
      {menuList}
    </div>
  );

  // 웹 직접 접근 + viewport ≥1024px(lg)이면 중앙 카드 레이아웃, 그 외(앱 웹뷰/좁은 웹)는 기존 렌더.
  const isWeb = appVersion === '' || appVersion == null;
  if (!isWeb) return mobile;

  return (
    <>
      <div className="hidden lg:block">
        <div className="w-full min-h-screen bg-[#f9f9fb] pt-12 pb-24">
          <div className="mx-auto w-full max-w-[680px] px-8">
            <section className="rounded-2xl border border-[#f0f1f3] bg-white overflow-hidden pt-4 pb-2">
              <h1 className="text-[18px] font-bold text-black px-6 pt-2 pb-3">{await translate('setting')}</h1>
              {menuList}
            </section>
          </div>
        </div>
      </div>
      <div className="lg:hidden">
        {mobile}
      </div>
    </>
  );
}
