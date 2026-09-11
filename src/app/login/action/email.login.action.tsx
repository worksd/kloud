'use server';
import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { RoutePageParams } from "@/app/login/action/google.login.action";
import { loginSuccessAction } from "@/app/login/action/login.success.action";
import { translate } from "@/utils/translate";

const emailLoginAction = async ({email, password}: { email: string, password: string }): Promise<RoutePageParams> => {
  try {
    const res = await api.auth.email({
      email,
      password: password,
      type: UserType.Default,
    });

    if ('user' in res) {
      await loginSuccessAction({
        accessToken: res.accessToken,
        userId: res.user.id,
      })
      return {
        success: true,
        status: res.user.status,
      };
    } else {
      return {
        success: false,
        errorCode: res.code,
        errorMessage: res.message
      }
    }
  } catch (e) {
    // 네트워크/파싱 실패 — 폼이 분기할 수 있게 코드 + 공용 문구 함께 반환
    return {
      success: false,
      errorCode: ExceptionResponseCode.UNKNOWN_ERROR,
      errorMessage: await translate('unknown_error_message'),
    }
  }
}

export default emailLoginAction