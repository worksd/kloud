import React from 'react';
import { requireAdmin } from '@/app/admin/admin.guard';
import { getMyStudioLessonSettingsAction } from '@/app/admin/setting/studio.setting.action';
import { LoadFailed } from '@/app/admin/setting/SettingKit';
import { LessonSettingsForm } from '@/app/admin/setting/lesson/LessonSettingsForm';

// 관리자 설정 > 수업·결제 — 공개/판매 일정, 마감, 자동취소, 수강권 규칙, 결제수단.
export default async function AdminSettingLessonPage() {
  const { studioName } = await requireAdmin();
  const settings = await getMyStudioLessonSettingsAction();
  if (!settings) return <LoadFailed title={'수업·결제 설정'} subtitle={studioName}/>;
  return <LessonSettingsForm initial={settings} studioName={studioName}/>;
}
