'use client'
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // TODO: 하드코딩 수정
    const dialogInfo = {
      route: "/studios/9",
      hideForeverMessage: "다시 보지 않기",
      imageUrl: "https://picsum.photos/250/250",
      imageRatio: 0.8,
    }
    // window.KloudEvent?.showDialog(JSON.stringify(dialogInfo))
  }, []);

  return <></>
}


export interface KloudDialog {
  route: string;
  menus?: KloudMenu[];
  imageUrl?: string;
  imageRatio?: number;
  hideForeverMessage?: string;
}

export interface KloudMenu {
  id: KloudMenuId;
}

export enum KloudMenuId {
  Confirm = 'Confirm',
  Cancel = 'Cancel',
}