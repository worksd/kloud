import TicketIcon from "../../../public/assets/ic_ticket.svg";
import { KloudScreen, NO_DATA_ID } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export async function PassPurchaseButton() {
  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.PurchasePass(NO_DATA_ID)}>
      <div
        className="flex flex-row w-full border border-[#A4A4A4] text-black px-4 py-3 rounded-[8px] items-center font-bold space-x-2.5 text-[14px] active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none">
        <div
          className="w-[32px] h-[32px] rounded-full overflow-hidden flex-shrink-0 bg-[#F3F3F4] flex items-center justify-center">
          <TicketIcon/>
        </div>
        <div>{await translate('purchase_pass')}</div>
      </div>
    </NavigateClickWrapper>
  );
}
