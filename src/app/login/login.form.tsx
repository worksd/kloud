'use client';
import { FormEventHandler, useState } from "react";
import { toast } from "react-toastify";
import { LoginActionResult } from "@/app/login/page";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";

export const LoginForm = ({login}: { login: (email: string, password: string) => Promise<LoginActionResult> }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지
    const res = await login(email, password); // 이메일과 비밀번호 전달
    console.log(res)
    if (res.userStatus) {
      toast.success(res.userStatus);

    } else if (res.errorMessage) {
      toast.error(res.errorMessage);
      setErrorText(res.errorMessage);
    }

  };


  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <label htmlFor="email">이메일</label>
      <input
        className="text-black"
        type="text"
        id="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="mt-2" htmlFor="password">
        비밀번호
      </label>
      <input
        className="text-black"
        type="password"
        id="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="mt-8 bg-white text-black py-1 active:scale-95" type="submit">
        로그인하기
      </button>
      <div>
        {errorText}
      </div>
    </form>
  );
};
