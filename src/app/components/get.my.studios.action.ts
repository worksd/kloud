'use server'
import { api } from "@/app/api.client";

// PC 웹 LNB '내 스튜디오' 하위 스튜디오 목록 (GET /studios/my).
// 실패/비로그인은 빈 배열 — LNB는 서브 리스트 없이 그리면 그만이라 에러를 밖으로 던지지 않는다.
export const getMyStudiosAction = async () => {
  try {
    const res = await api.studio.my({});
    if (res && typeof res === 'object' && 'studios' in res) {
      return res.studios.map((s) => ({ id: s.id, name: s.name, profileImageUrl: s.profileImageUrl }));
    }
    return [];
  } catch {
    return [];
  }
};
