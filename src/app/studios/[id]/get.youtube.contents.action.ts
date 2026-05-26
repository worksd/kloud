'use server'

import { YoutubeContentResponse } from "@/app/endpoint/studio.endpoint";

type RawSnippet = {
  resourceId?: { videoId?: string };
  title?: string;
  description?: string;
  publishedAt?: string;
  thumbnails?: {
    default?: { url?: string };
    medium?: { url?: string };
    high?: { url?: string };
  };
};

// YouTube playlistItems 호출 — 채널 업로드 재생목록("UU" + channelKey)에서 최근 N개.
// 실패/빈 결과/타임아웃은 모두 빈 배열로 폴백 → 호출부는 length 체크로 영역 숨김 처리.
export async function getYoutubeContents(channelKey: string | null | undefined, maxResults = 3): Promise<YoutubeContentResponse[]> {
  if (!channelKey) return [];
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const playlistId = `UU${channelKey}`;
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json() as { items?: { snippet?: RawSnippet }[] };
    return (data.items ?? [])
      .map((item) => {
        const s = item.snippet ?? {};
        const videoId = s.resourceId?.videoId ?? '';
        if (!videoId) return null;
        return {
          videoId,
          title: s.title ?? '',
          description: s.description ?? '',
          thumbnailUrl:
            s.thumbnails?.high?.url ??
            s.thumbnails?.medium?.url ??
            s.thumbnails?.default?.url ??
            '',
          publishedAt: s.publishedAt ?? '',
        } satisfies YoutubeContentResponse;
      })
      .filter((v): v is YoutubeContentResponse => v !== null);
  } catch {
    return [];
  }
}
