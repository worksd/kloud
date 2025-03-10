'use client'
import React, { useRef, useState } from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

export const VersionMenu = ({title, version}: { title: string, version: string }) => {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  const clickVersionMenu = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTimeRef.current;

    // 1초 이내에 클릭했다면 카운트 초기화
    if (timeDiff < 1000 && lastClickTimeRef.current !== 0) {
      clickCountRef.current = 0;
      lastClickTimeRef.current = 0;
      return;
    }

    // 클릭 카운트 증가
    clickCountRef.current += 1;
    lastClickTimeRef.current = currentTime;

    // 5번 클릭 달성시 개발자 모드 활성화
    if (clickCountRef.current === 5) {
      setIsDeveloperMode(true);
      clickCountRef.current = 0;
      lastClickTimeRef.current = 0;
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

      {isDeveloperMode &&
        <NavigateClickWrapper method={'push'} route={KloudScreen.DeveloperSetting}>

          <div
            className="flex justify-between items-center bg-white px-4 py-4 cursor-pointer border-gray-200 active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
          >
            <div className="text-gray-800">개발자모드</div>
          </div>

        </NavigateClickWrapper>
      }
    </div>
  )
}