import { LoginForm } from "@/app/login/login.form";

export default function Login(props: any) {
  return (
    <section className={'w-screen min-h-screen p-12 bg-black text-white flex flex-col justify-center items-center'}>
      <header className={'flex'}>
        <h1 className={'text-4xl font-bold flex justify-center items-center'}>로그인</h1>
      </header>

      <main className={'mt-8'}>
        <LoginForm />
      </main>
    </section>
  );
}

