import RightArrowIcon from "../../../public/assets/right-arrow.svg"
import React from "react";
import { StringResourceKey } from "@/shared/StringResource";
import { translate } from "@/utils/translate";

/** icon: 왼쪽 플랫 아이콘(설정 메뉴에서 사용). 없으면 라벨만 — 계정 설정 등 기존 화면은 그대로 */
export const MenuItem = async ({label, icon}: { label: StringResourceKey, icon?: React.ReactNode }) => {

  return (
    <div
      className="flex justify-between items-center bg-white px-6 py-3 cursor-pointer border-gray-200 hover:bg-gray-50 active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* 아이콘 감싸는 라운드 스퀘어 — 프로필 '내 활동'(ActivityRow)과 같은 규격 */}
        {icon && (
          <span className="w-[42px] h-[42px] rounded-[14px] bg-[#F7F8FA] flex items-center justify-center shrink-0">
            {icon}
          </span>
        )}
        <span className="text-gray-800 truncate">{await translate(label)}</span>
      </div>
      <RightArrowIcon/>
    </div>
  );
};