import React from 'react';
import { requireAdmin } from '@/app/admin/admin.guard';
import { AdminMockNotice, AdminPageHeader } from '@/app/admin/AdminMockNotice';
import { NavigateClickWrapper } from '@/utils/NavigateClickWrapper';
import { DialogClickWrapper } from '@/utils/DialogClickWrapper';
import { UserModeSwitch } from '@/app/admin/UserModeSwitch';
import { CircleImage } from '@/app/components/CircleImage';
import { KloudScreen } from '@/shared/kloud.screen';
import {
  StudioSettingFlatIcon, AccountFlatIcon, NotificationFlatIcon, CouponFlatIcon,
  BusinessInfoFlatIcon, PolicyFlatIcon, QrScannerFlatIcon, VersionFlatIcon,
} from '@/app/profile/setting/SettingIcons';

// 관리자 탭 '설정' — 학원 카드 + 섹션별 메뉴. 라우트가 있는 항목만 실제 이동하고, 나머지는 목(mock) 자리.
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

export default async function AdminSettingPage() {
  const { studioName, studioId, studioImageUrl, adminName } = await requireAdmin();

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: '학원 운영',
      rows: [
        { label: '학원 정보', desc: '이름·주소·연락처·소개', icon: <StudioSettingFlatIcon size={24}/>, route: KloudScreen.StudioSetting },
        { label: '수업·패스권 관리', desc: '목 화면', icon: <CouponFlatIcon size={24}/> },
        { label: '키오스크', desc: '목 화면', icon: <QrScannerFlatIcon size={24}/> },
      ],
    },
    {
      title: '정산',
      rows: [
        { label: '사업자 정보', icon: <BusinessInfoFlatIcon size={24}/>, route: KloudScreen.BusinessInfo },
        { label: '정산 계좌', desc: '목 화면', icon: <AccountFlatIcon size={24}/> },
      ],
    },
    {
      title: '앱',
      rows: [
        { label: '알림 설정', icon: <NotificationFlatIcon size={24}/>, route: KloudScreen.NotificationSetting },
        { label: '약관 및 정책', icon: <PolicyFlatIcon size={24}/>, route: KloudScreen.Policy },
        { label: '앱 버전', icon: <VersionFlatIcon size={24}/>, value: '최신' },
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen overflow-x-clip bg-[#F7F8FA] pb-32">
      <AdminPageHeader title="설정" studioName={studioName} />
      <AdminMockNotice />

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
