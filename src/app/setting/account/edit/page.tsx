import React from "react";
import { ProfileEditPageForm } from "@/app/setting/account/edit/ProfileEditPageForm";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { getUserAction } from "@/app/onboarding/action/get.user.action";

export default async function ProfileEditPage() {
  const user = await getUserAction()
  if (user) {
    return (
      <div className={'flex flex-col'}>
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader titleResource={'edit_profile'}/>
        </div>
        <ProfileEditPageForm
          initialAccountBank={user.refundAccountBank}
          initialAccountDepositor={user.refundAccountDepositor}
          initialAccountNumber={user.refundAccountNumber}
        />
      </div>
    )
  }
}