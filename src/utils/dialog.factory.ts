'use server'
import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";

export async function createDialog(id: DialogId, message?: string, title?: string,): Promise<DialogInfo | undefined> {
  const userId = (await cookies()).get(userIdKey)?.value
  console.log(`userId = ${ userId } DialogId = ${id} message = ${message} title = ${title}`)
  if (id == 'Logout') {
    return {
      id: id,
      type: 'YESORNO',
      title: await translate('log_out'),
      message: await translate('log_out_dialog_message'),
      route: KloudScreen.Login(''),
      confirmTitle: await translate('confirm'),
      cancelTitle: await translate('cancel'),
    }
  } else if (id == 'UnderDevelopment') {
    return {
      id: id,
      type: 'SIMPLE',
      title: await translate('rawgraphy'),
      confirmTitle: await translate('confirm'),
      message: await translate('under_development_message'),
    }
  } else if (id == 'LoginFail') {
    return {
      id: id,
      type: 'SIMPLE',
      title: await translate('fail_login'),
      message: message ?? '',
      confirmTitle: await translate('confirm'),
    }
  } else if (id == 'ChangeLocale') {
    return {
      id: id,
      type: 'YESORNO',
      title: await translate('change_locale_dialog_title'),
      message: message ?? '',
      confirmTitle: await translate('confirm'),
      cancelTitle: await translate('cancel'),
    }
  } else if (id == 'ChangeEndpoint') {
    return {
      id: id,
      type: 'YESORNO',
      title: '서버 전환',
      message: message ?? '',
      confirmTitle: await translate('confirm'),
      cancelTitle: await translate('cancel'),
    }
  } else if (id == 'SignUpFail') {
    return {
      id: id,
      type: 'SIMPLE',
      title: await translate('fail_sign_up'),
      message: message ?? '',
      confirmTitle: await translate('confirm'),
    }
  } else if (id == 'CertificationMismatch') {
    return {
      id: id,
      type: 'SIMPLE',
      title: await translate('mismatch_personal_information_title'),
      message: await translate('mismatch_personal_information_message'),
      confirmTitle: await translate('confirm')
    }
  } else if (id == 'AccountTransfer') {
    return {
      id: `AccountTransfer`,
      type: 'YESORNO',
      title: await translate('account_transfer'),
      message: message ?? '',
      confirmTitle: await translate('confirm'),
      cancelTitle: await translate('cancel'),
    }
  } else if (id == 'PaymentFail') {
    return {
      id: 'PaymentFail',
      type: 'SIMPLE',
      title: await translate('payment_fail'),
      message: message ?? await translate('payment_fail_message'),
      confirmTitle: await translate('confirm'),
    }
  } else if (id == 'UsePass') {
    return {
      id: 'UsePass',
      type: 'YESORNO',
      title: await translate('use_pass'),
      message: message ?? '',
      confirmTitle: await translate('confirm'),
      cancelTitle: await translate('cancel'),
    }
  } else if (id == 'EmptyDepositor') {
    return {
      id: 'EmptyDepositor',
      type: 'SIMPLE',
      title: await translate('account_transfer'),
      message: await translate('input_depositor_message'),
      confirmTitle: await translate('confirm'),
    }
  } else if (id == 'SignOut') {
    return {
      id: 'SignOut',
      type: 'YESORNO',
      title: await translate('sign_out'),
      message: await translate('sign_out_dialog_message'),
      route: KloudScreen.Login(''),
      confirmTitle: await translate('confirm'),
      cancelTitle: await translate('cancel'),
    }
  } else if (id == 'CertificationSuccess') {
    return {
      id: 'CertificationSuccess',
      type: 'SIMPLE',
      title: await translate('certification_success_title'),
      message: await translate('certification_success_message'),
      confirmTitle: await translate('confirm'),
    }
  } else if (id == 'EmptyAccountInformation') {
    return {
      id: 'EmptyAccountInformation',
      type: 'SIMPLE',
      title: await translate('refund_account'),
      message: await translate('empty_account_information_message'),
      confirmTitle: await translate('confirm'),
    }
  } else if (id == 'RefundAccountUpdateSuccess') {
    return {
      id: 'RefundAccountUpdateSuccess',
      type: 'SIMPLE',
      title: await translate('refund_account'),
      message: await translate('refund_account_update_success_message'),
      confirmTitle: await translate('confirm'),
    }
  } else if (id == 'CertificationEmail') {
    return {
      id: 'CertificationEmail',
      type: 'YESORNO',
      title: await translate('certificate_email_message'),
      message: message ?? '',
      confirmTitle: await translate('confirm'),
      cancelTitle: await translate('cancel'),
    }
  } else if (id == 'CertificationFail') {
    return {
      id: 'CertificationFail',
      type: 'SIMPLE',
      title: await translate('certification_code'),
      message: await translate('certification_code_mismatch'),
      confirmTitle: await translate('confirm'),
    }
  } else if (id == 'Simple') {
    return {
      id: 'Simple',
      type: 'SIMPLE',
      title: title ?? '',
      message: message ?? '',
      confirmTitle: await translate('confirm'),
    }
  } else if (id == 'AppUpgrade') {
    return {
      id: 'AppUpgrade',
      type: 'SIMPLE',
      title: title ?? '',
      message: message ?? '',
      confirmTitle: await translate('confirm'),
    }
  } else if (id == 'ForeignerVerificationRequest') {
    return {
      id: 'ForeignerVerificationRequest',
      type: 'YESORNO',
      title: 'Foreigner Certification',
      message: message ?? '',
      confirmTitle: await translate('confirm'),
      cancelTitle: await translate('cancel'),
    }
  } else if (id == 'CertificationComplete') {
    return {
      id: 'CertificationComplete',
      type: 'SIMPLE',
      title: await translate('certification_complete_message'),
      message: message ?? '',
      confirmTitle: await translate('confirm')
    }
  } else if (id == 'SkipCertification') {
    return {
      id: 'SkipCertification',
      type: 'YESORNO',
      title: await translate('skip_certification_title'),
      message: await translate('skip_certification_message'),
      confirmTitle: await translate('confirm'),
      cancelTitle: await translate('cancel'),
    }
  }
}

export type DialogId =
  'Logout'
  | 'UnderDevelopment'
  | 'LoginFail'
  | 'SignUpFail'
  | 'ChangeLocale'
  | 'ChangeEndpoint'
  | 'CertificationMismatch'
  | 'AccountTransfer'
  | 'PaymentFail'
  | 'UsePass'
  | 'SignOut'
  | 'EmptyDepositor'
  | 'CertificationSuccess'
  | 'EmptyAccountInformation'
  | 'RefundAccountUpdateSuccess'
  | 'CertificationEmail'
  | 'CertificationFail'
  | 'Simple'
  | 'AppUpgrade'
  | 'ForeignerVerificationRequest'
  | 'CertificationComplete'
  | 'SkipCertification'

type DialogType = 'YESORNO' | 'SIMPLE'
export type DialogInfo = {
  id: DialogId
  type: DialogType
  title: string
  message: string
  route?: string
  confirmTitle?: string
  cancelTitle?: string
}

export const createAccountTransferMessage = async ({
                                                     title,
                                                     price,
                                                     depositor,

                                                   }: {
  title: string;
  price: number;
  depositor: string;
}): Promise<DialogInfo | undefined> => {

  const message = await translate('account_transfer_dialog_message')

  const transformMessage = message
    .replace('{title}', title)
    .replace('{price}', new Intl.NumberFormat('ko-KR').format(price))
    .replace('{depositor}', depositor);

  console.log(transformMessage)

  return createDialog('AccountTransfer', transformMessage);
};