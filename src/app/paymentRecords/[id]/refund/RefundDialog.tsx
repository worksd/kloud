'use client'

import { useEffect } from "react";
import { DialogInfo } from "@/utils/dialog.factory";

export const RefundDialog = ({ refundReconsiderMessage }: { refundReconsiderMessage: string }) => {
  useEffect(() => {
    if (!refundReconsiderMessage) return;
    
    const dialogInfo: DialogInfo = {
      id: 'Simple',
      type: 'SIMPLE',
      title: '환불안내',
      message: refundReconsiderMessage,
      confirmTitle: '확인',
    };
    
    if (window.KloudEvent) {
      window.KloudEvent.showDialog(JSON.stringify(dialogInfo));
    }
  }, [refundReconsiderMessage]);

  return null;
};

