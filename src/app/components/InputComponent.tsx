'use client'
import { TranslatableText } from "@/utils/TranslatableText";
import React, { useEffect, useState } from "react";
import { StringResourceKey } from "@/shared/StringResource";
import { useLocale } from "@/hooks/useLocale";

export const InputComponent = ({
  labelResource,
  isRequired,
  value,
  onValueChangeAction,
  placeholderResource,
                               }: {
  labelResource: StringResourceKey,
  placeholderResource: StringResourceKey,
  isRequired: boolean,
  value: string,
  onValueChangeAction: (value: string) => void,
}) => {
  const { t } = useLocale();
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
          <TranslatableText titleResource={labelResource} className="text-[14px] font-medium"/>
          {isRequired &&
            <TranslatableText titleResource={'required'} className="text-[10px] text-[#E55B5B]"/>
          }
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChangeAction(e.target.value)}
          placeholder={mounted ? t(placeholderResource) : ''}
          className="w-full text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md mb-2 p-4"
        />
      </div>
    </div>
  )
}