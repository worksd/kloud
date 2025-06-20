'use client';

import { createDialog, DialogId, DialogInfo } from "@/utils/dialog.factory";
import { useEffect } from "react";
import { unregisterDeviceAction } from "@/app/home/action/unregister.device.action";
import { clearCookies } from "@/app/profile/clear.token.action";

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
        window.KloudEvent.clearAndPush(data.route)
      }
    }
  }, [])
  return (
    <div
      onClick={async () => {
        const dialogInfo = await createDialog({ id} )
        if (dialogInfo) {
          window.KloudEvent.showDialog(JSON.stringify(dialogInfo))
        }
      }}
    >
      {children}
    </div>
  );
}