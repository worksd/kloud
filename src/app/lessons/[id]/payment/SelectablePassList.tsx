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
    <div className="flex flex-row x-full text-black space-x-4 py-4">
      {passItems.map((item) => (
        <SelectablePassItem
          key={item.id}
          pass={item}
          isSelected={selectedPassId === item.id}
          onSelect={() => onSelect(item)}
        />
      ))}
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
      className={`bg-white rounded-2xl p-6 border transition-all duration-150 select-none cursor-pointer 
    ${isSelected ? 'border-black' : ''}`}
      onClick={onSelect}
    >
      <div className="flex flex-row items-center justify-center text-center space-x-2">
        <div className="space-y-2">
          <div className="flex flex-col items-center space-y-2">
            <CircleImage size={24} imageUrl={pass.passPlan?.studio?.profileImageUrl}/>
            <div className="text-[16px] text-black font-medium">{pass.passPlan?.studio?.name}</div>
          </div>
          <h2 className="text-xl font-semibold">{pass.passPlan?.name}</h2>
        </div>
        {isSelected && <CheckIcon className="mt-2"/>}
      </div>
    </div>
  );
};