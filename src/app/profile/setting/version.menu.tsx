'use client'
import React, { useRef, useState } from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { kloudNav } from "@/app/lib/kloudNav";

export const VersionMenu = ({title, version, icon}: { title: string, version: string, icon?: React.ReactNode }) => {

  const clickCountRef = useRef(0);

  const clickVersionMenu = () => {
    // 클릭 카운트 증가
    clickCountRef.current += 1;

    // 5번 클릭 달성시 개발자 모드 활성화
    if (clickCountRef.current === 5) {
      kloudNav.showBottomSheet(KloudScreen.DeveloperAuthentication);
      clickCountRef.current = 0; // 카운트 초기화
    }
  }

  return (
    <div className={"flex flex-col"}>
      <div
        className="flex justify-between items-center bg-white px-6 py-3 cursor-pointer border-gray-200 hover:bg-gray-50 active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
        onClick={() => clickVersionMenu()}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* 아이콘 감싸는 라운드 스퀘어 — MenuItem·ActivityRow와 같은 규격 */}
          {icon && (
            <span className="w-[42px] h-[42px] rounded-[14px] bg-[#F7F8FA] flex items-center justify-center shrink-0">
              {icon}
            </span>
          )}
          <span className="text-gray-800 truncate">{title}</span>
        </div>
        <div className="text-gray-400">{version}</div>
      </div>
    </div>
  )
}