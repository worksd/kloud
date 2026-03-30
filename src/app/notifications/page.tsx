import NotificationForm from "@/app/notifications/notification.form";
import { api } from "@/app/api.client";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { sendErrorToDiscord } from "@/utils/discord.webhook";

export default async function NotificationPage() {
  const res = await api.notification.get({});

  if (!('notifications' in res)) {
    const message = `GET /notifications 실패: ${JSON.stringify(res)}`;
    await sendErrorToDiscord(new Error(message), { pathname: '/notifications', route: '/notifications' });
    throw Error(message);
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