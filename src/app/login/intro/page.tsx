import { LoginButtonForm } from "@/app/login/login.button.form";
import { DevTapLogo } from "@/app/login/DevTapToGo";

export default async function LoginIntroPage({
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

  const {os, appVersion, returnUrl} = await searchParams;


  return (
    <section
      className="w-screen min-h-screen bg-white flex flex-col items-center pb-7 px-4"
      style={{paddingTop: '100px'}}
    >
      {/* ⬇️ 가운데 배치 */}
      <div className="flex-1 w-full flex justify-center pt-56">
        <DevTapLogo/>
      </div>

      <LoginButtonForm os={os} appVersion={appVersion} returnUrl={returnUrl}/>

    </section>

  )
}