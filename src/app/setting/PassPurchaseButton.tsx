'use client'
import TicketIcon from "../../../public/assets/ic_ticket.svg";
import { KloudScreen } from "@/shared/kloud.screen";

export const PassPurchaseButton = () => {
  const onClickTicketIcon = () => {
    window.KloudEvent?.push(KloudScreen.Pass)
  }
  return (
    <div
      className="flex flex-row w-full border border-black text-black px-4 py-3 rounded-[8px] items-center font-bold space-x-2.5 text-[14px] active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none"
      onClick={onClickTicketIcon}>
      <div
        className="w-[32px] h-[32px] rounded-full overflow-hidden flex-shrink-0 bg-[#F3F3F4] flex items-center justify-center">
        <TicketIcon/>
      </div>
      <div>패스 구매하기</div>
    </div>
  );
};
