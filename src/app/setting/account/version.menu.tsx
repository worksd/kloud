import React from "react";
import { useLocale } from "@/hooks/useLocale";
import { translate } from "@/utils/translate";

export async function VersionMenu({version} : {version: string}) {
  return (
    <div
      className="flex justify-between items-center bg-white px-4 py-4 cursor-pointer border-gray-200 active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
    >
      <div className="text-gray-800">{await translate('app_version')}</div>
      <div className="text-gray-400">{version}</div>
    </div>
  )
}