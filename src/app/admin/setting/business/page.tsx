import React from 'react';
import { requireAdmin } from '@/app/admin/admin.guard';
import { getMyStudioBusinessAction } from '@/app/admin/setting/studio.setting.action';
import { LoadFailed } from '@/app/admin/setting/SettingKit';
import { BusinessForm } from '@/app/admin/setting/business/BusinessForm';

// 관리자 설정 > 사업자·계좌 — GET /studios/me/business 로 읽고 PATCH /studios 로 저장.
export default async function AdminSettingBusinessPage() {
  const { studioName } = await requireAdmin();
  const business = await getMyStudioBusinessAction();
  if (!business) return <LoadFailed title={'사업자·계좌'} subtitle={studioName}/>;
  return <BusinessForm initial={business} studioName={studioName}/>;
}
