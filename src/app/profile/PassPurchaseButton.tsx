import WhiteTicketIcon from "../../../public/assets/ic_ticket_white.svg";
import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

// 홈 플로팅 버튼 — 내 학원의 정규반·패스권 탭 페이지(/studios/:id/programs)로. 탭은 페이지가 고른다.
export async function PassPurchaseButton({ studioId }: { studioId?: number }) {
  if (!studioId) return null;

  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.StudioPrograms(studioId)}>
      <div
        className="flex flex-row w-full text-white px-4 py-3 rounded-[100px] items-center font-bold bg-[#2A2A2A] space-x-2.5 text-[14px] active:scale-[0.98] transition-all duration-150 select-none font-paperlogy">
        <WhiteTicketIcon/>
        <div>{await translate('home_programs_button')}</div>
      </div>
    </NavigateClickWrapper>
  );
}
