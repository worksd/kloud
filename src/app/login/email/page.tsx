import Logo from "../../../../public/assets/logo_black.svg";
import LoginButtonForm from "@/app/login/login.button.form";
import { LoginForm } from "@/app/login/login.form";

export default function EmailLogin(props: any) {

  return (
    <section className="w-screen min-h-screen bg-white flex flex-col items-center justify-center"
             style={{paddingTop: "100px"}}>
      <Logo/>
      <LoginForm/>

    </section>
  )
}
