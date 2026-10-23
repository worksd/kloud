import { RecapStory } from "@/app/recap/RecapStory";
import { recapMock } from "@/app/recap/recap.mock";
import { api } from "@/app/api.client";

// 연말 리캡 스토리 — 스튜디오 단위. 홈 인트로 다이얼로그의 '돌아보기'·마이페이지 배너로 들어온다 (ignoreSafeArea 풀스크린).
// TODO(2026-10-23): 리캡 API 나오면 recapMock 대신 서버 응답(studioId 기준 집계)을 넘긴다.
// 지금은 수치는 목 그대로, 스튜디오 이름·프로필만 실제 스튜디오로 덮어 화면 톤을 맞춘다.
export default async function RecapPage({ searchParams }: { searchParams: Promise<{ studioId?: string }> }) {
  const studioId = Number((await searchParams).studioId);
  const studio = Number.isFinite(studioId) && studioId > 0 ? await api.studio.get({ id: studioId }) : null;
  const recap = studio && 'id' in studio
    ? { ...recapMock, studio: { id: studio.id, name: studio.name, profileImageUrl: studio.profileImageUrl } }
    : recapMock;
  return <RecapStory recap={recap}/>;
}
