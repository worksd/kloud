import { Endpoint } from "@/app/endpoint/index";
import { ValidLessonResponse } from "@/app/endpoint/lesson.endpoint";

// 소비자 검색 — 비로그인 공개 API. keyword가 빈 값/공백이면 서버가 빈 결과를 준다(에러 아님).
// 매칭은 LIKE '%keyword%', 노출 범위는 다른 소비자 목록과 동일(개인수업·미공개·취소·테스트 제외).

export type GetSearchSuggestionsRequest = {
  keyword: string;
}

// 수업 제목 + 스튜디오 이름 합집합, 중복 제거 후 가나다순 상위 10개. 타입 구분 없음 —
// 항목 선택 시 그 문자열로 /search/contents를 다시 호출하는 흐름을 전제.
export type GetSearchSuggestionsResponse = {
  keywords: string[];
}

export const GetSearchSuggestions: Endpoint<GetSearchSuggestionsRequest, GetSearchSuggestionsResponse> = {
  method: 'get',
  queryParams: ['keyword'],
  path: '/search/suggestions',
}

export type GetSearchContentsRequest = {
  keyword: string;
}

export type SearchStudioResponse = {
  id: number;
  name: string;
  profileImageUrl?: string;
}

// 리스트별 최대 20개(페이지네이션 없음). 다가올/종료 구분은 수업 종료 시각(시작+수업시간) 기준.
// 수업 카드는 GET /lessons/valid와 완전히 같은 모양 — lastLessons의 status는 'Completed'.
export type GetSearchContentsResponse = {
  studios: SearchStudioResponse[];
  upcomingLessons: ValidLessonResponse[];
  lastLessons: ValidLessonResponse[];
}

export const GetSearchContents: Endpoint<GetSearchContentsRequest, GetSearchContentsResponse> = {
  method: 'get',
  queryParams: ['keyword'],
  path: '/search/contents',
}
