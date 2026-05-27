// app/api/cache/purge-lesson/route.ts
// lesson-detail 캐시(endpoint.client.ts CACHE_RULES) 무효화 전용 route handler.
// server action이 아니라 route handler라서 호출해도 현재 페이지(/payment) RSC refresh가
// 트리거되지 않음 → 결제 직후 호출해도 GET /payment 재호출(TICKET_ALREADY_EXISTS) 부작용 없음.
import { revalidateTag } from 'next/cache'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { lessonId } = await req.json()
  // @ts-ignore - Next.js 16 type definition issue
  revalidateTag(`lesson:${lessonId}`)
  return Response.json({ ok: true })
}
