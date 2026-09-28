import React from 'react';
import { requireAdmin } from '@/app/admin/admin.guard';
import { AdminMockNotice, AdminPageHeader } from '@/app/admin/AdminMockNotice';
import { MOCK_STUDENTS, MOCK_STUDENT_SUMMARY, MockStudent } from '@/app/admin/admin.mock';

// 관리자 탭 '수강생' — 목 데이터 화면. 실제 연동 시 MOCK_STUDENTS를 API 응답으로 교체.
const STATUS_STYLE: Record<MockStudent['status'], { label: string; className: string }> = {
  Active: { label: '이용중', className: 'bg-[#EAF7F4] text-[#1E8A55]' },
  Expiring: { label: '만료 임박', className: 'bg-[#FFF3E0] text-[#C96E1E]' },
  Unpaid: { label: '미납', className: 'bg-[#FDECEC] text-[#C23A3F]' },
};

export default async function AdminStudentsPage() {
  const { studioName } = await requireAdmin();
  const sum = MOCK_STUDENT_SUMMARY;

  return (
    <div className="w-full min-h-screen overflow-x-clip bg-[#F7F8FA] pb-28">
      <AdminPageHeader title="수강생" studioName={studioName} />
      <AdminMockNotice />

      {/* 요약 */}
      <section className="mx-4 mt-3 grid grid-cols-4 gap-2">
        {[
          { label: '전체', value: sum.total, tone: 'text-[#191F28]' },
          { label: '이용중', value: sum.active, tone: 'text-[#1E8A55]' },
          { label: '만료 임박', value: sum.expiring, tone: 'text-[#C96E1E]' },
          { label: '미납', value: sum.unpaid, tone: 'text-[#C23A3F]' },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl bg-white border border-[#EEF0F2] px-2.5 py-3 text-center">
            <p className="text-[11px] font-semibold text-[#8B95A1] whitespace-nowrap">{m.label}</p>
            <p className={`mt-1 text-[18px] font-bold ${m.tone}`}>{m.value}</p>
          </div>
        ))}
      </section>

      {/* 검색(목) */}
      <div className="mx-4 mt-3 flex items-center gap-2 rounded-2xl bg-white border border-[#EEF0F2] px-4 py-3">
        <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px] shrink-0">
          <circle cx="11" cy="11" r="6.5" stroke="#8B95A1" strokeWidth="1.8"/>
          <path d="M16 16l4 4" stroke="#8B95A1" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <span className="text-[14px] text-[#B0B8C1]">이름 또는 전화번호 뒤 4자리</span>
      </div>

      {/* 목록 */}
      <section className="mx-4 mt-3 rounded-2xl bg-white border border-[#EEF0F2] overflow-hidden">
        <div className="flex flex-col divide-y divide-[#F1F3F6]">
          {MOCK_STUDENTS.map((st) => {
            const badge = STATUS_STYLE[st.status];
            return (
              <div key={st.id} className="flex items-center gap-3 px-4 py-3.5">
                <span className="w-[42px] h-[42px] rounded-[14px] bg-[#F7F8FA] flex items-center justify-center shrink-0 text-[15px] font-bold text-[#4E5968]">
                  {st.name.slice(0, 1)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] font-bold text-[#191F28] truncate">{st.name}</span>
                    <span className="text-[12px] text-[#8B95A1]">·{st.phoneTail}</span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-[#8B95A1] truncate">
                    {st.className} · {st.remaining == null ? '무제한' : `${st.remaining}회 남음`} · {st.endDate}까지
                  </p>
                </div>
                <span className={`shrink-0 rounded-lg px-2 py-1 text-[11.5px] font-bold ${badge.className}`}>{badge.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
