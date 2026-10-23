import { RecapResponse } from "@/app/recap/recap.types";

// TODO(2026-10-23): 리캡 API 나오면 삭제 — 지금은 화면 확인용 목 데이터
export const recapMock: RecapResponse = {
  year: 2026,
  nickName: '두리',
  // 진입한 스튜디오로 page.tsx 가 덮어쓴다 — 이건 studioId 없이 들어왔을 때의 기본값
  studio: { id: 0, name: '원밀리언 댄스 스튜디오' },
  totalLessons: 87,
  totalMinutes: 7830,
  topGenres: [
    { name: '힙합', count: 34 },
    { name: '코레오', count: 28 },
    { name: '걸스힙합', count: 12 },
    { name: '왁킹', count: 8 },
    { name: '락킹', count: 5 },
  ],
  topArtists: [
    // 1위만 실제 강사 활동명·프로필 사진을 빌려 씀 (목 전용). 2~5위는 가상 이름 — 사진 없으면 이니셜 아바타
    { id: 23, name: 'HOJUN', profileImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1782394237532.jpg', count: 21 },
    { id: -2, name: '루미', count: 14 },
    { id: -3, name: '제로', count: 11 },
    { id: -4, name: '하루', count: 9 },
    { id: -5, name: '비비', count: 7 },
  ],
  topLessons: [
    { title: '힙합 정규반 A', artistName: 'HOJUN', count: 16 },
    { title: 'Choreography Basic', artistName: '루미', count: 12 },
    { title: '걸스힙합 입문', artistName: '제로', count: 9 },
  ],
  monthlyLessons: [4, 6, 9, 7, 5, 8, 12, 14, 6, 9, 5, 2],
  firstLesson: { date: '2026-01-04', title: 'Choreography Basic', artistName: '리아' },
  longestStreakWeeks: 14,
  topPercent: 3,
  dancerType: {
    code: 'NIGHT_FIGHTER',
    title: '새벽반 파이터',
    description: '남들이 잠들 때 거울 앞에 서는 당신.\n밤 9시 이후 수업이 절반을 넘었어요.',
    keywords: ['#야간러', '#꾸준함', '#땀범벅'],
    colors: ['#7C3AED', '#EC4899'],
  },
};
