import { api } from "@/app/api.client";
import { getLocale } from "@/utils/translate";
import { handleApiError } from "@/utils/handle.api.error";
import { TokenExpiredRedirect } from "@/app/components/TokenExpiredRedirect";
import { notFound } from "next/navigation";
import { getArtistLessonsAction } from "@/app/artistLessons/actions";
import { ArtistLessonsList } from "@/app/artistLessons/ArtistLessonsList";

// 강사가 진행한 수업 목록 — 강사 연결 계정(me.artist) 전용.
export default async function ArtistLessonsPage() {
  const me = await api.user.me({});

  if (!('id' in me)) {
    const result = await handleApiError(me, 'GET /users/me');
    if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect />;
    return null;
  }

  // 강사로 연결되지 않은 계정은 이 화면이 없는 것과 같다 (딥링크 방어)
  const artistId = me.artist?.id;
  if (artistId == null) notFound();

  const [first, locale] = await Promise.all([
    getArtistLessonsAction({ artistId, page: 1 }),
    getLocale(),
  ]);

  return (
    <ArtistLessonsList
      artistId={artistId}
      initialLessons={first.lessons}
      totalPage={first.totalPage}
      locale={locale}
    />
  );
}
