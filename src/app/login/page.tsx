import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { cookies } from "next/headers";
import { LoginForm } from "@/app/login/login.form";
import { redirect } from "next/navigation";
import { UserStatus } from "@/entities/user/user.status";

export default function Login(props: any) {

  return (
    <>
      <div>Hello Login</div>
      <LoginForm login={login}/>

    </>
      );
}

async function login() {
  'use server';
  try {
    const loginResponse = await api.auth.email({
      email: 'dongho1222@unist.ac.kr',
      password: 'gusgh0705!',
      type: UserType.Default,
    })
    const nextCookies = cookies();
    nextCookies.set('accessToken', loginResponse.accessToken)
    nextCookies.set('userId', `${loginResponse.user.id}`)

    if (loginResponse.user.status == UserStatus.Ready) {
      redirect('/home')
    }
    else if (loginResponse.user.status == UserStatus.New) {
      redirect('/onboarding')
    }
  } catch (e) {
    console.log(e);
  }
}