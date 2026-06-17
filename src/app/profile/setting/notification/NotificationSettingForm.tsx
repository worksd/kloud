'use client';

import React, { useState, useTransition } from 'react';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { updateNotificationSettingsAction } from '@/app/profile/setting/notification/notification.settings.actions';

type ToggleKey = 'announcement' | 'event';

// 카테고리별 라벨 키 매핑 — 토스트 문구의 {label} 치환에 사용
const LABEL_KEY: Record<ToggleKey, Parameters<typeof getLocaleString>[0]['key']> = {
  announcement: 'announcement_notification',
  event: 'event_notification',
};

export const NotificationSettingForm = ({
  locale,
  initial,
}: {
  locale: Locale;
  initial: { announcement: boolean; event: boolean };
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const [values, setValues] = useState(initial);
  // text는 표시 내용, visible은 in/out 트랜지션 토글. 둘을 분리해서 unmount 전 fade-out이 보이게 함.
  const [toast, setToast] = useState<{ text: string; visible: boolean } | null>(null);
  const [, startTransition] = useTransition();

  const showToast = (text: string) => {
    // 직전 토스트가 떠 있어도 새로 시작 — 일단 hidden 상태로 마운트해두고
    setToast({ text, visible: false });
    // 다음 페인트에 visible=true로 바꿔서 슬라이드/페이드 in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setToast((cur) => (cur ? { ...cur, visible: true } : null)));
    });
    // 2.7s 후 fade-out 시작, 3s 후 완전 제거 (transition 300ms와 맞춤)
    setTimeout(() => setToast((cur) => (cur ? { ...cur, visible: false } : null)), 2700);
    setTimeout(() => setToast(null), 3000);
  };

  // 낙관적 업데이트 — 즉시 UI 반영 후 서버 PATCH. 성공 시 응답값으로 동기화 + 토스트, 실패 시 롤백.
  const toggle = (key: ToggleKey) => {
    const prev = values;
    const nextOn = !prev[key];
    setValues({ ...prev, [key]: nextOn });
    startTransition(async () => {
      try {
        const res = await updateNotificationSettingsAction({ [key]: nextOn });
        // 응답이 부분만 내려와도 안전하게 머지 — boolean 필드만 신뢰
        const r = res as { announcement?: unknown; event?: unknown };
        setValues((cur) => ({
          announcement: typeof r.announcement === 'boolean' ? r.announcement : cur.announcement,
          event: typeof r.event === 'boolean' ? r.event : cur.event,
        }));
        // 토스트는 서버가 확정한 값 기준으로 — 응답에 해당 키가 있으면 그 값, 없으면 우리가 보낸 값
        const finalOn = typeof r[key] === 'boolean' ? (r[key] as boolean) : nextOn;
        const label = t(LABEL_KEY[key]);
        const template = t(finalOn ? 'notification_turned_on' : 'notification_turned_off');
        showToast(template.replace('{label}', label));
      } catch {
        setValues(prev); // 롤백
      }
    });
  };

  return (
    <div className="flex flex-col">
      <Row
        label={t('announcement_notification')}
        checked={values.announcement}
        onToggle={() => toggle('announcement')}
      />
      <Row
        label={t('event_notification')}
        checked={values.event}
        onToggle={() => toggle('event')}
      />

      {toast && (
        <div
          className={`fixed left-1/2 bottom-10 z-20 max-w-[90%] rounded-[12px] bg-black/85 px-4 py-3 text-center text-[13px] text-white whitespace-pre-line leading-5 font-paperlogy transition-all duration-300 ease-out ${
            toast.visible
              ? 'opacity-100 -translate-x-1/2 translate-y-0'
              : 'opacity-0 -translate-x-1/2 translate-y-3'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
};

const Row = ({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) => (
  <div className="flex items-center justify-between bg-white px-6 py-4">
    <span className="text-gray-800 font-paperlogy text-[16px]">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={`relative inline-flex h-[28px] w-[48px] shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-black' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-[23px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  </div>
);
