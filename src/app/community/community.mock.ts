// 커뮤니티 — 연습실 스튜디오. 목록/상세/홀·슬롯은 실 API로 이관됨.
// 아직 실 API 소스가 없는 편의시설·이용권·공지만 정적(mock/default)으로 유지.

// 스튜디오에서 구매 가능한 이용권(패스권)
export type CommunityPass = {
  id: number;
  name: string;
  description?: string;
  price: number;
  /** 유효기간 라벨 (예: '30일') */
  period?: string;
  tag?: string; // '인기' 등 배지
};

// 스튜디오 공지사항
export type CommunityNotice = {
  date?: string; // YYYY-MM-DD (announcement 실데이터엔 날짜 없음 → 옵셔널)
  title: string;
  content?: string;
};

// 편의시설 — 실 API 필드 없음. 정적 기본 목록.
export const defaultCommunityAmenities = (): string[] => [
  '주차 가능', '와이파이', '에어컨', '탈의실', '급수시설',
];

// 스튜디오별 공지가 없으면 쓰는 기본 공지 목록 (Mock)
export const defaultCommunityNotices = (): CommunityNotice[] => [
  { date: '2026-07-10', title: '7월 정기 휴무 안내', content: '매월 셋째 주 월요일은 시설 점검으로 휴무입니다. 예약에 참고 부탁드립니다.' },
  { date: '2026-07-01', title: '전 홀 에어컨 필터 교체 완료', content: '쾌적한 연습 환경을 위해 모든 홀의 에어컨 필터를 새로 교체했습니다.' },
  { date: '2026-06-20', title: '주말 이용 시간 연장', content: '토·일요일 이용 종료 시간이 24시까지로 연장되었습니다.' },
];

// 스튜디오별 이용권이 없으면 쓰는 기본 이용권 목록 (Mock)
export const defaultCommunityPasses = (studioId: number): CommunityPass[] => [
  { id: studioId * 100 + 1, name: '한 달 자유 이용권', description: '30일 동안 예약 없이 자유롭게 이용', price: 300000, period: '30일', tag: '인기' },
  { id: studioId * 100 + 2, name: '월 100시간 이용권', description: '한 달간 총 100시간 이용', price: 200000, period: '30일' },
  { id: studioId * 100 + 3, name: '10회 이용권', description: '원하는 날 10회 이용 (1회 2시간)', price: 150000, period: '60일' },
];
