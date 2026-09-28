import React from 'react';
import { requireAdmin } from '@/app/admin/admin.guard';
import { AdminPageHeader } from '@/app/admin/AdminPageHeader';
import { NavigateClickWrapper } from '@/utils/NavigateClickWrapper';
import { DialogClickWrapper } from '@/utils/DialogClickWrapper';
import { UserModeSwitch } from '@/app/admin/UserModeSwitch';
import { CircleImage } from '@/app/components/CircleImage';
import { KloudScreen } from '@/shared/kloud.screen';
import { CalendarClock, DoorOpen } from 'lucide-react';
import {
  StudioSettingFlatIcon, BusinessInfoFlatIcon, PolicyFlatIcon, VersionFlatIcon,
} from '@/app/profile/setting/SettingIcons';

// 관리자 탭 '설정' — 학원 카드 + 섹션별 메뉴. 학원 항목은 PATCH /studios 로 저장하는 하위 화면(원장 계정만).
type Row = { label: string; desc?: string; icon: React.ReactNode; route?: string; value?: string };

const SettingRow = ({ row }: { row: Row }) => {
  const content = (
    <div className="flex items-center gap-3.5 px-4 py-3 active:bg-[#FAFBFC] transition-colors">
      <span className="w-[42px] h-[42px] rounded-[14px] bg-[#F7F8FA] flex items-center justify-center shrink-0">
        {row.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-[#191F28] truncate">{row.label}</p>
        {row.desc && <p className="text-[12px] text-[#8B95A1] truncate">{row.desc}</p>}
      </div>
      {row.value
        ? <span className="shrink-0 text-[13px] font-semibold text-[#B0B8C1]">{row.value}</span>
        : (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
            <path d="M9 6l6 6-6 6" stroke="#D1D6DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
    </div>
  );
  return row.route
    ? <NavigateClickWrapper method="push" route={row.route}>{content}</NavigateClickWrapper>
    : <div>{content}</div>;
};

export default async function AdminSettingPage({ searchParams }: {
  searchParams: Promise<{ appVersion?: string }>;
}) {
  const [{ studioName, studioId, studioImageUrl, adminName }, { appVersion }] = await Promise.all([requireAdmin(), searchParams]);

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: '학원',
      rows: [
        { label: '학원 정보', desc: '이름·연락처·주소·SNS·편의시설', icon: <StudioSettingFlatIcon size={24}/>, route: KloudScreen.AdminSettingProfile },
        { label: '수업·결제 설정', desc: '공개·예약 시점, 수강권 규칙, 결제수단', icon: <CalendarClock size={22} strokeWidth={1.6} color={'#1F1F1F'}/>, route: KloudScreen.AdminSettingLesson },
        { label: '연습실 설정', desc: '환불 기준, 이용안내 알림톡', icon: <DoorOpen size={22} strokeWidth={1.6} color={'#1F1F1F'}/>, route: KloudScreen.AdminSettingRoom },
        { label: '사업자·계좌', desc: '사업자 정보, 입금·정산 계좌', icon: <BusinessInfoFlatIcon size={24}/>, route: KloudScreen.AdminSettingBusiness },
      ],
    },
    {
      title: '앱',
      rows: [
        { label: '약관 및 정책', icon: <PolicyFlatIcon size={24}/>, route: KloudScreen.Policy },
        // proxy가 앱 UA에서 뽑아 query로 넘겨주는 버전 — 웹 접속이면 비어 있다
        { label: '앱 버전', icon: <VersionFlatIcon size={24}/>, value: appVersion || '웹' },
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen overflow-x-clip bg-[#F7F8FA] pb-32">
      <AdminPageHeader title="설정" studioName={studioName} />

      {/* 학원 카드 — 탭하면 학원 상세로 */}
      {studioId != null && (
        <NavigateClickWrapper method="push" route={KloudScreen.StudioDetail(studioId)}>
          <section className="mx-4 mt-3 rounded-2xl bg-white border border-[#EEF0F2] px-4 py-4 flex items-center gap-3.5 active:bg-[#FAFBFC] transition-colors">
            <CircleImage imageUrl={studioImageUrl} size={48}/>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-[#191F28] truncate">{studioName ?? '-'}</p>
              {adminName && <p className="mt-0.5 text-[12.5px] text-[#8B95A1] truncate">관리자 {adminName}</p>}
            </div>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
              <path d="M9 6l6 6-6 6" stroke="#D1D6DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </section>
        </NavigateClickWrapper>
      )}

      {sections.map((sec) => (
        <section key={sec.title} className="mt-4">
          <h2 className="px-6 pb-2 text-[12.5px] font-bold text-[#8B95A1] tracking-[0.2px]">{sec.title}</h2>
          <div className="mx-4 rounded-2xl bg-white border border-[#EEF0F2] overflow-hidden divide-y divide-[#F1F3F6]">
            {sec.rows.map((row) => <SettingRow key={row.label} row={row}/>)}
          </div>
        </section>
      ))}

      {/* 모드 전환 · 로그아웃 — 나머지 메뉴와 분리 */}
      <section className="mt-4 mx-4 rounded-2xl bg-white border border-[#EEF0F2] overflow-hidden divide-y divide-[#F1F3F6]">
        {/* 첫 탭이 관리자·일반 공용('/home')이라 단순 이동으로는 관리자 폼이 또 뜬다 —
            userMode 쿠키를 켜고 일반 탭 구성으로 메인을 재부팅한다 */}
        <UserModeSwitch label="일반 모드로 가기" description="수강생이 보는 화면으로 전환해요"/>
        <DialogClickWrapper id="Logout">
          <div className="px-4 py-3.5 active:bg-[#FAFBFC] transition-colors">
            <p className="text-[15px] font-semibold text-[#E5484D]">로그아웃</p>
          </div>
        </DialogClickWrapper>
      </section>
    </div>
  );
}
