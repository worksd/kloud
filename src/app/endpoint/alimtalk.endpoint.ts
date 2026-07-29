import { Endpoint, SimpleResponse } from "@/app/endpoint/index";

// POST /alimtalks/ — 파트너/운영자가 특정 결제건의 알림톡을 수신자에게 발송.
// 응답 { success: true }는 '발송 요청 접수' 기준(실제 카카오 전달 결과 아님).
// 다른 템플릿 변수 스펙은 GET /alimtalks/templates 참고.

export type AlimtalkTemplate =
  | 'RequestPayment'
  | 'PaymentReceipt'
  | 'RequestBankTransfer'
  | 'RemindBankTransfer'
  | 'RequestParentConnection'
  | 'PracticeRoomUsageGuide';

// PaymentReceipt(영수증) 발송 — 본문 값(결제자·금액·수단·일시·링크)은 서버가 paymentId로 자동 구성.
export type SendPaymentReceiptParameter = {
  template: 'PaymentReceipt';
  phone: string;         // 수신자 휴대폰번호
  countryCode: string;   // 국가번호 (예: '82')
  paymentId: string;     // 영수증 대상 결제의 PaymentRecord.paymentId
};

export const SendPaymentReceipt: Endpoint<SendPaymentReceiptParameter, SimpleResponse> = {
  method: 'post',
  path: '/alimtalks/',
  bodyParams: ['template', 'phone', 'countryCode', 'paymentId'],
};
