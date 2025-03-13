import Image from "next/image";
import { GetNotificationResponse } from "@/app/endpoint/notification.endpoint";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { getLocale } from "@/utils/translate";
import { StringResource } from "@/shared/StringResource";

export const NotificationItem = ({
                                   index,
                                   length,
                                   notification
                                 }: {
  index: number,
  length: number,
  notification: GetNotificationResponse
}) => {
  return (
    <NavigateClickWrapper method='push' route={notification.route}>
      <div className={`flex flex-row p-4 gap-3 cursor-pointer active:scale-[0.98] active:bg-gray-100 transition-all duration-150 
        ${index === length - 1 ? '' : 'border-b border-gray-100'}`}>
        {notification.thumbnailUrl && (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <Image src={notification.thumbnailUrl} alt="알림" fill className="object-cover"/>
          </div>
        )}
        <div className="flex flex-col flex-1">
          <span className="text-base font-bold text-black mb-1">{notification.title}</span>
          <p className="text-sm text-gray-600 mb-1">{notification.body}</p>
          <span className="text-xs text-gray-400">{formatTimeAgo(notification.createdAt)}</span>
        </div>
      </div>

    </NavigateClickWrapper>
  );
};

async function formatTimeAgo(dateInput: string | Date): Promise<string> {
  let date: Date;
  const locale = await getLocale()

  if (typeof dateInput === 'string') {
    date = new Date(dateInput.replace(/\./g, '-')); // "2025.02.24 10:45" -> "2025-02-24 10:45"
  } else {
    date = dateInput;
  }

  const diff = (new Date()).getTime() - date.getTime(); // 밀리초 단위 차이
  const seconds = Math.floor(diff / 1000); // 초 단위 변환
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return StringResource['just_now'][locale];
  if (minutes < 60) return StringResource['minutes_ago'][locale].replace("{n}", String(minutes));
  if (hours < 24) return StringResource['hours_ago'][locale].replace("{n}", String(hours));
  return StringResource['days_ago'][locale].replace("{n}", String(days));
}