// PoC용 mock 기준 영상. 실제 BE 연동 전 클라 단독 UI 검증용.
// videoUrl은 외부 placeholder — 운영에선 우리 스튜디오 강사 영상으로 교체.

export type ReferenceChallenge = {
  id: string;
  title: string;
  artistName: string;
  difficulty: '입문' | '초급' | '중급' | '고급';
  genre: string;
  durationSec: number;
  thumbnailUrl: string;
  videoUrl: string;
};

export const MOCK_CHALLENGES: ReferenceChallenge[] = [
  {
    id: 'ch-001',
    title: 'Lipsync — Hook 8 Count',
    artistName: 'MINSEO',
    difficulty: '입문',
    genre: 'K-Pop',
    durationSec: 16,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: 'ch-002',
    title: 'Locking Basic — Point & Up',
    artistName: 'HULK',
    difficulty: '초급',
    genre: 'Locking',
    durationSec: 24,
    thumbnailUrl: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: 'ch-003',
    title: 'House Footwork — 2-Step',
    artistName: 'JONGHYUN',
    difficulty: '중급',
    genre: 'House',
    durationSec: 32,
    thumbnailUrl: 'https://images.unsplash.com/photo-1535525153412-5a092d46af30?w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
];

export type MatchResult = {
  musicScore: number;   // 0~1
  motionScore: number;  // 0~1
  verdict: 'match' | 'mismatch' | 'review';
  totalScore: number;   // 0~100
};

const MUSIC_MATCH_THRESHOLD = 0.8;
const MUSIC_MISMATCH_THRESHOLD = 0.6;
const MOTION_MATCH_THRESHOLD = 0.75;
const MOTION_MISMATCH_THRESHOLD = 0.55;

const between = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

// mock 점수 산출 — 실제 BE 연동 시 이 함수를 API 호출로 교체.
export const runMockMatching = (): MatchResult => {
  // 살짝 매치 쪽으로 편향 (시연 시 결과가 너무 자주 mismatch면 재미 없음)
  const musicScore = between(0.55, 0.98);
  const motionScore = between(0.5, 0.95);

  let verdict: MatchResult['verdict'];
  if (musicScore >= MUSIC_MATCH_THRESHOLD && motionScore >= MOTION_MATCH_THRESHOLD) {
    verdict = 'match';
  } else if (musicScore < MUSIC_MISMATCH_THRESHOLD || motionScore < MOTION_MISMATCH_THRESHOLD) {
    verdict = 'mismatch';
  } else {
    verdict = 'review';
  }

  const totalScore = Math.round((musicScore * 0.4 + motionScore * 0.6) * 100);
  return { musicScore, motionScore, verdict, totalScore };
};
