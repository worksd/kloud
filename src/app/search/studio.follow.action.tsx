'use server'
import { api } from "@/app/api.client";
import { StudioFollowResponse } from "@/app/endpoint/studio.follow.endpoint";

export const toggleFollowStudio = async ({studioId, follow}: {
  studioId: number,
  follow?: StudioFollowResponse
}): Promise<{ success: boolean, follow?: StudioFollowResponse, message?: string }> => {
  console.log(studioId)
  console.log(follow)
  if (!follow) {
    const res = await followStudio({studioId})
    if ('id' in res) {
      return {
        success: true,
        follow: res,
        message: '팔로우하였습니다',
      }
    }
  } else if (follow) {
    await unFollowStudio({followId: follow.id})
    return {
      success: true,
      follow: undefined,
      message: '팔로우를 취소하였습니다',
    }
  }
  return {
    success: false,
    follow: undefined,
    message: undefined,
  }
}

export async function followStudio({studioId}: { studioId: number }) {
  return await api.studioFollow.create({studioId})
}

export async function unFollowStudio({followId}: { followId: number }) {
  return await api.studioFollow.delete({id: followId})
}