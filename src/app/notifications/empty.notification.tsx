import React from "react";
import { translate } from "@/utils/translate";

export async function EmptyNotifications() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center rounded-lg pb-36">
      <h2 className="text-black font-semibold text-[24px]">{await translate("empty_notification_title")}</h2>
      <p className="text-gray-500 text-[16px]">{await translate('empty_notification_description')}</p>
    </div>
  );
}