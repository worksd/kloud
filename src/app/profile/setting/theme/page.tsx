import { translate } from "@/utils/translate";
import { getThemePreference } from "@/utils/theme";
import { SettingPcShell } from "@/app/profile/setting/SettingPcShell";
import { ThemeChangeForm } from "@/app/profile/setting/theme/theme.change.form";

/** 설정 > 화면 테마 — 시스템/라이트/다크. 고르면 즉시 반영(쿠키 저장 + <html data-theme>), 확인 버튼 없음 */
export default async function ThemeSettingPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>
}) {
  const { appVersion } = await searchParams;
  const preference = await getThemePreference();
  const labels = {
    system: await translate('theme_system'),
    light: await translate('theme_light'),
    dark: await translate('theme_dark'),
    systemDescription: await translate('theme_system_description'),
  };

  return (
    <SettingPcShell
      isWeb={appVersion === '' || appVersion == null}
      title={await translate('theme_setting')}
      mobile={
        <div className="flex flex-col w-screen min-h-screen bg-white px-4 pt-2">
          <ThemeChangeForm preference={preference} labels={labels}/>
        </div>
      }
    >
      <ThemeChangeForm preference={preference} labels={labels}/>
    </SettingPcShell>
  );
}
