'use client';
import { FormEventHandler } from "react";
import { KloudScreen } from "@/shared/kloud.screen";

export const OnboardForm = () => {
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지

    if (typeof window !== 'undefined') {
      window.KloudEvent.navigateMain(
        `{
          bottom_menu_list: [
            {
              label: "Home",
              labelSize: 16,
              labelColor: "#FF5733",
              iconUrl: "https://example.com/icons/home.png",
              iconSize: 24,
              url: "home"
            },
            {
              label: "Profile",
              labelSize: 14,
              labelColor: "#33FF57",
              iconUrl: "https://example.com/icons/profile.png",
              iconSize: 20,
              url: "profile"
            },
            {
              label: "Settings",
              labelSize: 12,
              labelColor: "#3357FF",
              iconUrl: "https://example.com/icons/settings.png",
              iconSize: 18,
              url: "settings"
            }
          ],
          minimum_version: '1.0.0'
        }`
      )
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

export type BootInfo = {
  label: string;
  labelSize: number;
  labelColor: string;
  iconUrl: string;
  iconSize: number;
  url: string;
};