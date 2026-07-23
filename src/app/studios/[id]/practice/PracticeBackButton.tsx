'use client';

import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import LeftArrow from "../../../../../public/assets/left-arrow.svg";

// 스튜디오 상세와 동일한 백버튼 (위치·UI·기능).
export function PracticeBackButton() {
  return (
    <NavigateClickWrapper method={'back'}>
      <button
        type="button"
        aria-label="뒤로가기"
        className={[
          // 스크롤해도 화면 좌상단에 고정
          'fixed left-3 top-10 z-20',
          // 큰 터치 타깃 + 반투명 배경
          'inline-flex h-10 w-10 items-center justify-center rounded-full',
          'backdrop-blur text-white shadow',
        ].join(' ')}
      >
        <LeftArrow className="h-5 w-5" />
      </button>
    </NavigateClickWrapper>
  );
}
