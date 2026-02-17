import WhiteTicketIcon from "../../../public/assets/ic_ticket_white.svg";
import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export async function PassPurchaseButton({ studioId }: { studioId?: number }) {
  const route = studioId
    ? KloudScreen.PurchasePass(studioId)
    : KloudScreen.HasPassStudioList;

  return (
    <NavigateClickWrapper method={'push'} route={route}>
      <div
        className="flex flex-row w-full text-white px-4 py-3 rounded-[100px] items-center font-bold bg-[#2A2A2A] space-x-2.5 text-[14px] active:scale-[0.98] transition-all duration-150 select-none font-paperlogy">
        <WhiteTicketIcon/>
        <div>{await translate('purchase_pass_simple')}</div>
      </div>
    </NavigateClickWrapper>
  );
}
