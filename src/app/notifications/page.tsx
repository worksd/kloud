import NotificationForm from "@/app/notifications/notification.form";
import { TopToolbar } from "@/shared/top.toolbar";

export default function Notification(props: any) {
  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="sticky top-0 z-10 bg-white">
        <TopToolbar title="알림"/>
      </div>
      <div className="flex-1">
        <NotificationForm/>
      </div>
    </div>
  );
}