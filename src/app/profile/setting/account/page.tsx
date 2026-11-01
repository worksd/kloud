import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { MenuItem } from "@/app/profile/setting.menu.item";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { SettingPcShell } from "@/app/profile/setting/SettingPcShell";
import {
  PhoneCertFlatIcon, SnsLinkFlatIcon, PasswordFlatIcon, PaymentCardFlatIcon, RefundAccountFlatIcon, SignOutFlatIcon,
} from "@/app/profile/setting/SettingIcons";

export default async function MyAccountPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>
}) {
  const { appVersion } = await searchParams;
  const user = await getUserAction();
  if (!user || !('id' in user)) return null;

  const menuList = (
    <>
      {/* 휴대폰 인증 — 완료면 번호를 보여주는 정적 행(아이콘·여백은 MenuItem 과 같은 규격), 아니면 인증으로 */}
      {user.phone ? (
        <div className={'flex items-center gap-3.5 px-6 py-3 text-black font-medium'}>
          <span className="w-[42px] h-[42px] rounded-[14px] bg-[#F7F8FA] flex items-center justify-center shrink-0">
            <PhoneCertFlatIcon size={24}/>
          </span>
          <div className={'flex flex-col min-w-0'}>
            <div className={'flex flex-row space-x-1.5 items-center'}>
              <div className={'text-gray-800'}>{await translate('cell_phone_certificate')}</div>
              <div className={'bg-black text-white rounded-[4px] px-1 text-[12px]'}>{await translate('complete')}</div>
            </div>
            <div className={'text-[13px] text-[#919191]'}>{user.phone}</div>
          </div>
        </div>
      ) : (
        <NavigateClickWrapper method={'push'} route={KloudScreen.Certification}>
          <MenuItem label={'cell_phone_certificate'} icon={<PhoneCertFlatIcon size={24}/>}/>
        </NavigateClickWrapper>
      )}

      {/* SNS 계정 연결 — loginType 무관 항상 노출 */}
      <NavigateClickWrapper method={'push'} route={KloudScreen.SnsConnect}>
        <MenuItem label={'sns_account_connect'} icon={<SnsLinkFlatIcon size={24}/>}/>
      </NavigateClickWrapper>

      {user.loginType == 'Email' &&
        <NavigateClickWrapper method={'push'} route={KloudScreen.PasswordSetting}>
          <MenuItem label={'change_password'} icon={<PasswordFlatIcon size={24}/>}/>
        </NavigateClickWrapper>
      }

      <NavigateClickWrapper method={'push'} route={KloudScreen.PaymentMethodSetting}>
        <MenuItem label="payment_method_management" icon={<PaymentCardFlatIcon size={24}/>}/>
      </NavigateClickWrapper>

      <NavigateClickWrapper method={'push'} route={KloudScreen.RefundAccountSetting}>
        <MenuItem label="refund_account" icon={<RefundAccountFlatIcon size={24}/>}/>
      </NavigateClickWrapper>

      {/* TODO: 인스타 연동하기 — 추후 재오픈 예정. 일단 메뉴 노출 보류.
      <NavigateClickWrapper method={'push'} route={KloudScreen.InstagramConnect}>
        <MenuItem label="instagram_connect"/>
      </NavigateClickWrapper>
      */}

      <NavigateClickWrapper method={'push'} route={KloudScreen.SignOut}>
        <MenuItem label="sign_out" icon={<SignOutFlatIcon size={24}/>}/>
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
