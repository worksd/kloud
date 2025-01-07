'use server'
import { api } from "@/app/api.client";
import { ToggleFollowActionResult } from "@/app/search/simple.studio.item";
import { ExceptionResponseCode, GuinnessErrorCaseScheme } from "@/app/guinnessErrorCase";

export const toggleFollowStudio = async (prev: ToggleFollowActionResult, formData: FormData): Promise<ToggleFollowActionResult> => {
  console.log('hi')
  if (!prev.follow) {
    console.log(prev.studioId)
    const res = await followStudio({studioId: prev.studioId})
    console.log(JSON.stringify(res))
    if ('id' in res) {
      return {
        sequence: prev.sequence + 1,
        follow: res,
        message: '팔로우하였습니다',
        studioId: prev.studioId,
      }
    }
  }
  else if (prev.follow) {
    await unFollowStudio({followId: prev.follow.id})
    return {
      sequence: prev.sequence + 1,
      follow: undefined,
      message: '팔로우를 취소하였습니다',
      studioId: prev.studioId,
    }
  }
  return {
    sequence: prev.sequence + 1,
    follow: prev.follow,
    message: undefined,
    errorCode: ExceptionResponseCode.UNKNOWN_ERROR,
    errorMessage: '알 수 없는 에러가 발생했습니다',
    studioId: prev.studioId,
  }
}

async function followStudio({studioId}: { studioId: number }) {
  return await api.studioFollow.create({studioId})
}

async function unFollowStudio({followId}: { followId: number }) {
  return await api.studioFollow.delete({id: followId})
}