import Logo from "../../../public/assets/logo_black.svg"
import { LoginButtonForm } from "@/app/login/login.button.form";
import { ChangeLocaleButton } from "@/app/login/change.locale.button";
import { getLocale } from "@/utils/translate";

export default async function Login({
                                      searchParams,
                                    }: {
  searchParams: Promise<{ os: string, appVersion: string, code: string, returnUrl: string, state: string }>,
}) {
  const {os, appVersion, returnUrl } = await searchParams;
  console.log('login form')
  console.log(returnUrl)
  return (
    <section className="w-screen min-h-screen bg-white flex flex-col items-center relative"
             style={{paddingTop: "100px"}}>

      {appVersion != '' && <ChangeLocaleButton currentLocale={(await getLocale())}/>}
      <Logo/>
      <div className="mt-auto justify-center items-center w-full max-w-sm mb-8 bg-white">
        <LoginButtonForm
          os={os}
          appVersion={appVersion}
          returnUrl={returnUrl}
        />
      </div>
    </section>
  );
}