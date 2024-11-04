'use client';
import { useFormState } from "react-dom";
import { FormEventHandler } from "react";

export const LoginForm = ({login}: {login: any}) => {

  const [actionState, formAction] = useFormState(login, null);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    login()
  }

  return (
    <form className={'flex flex-col'} action={formAction} onSubmit={handleSubmit}>
      <label htmlFor="name">이메일</label>
      <input className={'text-black'} type="name" id="name" name="name" />
      <label className={'mt-2'} htmlFor="employee_number">
        비밀번호
      </label>
      <input className={'text-black'} type="employee_number" id="employee_number" name="employee_number" />

      <button className={'mt-8 bg-white text-black py-1 active:scale-95'} type="submit">
        로그인하기
      </button>

    </form>
  );
}