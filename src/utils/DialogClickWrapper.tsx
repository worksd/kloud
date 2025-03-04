'use client';

import { createDialog, DialogId } from "@/utils/dialog.factory";

interface DialogClickItemProps {
  id: DialogId
  children: React.ReactNode;
}

export function DialogClickWrapper({ id, children }: DialogClickItemProps) {
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