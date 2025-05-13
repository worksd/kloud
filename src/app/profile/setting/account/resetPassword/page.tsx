import { ResetPasswordForm } from "@/app/profile/setting/account/resetPassword/ResetPasswordForm";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import React from "react";

export default async function ResetPasswordPage() {
  return (
    <div className={'flex flex-col'}>
      <div className="flex justify-between items-center mb-14 px-6">
        <SimpleHeader titleResource="change_password"/>
      </div>
      <div className={'p-6'}>
        <ResetPasswordForm/>
      </div>
    </div>
  )

}