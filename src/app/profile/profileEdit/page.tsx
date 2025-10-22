import React from "react";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { ProfileEditForm } from "@/app/onboarding/ProfileEditForm";
import { translate } from "@/utils/translate";

export default async function ProfileEditPage() {
  const user = await getUserAction();

  if (user && 'id' in user) {
    return (
      <div className="flex flex-col">
        <ProfileEditForm user={user} nickNameText={await translate('nick_name')}
                         confirmText={await translate('confirm')}/>
      </div>

    )
  }
}