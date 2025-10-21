import { LargeKloudButton, LoginButtonForm } from "@/app/login/login.button.form";
import { ChangeLocaleButton } from "@/app/login/change.locale.button";
import { getLocale, translate } from "@/utils/translate";
import { DevTapLogo } from "@/app/login/DevTapToGo";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

export default async function Login({
                                      searchParams,
                                    }: {
  searchParams: Promise<{
    os: string;
    appVersion: string;
    code: string;
    returnUrl: string;
    state: string;
  }>;
}) {
  const { os, appVersion, returnUrl } = await searchParams;

  return (
    <section
      className="w-screen min-h-screen bg-white flex flex-col items-center pb-7 px-5"
      style={{ paddingTop: '100px' }}
    >
      {/* ⬇️ 가운데 배치 */}
      <div className="flex-1 w-full flex justify-center pt-56">
        <DevTapLogo />
      </div>

      {appVersion !== '' && (
        <div className={'mb-6'}>
          <ChangeLocaleButton currentLocale={await getLocale()}/>
        </div>
      )}
      <NavigateClickWrapper method={'push'} route={KloudScreen.LoginIntro('')}>
        <LargeKloudButton title={await translate('do_start')}/>
      </NavigateClickWrapper>

    </section>
  );
}