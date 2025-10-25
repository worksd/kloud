'use client'
import React, { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";

export const InputComponent = ({
                                 label,
                                 placeholder,
                                 requireText,
                                 value,
                                 onValueChangeAction,
                               }: {
  label: string,
  placeholder: string,
  requireText?: string,
  value: string,
  onValueChangeAction: (value: string) => void,
}) => {
  const {t} = useLocale();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, [])
  if (!mounted) return;
  return (
    <div className={'text-black'}>
      {/* 이름 입력 */}
      <div className="text-black">
        <div className="flex items-center gap-1 mb-2">
          <div className="text-[14px] font-medium">{label}</div>
          {requireText &&
            <div className="text-[10px] text-[#E55B5B]">{requireText}</div>
          }
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChangeAction(e.target.value)}
          placeholder={placeholder}
          className="w-full text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md mb-2 p-4"
        />
      </div>
    </div>
  )
}