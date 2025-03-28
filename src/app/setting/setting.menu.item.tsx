'use client'
import RightArrowIcon from "../../../public/assets/right-arrow.svg"
import { StringResourceKey } from "@/shared/StringResource";
import { translate } from "@/utils/translate";
import { useLocale } from "@/hooks/useLocale";

export const MenuItem = ({label}: { label: StringResourceKey }) => {
  const { t } = useLocale()
  return (
    <div
      className="flex justify-between items-center bg-white px-4 py-4 cursor-pointer border-gray-200 active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
    >
      <div className="text-gray-800">{t(label)}</div>
      <RightArrowIcon/>
    </div>
  );
};