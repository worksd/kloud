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
    <div className="flex flex-col gap-2 mt-3">
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
      className={`rounded-xl px-4 py-3.5 transition-all duration-200 select-none cursor-pointer
        active:scale-[0.98]
        ${isSelected
        ? 'border-[1.5px] border-black bg-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
        : 'border border-[#E8E8E8] bg-white text-black'}`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className={`text-[15px] font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
            {pass.passPlan?.name}
          </div>
          {pass.remainingCount != null && (
            <div className={`text-[12px] font-medium ${isSelected ? 'text-white/60' : 'text-[#999]'}`}>
              {pass.remainingCount}{getLocaleString({locale, key: 'remaining_count'})}
            </div>
          )}
        </div>
        {/* 선택 인디케이터 */}
        <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
          ${isSelected ? 'border-white bg-white' : 'border-[#D1D5DB]'}`}>
          {isSelected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
