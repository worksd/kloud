import { ResetPasswordForm } from "@/app/profile/setting/account/resetPassword/ResetPasswordForm";
import React from "react";
import { getLocale, translate } from "@/utils/translate";
import { SettingPcShell } from "@/app/profile/setting/SettingPcShell";

export default async function ResetPasswordPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>
}) {
  const { appVersion } = await searchParams;
  const locale = await getLocale();

  return (
    <SettingPcShell
      isWeb={appVersion === '' || appVersion == null}
      title={await translate('change_password')}
      mobile={
        <div className={'flex flex-col'}>
          <div className={'p-6'}>
            <ResetPasswordForm locale={locale}/>
          </div>
        </div>
      }
    >
      <ResetPasswordForm locale={locale} pcCard/>
    </SettingPcShell>
  );
}
