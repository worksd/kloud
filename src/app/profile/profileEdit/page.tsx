import React from "react";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { ProfileEditForm } from "@/app/onboarding/ProfileEditForm";
import { getLocale, translate } from "@/utils/translate";

export default async function ProfileEditPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>
}) {
  const { appVersion } = await searchParams;
  const user = await getUserAction();

  if (!user || !('id' in user)) return null;

  const formProps = {
    user,
    nickNameText: await translate('nick_name'),
    confirmText: await translate('confirm'),
    accountInfoText: await translate('account_info'),
    profileInfoText: await translate('profile_info'),
    userIdText: await translate('user_id'),
    emailText: await translate('email'),
    nameText: await translate('name'),
    identityVerifiedText: await translate('identity_verified'),
    identityNotVerifiedText: await translate('identity_not_verified'),
    loginTypeText: await translate('login_type'),
    refundAccountBankText: await translate('refund_account_bank'),
    refundAccountNumberText: await translate('refund_account_number'),
    refundAccountDepositorText: await translate('refund_account_depositor'),
    refundAccountSectionText: await translate('refund_account'),
    phoneText: await translate('cellphone_number'),
    birthText: await translate('real_birthday'),
    genderText: await translate('sex'),
    maleText: await translate('man'),
    femaleText: await translate('woman'),
    locale: await getLocale(),
  };

  // 웹 직접 접근 + viewport ≥1024px(lg)이면 중앙 카드 레이아웃, 그 외(앱 웹뷰/좁은 웹)는 기존 렌더.
  const isWeb = appVersion === '' || appVersion == null;

  if (!isWeb) {
    return (
      <div className="flex flex-col">
        <ProfileEditForm {...formProps}/>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block">
        <div className="w-full min-h-screen bg-[#f9f9fb] pt-12 pb-24">
          <div className="mx-auto w-full max-w-[680px] px-8">
            <div className="rounded-2xl border border-[#f0f1f3] bg-white overflow-hidden py-2">
              <ProfileEditForm {...formProps} pcCard/>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:hidden">
        <div className="flex flex-col">
          <ProfileEditForm {...formProps}/>
        </div>
      </div>
    </>
  );
}
