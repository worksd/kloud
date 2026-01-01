'use server'
import { revalidatePath } from 'next/cache'

export async function purgeAllCacheAction() {
  try {
    // 모든 경로의 캐시를 무효화
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Failed to purge cache:', error)
    return { success: false, error: String(error) }
  }
}

