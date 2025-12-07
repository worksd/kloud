'use server'
import { revalidateTag } from 'next/cache'

export async function removeLessonCache(id: number) {
  // @ts-ignore - Next.js 16 type definition issue
  revalidateTag(`lesson:${id}`) // ✅ 서버에서 호출
}