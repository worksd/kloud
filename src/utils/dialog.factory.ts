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
    }
  }
  else if (id == 'UnderDevelopment') {
    return {
      id: 'UnderDevelopment',
      type: 'SIMPLE',
      title: await translate('rawgraphy'),
      message: await translate('under_development_message'),
    }
  }
  else if (id == 'LoginFail') {
    return {
      id: 'LoginFail',
      type: 'SIMPLE',
      title: await translate('fail_login'),
      message: message ?? ''
    }
  }
}

export type DialogId = 'Logout' | 'UnderDevelopment' | 'LoginFail';
type DialogType = 'YESORNO' | 'SIMPLE'
type DialogInfo = {
  id: DialogId
  type: DialogType
  title: string
  message: string
  route?: string
}