/**
 * 회사(로우그래피) 정보 — PC 웹 푸터 등 법적 표기용 단일 출처.
 *
 * 파트너스 웹(utils/company.ts · i18n legal.*)과 같은 값·같은 문구를 쓴다 — 두 곳이 갈리면 안 된다.
 * 값이 바뀌면 이 파일 하나만 고치되, 파트너스 웹도 함께 고쳐야 한다(현재는 양쪽 다 상수).
 * 장기적으로는 BE가 한 곳에서 내려주는 형태(GET /app/footer)가 권장안 — 전달 가이드 5절.
 *
 * ⚠️ 스튜디오 각각의 사업자 정보(businessName 등)와 다른 값이다. 섞지 말 것.
 */
export const COMPANY_INFO = {
  /** 상호 — 라벨 없이 값만 표기 */
  name: '로우그래피 주식회사',
  representative: '서종렬',
  businessRegistrationNumber: '804-88-03066',
  eCommerceRegNumber: '2023-서울중구-1300',
  /** 주소 — 라벨 없이 값만 표기 */
  address: '서울시 강동구 진황도로 14, A동 219호',
  customerServicePhone: '050-6774-3302',
  /** 저작권 줄 영문 표기. 연도는 하드코딩하지 말고 렌더 시점에 new Date().getFullYear() */
  copyrightName: 'Rawgraphy Inc.',
} as const;

export const LEGAL_LINKS = {
  privacy: 'https://hello.rawgraphy.com/ko/privacy',
  terms: 'https://hello.rawgraphy.com/ko/terms',
  // 패치노트는 파트너스 전용 — 수강생 화면엔 넣지 않는다 (가이드 2절)
} as const;
