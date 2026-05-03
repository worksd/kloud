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
  /** 거래 시각. 미지정 시 빌드 시점의 new Date(). */
  occurredAt?: Date;
};

export type ReceiptItem = {
  name: string;
  price: number;
};

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

const transactionLines = (tx: ReceiptTransaction | undefined): PrinterLine[] => {
  const occurredAt = tx?.occurredAt ?? new Date();
  const left = tx?.cashier ? `거래자 ${tx.cashier}` : '';
  const right = tx?.posNumber ? `POS ${tx.posNumber}` : '';
  const lines: PrinterLine[] = [];
  if (left && right) {
    lines.push({ align: 'L', text: pad(left, right) });
  } else if (left || right) {
    lines.push({ align: 'L', text: left || right });
  }
  lines.push({ align: 'L', text: `매출일시 ${fmtTimestamp(occurredAt)}` });
  return lines;
};

const itemTable = (items: ReceiptItem[]): PrinterLine[] => [
  { align: 'L', text: DIVIDER },
  { align: 'L', text: pad('상품명', '금액') },
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

const cardMetaLines = (card: CardPaymentInfo, opts: { authNoLabel?: string; authDateLabel?: string } = {}): PrinterLine[] => {
  const lines: PrinterLine[] = [];
  if (card.cardNo) lines.push({ align: 'L', text: `카드번호 ${card.cardNo}` });
  if (card.issuerName) lines.push({ align: 'L', text: `카드사 ${card.issuerName}` });
  if (card.authNo) lines.push({ align: 'L', text: `${opts.authNoLabel ?? '승인번호'} ${card.authNo}` });
  if (card.authDate) lines.push({ align: 'L', text: `${opts.authDateLabel ?? '승인일시'} ${card.authDate}` });
  if (card.installment) {
    const display = card.installment === '00' ? '일시불' : `${parseInt(card.installment, 10)}개월`;
    lines.push({ align: 'L', text: `할부 ${display}` });
  }
  if (card.merchantNo) lines.push({ align: 'L', text: `가맹점 ${card.merchantNo}` });
  return lines;
};

// ════════════════════════════ 타입 1: CARD ════════════════════════════
// 카드/Apple Pay 결제 영수증 — 신용승인전표 포함, 패스 부분할인 옵션

export type CardReceiptInput = {
  studio: ReceiptStudio;
  transaction?: ReceiptTransaction;
  items: ReceiptItem[];
  /** 패스권으로 일부 차감된 금액 (없으면 0) */
  passDiscount?: number;
  card: CardPaymentInfo;
  qrText?: string;
};

export const buildCardPaymentReceipt = (input: CardReceiptInput): PrinterLine[] => {
  const { studio, transaction, items, card, passDiscount = 0, qrText } = input;
  const total = sumPrice(items);
  const lines: PrinterLine[] = [
    ...studioHeader(studio),
    ...transactionLines(transaction),
    ...itemTable(items),
    totalsRow('합계', total),
  ];
  if (passDiscount > 0) {
    lines.push(totalsRow('패스권', passDiscount, true));
    lines.push(totalsRow('카드결제', total - passDiscount));
  }
  lines.push({ blank: 1 });
  lines.push({ align: 'C', bold: true, text: '** 신용승인전표 **' });
  lines.push(...cardMetaLines(card));
  lines.push(...qrLine(qrText));
  lines.push(...footerLines(studio.receiptFooter));
  lines.push({ blank: 3 });
  return lines;
};

// ════════════════════════════ 타입 2: PASS_USE ════════════════════════════
// 보유 패스권으로 수업 풀커버 — 결제 완료 영수증

export type PassReceiptInput = {
  studio: ReceiptStudio;
  transaction?: ReceiptTransaction;
  items: ReceiptItem[];
  passName?: string;
  qrText?: string;
};

export const buildPassPaymentReceipt = (input: PassReceiptInput): PrinterLine[] => {
  const { studio, transaction, items, passName, qrText } = input;
  const total = sumPrice(items);
  return [
    ...studioHeader(studio),
    ...transactionLines(transaction),
    ...itemTable(items),
    totalsRow('합계', total),
    totalsRow(passName ? `패스권 (${passName})` : '패스권', total, true),
    { blank: 1 },
    { align: 'C', bold: true, text: '** 결제 완료 **' },
    ...qrLine(qrText),
    ...footerLines(studio.receiptFooter),
    { blank: 3 },
  ];
};

// ════════════════════════════ 타입 3: CASH_REQUEST ════════════════════════════
// 현금 결제 신청 — 인포데스크에서 결제 마무리. 도장 영역 포함, 결제 record는 미생성.

export type CashRequestReceiptInput = {
  studio: ReceiptStudio;
  transaction?: ReceiptTransaction;
  items: ReceiptItem[];
  qrText?: string;
};

export const buildCashRequestReceipt = (input: CashRequestReceiptInput): PrinterLine[] => {
  const { studio, transaction, items, qrText } = input;
  const total = sumPrice(items);
  return [
    ...studioHeader(studio),
    ...transactionLines(transaction),
    ...itemTable(items),
    totalsRow('합계', total),
    { blank: 1 },
    { align: 'C', bold: true, text: '** 인포에서 결제를 마무리해주세요 **' },
    { blank: 1 },
    ...stampBox(),
    ...qrLine(qrText),
    ...footerLines(studio.receiptFooter),
    { blank: 3 },
  ];
};

// ════════════════════════════ 타입 4: CANCEL ════════════════════════════
// 관리자 결제 취소 전표 — 단말 취소 응답 메타(취소승인번호) 포함

export type CancellationReceiptInput = {
  studio: ReceiptStudio;
  transaction?: ReceiptTransaction;
  items: ReceiptItem[];
  /** 카드 취소면 카드 메타 + 취소 승인번호. 현금 등은 생략 */
  card?: CardPaymentInfo;
  qrText?: string;
};

export const buildCancellationReceipt = (input: CancellationReceiptInput): PrinterLine[] => {
  const { studio, transaction, items, card, qrText } = input;
  const total = sumPrice(items);
  const lines: PrinterLine[] = [
    ...studioHeader(studio),
    { align: 'C', bold: true, text: '*** 결제 취소 ***' },
    { blank: 1 },
    ...transactionLines(transaction),
    ...itemTable(items),
    totalsRow('취소 금액', total),
    { blank: 1 },
  ];
  if (card) {
    lines.push({ align: 'C', bold: true, text: '** 신용카드 취소전표 **' });
    lines.push(...cardMetaLines(card, { authNoLabel: '취소승인번호', authDateLabel: '취소일시' }));
  }
  lines.push(...qrLine(qrText));
  lines.push(...footerLines(studio.receiptFooter));
  lines.push({ blank: 3 });
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
  installment: pickStr(data, 'outInstallment'),
  merchantNo: pickStr(data, 'outMerchantNo'),
});

export const buildKioskReceipt = (input: BuildKioskReceiptInput): PrinterLine[] => {
  const { paymentMethod, studio, transaction, items, discount, cardData = {}, qrText } = input;
  switch (paymentMethod) {
    case 'card':
      return buildCardPaymentReceipt({
        studio, transaction, items, qrText,
        passDiscount: discount?.amount ?? 0,
        card: cardInfoFromKisData(cardData),
      });
    case 'pass':
      return buildPassPaymentReceipt({
        studio, transaction, items, qrText,
        passName: discount?.description || discount?.targetLabel,
      });
    case 'cash':
      return buildCashRequestReceipt({ studio, transaction, items, qrText });
  }
};
