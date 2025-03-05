'use client';

import { createDialog, DialogId } from "@/utils/dialog.factory";
import { useEffect } from "react";
import { DialogInfo } from "@/app/setting/setting.menu.item";
import { unregisterDeviceAction } from "@/app/home/action/unregister.device.action";
import { clearCookies } from "@/app/setting/clear.token.action";

interface DialogClickItemProps {
  id: DialogId
  children: React.ReactNode;
}

export function DialogClickWrapper({ id, children }: DialogClickItemProps) {

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.route && data.id == 'Logout') {
        await unregisterDeviceAction()
        await clearCookies();
        localStorage.clear();
        sessionStorage.clear();
        window.KloudEvent?.clearToken()
        window.KloudEvent.clearAndPush(data.route)
      }
    }
  }, [])
  return (
    <div
      onClick={async () => {
        const dialogInfo = await createDialog(id)
        if (dialogInfo) {
          window.KloudEvent.showDialog(JSON.stringify(dialogInfo))
        }
      }}
    >
      {children}
    </div>
  );
}