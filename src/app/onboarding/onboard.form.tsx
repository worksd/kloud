'use client';
import { FormEventHandler } from "react";
import { KloudScreen } from "@/shared/kloud.screen";

export const OnboardForm = () => {
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지

    if (typeof window !== 'undefined') {
      window.KloudEvent.navigate(KloudScreen.Main)
    }
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <button className="mt-8 bg-white text-black py-1 active:scale-95" type="submit">
        온보딩 완료하기
      </button>
    </form>
  )
}