import WhiteTicketIcon from "../../../public/assets/ic_ticket_white.svg";
import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

// 홈 플로팅 버튼 — 내 학원의 정규반·패스권 탭 페이지(/studios/:id/programs)로. 탭은 페이지가 고르고, 버튼 문구는 그 페이지 제목으로 넘긴다.
// 문구는 GET /home 응답 최상위 ctaText(학원 판매 상품에 맞춘 BE 문구). 안 내려오거나 빈 값이면 버튼을 아예 숨긴다.
export async function PassPurchaseButton({ studioId, ctaText }: { studioId?: number; ctaText?: string | null }) {
  const text = ctaText?.trim();
  if (!studioId || !text) return null;

  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.StudioPrograms(studioId, undefined, text)}>
      <div
        className="flex flex-row w-full text-white px-4 py-3 rounded-[100px] items-center font-bold bg-[#2A2A2A] space-x-2.5 text-[14px] active:scale-[0.98] transition-all duration-150 select-none font-paperlogy">
        <WhiteTicketIcon/>
        <div>{text}</div>
      </div>
    </NavigateClickWrapper>
  );
}
