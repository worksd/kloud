import React from 'react';
import { requireAdmin } from '@/app/admin/admin.guard';
import { getMyStudioRoomSettingsAction } from '@/app/admin/setting/studio.setting.action';
import { LoadFailed } from '@/app/admin/setting/SettingKit';
import { RoomSettingsForm } from '@/app/admin/setting/room/RoomSettingsForm';

// 관리자 설정 > 연습실 — 환불 기준일, 이용안내 알림톡 문구·발송 시점.
export default async function AdminSettingRoomPage() {
  const { studioName } = await requireAdmin();
  const settings = await getMyStudioRoomSettingsAction();
  if (!settings) return <LoadFailed title={'연습실 설정'} subtitle={studioName}/>;
  return <RoomSettingsForm initial={settings} studioName={studioName}/>;
}
