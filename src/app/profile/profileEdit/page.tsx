import { ProfileEditForm } from "@/app/onboarding/ProfileEditForm";
import React from "react";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { ProfileEditWrapper } from "@/app/profile/profileEdit/ProfileEditWrapper";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";

export default async function ProfileEditPage() {
  const user = await getUserAction();

  if (user && 'id' in user) {
    return (
      <div className="flex flex-col">
        <SimpleHeader titleResource="edit_profile"/>
        <div className={'pt-14'}>
          <ProfileEditWrapper user={user}/>
        </div>
      </div>

    )
  }
}