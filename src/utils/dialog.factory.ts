'use server'
import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";

export async function createDialog(id: DialogId, message?: string): Promise<DialogInfo | undefined> {
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
      message: await translate('payment_fail_message'),
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
      message: '입금자명을 입력해주시길 바랍니다',
      confirmTitle: await translate('confirm'),
    }
  } else if (id == 'SignOut') {
    return {
      id: 'SignOut',
      type: 'YESORNO',
      title: await translate('sign_out'),
      message: await translate('sign_out_dialog_message'),
      route: KloudScreen.Login(''),
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
  | 'EmptyDepositor';
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