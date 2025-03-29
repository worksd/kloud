import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { CircleImage } from "@/app/components/CircleImage";
import CheckIcon from ".././../../../../public/assets/ic_check_black.svg"

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
  return (
    <div
      className={`bg-white rounded-3xl p-6 flex-shrink-0 transition-all duration-200 select-none cursor-pointer 
        shadow-sm hover:shadow-md
        ${isSelected
        ? 'border-2 border-black ring-2 ring-black/5'
        : 'border border-gray-100 hover:border-gray-200'}`}
      onClick={onSelect}
    >
      <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-bold tracking-tight">{pass.passPlan?.name}</h2>
      </div>
    </div>
  )
}