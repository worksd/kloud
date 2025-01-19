'use client'
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // TODO: 하드코딩 수정
    const dialogInfo = {
      id: "LessonLandingDialog",
      type: "image",
      route: "/lessons/9",
      hideForeverMessage: "오늘 하루 보지 않기",
      imageUrl: "https://data-rawgraphy.s3.us-east-1.amazonaws.com/vita.png",
      imageRatio: 0.8,
      ctaButtonText: '이벤트 바로가기'
    }
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo))
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