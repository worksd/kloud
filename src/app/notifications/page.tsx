import NotificationForm from "@/app/notifications/notification.form";
import { api } from "@/app/api.client";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";

export default async function NotificationPage() {
  const res = await api.notification.get({});

  if (!('notifications' in res)) {
    throw Error();
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader titleResource={'notification'}/>
      </div>
      <NotificationForm notifications={res.notifications}/>
    </main>
  );
}