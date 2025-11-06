import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export const SelectablePassList = ({
                                     passItems,
                                     onSelect,
                                     selectedPassId,
                                     locale,
                                   }: {
  passItems: GetPassResponse[],
  onSelect: (pass: GetPassResponse) => void,
  selectedPassId: number | null
  locale: Locale,
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
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
};

const SelectablePassItem = ({pass, isSelected, onSelect, locale}: {
  pass: GetPassResponse,
  isSelected: boolean,
  locale: Locale,
  onSelect: () => void
}) => {
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
        <h2 className="tracking-tight">{pass.passPlan?.name}</h2>
        {pass.remainingCount &&
          <div className={'tracking-tight'}>({pass.remainingCount}{getLocaleString({
            locale,
            key: 'remaining_count'
          })})</div>
        }
      </div>
    </div>
  )
}