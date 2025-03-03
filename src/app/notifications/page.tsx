import NotificationForm from "@/app/notifications/notification.form";
import { TopToolbar } from "@/shared/top.toolbar";
import { getNotificationListAction } from "@/app/notifications/get.notification.list.action";

export default async function Notification(props: any) {
  const res = await getNotificationListAction()
  if ('notifications' in res) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col">
        <div className="sticky top-0 z-10 bg-white">
          <TopToolbar title="notification"/>
        </div>
        <div className="flex-1">
          <NotificationForm notifications={res.notifications}/>
        </div>
      </div>
    );
  }
  else {
    throw Error()
  }
}