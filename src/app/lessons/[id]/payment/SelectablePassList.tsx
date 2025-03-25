import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { CircleImage } from "@/app/components/CircleImage";

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
    <div className="flex flex-col text-black">
      <div className="flex flex-col space-y-4 py-4">
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
      className={`bg-white rounded-2xl p-6 border transition-all duration-150 select-none cursor-pointer 
        ${isSelected ? 'border-black' : ''}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="flex flex-row items-center space-x-2">
            <CircleImage size={24} imageUrl={pass.passPlan?.studio?.profileImageUrl}/>
            <div className="text-[16px] text-black font-medium">{pass.passPlan?.studio?.name}</div>
          </div>
          <h2 className="text-xl font-semibold">{pass.passPlan?.name}</h2>
        </div>
        {isSelected && <span className="text-black font-bold">✓</span>}
      </div>
    </div>
  );
};