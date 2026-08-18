import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { MenuItem } from "@/app/profile/setting.menu.item";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { SettingPcShell } from "@/app/profile/setting/SettingPcShell";

export default async function MyAccountPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>
}) {
  const { appVersion } = await searchParams;
  const user = await getUserAction();
  if (!user || !('id' in user)) return null;

  const menuList = (
    <>
      {user.phone ? <div className={'flex flex-col px-6 text-black py-4 space-y-1 font-medium'}>
        <div className={'flex flex-row space-x-1 items-center'}>
          <div className={'text-black'}>{await translate('cell_phone_certificate')}</div>
          <div className={'bg-black text-white rounded-[4px] px-1 text-[12px]'}>{await translate('complete')}</div>
        </div>
        <div className={'text-[#919191]'}>
          {user.phone}
        </div>
      </div> : <NavigateClickWrapper method={'push'} route={KloudScreen.Certification}> <MenuItem
        label={'cell_phone_certificate'}/></NavigateClickWrapper>
      }

      {/* SNS 계정 연결 — loginType 무관 항상 노출 */}
      <NavigateClickWrapper method={'push'} route={KloudScreen.SnsConnect}>
        <MenuItem label={'sns_account_connect'}/>
      </NavigateClickWrapper>

      {user.loginType == 'Email' &&
        <NavigateClickWrapper method={'push'} route={KloudScreen.PasswordSetting}>
          <MenuItem label={'change_password'}/>
        </NavigateClickWrapper>
      }

      <NavigateClickWrapper method={'push'} route={KloudScreen.PaymentMethodSetting}>
        <MenuItem label="payment_method_management"/>
      </NavigateClickWrapper>

      <NavigateClickWrapper method={'push'} route={KloudScreen.RefundAccountSetting}>
        <MenuItem label="refund_account"/>
      </NavigateClickWrapper>

      {/* TODO: 인스타 연동하기 — 추후 재오픈 예정. 일단 메뉴 노출 보류.
      <NavigateClickWrapper method={'push'} route={KloudScreen.InstagramConnect}>
        <MenuItem label="instagram_connect"/>
      </NavigateClickWrapper>
      */}

      <NavigateClickWrapper method={'push'} route={KloudScreen.SignOut}>
        <MenuItem label="sign_out"/>
      </NavigateClickWrapper>
    </>
  );

  return (
    <SettingPcShell
      isWeb={appVersion === '' || appVersion == null}
      title={await translate('my_account')}
      flush
      mobile={<div className={'flex flex-col'}>{menuList}</div>}
    >
      {menuList}
    </SettingPcShell>
  );
}
