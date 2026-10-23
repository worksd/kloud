/**
 * 연말 리캡 응답 — 아직 서버 API 가 없어 recap.mock.ts 로 그린다.
 * 서버가 생기면 이 타입을 endpoint 로 옮기고 page.tsx 에서 mock 대신 api 응답을 넘기면 된다.
 */
export type RecapGenre = { name: string; count: number };

export type RecapPerson = {
  id: number;
  name: string;
  profileImageUrl?: string;
  /** 강사는 함께한 수업 수, 스튜디오는 방문 수 */
  count: number;
};

export type RecapLesson = { title: string; artistName: string; count: number };

export type RecapDancerType = {
  code: string;
  title: string;
  description: string;
  keywords: string[];
  /** 3D 블롭·그라데이션에 쓰는 대표 색 2개 */
  colors: [string, string];
};

/**
 * 리캡은 스튜디오 단위 — 수치·강사·장르·랭크 전부 이 스튜디오 안에서 집계한 것이다 (Kloud 전체 아님).
 */
export type RecapResponse = {
  year: number;
  nickName: string;
  studio: { id: number; name: string; profileImageUrl?: string };
  totalLessons: number;
  totalMinutes: number;
  /** 많이 들은 순 최대 5개 */
  topGenres: RecapGenre[];
  /** 많이 함께한 강사 순 최대 5명 — [0] 이 최애 강사 */
  topArtists: RecapPerson[];
  /** 많이 들은 수업 순 최대 3개 (같은 정규반·반복 수업 기준) */
  topLessons: RecapLesson[];
  /** 1~12월 수업 수 (길이 12) */
  monthlyLessons: number[];
  firstLesson?: { date: string; title: string; artistName: string };
  /** 한 주도 빠짐없이 수업을 들은 최장 연속 주 */
  longestStreakWeeks: number;
  /** 이 스튜디오 수강생 중 상위 N% (수업 수 기준) */
  topPercent: number;
  dancerType: RecapDancerType;
};
