'use client'

import React, { Ref, useRef } from "react";

export const CommonLoginInputBox = ({
                                      value,
                                      placeholder,
                                      handleChangeAction,
                                      maxLength,
                                      inputMode,
                                      ref,
                                      clearable,
                                    }: {
  value: string;
  placeholder?: string;
  handleChangeAction: (value: string) => void;
  maxLength?: number;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search" | undefined;
  ref?: Ref<HTMLInputElement>;
  /** true면 값이 있을 때 오른쪽에 X 버튼 노출. 클릭 시 값 비우고 포커스 복귀. */
  clearable?: boolean;
}) => {
  // React 19의 readonly RefObject 타입 회피 — innerRef.current 직접 할당이 막혀 있어 unknown 캐스팅.
  const innerRef = useRef<HTMLInputElement | null>(null);
  const setRef = (el: HTMLInputElement | null) => {
    (innerRef as unknown as { current: HTMLInputElement | null }).current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as unknown as { current: HTMLInputElement | null }).current = el;
  };

  const showClear = !!clearable && value.length > 0;

  return (
    <div
      className="
      relative w-full rounded-[16px] border border-gray-200 bg-white px-4 py-3 shadow-sm
      transition-[border-color,box-shadow] duration-200
      focus-within:border-black
    "
    >
      <input
        ref={setRef}
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
      {showClear && (
        <button
          type="button"
          aria-label="지우기"
          // onMouseDown으로 처리해 input blur 발생 전에 클릭이 등록되게 함 (포커스 유지 효과)
          onMouseDown={(e) => {
            e.preventDefault();
            handleChangeAction('');
            innerRef.current?.focus({ preventScroll: true });
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#D1D5DB] flex items-center justify-center active:bg-[#9CA3AF] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>
      )}
    </div>
  );

};
