'use client'

import { Ref } from "react";

export const CommonLoginInputBox = ({
                                      value,
                                      placeholder,
                                      handleChangeAction,
                                      maxLength,
                                      inputMode,
                                      ref,
                                    }: {
  value: string;
  placeholder?: string;
  handleChangeAction: (value: string) => void;
  maxLength?: number;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search" | undefined;
  ref?: Ref<HTMLInputElement>;
}) => {

  return (
    <div
      className="
      relative w-full rounded-[16px] border border-gray-200 bg-white px-4 py-3 shadow-sm
      transition-[border-color,box-shadow] duration-200
      focus-within:border-black
    "
    >
      <input
        ref={ref}
        type="text"
        inputMode={inputMode}
        className="w-full bg-transparent pr-12 text-[16px] font-medium text-black placeholder:text-[#8B95A1] outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (!maxLength || v.length <= maxLength) {
            handleChangeAction(v);
          }
        }}
      />
    </div>
  );

};