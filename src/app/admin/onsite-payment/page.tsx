import React from 'react';
import { requireAdmin } from '@/app/admin/admin.guard';
import { getLocale } from '@/utils/translate';
import { getTodayAdminLessons, todayKst } from '@/app/admin/admin.today.lessons';
import { LoadFailed } from '@/app/admin/setting/SettingKit';
import { AdminOnsitePaymentForm } from '@/app/admin/onsite-payment/AdminOnsitePaymentForm';

// 관리자 현장결제 — 홈 숏컷에서 push로 들어온다. 수강생 찾기(없으면 새로 등록) → 상품 → 수단·금액.
export default async function AdminOnsitePaymentPage() {
  const { studioId, studioName } = await requireAdmin();
  if (!studioId) return <LoadFailed title={'현장결제'} subtitle={studioName}/>;
  const locale = await getLocale();
  const lessons = await getTodayAdminLessons(studioId, locale);
  return <AdminOnsitePaymentForm studioId={studioId} lessons={lessons} today={todayKst().replace(/\./g, '-')}/>;
}
