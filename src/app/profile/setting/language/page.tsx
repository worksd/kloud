import { LanguageChangeForm } from "@/app/profile/setting/language/language.change.form";
import { getLocale, translate } from "@/utils/translate";
import { SettingPcShell } from "@/app/profile/setting/SettingPcShell";

export default async function LanguageSettingPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>
}) {
  const { appVersion } = await searchParams;
  const locale = await getLocale();
  const confirmText = await translate('confirm');

  return (
    <SettingPcShell
      isWeb={appVersion === '' || appVersion == null}
      title={await translate('language_setting')}
      mobile={
        <div className={"flex flex-col w-screen min-h-screen bg-white"}>
          <LanguageChangeForm locale={locale} confirmText={confirmText}/>
        </div>
      }
    >
      <LanguageChangeForm locale={locale} confirmText={confirmText} pcCard/>
    </SettingPcShell>
  );
}
