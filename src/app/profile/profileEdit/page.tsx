import React from "react";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { ProfileEditForm } from "@/app/onboarding/ProfileEditForm";
import { translate } from "@/utils/translate";

export default async function ProfileEditPage() {
  const user = await getUserAction();

  if (user && 'id' in user) {
    return (
      <div className="flex flex-col">
        <ProfileEditForm
          user={user}
          nickNameText={await translate('nick_name')}
          confirmText={await translate('confirm')}
          accountInfoText={await translate('account_info')}
          profileInfoText={await translate('profile_info')}
          userIdText={await translate('user_id')}
          emailText={await translate('email')}
          nameText={await translate('name')}
          identityVerifiedText={await translate('identity_verified')}
          identityNotVerifiedText={await translate('identity_not_verified')}
          loginTypeText={await translate('login_type')}
          refundAccountBankText={await translate('refund_account_bank')}
          refundAccountNumberText={await translate('refund_account_number')}
          refundAccountDepositorText={await translate('refund_account_depositor')}
          refundAccountSectionText={await translate('refund_account')}
        />
      </div>
    )
  }
}
