'use server'
import { revalidateTag } from 'next/cache'

export async function removeLessonCache(id: number) {
  revalidateTag(`lesson:${id}`) // ✅ 서버에서 호출
}