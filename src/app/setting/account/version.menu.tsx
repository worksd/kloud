'use client'
import React, { useRef, useState } from "react";
import { KloudScreen } from "@/shared/kloud.screen";

export const VersionMenu = ({title, version}: { title: string, version: string }) => {

  const clickCountRef = useRef(0);

  const clickVersionMenu = () => {
    // 클릭 카운트 증가
    clickCountRef.current += 1;

    // 5번 클릭 달성시 개발자 모드 활성화
    if (clickCountRef.current === 5) {
      window.KloudEvent.showBottomSheet(KloudScreen.DeveloperAuthentication);
      clickCountRef.current = 0; // 카운트 초기화
    }
  }

  return (
    <div className={"flex flex-col"}>
      <div
        className="flex justify-between items-center bg-white px-4 py-4 cursor-pointer border-gray-200 active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
        onClick={() => clickVersionMenu()}
      >
        <div className="text-gray-800">{title}</div>
        <div className="text-gray-400">{version}</div>
      </div>
    </div>
  )
}