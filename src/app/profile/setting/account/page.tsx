import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { MenuItem } from "@/app/profile/setting.menu.item";
import { translate } from "@/utils/translate";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

export default async function MyAccountPage() {

  const user = await getUserAction();
  if (user && 'id' in user) {
    return <div className={'flex flex-col'}>

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

    </div>
  }
}