import { GetPaymentResponse } from "@/app/endpoint/payment.endpoint";
import { Locale } from "@/shared/StringResource";

export type PaymentPageType = 'lesson' | 'pass-plan' | 'lesson-group' | 'practice-room' | 'bundle';

// PC/모바일 결제 폼 공용 props — page.tsx가 데이터를 다 준비해서 두 폼에 같은 값을 넘긴다.
export type PaymentFormProps = {
  payment: GetPaymentResponse;
  paymentItem: PaymentPageType;
  itemId: number;
  thumbnailUrl?: string;
  title?: string;
  studioName?: string;
  studioImageUrl?: string;
  os?: string;
  appVersion: string;
  beforeDepositor: string;
  actualPayerUserId?: number;
  isProxyPayment: boolean;
  locale: Locale;
  apiUrl: string;
  /** 연습실 결제 — 이미 선택된 시간대 (쿼리로 들어옴) */
  preStartTime?: string;
  preEndTime?: string;
};
