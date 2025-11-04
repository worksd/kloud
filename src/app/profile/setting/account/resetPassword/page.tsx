import { ResetPasswordForm } from "@/app/profile/setting/account/resetPassword/ResetPasswordForm";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import React from "react";
import { getLocale } from "@/utils/translate";

export default async function ResetPasswordPage() {
  return (
    <div className={'flex flex-col'}>
      <div className={'p-6'}>
        <ResetPasswordForm locale={await getLocale()}/>
      </div>
    </div>
  )

}