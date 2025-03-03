'use client'
import React from "react";
import { useLocale } from "@/hooks/useLocale";

export const VersionMenu = ({version} : {version: string}) => {
  const { t } = useLocale();
  return (
    <div
      className="flex justify-between items-center bg-white px-4 py-4 cursor-pointer border-gray-200 active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
    >
      <div className="text-gray-800">{t('app_version')}</div>
      <div className="text-gray-400">{version}</div>
    </div>
  )
}