'use client';

import BackArrowIcon from "../../../public/assets/ic_back_arrow.svg";

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="absolute top-4 left-5 z-10 flex items-center justify-center"
    >
      <BackArrowIcon className="w-6 h-6 text-black"/>
    </button>
  );
}
