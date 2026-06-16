/**
 * 키오스크 영수증
 *
 * 4가지 타입:
 *  1. CARD          — 카드/Apple Pay 결제 (옵션: 패스권 부분할인 → 신용승인전표)
 *  2. PASS_USE      — 보유 패스권으로 수업 풀커버 (결제 완료 영수증)
 *  3. CASH_REQUEST  — 현금 결제 신청 (인포에서 마무리, 도장 영역 포함)
 *  4. CANCEL        — 관리자 결제 취소 전표 (취소승인번호 포함)
 *
 * 빌더는 PrinterLine[]을 반환 — `kiosk.native.ts`의 sendReceiptToPrinter()로 송출.
 * 손님 결제 흐름 3종(CARD/PASS_USE/CASH_REQUEST)은 `buildKioskReceipt()` 통합 dispatch로 호출하고,
 * CANCEL은 admin 흐름에서 `buildCancellationReceipt()`를 직접 호출.
 */

// ════════════════════════════ 공통 타입 ════════════════════════════

export type PrinterAlign = 'L' | 'C' | 'R';

/**
 * 시리얼 프린터 한 줄 페이로드. 필드는 mutually exclusive (text / blank / qr 중 하나).
 * 네이티브가 인식하지 못하는 키는 무시되므로 회귀 위험은 없다.
 */
export type PrinterLine = {
  text?: string;
  blank?: number;
  qr?: string;
  size?: number;
  ec?: 'L' | 'M' | 'Q' | 'H';
  align?: PrinterAlign;
  bold?: boolean;
};

export type ReceiptStudio = {
  name: string;
  address?: string;
  businessNumber?: string;
  representative?: string;
  phone?: string;
  /** 영수증 하단 안내 문구 (스튜디오별 자유 텍스트, '\n'로 줄바꿈) */
  receiptFooter?: string;
};

export type ReceiptTransaction = {
  posNumber?: string;
  cashier?: string;
  /** 키오스크 이름 — 매출일시 윗줄에 노출 */
  kioskName?: string;
  /** 결제 ID (서버 paymentId) — 영수증 트랜잭션 블록 하단에 노출 */
  paymentId?: string;
  /** 거래 시각. 미지정 시 빌드 시점의 new Date(). */
  occurredAt?: Date;
};

export type ReceiptItem = {
  name: string;
  price: number;
};

export type ReceiptUser = {
  name?: string;
  nickName?: string;
  phone?: string;
};

/** 영수증의 상품 종류 — 컬럼 라벨 분기에 사용 */
export type KioskItemType = 'lesson' | 'pass-plan';

export type CardPaymentInfo = {
  cardNo?: string;
  issuerName?: string;
  authNo?: string;
  authDate?: string;
  /** '00' = 일시불, 그 외 두 자리 = 개월수 */
  installment?: string;
  merchantNo?: string;
};

// ════════════════════════════ 공통 헬퍼 ════════════════════════════

const W = 46;
const DIVIDER = '-'.repeat(W);

const cellLen = (s: string): number =>
  Array.from(s).reduce((n, c) => n + (c.charCodeAt(0) > 127 ? 2 : 1), 0);

const pad = (left: string, right: string): string =>
  left + ' '.repeat(Math.max(1, W - cellLen(left) - cellLen(right))) + right;

const fmtKRW = (n: number): string => `${n.toLocaleString('ko-KR')}원`;

const fmtTimestamp = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
};

const sumPrice = (items: ReceiptItem[]): number =>
  items.reduce((s, i) => s + i.price, 0);

// ──────── 빌딩 블록 (모든 타입에서 공유) ────────

const studioHeader = (s: ReceiptStudio): PrinterLine[] => {
  const lines: PrinterLine[] = [
    { align: 'C', bold: true, text: s.name },
    { blank: 1 },
  ];
  if (s.address) lines.push({ align: 'L', text: s.address });
  if (s.businessNumber) lines.push({ align: 'L', text: `사업자번호: ${s.businessNumber}` });
  if (s.representative) lines.push({ align: 'L', text: `대표: ${s.representative}` });
  if (s.phone) lines.push({ align: 'L', text: `전화번호: ${s.phone}` });
  lines.push({ blank: 1 });
  return lines;
};

// 회원 정보 라인 — 닉네임/본명 합쳐 표기 + 전화번호
const formatPhoneForReceipt = (digits: string): string => {
  const d = digits.replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
};

const userLines = (user: ReceiptUser | undefined): PrinterLine[] => {
  if (!user) return [];
  const display = user.nickName
    ? (user.name && user.name !== user.nickName ? `${user.nickName} (${user.name})` : user.nickName)
    : user.name;
  const lines: PrinterLine[] = [];
  if (display) lines.push({ align: 'L', text: pad('회원', display) });
  if (user.phone) lines.push({ align: 'L', text: pad('전화번호', formatPhoneForReceipt(user.phone)) });
  return lines;
};

// 수업 결제 영수증 상단의 임팩트 박스 — 수업명(bold center) + 강사 + 수업일시 ('===' 구분선으로 감쌈)
const HIGHLIGHT_SEP = '='.repeat(W);
const lessonHighlightLines = (title?: string, artists?: string[], dateTime?: string, rank?: string): PrinterLine[] => {
  const hasArtist = !!(artists && artists.length > 0);
  if (!title && !hasArtist && !dateTime && !rank) return [];
  const lines: PrinterLine[] = [
    { align: 'C', text: HIGHLIGHT_SEP },
    { align: 'C', bold: true, text: '[ 수업 정보 ]' },
  ];
  if (title) lines.push({ align: 'C', bold: true, text: title });
  if (hasArtist) lines.push({ align: 'C', text: `강사 ${artists!.join(', ')}` });
  if (dateTime) lines.push({ align: 'C', text: dateTime });
  if (rank) lines.push({ align: 'C', bold: true, text: `입장 ${rank}` });
  lines.push({ align: 'C', text: HIGHLIGHT_SEP });
  return lines;
};

const transactionLines = (tx: ReceiptTransaction | undefined): PrinterLine[] => {
  const occurredAt = tx?.occurredAt ?? new Date();
  const left = tx?.cashier ? `거래자 ${tx.cashier}` : '';
  const right = tx?.posNumber ? `POS ${tx.posNumber}` : '';
  const lines: PrinterLine[] = [];
  if (tx?.kioskName) lines.push({ align: 'L', text: pad('키오스크', tx.kioskName) });
  if (left && right) {
    lines.push({ align: 'L', text: pad(left, right) });
  } else if (left || right) {
    lines.push({ align: 'L', text: left || right });
  }
  lines.push({ align: 'L', text: `매출일시 ${fmtTimestamp(occurredAt)}` });
  if (tx?.paymentId) lines.push({ align: 'L', text: pad('결제번호', tx.paymentId) });
  return lines;
};

// 상품 종류에 따라 컬럼 라벨 분기 (수업: 수업명 / 패스권: 패스권명 / 그 외: 상품명)
const itemColumnLabel = (itemType?: KioskItemType): string => {
  if (itemType === 'lesson') return '수업명';
  if (itemType === 'pass-plan') return '패스권명';
  return '상품명';
};

const itemTable = (items: ReceiptItem[], itemType?: KioskItemType): PrinterLine[] => [
  { align: 'L', text: DIVIDER },
  { align: 'L', text: pad(itemColumnLabel(itemType), '금액') },
  { align: 'L', text: DIVIDER },
  ...items.map<PrinterLine>((item, idx) => ({
    align: 'L',
    text: pad(`${idx + 1}) ${item.name}`, fmtKRW(item.price)),
  })),
  { align: 'L', text: DIVIDER },
];

const totalsRow = (label: string, amount: number, signed = false): PrinterLine => ({
  align: 'L',
  text: pad(label, signed ? `-${fmtKRW(amount)}` : fmtKRW(amount)),
});

// 인포 도장 영역 — 외곽 22 char × 5줄 (58mm 종이 기준 약 35×20mm)
const stampBox = (): PrinterLine[] => [
  { align: 'C', text: '[ 인포 확인 도장 ]' },
  { align: 'C', text: '+--------------------+' },
  { align: 'C', text: '|                    |' },
  { align: 'C', text: '|                    |' },
  { align: 'C', text: '|                    |' },
  { align: 'C', text: '|                    |' },
  { align: 'C', text: '|                    |' },
  { align: 'C', text: '+--------------------+' },
];

const qrLine = (qrText: string | undefined): PrinterLine[] =>
  qrText ? [{ blank: 1 }, { align: 'C', qr: qrText, size: 6 }] : [];

// 스튜디오 별 영수증 하단 안내 문구 — 줄바꿈은 '\n'으로
const footerLines = (footer: string | undefined): PrinterLine[] => {
  if (!footer) return [];
  return [
    { blank: 1 },
    ...footer.split('\n').map<PrinterLine>((line) => ({ align: 'C', text: line })),
  ];
};

// KIS authDate raw 문자열 → 사람이 읽기 쉬운 포맷 (YYYY/MM/DD [HH:MM:SS]). 8/12/14자리 모두 대응.
const formatAuthDate = (raw: string): string => {
  if (raw.length === 8) {
    return `${raw.slice(0, 4)}/${raw.slice(4, 6)}/${raw.slice(6, 8)}`;
  }
  if (raw.length === 12) {
    const yy = raw.slice(0, 2);
    const yyyy = parseInt(yy, 10) >= 70 ? `19${yy}` : `20${yy}`;
    return `${yyyy}/${raw.slice(2, 4)}/${raw.slice(4, 6)} ${raw.slice(6, 8)}:${raw.slice(8, 10)}:${raw.slice(10, 12)}`;
  }
  if (raw.length === 14) {
    return `${raw.slice(0, 4)}/${raw.slice(4, 6)}/${raw.slice(6, 8)} ${raw.slice(8, 10)}:${raw.slice(10, 12)}:${raw.slice(12, 14)}`;
  }
  return raw;
};

// 카드 메타 라인을 좌라벨/우값 우정렬로 출력 (printer mono font에서 깔끔하게 보이도록 pad 사용)
const cardMetaLines = (card: CardPaymentInfo, opts: { authNoLabel?: string; authDateLabel?: string } = {}): PrinterLine[] => {
  const row = (label: string, value: string): PrinterLine => ({ align: 'L', text: pad(label, value) });
  const lines: PrinterLine[] = [];
  if (card.cardNo) lines.push(row('카드번호', card.cardNo));
  if (card.issuerName) lines.push(row('카드사', card.issuerName));
  if (card.authNo) lines.push(row(opts.authNoLabel ?? '승인번호', card.authNo));
  if (card.authDate) lines.push(row(opts.authDateLabel ?? '승인일시', formatAuthDate(card.authDate)));
  if (card.installment) {
    const display = card.installment === '00' ? '일시불' : `${parseInt(card.installment, 10)}개월`;
    lines.push(row('할부', display));
  }
  if (card.merchantNo) lines.push(row('가맹점', card.merchantNo));
  return lines;
};

// ════════════════════════════ 타입 1: CARD ════════════════════════════
// 카드/Apple Pay 결제 영수증 — 신용승인전표 포함, 패스 부분할인 옵션

export type CardReceiptInput = {
  studio: ReceiptStudio;
  transaction?: ReceiptTransaction;
  user?: ReceiptUser;
  itemType?: KioskItemType;
  /** 수업 결제 영수증의 강사 — 상단 임팩트 박스에 노출 */
  artists?: string[];
  /** 수업 결제 영수증의 수업일시 — 상단 임팩트 박스에 노출 (예: '2026.05.03(일) 오후 10:00') */
  lessonDateTime?: string;
  /** 입장 순서 라벨 — 임팩트 박스에 노출 (예: 'No. 7 (A Group)') */
  rank?: string;
  items: ReceiptItem[];
  /** 패스권으로 일부 차감된 금액 (없으면 0) */
  passDiscount?: number;
  card: CardPaymentInfo;
  qrText?: string;
};

export const buildCardPaymentReceipt = (input: CardReceiptInput): PrinterLine[] => {
  const { studio, transaction, user, items, itemType, artists, lessonDateTime, rank, card, passDiscount = 0, qrText } = input;
  const total = sumPrice(items);
  const highlightTitle = itemType === 'lesson' ? items[0]?.name : undefined;
  const lines: PrinterLine[] = [
    ...studioHeader(studio),
    ...transactionLines(transaction),
    ...userLines(user),
    ...itemTable(items, itemType),
    totalsRow('합계', total),
  ];
  if (passDiscount > 0) {
    lines.push(totalsRow('패스권', passDiscount, true));
    lines.push(totalsRow('카드결제', total - passDiscount));
  }
  lines.push({ blank: 1 });
  lines.push({ align: 'C', bold: true, text: '** 신용승인전표 **' });
  lines.push(...cardMetaLines(card));
  lines.push(...lessonHighlightLines(highlightTitle, artists, lessonDateTime, rank));
  lines.push(...qrLine(qrText));
  lines.push(...footerLines(studio.receiptFooter));
  return lines;
};

// ════════════════════════════ 타입 2: PASS_USE ════════════════════════════
// 보유 패스권으로 수업 풀커버 — 결제 완료 영수증

export type PassReceiptInput = {
  studio: ReceiptStudio;
  transaction?: ReceiptTransaction;
  user?: ReceiptUser;
  itemType?: KioskItemType;
  /** 수업 결제 영수증의 강사 — 상단 임팩트 박스에 노출 */
  artists?: string[];
  /** 수업 결제 영수증의 수업일시 — 상단 임팩트 박스에 노출 (예: '2026.05.03(일) 오후 10:00') */
  lessonDateTime?: string;
  /** 입장 순서 라벨 — 임팩트 박스에 노출 */
  rank?: string;
  items: ReceiptItem[];
  passName?: string;
  qrText?: string;
};

export const buildPassPaymentReceipt = (input: PassReceiptInput): PrinterLine[] => {
  const { studio, transaction, user, items, itemType, artists, lessonDateTime, rank, passName, qrText } = input;
  const total = sumPrice(items);
  const highlightTitle = itemType === 'lesson' ? items[0]?.name : undefined;
  // 패스권으로 풀커버되는 영수증 — 패스권 차감 라인을 먼저 노출하고, 합계는 차감 후 실결제액(0원)으로 표시
  return [
    ...studioHeader(studio),
    ...transactionLines(transaction),
    ...userLines(user),
    ...itemTable(items, itemType),
    totalsRow(passName ? `패스권 (${passName})` : '패스권', total, true),
    totalsRow('합계', 0),
    { blank: 1 },
    { align: 'C', bold: true, text: '** 결제 완료 **' },
    ...lessonHighlightLines(highlightTitle, artists, lessonDateTime, rank),
    ...qrLine(qrText),
    ...footerLines(studio.receiptFooter),
  ];
};

// ════════════════════════════ 타입 3: CASH_REQUEST ════════════════════════════
// 현금 결제 신청 — 인포데스크에서 결제 마무리. 도장 영역 포함, 결제 record는 미생성.

export type CashRequestReceiptInput = {
  studio: ReceiptStudio;
  transaction?: ReceiptTransaction;
  user?: ReceiptUser;
  itemType?: KioskItemType;
  /** 수업 결제 영수증의 강사 — 상단 임팩트 박스에 노출 */
  artists?: string[];
  /** 수업 결제 영수증의 수업일시 — 상단 임팩트 박스에 노출 (예: '2026.05.03(일) 오후 10:00') */
  lessonDateTime?: string;
  /** 입장 순서 라벨 — 임팩트 박스에 노출 */
  rank?: string;
  items: ReceiptItem[];
  /** 패스권으로 일부 차감된 금액 (없으면 0) — 카드 영수증과 동일 패턴 */
  passDiscount?: number;
  qrText?: string;
};

export const buildCashRequestReceipt = (input: CashRequestReceiptInput): PrinterLine[] => {
  const { studio, transaction, user, items, itemType, artists, lessonDateTime, rank, passDiscount = 0, qrText } = input;
  const total = sumPrice(items);
  const highlightTitle = itemType === 'lesson' ? items[0]?.name : undefined;
  const lines: PrinterLine[] = [
    ...studioHeader(studio),
    ...transactionLines(transaction),
    ...userLines(user),
    ...itemTable(items, itemType),
    totalsRow('합계', total),
  ];
  if (passDiscount > 0) {
    lines.push(totalsRow('패스권', passDiscount, true));
    lines.push(totalsRow('현금결제', total - passDiscount));
  }
  lines.push({ blank: 1 });
  lines.push({ align: 'C', bold: true, text: '** 인포에서 결제를 마무리해주세요 **' });
  lines.push({ blank: 1 });
  lines.push(...stampBox());
  lines.push(...lessonHighlightLines(highlightTitle, artists, lessonDateTime, rank));
  lines.push(...qrLine(qrText));
  lines.push(...footerLines(studio.receiptFooter));
  return lines;
};

// ════════════════════════════ 타입 4: CANCEL ════════════════════════════
// 관리자 결제 취소 전표 — 단말 취소 응답 메타(취소승인번호) 포함

export type CancellationReceiptInput = {
  studio: ReceiptStudio;
  transaction?: ReceiptTransaction;
  user?: ReceiptUser;
  itemType?: KioskItemType;
  /** 수업 결제 영수증의 강사 — 상단 임팩트 박스에 노출 */
  artists?: string[];
  /** 수업 결제 영수증의 수업일시 — 상단 임팩트 박스에 노출 (예: '2026.05.03(일) 오후 10:00') */
  lessonDateTime?: string;
  items: ReceiptItem[];
  /** 카드 취소면 카드 메타 + 취소 승인번호. 현금 등은 생략 */
  card?: CardPaymentInfo;
  qrText?: string;
};

export const buildCancellationReceipt = (input: CancellationReceiptInput): PrinterLine[] => {
  const { studio, transaction, user, items, itemType, artists, lessonDateTime, card, qrText } = input;
  const total = sumPrice(items);
  const highlightTitle = itemType === 'lesson' ? items[0]?.name : undefined;
  const lines: PrinterLine[] = [
    ...studioHeader(studio),
    { align: 'C', bold: true, text: '*** 결제 취소 ***' },
    { blank: 1 },
    ...transactionLines(transaction),
    ...userLines(user),
    ...itemTable(items, itemType),
    totalsRow('취소 금액', total),
    { blank: 1 },
  ];
  if (card) {
    lines.push({ align: 'C', bold: true, text: '** 신용카드 취소전표 **' });
    lines.push(...cardMetaLines(card, { authNoLabel: '취소승인번호', authDateLabel: '취소일시' }));
  }
  lines.push(...lessonHighlightLines(highlightTitle, artists, lessonDateTime));
  lines.push(...qrLine(qrText));
  lines.push(...footerLines(studio.receiptFooter));
  return lines;
};

// ════════════════════════════ 통합 dispatch (손님 결제) ════════════════════════════
// CARD / PASS_USE / CASH_REQUEST 3종은 KioskForm 결제 흐름에서 buildKioskReceipt로 통합 호출.
// CANCEL은 admin 흐름에서 buildCancellationReceipt를 직접 호출.

export type KioskPaymentMethod = 'card' | 'pass' | 'cash';

export type KioskReceiptDiscount = {
  amount?: number;
  description?: string;
  targetLabel?: string;
};

export type BuildKioskReceiptInput = {
  paymentMethod: KioskPaymentMethod;
  studio: ReceiptStudio;
  transaction?: ReceiptTransaction;
  user?: ReceiptUser;
  itemType?: KioskItemType;
  /** 수업 결제 영수증의 강사 — 상단 임팩트 박스에 노출 */
  artists?: string[];
  /** 수업 결제 영수증의 수업일시 — 상단 임팩트 박스에 노출 (예: '2026.05.03(일) 오후 10:00') */
  lessonDateTime?: string;
  /** 입장 순서 라벨 — 임팩트 박스에 노출 (BE complete 응답의 rank) */
  rank?: string;
  items: ReceiptItem[];
  /** 선택된 할인 — card 케이스에서는 passDiscount로, pass 케이스에서는 passName 라벨로 사용 */
  discount?: KioskReceiptDiscount;
  /** KIS 단말 응답 raw — card 케이스에서 카드번호/승인번호/카드사 등 메타 추출에 사용 */
  cardData?: Record<string, unknown>;
  qrText?: string;
};

const pickStr = (data: Record<string, unknown>, key: string): string | undefined => {
  const v = data[key];
  return typeof v === 'string' && v ? v : undefined;
};

const cardInfoFromKisData = (data: Record<string, unknown>): CardPaymentInfo => ({
  cardNo: pickStr(data, 'outCardNo'),
  issuerName: pickStr(data, 'outIssuerName'),
  authNo: pickStr(data, 'outAuthNo'),
  authDate: pickStr(data, 'outAuthDate'),
  // KIS 실제 응답 키 — M 대문자, MerchantRegNo
  installment: pickStr(data, 'outInstallMent'),
  merchantNo: pickStr(data, 'outMerchantRegNo'),
});

// ════════════════════════════ 영수증 재발급 (Reprint) ════════════════════════════
// GET /kiosks/:id/paymentRecords/:paymentId 응답을 받아 영수증 PrinterLine[] 생성.
// 빌드는 기존 빌더(buildCardPaymentReceipt/buildPassPaymentReceipt/buildCashRequestReceipt)에 위임.

import type {
  KioskPaymentRecordDetailResponse,
} from "@/app/endpoint/kiosk.endpoint";

const installmentRawFromLabel = (label?: string): string | undefined => {
  if (!label) return undefined;
  if (label === '일시불') return '00';
  // "3개월" → "03"
  const m = label.match(/^(\d+)\s*개월$/);
  if (m) return String(parseInt(m[1], 10)).padStart(2, '0');
  return undefined;
};

export const buildReprintReceipt = (
  detail: KioskPaymentRecordDetailResponse,
  ctx: { kioskName?: string },
): PrinterLine[] => {
  const studio: ReceiptStudio = {
    name: detail.studio?.name ?? '',
    address: detail.studio?.address,
    businessNumber: detail.studio?.businessRegistrationNumber,
    representative: detail.studio?.representative,
    phone: detail.studio?.phone,
    receiptFooter: detail.studio?.receiptFooter,
  };
  const transaction: ReceiptTransaction = {
    kioskName: ctx.kioskName,
    paymentId: detail.paymentId,
    // 원거래 시각 (yyyy.MM.dd HH:mm) — 빌더가 Date를 요구하므로 파싱
    occurredAt: detail.confirmedAt || detail.createdAt
      ? parseTimestamp(detail.confirmedAt ?? detail.createdAt ?? '')
      : undefined,
  };

  const itemType: KioskItemType | undefined = detail.lesson ? 'lesson' : undefined;
  const items: ReceiptItem[] = [{
    name: detail.lesson?.title ?? detail.productName ?? '',
    price: detail.amount,
  }];
  const artists = (detail.lesson?.artists ?? [])
    .map((a) => a.nickName || a.name)
    .filter((n): n is string => Boolean(n));
  const lessonDateTime = detail.lesson?.startDate;
  const qrText = detail.qrCodeUrl;
  // 재발급 영수증에도 입장번호 라벨(rank)을 그대로 노출 — 원거래에서 발급된 라벨을 detail 응답에서 받아옴.
  const rank = detail.rank ?? undefined;

  // methodType은 'Card' | 'Credit' | 'Cash' | 'Pass' 등 — 영수증 빌더는 소문자.
  // BE가 'card' 외에 'credit' / easy-pay 계열도 내려주므로 카드 계열을 명시적으로 묶어서 처리.
  const mt = (detail.methodType ?? '').toLowerCase();
  const CARD_METHODS = new Set([
    'card', 'credit', 'foreign_card', 'billing',
    'easy_pay', 'naver_pay', 'kakao_pay', 'toss_pay',
  ]);

  // 카드 계열이면 detail.card 또는 detail.vanResponse 둘 중 어느 쪽에 메타가 있어도 카드 영수증 양식으로 빌드.
  // 둘 다 비어 있어도 카드 양식 유지 — 현금 양식으로 잘못 떨어지는 것 방지.
  if (CARD_METHODS.has(mt)) {
    const card: CardPaymentInfo = detail.card
      ? {
          cardNo: detail.card.cardNumber,
          issuerName: detail.card.issuerName,
          authNo: detail.card.authNo,
          authDate: detail.card.authDate,
          installment: installmentRawFromLabel(detail.card.installmentLabel),
          merchantNo: detail.card.merchantNo,
        }
      : (detail.vanResponse ? cardInfoFromKisData(detail.vanResponse) : {});
    const passDiscount = (detail.discounts ?? []).reduce((s, d) => s + (d.amount ?? 0), 0);
    return buildCardPaymentReceipt({
      studio, transaction, items, itemType, artists, lessonDateTime, rank,
      passDiscount,
      card,
      qrText,
    });
  }

  if (mt === 'pass') {
    const passName = (detail.discounts ?? [])[0]?.name;
    return buildPassPaymentReceipt({
      studio, transaction, items, itemType, artists, lessonDateTime, rank,
      passName,
      qrText,
    });
  }

  // cash (또는 그 외) — 인포에서 마무리한 현금 결제 재발급
  const cashPassDiscount = (detail.discounts ?? []).reduce((s, d) => s + (d.amount ?? 0), 0);
  return buildCashRequestReceipt({
    studio, transaction, items, itemType, artists, lessonDateTime, rank, qrText,
    passDiscount: cashPassDiscount,
  });
};

// 'yyyy.MM.dd HH:mm' → Date. 실패 시 undefined.
function parseTimestamp(s: string): Date | undefined {
  const m = s.match(/^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})$/);
  if (!m) return undefined;
  const [, y, mo, d, h, mi] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
}

export const buildKioskReceipt = (input: BuildKioskReceiptInput): PrinterLine[] => {
  const { paymentMethod, studio, transaction, user, items, itemType, artists, lessonDateTime, rank, discount, cardData = {}, qrText } = input;
  switch (paymentMethod) {
    case 'card':
      return buildCardPaymentReceipt({
        studio, transaction, user, items, itemType, artists, lessonDateTime, rank, qrText,
        passDiscount: discount?.amount ?? 0,
        card: cardInfoFromKisData(cardData),
      });
    case 'pass':
      return buildPassPaymentReceipt({
        studio, transaction, user, items, itemType, artists, lessonDateTime, rank, qrText,
        passName: discount?.description || discount?.targetLabel,
      });
    case 'cash':
      return buildCashRequestReceipt({
        studio, transaction, user, items, itemType, artists, lessonDateTime, rank, qrText,
        passDiscount: discount?.amount ?? 0,
      });
  }
};
