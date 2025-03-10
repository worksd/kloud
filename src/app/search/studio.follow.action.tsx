'use server'
import { api } from "@/app/api.client";
import { StudioFollowResponse } from "@/app/endpoint/studio.follow.endpoint";
import { StringResource } from "@/shared/StringResource";
import { translate } from "@/utils/translate";

export const toggleFollowStudio = async ({studioId, follow}: {
  studioId: number,
  follow?: StudioFollowResponse
}): Promise<{ success: boolean, follow?: StudioFollowResponse, message?: string}> => {
  if (!follow) {
    const res = await followStudio({studioId})
    if ('id' in res) {
      return {
        success: true,
        follow: res,
        message: await translate('follow_success_message'),
      }
    }
  } else if (follow) {
    await unFollowStudio({followId: follow.id})
    return {
      success: true,
      follow: undefined,
      message: await translate('unfollow_success_message'),
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