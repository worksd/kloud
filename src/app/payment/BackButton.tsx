'use client';

import BackArrowIcon from "../../../public/assets/ic_back_arrow.svg";

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      aria-label="back"
      className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 backdrop-blur shadow-sm active:scale-95 transition-transform"
    >
      <BackArrowIcon className="w-5 h-5 text-black"/>
    </button>
  );
}
