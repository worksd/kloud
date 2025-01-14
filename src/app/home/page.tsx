'use client'
import Popup, { PopupType } from "@/app/components/popup/Popup";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    createPortal(
      <Popup
        popupType={PopupType.Event}
        message={'테스트입니다'}
        buttonText={'닫기'}
        onClose={() => {
        }}
      />,
      document.body,
    )
  )
}