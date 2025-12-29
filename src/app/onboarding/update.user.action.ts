'use server'
import { api } from "@/app/api.client";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import { UserType } from "@/entities/user/user.type";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { COUNTRIES } from "@/app/certification/COUNTRIES";

export const updateUserAction = async ({
                                         name,
                                         nickName,
                                         phone,
  code,
                                         birth,
                                         gender,
                                         country,
                                         countryCode,
                                         refundAccountNumber,
                                         refundDepositor,
                                         refundAccountBank,
                                         emailVerified,
                                         password,
                                       }: {
  name?: string,
  nickName?: string,
  phone?: string,
  code?: string,
  countryCode?: string,
  country?: string,
  birth?: string,
  gender?: 'male' | 'female' | '',
  refundAccountNumber?: string;
  refundAccountBank?: string;
  refundDepositor?: string;
  emailVerified?: boolean,
  password?: string,
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
      birth,
      gender,
      country: country,
      refundAccountNumber: refundAccountNumber,
      refundAccountBank: refundAccountBank,
      refundDepositor: refundDepositor,
      emailVerified: emailVerified,
      password: password,
      countryCode: countryCode ? COUNTRIES.find((value) => value.key == countryCode)?.dial : undefined,
      code: code,
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
    return {
      success: false,
      errorCode: ExceptionResponseCode.UNKNOWN_ERROR
    }
  }
}