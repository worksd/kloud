import React from 'react';
import { requireAdmin } from '@/app/admin/admin.guard';
import { AdminPageHeader } from '@/app/admin/AdminMockNotice';
import { getRecentSalesAction } from '@/app/admin/sales/recent.sales.action';
import { SalesSection } from '@/app/admin/sales/SalesSection';
import { AdminPaymentsSheetContent } from '@/app/admin/AdminPaymentsSheet';
import { getLocale } from '@/utils/translate';

// 관리자 탭 '매출' — 기간 필터 + 그래프(일별 매출) 하나 + 그 아래 최근 결제내역 전체.
// 둘 다 실제 데이터: 그래프는 서버에서 GET /paymentRecords를 훑어 일자별로 합산하고,
// 결제내역은 관리자 홈 바텀시트와 같은 컴포넌트(무한 더보기 + 결제 취소)를 inline으로 재사용한다.
export default async function AdminSalesPage() {
  const { studioName } = await requireAdmin();
  const [sales, locale] = await Promise.all([getRecentSalesAction(7), getLocale()]);

  return (
    <div className="w-full min-h-screen overflow-x-clip bg-[#F7F8FA] pb-28">
      <AdminPageHeader title="매출" studioName={studioName} />

      <SalesSection initial={sales} />

      <section className="mx-4 mt-3 mb-3 rounded-2xl bg-white border border-[#EEF0F2] py-5">
        <AdminPaymentsSheetContent locale={locale} inline title="최근 결제내역" />
      </section>
    </div>
  );
}
