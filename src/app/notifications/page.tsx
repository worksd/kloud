import NotificationForm from "@/app/notifications/notification.form";
import { api } from "@/app/api.client";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { handleApiError } from "@/utils/handle.api.error";
import { TokenExpiredRedirect } from "@/app/components/TokenExpiredRedirect";

export default async function NotificationPage() {
  const res = await api.notification.get({});

  if (!('notifications' in res)) {
    const result = await handleApiError(res, 'GET /notifications');
    if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect />;
    return null;
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