'use client'

import Image from "next/image";
import { GetPassResponse, PassPlanTier, PassStatus } from "@/app/endpoint/pass.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import { kloudNav } from "@/app/lib/kloudNav";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import PremiumTierIcon from "../../../../public/assets/ic_premium_pass_plan.svg";

// 상태 칩 문구 — 기존 PassItem이 쓰던 키 재사용
const STATUS_KEY: Record<PassStatus, StringResourceKey> = {
  Active: 'usable',
  Pending: 'pending_account_transfer',
  Waiting: 'waiting_pass_status',
  Done: 'used_complete',
  Expired: 'expired',
  Cancelled: 'purchase_cancel',
  CancelPending: 'payment_record_cancel_pending',
};

// 상태 칩 색 — 수강 내역(ticket.item)과 동일 톤. 사용 가능만 검정, 나머지는 낮춘다.
const statusChip = (status: PassStatus) => {
  switch (status) {
    case 'Active':
      return 'bg-[#191F28] text-white';
    case 'Pending':
      return 'bg-[#FFF8EC] text-[#A05A00]';
    case 'Waiting':
      return 'bg-[#FFF8EC] text-[#A05A00]';
    case 'Cancelled':
    case 'CancelPending':
      return 'bg-[#FDECEC] text-[#E55B5B]';
    default:
      return 'bg-[#F2F4F6] text-[#8B95A1]';
  }
};

// 'yyyy.MM.dd' | 'yyyy-MM-dd' → 오늘 기준 D-day 문자열. 지났으면 null(배지 안 그림)
const ddayOf = (input?: string): string | null => {
  if (!input) return null;
  const [y, m, d] = input.split(/[-.]/).map(Number);
  if (!y || !m || !d) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(y, m - 1, d); target.setHours(0, 0, 0, 0);
  const diff = Math.floor((target.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return null;
  return diff === 0 ? 'D-Day' : `D-${diff}`;
};

export const isActivePassStatus = (status: PassStatus) =>
  status === 'Active' || status === 'Pending' || status === 'Waiting';

// 패스권 행 — 수강 내역 행과 같은 구조. 정방형 썸네일(패스 이미지 → 없으면 스튜디오 로고) + 이름/기간 + 상태 칩.
// 지난 패스(사용 완료·만료·취소)는 썸네일 흑백 + 글자 톤 다운.
export const PassListRow = ({ pass, locale }: { pass: GetPassResponse; locale: Locale }) => {
  const plan = pass.passPlan;
  const isInactive = !isActivePassStatus(pass.status);
  const isPremium = plan?.tier === PassPlanTier.Premium;
  const imageUrl = plan?.imageUrl || plan?.studio?.profileImageUrl;
  const dday = pass.status === 'Active' ? ddayOf(pass.endDate) : null;
  const until = getLocaleString({ locale, key: 'until' });

  // 상태별 보조 문구
  const subline = (() => {
    switch (pass.status) {
      case 'Pending':
        return plan?.price != null
          ? `${getLocaleString({ locale, key: 'deposit_amount' })} ${new Intl.NumberFormat('ko-KR').format(plan.price)}원`
          : null;
      case 'Waiting':
        return pass.startDate ? `${pass.startDate} ${getLocaleString({ locale, key: 'start_scheduled' })}` : null;
      default:
        return pass.endDate ? `${pass.endDate} ${until}` : null;
    }
  })();

  return (
    <div
      className={'px-5 py-4 flex items-center gap-4 active:bg-[#F9FAFB] transition-colors cursor-pointer select-none'}
      onClick={() => kloudNav.push(KloudScreen.MyPassDetail(pass.id))}
    >
      {/* 썸네일 */}
      <div className={`relative w-[56px] h-[56px] rounded-[14px] overflow-hidden bg-[#F2F4F6] shrink-0 ${isInactive ? 'grayscale opacity-60' : ''}`}>
        {imageUrl && (
          <Image src={imageUrl} alt={''} fill sizes={'56px'} quality={50} className={'object-cover'}/>
        )}
        {/* 만료까지 D-day — 썸네일 하단 검정 배지 */}
        {dday && (
          <span className={'absolute bottom-0 left-0 right-0 h-[18px] bg-[#191F28] text-white text-[10.5px] font-bold font-paperlogy flex items-center justify-center tracking-wide'}>
            {dday}
          </span>
        )}
      </div>

      {/* 정보 */}
      <div className={'flex-1 min-w-0 flex flex-col gap-0.5'}>
        {plan?.studio?.name && (
          <p className={`text-[12.5px] truncate tracking-[-0.2px] ${isInactive ? 'text-[#B0B8C1]' : 'text-[#8B95A1]'}`}>{plan.studio.name}</p>
        )}
        <div className={'flex items-center gap-1.5 min-w-0'}>
          <p className={`text-[15px] font-semibold leading-snug truncate tracking-[-0.3px] ${isInactive ? 'text-[#8B95A1]' : 'text-[#191F28]'}`}>
            {plan?.name}
          </p>
          {isPremium && !isInactive && <PremiumTierIcon className={'w-4 h-4 shrink-0'}/>}
        </div>
        {subline && (
          <p className={`text-[13px] truncate tracking-[-0.2px] ${isInactive ? 'text-[#B0B8C1]' : 'text-[#4E5968]'}`}>{subline}</p>
        )}
      </div>

      {/* 상태 칩 */}
      <span className={`shrink-0 self-start mt-0.5 px-2 py-[3px] rounded-[6px] text-[11px] font-bold tracking-[-0.1px] whitespace-nowrap ${statusChip(pass.status)}`}>
        {getLocaleString({ locale, key: STATUS_KEY[pass.status] ?? 'empty' })}
      </span>
    </div>
  );
};
