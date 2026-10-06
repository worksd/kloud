import React from 'react';
import { api } from '@/app/api.client';
import { requireAdmin } from '@/app/admin/admin.guard';
import { getMyStudioProfileAction } from '@/app/admin/setting/studio.setting.action';
import { LoadFailed } from '@/app/admin/setting/SettingKit';
import { ProfileForm } from '@/app/admin/setting/profile/ProfileForm';

// 관리자 설정 > 학원 정보 — 프로필(이름·연락처·주소·SNS·slug) + 편의시설.
// 편의시설 현재값은 GET /studios/me/profile 에 없어 GET /studios/:id 에서 가져온다.
export default async function AdminSettingProfilePage() {
  const { studioName, studioId } = await requireAdmin();
  const [profile, detail] = await Promise.all([
    getMyStudioProfileAction(),
    studioId != null ? api.studio.get({ id: studioId }) : Promise.resolve(null),
  ]);
  if (!profile) return <LoadFailed title={'학원 정보'} subtitle={studioName}/>;

  const amenities = detail && 'id' in detail ? (detail.amenities ?? []) : [];
  return <ProfileForm initial={profile} amenities={amenities} studioName={studioName}/>;
}
