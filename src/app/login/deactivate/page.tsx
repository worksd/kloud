import { getUserAction } from "@/app/onboarding/action/get.user.action";
import React from "react";
import { LoginDeactivateScreen } from "@/app/login/deactivate/DeactivateScreen";

export default async function LoginDeactivatePage() {
  const user = await getUserAction()
  if (user != null && 'id' in user) {
    return (
      <LoginDeactivateScreen user={user}/>
    );
  } else {
    return <div className={'text-black'}>{user?.message}</div>
  }
}