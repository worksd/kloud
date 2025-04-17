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
          {notification.diffStamp && <span className="text-xs text-gray-400">{notification.diffStamp}</span>}
        </div>
      </div>

    </NavigateClickWrapper>
  );
};