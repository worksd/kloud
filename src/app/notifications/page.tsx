import NotificationForm from "@/app/notifications/notification.form";
import { translate } from "@/utils/translate";
import { api } from "@/app/api.client";

export default async function NotificationPage() {
  const res = await api.notification.get({});

  if (!('notifications' in res)) {
    throw Error();
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white p-4">
        <h1 className="text-2xl text-black">{await translate('notification')}</h1>
      </header>
      <NotificationForm notifications={res.notifications}/>
    </main>
  );
}