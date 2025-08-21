// app/api/cache/purge-lesson/route.ts
import { revalidateTag } from 'next/cache'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { lessonId } = await req.json()
  revalidateTag(`lesson:${lessonId}`)
  return Response.json({ ok: true })
}