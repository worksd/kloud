'use server';

import { api } from '@/app/api.client';

export const getNotificationSettingsAction = async () => {
  return await api.notification.getSettings({});
};

export const updateNotificationSettingsAction = async (patch: { announcement?: boolean; event?: boolean }) => {
  return await api.notification.updateSettings(patch);
};
