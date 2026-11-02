// 커뮤니티 — 연습실 스튜디오 상세가 쓰는 이용권·공지 표시 타입.

// 스튜디오에서 구매 가능한 이용권(패스권)
export type CommunityPass = {
  id: number;
  name: string;
  description?: string;
  /** PriceHidden 패스권은 null — 금액 숨김·앱 결제 불가 */
  price: number | null;
  /** 유효기간 라벨 (예: '30일') */
  period?: string;
  tag?: string; // '인기' 등 배지
};

// 스튜디오 공지사항
export type CommunityNotice = {
  date?: string; // YYYY-MM-DD (announcement 실데이터엔 날짜 없음 → 옵셔널)
  title: string;
  content?: string;
  imageUrl?: string | null;
  createdAt?: string | null; // 작성 시각(ISO 또는 'yyyy.MM.dd HH:mm') — 상대 표기용
};
