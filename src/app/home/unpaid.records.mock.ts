// TODO(2026-10-30) ★★★ main 배포 전 반드시 바꿔야 함 ★★★
// 홈 미납 결제건 목 — UI 확인용 임시 코드. 지금은 환경과 무관하게 무조건 켜져 있어(unpaidRecordsMockEnabled = true)
// 운영에 이대로 나가면 미납이 없는 모든 유저에게 홈 진입마다 가짜 미납 다이얼로그가 뜬다.
// GET /home 이 unpaidPaymentRecords 를 실제로 내려주면: 이 파일 삭제 + home.bands.ts 의 import·withUnpaidRecordsMock 호출 줄 삭제.
// (HomeUnpaidDialog 는 서버 값을 그대로 쓰게 돼 있어 그 외엔 손댈 곳 없음)
import { HomeUnpaidPaymentRecordResponse } from "@/app/endpoint/home.endpoint";
import { GetStudioResponse, StudioRegularClassResponse } from "@/app/endpoint/studio.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import { resolveRegularClassImage } from "@/utils/regular.class.image";

/** TODO(2026-10-30) ★ 반드시 바꿀 것 — 환경 무관하게 무조건 켠다(develop 배포에서 UI 확인용). 서버가 내려주기 시작하면 서버 값이 우선되지만, 빈 배열이면 여전히 가짜가 뜬다 */
export const unpaidRecordsMockEnabled = () => true;

/**
 * 서버가 미납건을 주면 그대로, 비어 있으면 가짜 1건 — 이 스튜디오 첫 정규반을 미납된 것으로 꾸민다(결제하기가 실제 정규반 결제 페이지로 가도록).
 * 사진은 정규반 이미지 > 담당 강사 > 학원 로고(resolveRegularClassImage), 스튜디오는 내 스튜디오.
 * 정규반 밴드가 없으면 이름만 가짜고 route 는 반 id 0 이라 결제 페이지가 '상품을 찾을 수 없음'을 띄울 수 있다(UI 확인용).
 */
export const withUnpaidRecordsMock = (
  records: HomeUnpaidPaymentRecordResponse[],
  regularClasses: StudioRegularClassResponse[],
  studio?: GetStudioResponse,
): HomeUnpaidPaymentRecordResponse[] => {
  if (records.length > 0) return records;
  const rc = regularClasses[0];
  return [{
    id: -9001,
    paymentId: null,
    productName: rc?.name ?? '화·목 정규반',
    productImageUrl: resolveRegularClassImage(rc, studio),
    productDescription: '주 2회 · 10.04 ~ 11.03',
    amount: 180000,
    route: KloudScreen.RegularClassPayment(rc?.id ?? 0),
    studio: studio ? { id: studio.id, name: studio.name, profileImageUrl: studio.profileImageUrl } : null,
  }];
};
