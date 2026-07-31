import { PricePolicyResponse } from "@/app/endpoint/payment.endpoint";

/**
 * TODO: 배포 전 반드시 목업 해제할 것 — 이 파일 삭제 + UnifiedPaymentInfo의 MOCK_PRICE_POLICIES 폴백 제거.
 *
 * 가격정책 목업 — BE 연동 전 UI 확인용.
 *
 * ⚠️ item=lesson 결제 페이지 '전부'에 이 가격이 노출되고, 결제 버튼 금액까지 이 값으로 바뀐다.
 * 실제 수업 가격과 무관한 가짜 값이라 이대로 프로덕션에 나가면 잘못된 금액으로 결제된다.
 *
 * 해제 방법 —
 *   1) BE가 lesson.pricePolicies를 내려주면 실데이터가 우선이라 목업은 자동으로 안 쓰인다
 *   2) 그래도 폴백 자체를 남겨두면 안 됨 — 응답 누락 시 조용히 가짜 가격으로 돌아간다.
 *      이 파일과 UnifiedPaymentInfo의 폴백 한 줄을 반드시 지울 것.
 */
export const MOCK_PRICE_POLICIES: PricePolicyResponse[] = [
  {
    id: 9001,
    count: 1,
    price: 35_000,
  },
  {
    id: 9002,
    count: 4,
    price: 120_000,
    originalPrice: 140_000,
    description: '주 1회 4주 과정',
    expiryDays: 60,
  },
  {
    id: 9003,
    count: 8,
    price: 200_000,
    originalPrice: 280_000,
    description: '주 2회 4주 과정',
    badge: '최대 할인',
    recommended: true,
    expiryDays: 90,
  },
];
