import NotificationForm from "@/app/notifications/notification.form";
import { TopToolbar } from "@/shared/top.toolbar";

export default function Notification(props: any) {
  return (
    <div style={{
      backgroundColor: 'white',
      color: 'white',
      height: '100vh',
      display: 'flex',
      background: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    }}>
      <TopToolbar title="공지"/>
      <NotificationForm/>
    </div>
  );
}