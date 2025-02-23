'use server'
import { api } from "@/app/api.client";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import { UserType } from "@/entities/user/user.type";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";

export const updateUserAction = async ({name, nickName, phone}: {
  name?: string,
  nickName?: string,
  phone?: string,
}): Promise<{ success: boolean, errorCode?: string, errorMessage?: string, user?: GetUserResponse }> => {

  try {
    const userId = Number((await cookies()).get(userIdKey)?.value)
    if (isNaN(userId)) throw Error('User Id가 없습니다' + userId)
    const res = await api.user.update({
      name: name,
      nickName: nickName,
      id: userId,
      type: UserType.Default,
      phone: phone,
    });
    if ('id' in res) {
      return {
        success: true,
        user: res,
      }
    } else {
      return {
        success: false,
        errorCode: res.code,
        errorMessage: res.message,
      }
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      errorCode: ExceptionResponseCode.UNKNOWN_ERROR
    }
  }
}