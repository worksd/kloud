import { PaymentRecordStatus } from '@/app/endpoint/payment.record.endpoint';

/** 관리자 화면(결제내역 리스트·결제 상세)에서 공용으로 쓰는 상태 뱃지 */
export const PAYMENT_STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  [PaymentRecordStatus.Completed]: { label: '결제 완료', cls: 'bg-[#E8F5E9] text-[#2E7D32]' },
  [PaymentRecordStatus.Settled]: { label: '정산 완료', cls: 'bg-[#E8F0FE] text-[#1A5CE5]' },
  [PaymentRecordStatus.Pending]: { label: '대기', cls: 'bg-[#FFF4E5] text-[#A05A00]' },
  [PaymentRecordStatus.CancelPending]: { label: '환불 대기', cls: 'bg-[#FFF4E5] text-[#A05A00]' },
  [PaymentRecordStatus.Cancelled]: { label: '취소됨', cls: 'bg-[#F3F4F6] text-[#6B7280]' },
  [PaymentRecordStatus.Failed]: { label: '실패', cls: 'bg-[#FEECEC] text-[#E55B5B]' },
};

export const paymentStatusBadge = (status?: string) =>
  PAYMENT_STATUS_STYLE[status ?? ''] ?? { label: String(status ?? ''), cls: 'bg-[#F3F4F6] text-[#6B7280]' };

/**
 * 정상 건(결제 완료·정산 완료)은 라벨을 붙이지 않는다 — 대부분이 정상이라 칩이 도배되면 오히려 안 읽힌다.
 * 취소·실패·대기처럼 확인이 필요한 상태에만 라벨을 준다.
 */
export const paymentIssueBadge = (status?: string): { cls: string; label: string } | null => {
  switch (status) {
    case PaymentRecordStatus.Cancelled:
    case PaymentRecordStatus.Failed:
    case PaymentRecordStatus.Pending:
    case PaymentRecordStatus.CancelPending:
      return PAYMENT_STATUS_STYLE[status];
    default:
      return null;
  }
};
