'use server'
import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";

export async function createDialog(id: DialogId, message?: string): Promise<DialogInfo | undefined> {
  if (id == 'Logout') {
    return {
      id: 'Logout',
      type: 'YESORNO',
      title: await translate('log_out'),
      message: await translate('log_out_dialog_message'),
      route: KloudScreen.Login,
      confirmTitle: await translate('confirm'),
      cancelTitle: await translate('cancel'),
    }
  }
  else if (id == 'UnderDevelopment') {
    return {
      id: 'UnderDevelopment',
      type: 'SIMPLE',
      title: await translate('rawgraphy'),
      confirmTitle: await translate('confirm'),
      message: await translate('under_development_message'),
    }
  }
  else if (id == 'LoginFail') {
    return {
      id: 'LoginFail',
      type: 'SIMPLE',
      title: await translate('fail_login'),
      message: message ?? '',
      confirmTitle: await translate('confirm'),
    }
  }
  else if (id == 'ChangeLocale') {
    return {
      id: 'ChangeLocale',
      type: 'YESORNO',
      title: await translate('change_locale_dialog_title'),
      message: message ?? '',
      confirmTitle: await translate('confirm'),
      cancelTitle: await translate('cancel'),
    }
  }
  else if (id == 'ChangeEndpoint') {
    return {
      id: 'ChangeEndpoint',
      type: 'YESORNO',
      title: '서버 전환',
      message: message ?? '',
      confirmTitle: await translate('confirm'),
      cancelTitle: await translate('cancel'),
    }
  }
}

export type DialogId = 'Logout' | 'UnderDevelopment' | 'LoginFail' | 'ChangeLocale' | 'ChangeEndpoint';
type DialogType = 'YESORNO' | 'SIMPLE'
type DialogInfo = {
  id: DialogId
  type: DialogType
  title: string
  message: string
  route?: string
  confirmTitle?: string
  cancelTitle?: string
}