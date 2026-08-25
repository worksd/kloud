import React from "react";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import SignOutForm from "@/app/profile/setting/account/signOut/SignOutForm";
import { getLocale, translate } from "@/utils/translate";
import { SettingPcShell } from "@/app/profile/setting/SettingPcShell";

export default async function SignOut({searchParams}: {
  searchParams: Promise<{ os?: string, appVersion?: string }>
}) {
  const { appVersion } = await searchParams;
  const locale = await getLocale();

  return (
    <SettingPcShell
      isWeb={appVersion === '' || appVersion == null}
      title={await translate('sign_out')}
      mobile={
        <div className="flex flex-col w-screen min-h-screen bg-white mx-auto">
          <div className="flex justify-between items-center mb-14">
            <SimpleHeader titleResource="sign_out"/>
          </div>
          <SignOutForm locale={locale}/>
        </div>
      }
    >
      <SignOutForm locale={locale}/>
    </SettingPcShell>
  );
}
