import { api } from "@/app/api.client";
import { getLocale } from "@/utils/translate";
import { handleApiError } from "@/utils/handle.api.error";
import { TokenExpiredRedirect } from "@/app/components/TokenExpiredRedirect";
import { notFound } from "next/navigation";
import { PrivateLessonCreateForm } from "@/app/privateLessons/create/PrivateLessonCreateForm";

// 강사 개인수업 개설 — GET /users/me 의 artistStudios(강사 소속 학원)가 있어야 진입 의미가 있다.
export default async function PrivateLessonCreatePage() {
  const me = await api.user.me({});

  if (!('id' in me)) {
    const result = await handleApiError(me, 'GET /users/me');
    if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect />;
    return null;
  }

  const studios = me.artistStudios ?? [];
  // 강사가 아니면 이 화면은 없는 것과 같다 (프로필 카드도 안 보이지만 딥링크 방어)
  if (studios.length === 0) notFound();

  const locale = await getLocale();
  // 수업명 자동 생성('{날짜} {강사} 개인수업')에 쓸 강사 표시명 — 강사 활동명(artist.nickName) 우선
  const artistName = me.artist?.nickName ?? me.artist?.name ?? me.nickName ?? me.name ?? '';
  return <PrivateLessonCreateForm studios={studios} artistName={artistName} locale={locale}/>;
}
