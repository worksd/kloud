import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { TranslatableText } from "@/utils/TranslatableText";
import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";

export const SelectablePassList = ({
                                     passItems,
                                     onSelect,
                                     selectedPassId,
                                   }: {
  passItems: GetPassResponse[],
  onSelect: (pass: GetPassResponse) => void,
  selectedPassId: number | null
}) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex flex-row min-w-min text-black space-x-6 py-6 px-4">
        {passItems.map((item) => (
          <SelectablePassItem
            key={item.id}
            pass={item}
            isSelected={selectedPassId === item.id}
            onSelect={() => onSelect(item)}
          />
        ))}
      </div>
    </div>
  );
};

const SelectablePassItem = ({pass, isSelected, onSelect}: {
  pass: GetPassResponse,
  isSelected: boolean,
  onSelect: () => void
}) => {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, [])
  if (!mounted) return null;
  return (
    <div
      className={`bg-white rounded-3xl p-6 flex-shrink-0 transition-all duration-200 select-none cursor-pointer 
        shadow-sm hover:shadow-md
        ${isSelected
        ? 'border-2 border-black ring-2 ring-black/5'
        : 'border border-gray-100 hover:border-gray-200'}`}
      onClick={onSelect}
    >
      <div className="flex flex-row items-center text-center font-bold text-xl ">
        <h2 className="tracking-tight">{pass.passPlan?.name} ({pass.remainingCount}{mounted ? t('remaining_count') : ''})</h2>
      </div>
    </div>
  )
}