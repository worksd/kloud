'use client'
import React from "react";
import { useLocale } from "@/hooks/useLocale";

export function EmptyNotifications() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col min-h-screen items-center justify-center rounded-lg pb-36">
      <h2 className="text-black font-semibold text-[24px]">{t("empty_notification_title")}</h2>
      <p className="text-gray-500 text-[16px]">{t('empty_notification_description')}</p>
    </div>
  );
}