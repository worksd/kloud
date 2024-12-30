'use client';
import { FormEventHandler } from "react";
import { KloudScreen } from "@/shared/kloud.screen";

export const OnboardForm = () => {
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지

    if (typeof window !== 'undefined') {
      window.KloudEvent.navigateMain()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white px-6">
      <header className="flex items-center gap-2 py-4">
        <button className="text-lg text-black">←</button>
        <h1 className="text-lg text-black font-semibold">서비스를 위해 동의해 주세요!</h1>
      </header>

      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <span className="text-lg text-black font-medium">모두 동의하기</span>
          <input type="checkbox" className="w-5 h-5 accent-gray-400"/>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">[필수] 서비스 이용약관</span>
            <input type="checkbox" className="w-5 h-5 accent-gray-400"/>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700">[필수] 개인정보 수집 및 이용동의</span>
            <input type="checkbox" className="w-5 h-5 accent-gray-400"/>
          </div>
        </div>
      </main>
      <footer className="py-4">
        <button
          className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg text-lg"
          disabled
        >
          시작하기
        </button>
      </footer>
    </div>
  )
}

export type BootInfo = {
  label: string;
  labelSize: number;
  labelColor: string;
  iconUrl: string;
  iconSize: number;
  url: string;
};