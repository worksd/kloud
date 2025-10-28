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
      rrn: getRrnByBirthAndGender({gender, birth}),
      country: country,
      refundAccountNumber: refundAccountNumber,
      refundAccountBank: refundAccountBank,
      refundDepositor: refundDepositor,
      emailVerified: emailVerified,
      password: password,
      countryCode: COUNTRIES.find((value) => value.key == countryCode)?.dial ?? '82',
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

const getRrnByBirthAndGender = (
  {birth, gender}: { birth?: string; gender?: 'male' | 'female' | '' }
): string | undefined => {
  // 형식 체크
  if (!birth || !gender || !/^\d{8}$/.test(birth)) {
    return undefined;
  }

  const year = Number(birth.slice(0, 4));
  const yy = birth.slice(2, 4);
  const mm = birth.slice(4, 6);
  const dd = birth.slice(6, 8);

  // 유효한 날짜인지 간단 체크
  const d = new Date(`${year}-${mm}-${dd}`);
  const isValidDate =
    d.getFullYear() === year &&
    String(d.getMonth() + 1).padStart(2, '0') === mm &&
    String(d.getDate()).padStart(2, '0') === dd;

  if (!isValidDate) {
    throw new Error('유효한 날짜가 아닙니다.');
  }

  let digit: number;
  if (year >= 1900 && year <= 1999) {
    digit = gender === 'male' ? 1 : 2;
  } else if (year >= 2000 && year <= 2099) {
    digit = gender === 'male' ? 3 : 4;
  } else if (year >= 1800 && year <= 1899) {
    digit = gender === 'male' ? 9 : 0; // 참고용(거의 사용되지 않음)
  } else {
    throw new Error('지원되지 않는 연도입니다. (1800~2099)');
  }

  // YYMMDD-<성별/세기 식별자>
  return `${yy}${mm}${dd}-${digit}`;
};