import { TopToolbar } from '@/shared/top.toolbar';
import NotificationForm from "@/app/notifications/notification.form";

export default function NotificationPage() {
  return (
    <>
      <TopToolbar title="알림" />
      <main className="flex flex-col bg-white">
        <NotificationForm />
      </main>
    </>
  );
} 