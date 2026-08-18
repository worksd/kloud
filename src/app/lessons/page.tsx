import { redirect } from "next/navigation";

// 수업 목록 홈은 루트(/)로 이동 — 구 링크/북마크 호환용 리다이렉트만 남긴다.
// ?login=true 등 쿼리는 보존한다 (로그인 다이얼로그 오픈 파라미터가 유실되지 않게).
export default async function LessonsPage({searchParams}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') params.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
  }
  const qs = params.toString();
  redirect(qs ? `/?${qs}` : '/');
}
