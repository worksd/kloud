import Logo from "../../../public/assets/logo_black.svg"
import { LoginButtonForm } from "@/app/login/login.button.form";
import { userAgent } from "next/server";

export interface PageParams {
  os: string
}

export default function Login({searchParams}: {searchParams: PageParams}): JSX.Element {
  return (
    <section className="w-screen min-h-screen bg-white flex flex-col items-center"
             style={{paddingTop: "100px"}}>
      <Logo/>
      <div className="mt-auto justify-center items-center w-full max-w-sm mb-8 bg-white">
        <LoginButtonForm os={searchParams.os} />
      </div>
    </section>
  );
}

