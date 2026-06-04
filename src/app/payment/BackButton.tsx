'use client';

import BackIcon from "../../../public/assets/ic_back.svg";

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="flex"
    >
      <BackIcon className="w-6 h-6 text-black"/>
    </button>
  );
}
