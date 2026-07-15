// 커뮤니티 — "연습실을 제공하는 스튜디오"를 홍보하는 목록/상세 (댄스 강습 스튜디오와 별개).
// 실제 API 나오기 전 임시 Mock. API 연동 시 이 파일 대신 서버 액션으로 교체.
export type HeelDance = 'impossible' | 'after_protection' | 'possible';

export const HEEL_DANCE_LABEL: Record<HeelDance, string> = {
  impossible: '힐 댄스 불가능',
  after_protection: '보양 후 힐 댄스 가능',
  possible: '힐 댄스 가능',
};

// 스튜디오 내 개별 홀(연습실)
export type CommunityHall = {
  id: number;
  name: string;
  description: string;
  maxNumber: number;
  /** 가로·세로·높이 (m) */
  dimensions: { width: number; depth: number; height: number };
  heelDance: HeelDance;
  pricePerHour: number;
  imageUrl?: string;
};

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
  date: string; // YYYY-MM-DD
  title: string;
  content?: string;
};

// 연습실을 제공하는 스튜디오
export type CommunityStudio = {
  id: number;
  name: string;
  address: string;
  imageUrl?: string;
  images?: string[];
  description?: string;
  amenities?: string[]; // 주차, 와이파이, 에어컨 등 스튜디오 공통 편의시설
  notices?: CommunityNotice[];
  notes?: string[];
  halls: CommunityHall[];
  passes?: CommunityPass[];
};

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

export const MOCK_COMMUNITY_STUDIOS: CommunityStudio[] = [
  {
    id: 1,
    name: '라운지 스튜디오',
    address: '서울 강남구 테헤란로 123, 5층',
    imageUrl: 'https://picsum.photos/seed/studio1/500/500',
    images: ['https://picsum.photos/seed/studio1/800/600', 'https://picsum.photos/seed/studio1b/800/600', 'https://picsum.photos/seed/studio1c/800/600'],
    description: '층고가 높고 채광이 좋은 대형 연습실을 제공하는 스튜디오입니다. 전면 거울과 음향 시설이 완비되어 있어요.',
    amenities: ['주차 가능', '와이파이', '에어컨', '탈의실', '급수시설'],
    notes: ['건물 내 화장실 이용 가능', '이용 종료 후 정리 부탁드립니다'],
    halls: [
      {
        id: 101, name: 'A홀 (대형)',
        description: '10m 이상 통유리 거울과 프리미엄 음향을 갖춘 대형 홀. 팀 연습·워크샵에 적합합니다.',
        maxNumber: 20, dimensions: { width: 10, depth: 8, height: 3.2 }, heelDance: 'possible', pricePerHour: 30000,
        imageUrl: 'https://picsum.photos/seed/hall101/600/400',
      },
      {
        id: 102, name: 'B홀 (중형)',
        description: '적당한 크기로 소규모 팀 연습에 좋은 홀. 발레바가 설치되어 있습니다.',
        maxNumber: 10, dimensions: { width: 7, depth: 6, height: 3.0 }, heelDance: 'after_protection', pricePerHour: 20000,
        imageUrl: 'https://picsum.photos/seed/hall102/600/400',
      },
    ],
  },
  {
    id: 2,
    name: '미러룸 스튜디오',
    address: '서울 마포구 양화로 45, 지하 1층',
    imageUrl: 'https://picsum.photos/seed/studio2/500/500',
    images: ['https://picsum.photos/seed/studio2/800/600', 'https://picsum.photos/seed/studio2b/800/600'],
    description: '거울이 넓어 개인 연습에 최적인 연습실을 운영합니다.',
    amenities: ['와이파이', '에어컨', '음향 · 마이크'],
    notes: ['엘리베이터 없음 (지하 1층)'],
    halls: [
      {
        id: 201, name: '미러룸',
        description: '전면·측면 거울로 자세 확인이 쉬운 개인 연습 특화 룸.',
        maxNumber: 8, dimensions: { width: 6, depth: 5, height: 2.7 }, heelDance: 'after_protection', pricePerHour: 18000,
        imageUrl: 'https://picsum.photos/seed/hall201/600/400',
      },
    ],
  },
  {
    id: 3,
    name: '성수 발레 스튜디오',
    address: '서울 성동구 성수이로 77, 3층',
    imageUrl: 'https://picsum.photos/seed/studio3/500/500',
    images: ['https://picsum.photos/seed/studio3/800/600', 'https://picsum.photos/seed/studio3b/800/600'],
    description: '전문 발레바와 마룻바닥을 갖춘 발레 특화 스튜디오입니다.',
    amenities: ['주차 가능', '와이파이', '에어컨', '발레바'],
    notes: ['힐 착용 불가 (마룻바닥 보호)'],
    halls: [
      {
        id: 301, name: '발레홀 1',
        description: '스프링 마룻바닥과 양면 발레바를 갖춘 정통 발레홀.',
        maxNumber: 12, dimensions: { width: 8, depth: 7, height: 3.0 }, heelDance: 'impossible', pricePerHour: 25000,
        imageUrl: 'https://picsum.photos/seed/hall301/600/400',
      },
      {
        id: 302, name: '발레홀 2 (소형)',
        description: '개인 레슨·소규모 연습에 적합한 아담한 발레홀.',
        maxNumber: 5, dimensions: { width: 5, depth: 4, height: 2.8 }, heelDance: 'impossible', pricePerHour: 16000,
        imageUrl: 'https://picsum.photos/seed/hall302/600/400',
      },
    ],
  },
  {
    id: 4,
    name: '판교 더그라운드',
    address: '경기 성남시 분당구 판교로 200',
    imageUrl: 'https://picsum.photos/seed/studio4/500/500',
    images: ['https://picsum.photos/seed/studio4/800/600'],
    description: '넓은 주차 공간과 대형 홀을 갖춘 연습실 전문 스튜디오입니다.',
    amenities: ['주차 가능', '와이파이', '에어컨', '삼각대', '탈의실', '급수시설'],
    notes: ['엘리베이터 이용 가능'],
    halls: [
      {
        id: 401, name: '그라운드 홀',
        description: '30명까지 수용 가능한 초대형 홀. 공연 리허설·촬영에 적합합니다.',
        maxNumber: 30, dimensions: { width: 12, depth: 10, height: 3.5 }, heelDance: 'possible', pricePerHour: 40000,
        imageUrl: 'https://picsum.photos/seed/hall401/600/400',
      },
    ],
  },
  {
    id: 5,
    name: '이태원 루프탑 스튜디오',
    address: '서울 용산구 이태원로 88, 옥상',
    imageUrl: 'https://picsum.photos/seed/studio5/500/500',
    images: ['https://picsum.photos/seed/studio5/800/600', 'https://picsum.photos/seed/studio5b/800/600'],
    description: '탁 트인 뷰의 루프탑 연습실을 제공합니다. 촬영에도 좋아요.',
    amenities: ['와이파이', '삼각대', '음향 · 마이크'],
    notes: ['우천 시 이용 제한'],
    halls: [
      {
        id: 501, name: '루프탑 홀',
        description: '자연광과 도심 뷰가 있는 야외형 홀. 화보·영상 촬영에 인기.',
        maxNumber: 15, dimensions: { width: 9, depth: 7, height: 2.8 }, heelDance: 'after_protection', pricePerHour: 28000,
        imageUrl: 'https://picsum.photos/seed/hall501/600/400',
      },
    ],
  },
  {
    id: 6,
    name: '서초 코너 스튜디오',
    address: '서울 서초구 서초대로 300, 2층',
    imageUrl: 'https://picsum.photos/seed/studio6/500/500',
    images: ['https://picsum.photos/seed/studio6/800/600'],
    description: '접근성 좋은 역세권 소형 연습실을 제공합니다.',
    amenities: ['와이파이', '에어컨'],
    notes: ['건물 내 화장실 이용 가능'],
    halls: [
      {
        id: 601, name: '코너룸',
        description: '역세권 소형 룸. 1~2인 개인 연습에 딱 좋습니다.',
        maxNumber: 6, dimensions: { width: 5, depth: 4, height: 2.6 }, heelDance: 'possible', pricePerHour: 15000,
        imageUrl: 'https://picsum.photos/seed/hall601/600/400',
      },
    ],
  },
];

export const getMockCommunityStudio = (id: number): CommunityStudio | undefined =>
  MOCK_COMMUNITY_STUDIOS.find((s) => s.id === id);
