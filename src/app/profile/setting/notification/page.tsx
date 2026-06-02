import { NotificationSettingForm } from '@/app/profile/setting/notification/NotificationSettingForm';
import { getLocale } from '@/utils/translate';
import { getNotificationSettingsAction } from '@/app/profile/setting/notification/notification.settings.actions';

export default async function NotificationSettingPage() {
  const locale = await getLocale();
  const res = await getNotificationSettingsAction();
  // 응답 형상 가드 — BE가 에러 객체를 내려줄 수도 있어 boolean 필드 존재 여부로 판별, 기본값 ON
  const initial = {
    announcement: (res as { announcement?: boolean })?.announcement ?? true,
    event: (res as { event?: boolean })?.event ?? true,
  };
  return (
    <div className="flex flex-col w-screen min-h-screen bg-white">
      <NotificationSettingForm locale={locale} initial={initial}/>
    </div>
  );
}
