import React from 'react';
import { requireAdmin } from '@/app/admin/admin.guard';
import { AdminPageHeader } from '@/app/admin/AdminPageHeader';
import { getActiveStudentCountAction, getStudentsAction } from '@/app/admin/students/students.action';
import { StudentList } from '@/app/admin/students/StudentList';
import { getLocale } from '@/utils/translate';

// 관리자 탭 '수강생' — GET /students 연동. 요약(전체·활성)은 서버에서, 목록은 첫 페이지만 서버 렌더 후 클라이언트가 이어받는다.
export default async function AdminStudentsPage() {
  const { studioName } = await requireAdmin();
  const [initial, activeCount, locale] = await Promise.all([
    getStudentsAction({ page: 1, order: 'CreatedAtDesc', onlyActive: false }),
    getActiveStudentCountAction(),
    getLocale(),
  ]);

  return (
    <div className="w-full min-h-screen overflow-x-clip bg-[#F7F8FA] pb-28">
      <AdminPageHeader title="수강생" studioName={studioName} />

      {/* 요약 — 활성은 최근 3개월 안에 결제한 수강생 */}
      <section className="mx-4 mt-3 grid grid-cols-2 gap-2">
        {[
          { label: '전체 수강생', value: initial.totalCount, tone: 'text-[#191F28]' },
          { label: '활성 (최근 3개월 결제)', value: activeCount, tone: 'text-[#1E8A55]' },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl bg-white border border-[#EEF0F2] px-3 py-3 text-center">
            <p className="text-[11px] font-semibold text-[#8B95A1]">{m.label}</p>
            <p className={`mt-1 text-[20px] font-bold ${m.tone}`}>{m.value.toLocaleString()}<span className="text-[13px]">명</span></p>
          </div>
        ))}
      </section>

      <StudentList initial={initial} locale={locale}/>
    </div>
  );
}
