'use server'

// 탑바 검색창 추천 검색어 — 타이핑 디바운스마다 호출되므로 실패는 조용히 빈 배열로.
import { api } from "@/app/api.client";

export const getSearchSuggestionsAction = async (keyword: string): Promise<string[]> => {
  const trimmed = keyword.trim();
  if (!trimmed) return [];
  try {
    const res = await api.search.suggestions({ keyword: trimmed });
    return 'keywords' in res ? res.keywords : [];
  } catch {
    return [];
  }
}
