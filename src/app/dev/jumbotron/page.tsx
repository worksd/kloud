// TODO(2026-10-23): 점보트론 목 미리보기 페이지 — UI 확인용 임시 코드. 서버 필드(openDate·saleStartDate·level·remainingSeats) 붙으면 main 배포 전 반드시 삭제할 것.
import { notFound } from "next/navigation";
import { Jumbotron } from "@/app/home/Jumbotron";
import { JUMBOTRON_MOCK } from "@/app/home/jumbotron.mock";

/** 점보트론 디자인 미리보기 — 목 데이터 상태별 한 장씩 + 실제 캐러셀. 운영에선 404 */
export default function JumbotronPreview() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <div className="w-full bg-white py-4 flex flex-col gap-6">
      {JUMBOTRON_MOCK.map(m => <Jumbotron key={m.id} items={[m]} locale="ko" />)}
      <Jumbotron items={JUMBOTRON_MOCK} locale="ko" />
    </div>
  );
}
