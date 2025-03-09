import Logo from "../../../public/assets/logo_black.svg"
import { LoginButtonForm } from "@/app/login/login.button.form";
import { ChangeLocaleButton } from "@/app/login/change.locale.button";
import { getLocale } from "@/utils/translate";

export default async function Login({
                                      searchParams
                                    }: {
  searchParams: Promise<{ os: string }>
}) {
  return (
    <section className="w-screen min-h-screen bg-white flex flex-col items-center relative"
             style={{paddingTop: "100px"}}>
      <ChangeLocaleButton currentLocale={(await getLocale())}/>
      <Logo/>
      <div className="mt-auto justify-center items-center w-full max-w-sm mb-8 bg-white">
        <LoginButtonForm os={(await searchParams).os}/>
      </div>
    </section>
  );
}