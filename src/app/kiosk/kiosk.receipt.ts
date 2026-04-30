/**
 * 키오스크 영수증 빌더
 *
 * 3가지 영수증 타입을 시리얼 프린터 lines 페이로드로 빌드한다.
 *  - A. {@link buildCardPaymentReceipt} — 카드 결제 (신용승인전표 포함)
 *  - B. {@link buildPassPaymentReceipt} — 패스권으로 구매
 *  - C. {@link buildCashRequestReceipt} — 현금 결제 신청 (인포에서 마무리, 도장 영역 포함)
 *
 * 반환값은 `window.KloudEvent.requestSerialPrint(JSON.stringify({ lines }))`로 그대로 송출한다.
 */

export type PrinterAlign = 'L' | 'C' | 'R';

/**
 * 시리얼 프린터 한 줄 페이로드. 필드는 mutually exclusive하게 사용한다 (text / blank / qr 중 하나).
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

export type CardReceiptInput = {
  studio: ReceiptStudio;
  transaction?: ReceiptTransaction;
  items: ReceiptItem[];
  /** 패스권으로 일부 차감된 금액 (없으면 0) */
  passDiscount?: number;
  card: CardPaymentInfo;
  qrText?: string;
};

export type PassReceiptInput = {
  studio: ReceiptStudio;
  transaction?: ReceiptTransaction;
  items: ReceiptItem[];
  passName?: string;
  qrText?: string;
};

export type CashRequestReceiptInput = {
  studio: ReceiptStudio;
  transaction?: ReceiptTransaction;
  items: ReceiptItem[];
  qrText?: string;
};

// ─────────────────────────────── 공통 헬퍼 ───────────────────────────────

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

const sumPrice = (items: ReceiptItem[]): number =>
  items.reduce((s, i) => s + i.price, 0);

// 도장 영역 — 외곽 22 char × 5줄 (58mm 종이 기준 약 35×20mm)
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

// ───────────────────────────── 빌더 A: 카드 결제 ─────────────────────────────

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
  if (card.cardNo) lines.push({ align: 'L', text: `카드번호 ${card.cardNo}` });
  if (card.issuerName) lines.push({ align: 'L', text: `카드사 ${card.issuerName}` });
  if (card.authNo) lines.push({ align: 'L', text: `승인번호 ${card.authNo}` });
  if (card.authDate) lines.push({ align: 'L', text: `승인일시 ${card.authDate}` });
  if (card.installment) {
    const display = card.installment === '00' ? '일시불' : `${parseInt(card.installment, 10)}개월`;
    lines.push({ align: 'L', text: `할부 ${display}` });
  }
  if (card.merchantNo) lines.push({ align: 'L', text: `가맹점 ${card.merchantNo}` });
  lines.push(...qrLine(qrText));
  lines.push({ blank: 3 });
  return lines;
};

// ──────────────────────────── 빌더 B: 패스권 구매 ────────────────────────────

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
    { blank: 3 },
  ];
};

// ─────────────────────────── 빌더 C: 현장 결제 신청 ───────────────────────────

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
    { blank: 3 },
  ];
};
