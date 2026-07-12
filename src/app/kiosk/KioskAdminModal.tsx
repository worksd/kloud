'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // 기본 CSS — 무조건 먼저 import
import calendarStyles from '@/app/kiosk/CalendarStyles.module.css';
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { KioskPaymentRecord } from "@/app/endpoint/kiosk.endpoint";
import { buildCancellationReceipt, buildReprintReceipt, ReceiptStudio } from "@/app/kiosk/kiosk.receipt";
import { sendReceiptToPrinter } from "@/app/kiosk/kiosk.native";
import { kioskImageSrc } from "@/app/kiosk/kiosk.image";
import { listKioskPaymentsAction, cancelKioskPaymentAction, discardKioskPaymentAction, completeKioskPaymentAction, getKioskPaymentRecordDetailAction, clearSelectedKioskIdAction } from "@/app/kiosk/kiosk.actions";

// yyyy-MM-dd 문자열 ↔ Date 변환 헬퍼
const formatYmd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const parseYmd = (s: string): Date | null => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'] as const;

type KioskAdminModalProps = {
  kioskId: number;
  kioskName?: string;
  /** BE에서 키오스크 단위로 내려주는 관리자 비밀번호. 미설정이면 어떤 입력도 통과시키지 않음. */
  password?: string;
  studio: ReceiptStudio;
  onClose: () => void;
};

type Stage = 'pin' | 'list';

const fmtAmount = (n: number) => `${new Intl.NumberFormat('ko-KR').format(n)}원`;

const fmtMethod = (methodType: string): string => {
  const m = methodType.toLowerCase();
  if (m.includes('credit') || m.includes('card')) return '카드';
  if (m.includes('cash')) return '현금';
  if (m.includes('apple')) return '애플페이';
  if (m.includes('pass')) return '패스권';
  return methodType;
};

const fmtPhoneDisplay = (raw?: string): string => {
  if (!raw) return '';
  const d = raw.replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
};

const STATUS_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  Pending:       { label: '결제 대기',   bg: '#FFF4E0', fg: '#B58026' },
  Completed:     { label: '완료',        bg: '#E5F4F0', fg: '#0FA37F' },
  Cancelled:     { label: '취소됨',      bg: '#E6E8EA', fg: '#86898C' },
  CancelPending: { label: '취소 처리 중', bg: '#FFF4E0', fg: '#B58026' },
};

// 카드 결제 여부 — 백엔드는 cardNumber/cardBrand를 더 이상 안 내려주므로 KIS 메타(authNo/vanKey) 또는 methodType으로 판별
const isCardPayment = (record: KioskPaymentRecord): boolean =>
  Boolean(record.authNo || record.vanKey)
  || record.methodType.toLowerCase().includes('card')
  || record.methodType.toLowerCase().includes('credit');

const printCancellationReceipt = (record: KioskPaymentRecord, studio: ReceiptStudio, kioskName: string | undefined, cancelMeta?: { authNo?: string; authDate?: string }) => {
  const lines = buildCancellationReceipt({
    studio,
    transaction: { kioskName, paymentId: record.paymentId },
    items: [{ name: record.productName ?? '', price: record.amount }],
    card: isCardPayment(record) ? {
      authNo: cancelMeta?.authNo ?? record.authNo ?? undefined,
      authDate: cancelMeta?.authDate ?? record.authDate ?? undefined,
    } : undefined,
  });
  sendReceiptToPrinter(lines);
};

export const KioskAdminModal = ({ kioskId, kioskName, password, studio, onClose }: KioskAdminModalProps) => {
  const [stage, setStage] = useState<Stage>('pin');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [payments, setPayments] = useState<KioskPaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  // KST 기준 yyyy-MM-dd. 빈 문자열이면 '전체'(date 파라미터 미전달) — 기본값
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(0);
  // 날짜 picker(react-calendar) popover 토글 + 외부 클릭으로 닫기 위한 컨테이너 ref
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!calendarOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!calendarWrapRef.current) return;
      if (!calendarWrapRef.current.contains(e.target as Node)) setCalendarOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [calendarOpen]);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // 키오스크 변경 — 선택된 키오스크 쿠키(kioskSelectedId)만 해제 후 리로드하면
  // KioskBootstrap이 다시 키오스크 셀렉터 화면을 노출한다.
  const handleChangeKiosk = useCallback(async () => {
    await clearSelectedKioskIdAction();
    window.location.reload();
  }, []);
  // 취소 확인 다이얼로그 — 사용자가 '취소' 버튼을 눌렀을 때 즉시 KIS로 가지 않고 한 번 확인받음
  const [confirmTarget, setConfirmTarget] = useState<KioskPaymentRecord | null>(null);
  // 취소 결과 다이얼로그 — 단일 친화적 메시지로 표시
  const [cancelResult, setCancelResult] = useState<{ kind: 'success' | 'fail'; message?: string } | null>(null);
  // Pending 폐기 확인 다이얼로그
  const [discardTarget, setDiscardTarget] = useState<KioskPaymentRecord | null>(null);
  const [discardingId, setDiscardingId] = useState<string | null>(null);
  // KIS 단말 ST(상태 조회) — Pending 결제 확인용
  type VerifyOutcome =
    | { kind: 'completed'; }                           // 0000 + auto /complete 성공
    | { kind: 'no-record'; replyCode?: string; }       // ST97/98/99 — 단말에 매입 없음
    | { kind: 'system-error'; message?: string; };     // E000 등 시스템 에러
  const [verifyTarget, setVerifyTarget] = useState<KioskPaymentRecord | null>(null);
  const [verifyOutcome, setVerifyOutcome] = useState<VerifyOutcome | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // PIN 입력 처리 — BE가 내려준 password와 길이 + 값 모두 일치할 때만 진입.
  // password 미설정(undefined/'')이면 어떤 입력도 통과시키지 않음.
  const passwordLength = password?.length ?? 0;
  const press = (k: string) => {
    if (k === '⌫') return setPin((p) => p.slice(0, -1));
    if (k === '') return;
    if (passwordLength === 0) return;
    if (pin.length >= passwordLength) return;
    const next = pin + k;
    setPin(next);
    if (next.length === passwordLength) {
      if (next === password) {
        setPinError(null);
        setStage('list');
      } else {
        setPinError('비밀번호가 일치하지 않습니다');
        setTimeout(() => { setPin(''); setPinError(null); }, 800);
      }
    }
  };


  // 결제 목록 fetch — 날짜/페이지 변경 시 자동 재호출 + 새로고침 버튼도 동일 함수 호출
  const fetchPayments = useCallback(() => {
    if (!kioskId) return;
    setLoading(true);
    listKioskPaymentsAction(kioskId, {
      date: selectedDate || undefined,
      page: currentPage,
    })
      .then((res) => {
        if (isGuinnessErrorCase(res)) {
          setToast(res.message ?? '목록을 불러오지 못했습니다');
          return;
        }
        if ('paymentRecords' in res) {
          setPayments(res.paymentRecords);
          setTotalPage(typeof res.totalPage === 'number' ? res.totalPage : 0);
        }
      })
      .catch(() => setToast('목록을 불러오지 못했습니다'))
      .finally(() => setLoading(false));
  }, [kioskId, selectedDate, currentPage]);

  useEffect(() => {
    if (stage !== 'list') return;
    fetchPayments();
  }, [stage, fetchPayments]);

  // 콜백/refs — 네이티브 단일 onKisPaymentResult 핸들러에서 outTranCode='D2' 분기로 취소 응답 처리.
  // 핸들러는 마운트 시 한 번만 설치 (deps에 객체 prop을 넣으면 매 렌더마다 재설치되어 D2 응답이 새는 케이스 발생).
  // 변하는 값은 ref로 보관.
  const cancelingIdRef = useRef<string | null>(null);
  useEffect(() => { cancelingIdRef.current = cancelingId; }, [cancelingId]);
  const paymentsRef = useRef(payments);
  useEffect(() => { paymentsRef.current = payments; }, [payments]);
  const kioskIdRef = useRef(kioskId);
  useEffect(() => { kioskIdRef.current = kioskId; }, [kioskId]);
  const studioRef = useRef(studio);
  useEffect(() => { studioRef.current = studio; }, [studio]);
  const kioskNameRef = useRef(kioskName);
  useEffect(() => { kioskNameRef.current = kioskName; }, [kioskName]);
  const cancelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    type KisResponse = {
      outTranCode?: string;
      success?: boolean;
      canceled?: boolean;
      outAuthNo?: string;
      outAuthDate?: string;
      outReplyMsg1?: string;
      outReplyMsg2?: string;
    };
    type Win = Window & { onKisPaymentResult?: (r: KisResponse) => void };
    // KioskForm의 D1 결제 핸들러를 보존하고, D2 응답만 가로채서 처리. D2 외엔 그대로 위임.
    const previousHandler = (window as Win).onKisPaymentResult;

    (window as Win).onKisPaymentResult = (response) => {
      console.log('[KioskAdminModal] onKisPaymentResult:', response);
      if (response?.outTranCode !== 'D2') {
        previousHandler?.(response);
        return;
      }
      const targetId = cancelingIdRef.current;
      if (!targetId) return;

      if (cancelTimeoutRef.current) { clearTimeout(cancelTimeoutRef.current); cancelTimeoutRef.current = null; }

      if (response.canceled) {
        // 사용자가 단말 화면에서 ESC/취소 — 진행 상태만 해제, 별도 안내 없음
        setCancelingId(null);
        return;
      }
      if (!response.success) {
        setCancelingId(null);
        const reason = [response.outReplyMsg1, response.outReplyMsg2]
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
          .join(' ')
          .trim();
        setCancelResult({ kind: 'fail', message: reason || undefined });
        return;
      }
      // 단말 취소 성공 → 서버에 취소 기록 + 취소 전표 인쇄. authNo/authDate는 신규 취소 거래의 값
      const target = paymentsRef.current.find((p) => p.paymentId === targetId);
      if (!target) { setCancelingId(null); return; }
      cancelKioskPaymentAction({ paymentId: targetId, targetUserId: target.user.id, kioskId: kioskIdRef.current })
        .then((res) => {
          if (isGuinnessErrorCase(res)) {
            setCancelResult({ kind: 'fail' });
            return;
          }
          setPayments((prev) => prev.map((p) => p.paymentId === targetId ? { ...p, status: 'Cancelled' } : p));
          if (target) {
            printCancellationReceipt(target, studioRef.current, kioskNameRef.current, {
              authNo: response.outAuthNo,
              authDate: response.outAuthDate,
            });
          }
          setCancelResult({ kind: 'success' });
        })
        .catch(() => setCancelResult({ kind: 'fail' }))
        .finally(() => setCancelingId(null));
    };
    return () => { (window as Win).onKisPaymentResult = previousHandler; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 토스트 자동 dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCancel = (record: KioskPaymentRecord) => {
    if (cancelingId) return;
    if (record.status === 'Cancelled') return;
    setCancelingId(record.paymentId);

    if (isCardPayment(record)) {
      // 카드: 단말로 D2(취소) 트랜잭션 송출 — 단일 채널 requestKisPayment 사용, 응답은 onKisPaymentResult에서 outTranCode='D2'로 분기.
      // '취소 처리 중' 다이얼로그가 먼저 보이고 난 뒤 단말 호출 — 사용자가 안내를 인지할 시간 확보.
      //
      // KIS-ANDAGT D2 스펙:
      //  - inOrgAuthNo:   원거래 outAuthNo와 정확히 동일
      //  - inOrgAuthDate: 원거래 outAuthDate가 YYYYMMDD(8) 또는 YYYYMMDDHHmmss(14)로 오므로 YY MMDD 6자리로 자름 (앞 2자리 'YY' 절단)
      //  - inTotAmt:      원거래 outTotAmt와 동일
      //  - inCatId:       단말 본체 값 — 네이티브가 자동 채움 (전송 X)
      const rawAuthDate = record.authDate ?? '';
      // 8자리 또는 14자리 모두 앞 2자리(세기)를 잘라 YYMMDD 형태로
      const orgAuthDate = rawAuthDate.length >= 8 ? rawAuthDate.slice(2, 8) : rawAuthDate;
      setTimeout(() => {
        window.KloudEvent?.requestKisPayment?.(JSON.stringify({
          inTranCode: 'D2',
          inOrgAuthNo: record.authNo ?? '',
          inOrgAuthDate: orgAuthDate,
          inTotAmt: `${record.totalAmount ?? record.amount ?? 0}`,
          // inCustomerUuid 생략 — 네이티브가 자동 생성 (idempotency)
        }));
      }, 1000);
      // 30초 타임아웃 안전망 — 네이티브 미응답 시 진행 상태 해제 + 친화적 실패 다이얼로그
      if (cancelTimeoutRef.current) clearTimeout(cancelTimeoutRef.current);
      cancelTimeoutRef.current = setTimeout(() => {
        setCancelingId(null);
        setCancelResult({ kind: 'fail' });
        cancelTimeoutRef.current = null;
      }, 30000);
      return;
    }

    // 현금/패스 등: 단말 취소 없이 바로 서버 취소 + 취소 전표 인쇄
    cancelKioskPaymentAction({ paymentId: record.paymentId, targetUserId: record.user.id, kioskId })
      .then((res) => {
        if (isGuinnessErrorCase(res)) {
          setCancelResult({ kind: 'fail' });
          return;
        }
        setPayments((prev) => prev.map((p) => p.paymentId === record.paymentId ? { ...p, status: 'Cancelled' } : p));
        printCancellationReceipt(record, studio, kioskName);
        setCancelResult({ kind: 'success' });
      })
      .catch(() => setCancelResult({ kind: 'fail' }))
      .finally(() => setCancelingId(null));
  };

  // Pending 폐기 — DELETE /kiosks/payments/:paymentId
  const handleDiscard = (record: KioskPaymentRecord) => {
    if (discardingId) return;
    setDiscardingId(record.paymentId);
    discardKioskPaymentAction(record.paymentId, kioskId)
      .then((res) => {
        if (isGuinnessErrorCase(res)) {
          setToast(res.message ?? '폐기 처리에 실패했어요');
          return;
        }
        setPayments((prev) => prev.filter((p) => p.paymentId !== record.paymentId));
      })
      .catch(() => setToast('폐기 처리에 실패했어요'))
      .finally(() => { setDiscardingId(null); setDiscardTarget(null); });
  };

  // 영수증 재발급 — GET /kiosks/:id/paymentRecords/:paymentId 응답을 받아 buildReprintReceipt → 시리얼 프린터 송출.
  const [reprintingId, setReprintingId] = useState<string | null>(null);
  const handleReprint = (record: KioskPaymentRecord) => {
    if (reprintingId) return;
    setReprintingId(record.paymentId);
    getKioskPaymentRecordDetailAction({ kioskId, paymentId: record.paymentId })
      .then((res) => {
        if (isGuinnessErrorCase(res)) {
          setToast(res.message ?? '영수증 재발급에 실패했어요');
          return;
        }
        const lines = buildReprintReceipt(res, { kioskName: kioskNameRef.current });
        sendReceiptToPrinter(lines);
      })
      .catch(() => setToast('영수증 재발급에 실패했어요'))
      .finally(() => setReprintingId(null));
  };

  // KIS 단말 ST(상태 조회) — 네이티브 인터페이스
  //   web → native:  window.KloudEvent.queryKisTransaction(paymentId)  (catId는 네이티브가 자체 보유)
  //   native → web:  window.onKisTransactionQueryResult(result)
  // 응답 outReplyCode 분기:
  //   '0000' → 단말에 매입 있음 → 자동으로 POST /kiosks/payments/:id/complete 호출
  //   'ST97' / 'ST98' / 'ST99' → 단말에 매입 없음 → '폐기'로 안내
  //   기타 (E000 등) → 시스템 에러로 노출
  type KisQueryResult = {
    success?: boolean;
    canceled?: boolean;
    outReplyCode?: string;
    outReplyMsg1?: string;
    outCustomerUuid?: string;  // 우리가 보낸 paymentId echo
    outAuthNo?: string;
    outAuthDate?: string;
    outVanKey?: string;
    outTotAmt?: string;
    outCardNo?: string;
    outIssuerName?: string;
    outAccepterName?: string;
    outCatId?: string;
    outTradeNumber?: string;
  };
  type QueryWindow = Window & {
    KloudEvent?: { queryKisTransaction?: (paymentId: string) => void };
    onKisTransactionQueryResult?: (r: KisQueryResult) => void;
  };

  // 응답 콜백 — 0000은 자동 /complete, ST??는 폐기 안내, 그 외는 에러로 표시
  const verifyTargetRef = useRef<KioskPaymentRecord | null>(null);
  useEffect(() => { verifyTargetRef.current = verifyTarget; }, [verifyTarget]);
  useEffect(() => {
    const w = window as QueryWindow;
    w.onKisTransactionQueryResult = async (r) => {
      const target = verifyTargetRef.current;
      if (!target) { setVerifyLoading(false); return; }
      // outCustomerUuid가 우리 paymentId와 다르면 무시 (안전장치)
      if (r?.outCustomerUuid && r.outCustomerUuid !== target.paymentId) {
        setVerifyLoading(false);
        return;
      }

      const code = r?.outReplyCode ?? '';

      if (r?.success && code === '0000') {
        // ✅ 단말에 매입 있음 → 자동으로 /complete 호출
        const rawAuthDate = r.outAuthDate ?? '';
        const authDate = rawAuthDate.length >= 8 ? rawAuthDate.slice(0, 8) : rawAuthDate;
        try {
          const res = await completeKioskPaymentAction({
            paymentId: target.paymentId,
            targetUserId: target.user.id,
            kioskId,
            authNo: r.outAuthNo ?? '',
            authDate,
            vanKey: r.outVanKey ?? '',
            totalAmount: Number(r.outTotAmt ?? target.amount),
            cardBrand: r.outAccepterName ?? r.outIssuerName,
            cardNumber: r.outCardNo,
            vanResponse: r as unknown as Record<string, unknown>,
          });
          if (isGuinnessErrorCase(res)) {
            setVerifyOutcome({ kind: 'system-error', message: res.message ?? '결제 완료 처리에 실패했어요' });
            return;
          }
          setPayments((prev) => prev.map((p) => p.paymentId === target.paymentId ? { ...p, status: 'Completed' } : p));
          setVerifyOutcome({ kind: 'completed' });
        } catch {
          setVerifyOutcome({ kind: 'system-error', message: '결제 완료 처리에 실패했어요' });
        } finally {
          setVerifyLoading(false);
        }
        return;
      }

      if (code.startsWith('ST')) {
        // ❌ 단말에 매입 없음 (ST97 카드사 거절 / ST98 키 오류 / ST99 거래 없음)
        setVerifyOutcome({ kind: 'no-record', replyCode: code });
        setVerifyLoading(false);
        return;
      }

      // 시스템 에러 — KIS-ANDAGT 미설치 등
      setVerifyOutcome({ kind: 'system-error', message: r?.outReplyMsg1 });
      setVerifyLoading(false);
    };
    return () => { delete w.onKisTransactionQueryResult; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kioskId]);

  const handleVerifyPayment = (record: KioskPaymentRecord) => {
    setVerifyTarget(record);
    setVerifyOutcome(null);
    setVerifyLoading(true);
    const w = window as QueryWindow;
    if (w.KloudEvent?.queryKisTransaction) {
      w.KloudEvent.queryKisTransaction(record.paymentId);
    } else {
      // 네이티브 미지원 환경 (웹 브라우저) — 즉시 시스템 에러로 마무리
      setVerifyLoading(false);
      setVerifyOutcome({ kind: 'system-error', message: '이 환경에서는 단말 조회를 지원하지 않아요' });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center animate-[fadeIn_200ms_ease-out]">
      {/* 배경 dim — 클릭으로 닫지 않음. 로고 6번째 탭(관리자 진입 직후) 같은 의도치 않은 입력으로 모달이 사라지면 곤란하기 때문. 명시적 닫기 버튼을 통해서만 닫힘 */}
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-[92.6%] max-w-[1000px] bg-white rounded-[28px] flex flex-col overflow-hidden animate-[fadeIn_200ms_ease-out]"
        style={{ maxHeight: '88vh' }}
      >
        {stage === 'pin' ? (
          <>
            <div style={{ padding: 'min(4vw,44px) min(4.4vw,48px) min(1.4vw,16px)' }}>
              <p className="text-black font-bold leading-tight" style={{ fontSize: 'min(2.8vw, 32px)' }}>
                관리자 모드
              </p>
              <p className="text-[#6D7882] mt-[min(0.8vw,10px)]" style={{ fontSize: 'min(1.8vw, 20px)' }}>
                4자리 비밀번호를 입력해주세요
              </p>
            </div>
            <div className="flex items-center justify-center" style={{ gap: 'min(2vw,22px)', padding: 'min(2.4vw,26px) 0' }}>
              {/* 비밀번호 길이만큼 점 표시 — password 미설정이면 0개 (사실상 입력 차단됨을 시각적으로 알림) */}
              {Array.from({ length: passwordLength }, (_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-colors ${i < pin.length ? 'bg-[#1E2124]' : 'bg-[#E6E8EA]'}`}
                  style={{ width: 'min(2.6vw, 28px)', height: 'min(2.6vw, 28px)' }}
                />
              ))}
            </div>
            <div className="text-center px-[min(5.6vw,60px)]" style={{ minHeight: 'min(2.4vw,26px)' }}>
              {pinError && (
                <span className="text-[#E55B5B] font-medium" style={{ fontSize: 'min(1.8vw, 20px)' }}>{pinError}</span>
              )}
            </div>
            <div className="grid grid-cols-3 px-[min(4vw,44px)] pt-[min(2vw,22px)] pb-[min(3vw,32px)]" style={{ gap: 'min(1vw,12px)' }}>
              {KEYS.map((k, idx) => (
                <button
                  key={idx}
                  onClick={() => press(k)}
                  disabled={k === ''}
                  className={`h-[min(8vw,90px)] rounded-[20px] flex items-center justify-center active:scale-[0.96] transition-transform ${
                    k === '' ? 'bg-transparent' : k === '⌫' ? 'bg-[#F2F4F6]' : 'bg-[#F9F9FB]'
                  }`}
                >
                  <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(3.2vw, 34px)' }}>{k}</span>
                </button>
              ))}
            </div>
            <div className="px-[min(4vw,44px)] pb-[min(3.7vw,40px)]">
              <button
                onClick={onClose}
                className="w-full h-[min(7vw,76px)] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
              >
                <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.4vw, 26px)' }}>닫기</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between flex-wrap" style={{ padding: 'min(3.4vw,36px) min(4vw,44px) min(1.4vw,16px)', gap: 'min(1vw,12px)' }}>
              <div className="flex items-center" style={{ gap: 'min(1.2vw,14px)' }}>
                <p className="text-black font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>결제 내역</p>
                {/* 키오스크 변경 — 누르면 kioskSelectedId 쿠키 해제 후 리로드 → 셀렉터로 */}
                <button
                  onClick={handleChangeKiosk}
                  className="rounded-[12px] bg-[#F2F4F6] active:scale-[0.97] transition-transform flex items-center"
                  style={{ padding: 'min(0.9vw,10px) min(1.4vw,16px)', gap: 'min(0.6vw,8px)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 'min(1.8vw,20px)', height: 'min(1.8vw,20px)' }}>
                    <rect x="4" y="3" width="16" height="18" rx="2" stroke="#1E2124" strokeWidth="1.6"/>
                    <path d="M9 17H15" stroke="#1E2124" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[#1E2124] font-medium" style={{ fontSize: 'min(1.6vw, 18px)' }}>
                    {kioskName ?? `#${kioskId}`} 변경
                  </span>
                </button>
              </div>
              <div className="flex items-center" style={{ gap: 'min(0.8vw,10px)' }}>
                {/* 날짜 필터 — react-calendar popover */}
                <div className="relative" ref={calendarWrapRef}>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen((v) => !v)}
                    className="rounded-[12px] bg-[#F2F4F6] active:scale-[0.97] transition-transform flex items-center"
                    style={{ padding: 'min(1vw,12px) min(1.6vw,18px)', gap: 'min(0.6vw,8px)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 'min(1.8vw,20px)', height: 'min(1.8vw,20px)' }}>
                      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="#1E2124" strokeWidth="1.8"/>
                      <path d="M3 10H21" stroke="#1E2124" strokeWidth="1.8"/>
                      <path d="M8 3V7" stroke="#1E2124" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M16 3V7" stroke="#1E2124" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    <span className="text-[#1E2124] font-medium" style={{ fontSize: 'min(1.6vw, 18px)' }}>
                      {selectedDate || '전체'}
                    </span>
                  </button>
                  {calendarOpen && (
                    <div className={`${calendarStyles.calendarWrapper} absolute right-0 z-[80] mt-2 bg-white rounded-[16px] shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-[#E6E8EA] p-3`} style={{ width: 320 }}>
                      <Calendar
                        onChange={(value) => {
                          const d = Array.isArray(value) ? value[0] : value;
                          if (d instanceof Date) {
                            setSelectedDate(formatYmd(d));
                            setCurrentPage(1);
                            setCalendarOpen(false);
                          }
                        }}
                        value={parseYmd(selectedDate)}
                        formatDay={(_locale, d) => String(d.getDate())}
                        locale="ko-KR"
                        calendarType="gregory"
                      />
                    </div>
                  )}
                </div>
                {selectedDate && (
                  <button
                    onClick={() => { setSelectedDate(''); setCurrentPage(1); }}
                    aria-label="날짜 필터 해제"
                    className="rounded-full bg-[#F2F4F6] active:scale-[0.97] transition-transform flex items-center justify-center"
                    style={{ width: 'min(3.4vw,36px)', height: 'min(3.4vw,36px)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: '50%', height: '50%' }}>
                      <path d="M6 6L18 18M6 18L18 6" stroke="#6D7882" strokeWidth="2.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
                <button
                  onClick={fetchPayments}
                  disabled={loading}
                  aria-label="새로고침"
                  className="rounded-[12px] bg-[#F2F4F6] active:scale-[0.97] transition-transform flex items-center justify-center disabled:opacity-50"
                  style={{ width: 'min(4.4vw,48px)', height: 'min(4.4vw,48px)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className={loading ? 'animate-spin' : ''} style={{ width: '60%', height: '60%' }}>
                    <path d="M4 12C4 7.58 7.58 4 12 4C14.5 4 16.7 5.13 18.16 6.94" stroke="#1E2124" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M19 3V8H14" stroke="#1E2124" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 12C20 16.42 16.42 20 12 20C9.5 20 7.3 18.87 5.84 17.06" stroke="#1E2124" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M5 21V16H10" stroke="#1E2124" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="px-[min(1.6vw,18px)] py-[min(1vw,12px)] rounded-[12px] bg-[#F2F4F6] active:scale-[0.97] transition-transform"
                >
                  <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.8vw, 20px)' }}>닫기</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ padding: 'min(0.8vw,10px) min(3vw,32px) min(2vw,22px)' }}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                </div>
              ) : payments.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <span className="text-[#6D7882]" style={{ fontSize: 'min(2vw, 22px)' }}>결제 내역이 없습니다</span>
                </div>
              ) : (
                <div className="flex flex-col" style={{ gap: 'min(1vw, 12px)' }}>
                  {payments.map((record) => {
                    const isCancelled = record.status === 'Cancelled' || record.status === 'CancelPending';
                    const isPending = record.status === 'Pending';
                    const isThisCanceling = cancelingId === record.paymentId;
                    const isThisDiscarding = discardingId === record.paymentId;
                    const badge = STATUS_BADGE[record.status] ?? { label: record.status, bg: '#E6E8EA', fg: '#6D7882' };
                    const userDisplay = record.user.nickName || record.user.name || '';
                    const phoneDisplay = fmtPhoneDisplay(record.user.phone);
                    return (
                      <div
                        key={record.paymentId}
                        className={`rounded-[16px] flex items-center px-[min(2.4vw,26px)] py-[min(2vw,22px)] bg-[#F9F9FB] ${
                          record.status === 'Cancelled' ? 'opacity-60' : ''
                        }`}
                        style={{ gap: 'min(1.6vw,18px)' }}
                      >
                        <div
                          className="rounded-full overflow-hidden bg-[#E8E8EA] flex-shrink-0 flex items-center justify-center"
                          style={{ width: 'min(4.4vw,48px)', height: 'min(4.4vw,48px)' }}
                        >
                          {record.user.profileImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={kioskImageSrc(record.user.profileImageUrl, 120)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
                              <circle cx="12" cy="9" r="3.5" stroke="#A6B5C9" strokeWidth="1.8"/>
                              <path d="M5 19C5 16 8 14 12 14S19 16 19 19" stroke="#A6B5C9" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1" style={{ gap: 'min(0.5vw,7px)' }}>
                          <div className="flex items-center" style={{ gap: 'min(0.8vw,10px)' }}>
                            <span className="text-black font-bold truncate" style={{ fontSize: 'min(2vw, 22px)' }}>
                              {record.productName ?? ''}
                            </span>
                            <span
                              className="shrink-0 px-[min(1vw,12px)] py-[min(0.3vw,4px)] rounded-full font-bold"
                              style={{ fontSize: 'min(1.3vw, 14px)', backgroundColor: badge.bg, color: badge.fg }}
                            >
                              {badge.label}
                            </span>
                          </div>
                          {(userDisplay || phoneDisplay) && (
                            <div className="flex items-center" style={{ gap: 'min(0.8vw,10px)' }}>
                              <span className="text-[#1E2124] font-medium truncate" style={{ fontSize: 'min(1.6vw, 17px)' }}>
                                {userDisplay}
                              </span>
                              {phoneDisplay && (
                                <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vw, 15px)' }}>
                                  {phoneDisplay}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center" style={{ gap: 'min(0.8vw,10px)' }}>
                            <span className="text-[#6D7882]" style={{ fontSize: 'min(1.4vw, 15px)' }}>
                              {fmtMethod(record.methodType)}
                            </span>
                            <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vw, 15px)' }}>·</span>
                            <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vw, 15px)' }}>
                              {record.createdAt}
                            </span>
                            {record.cancelledAt && (
                              <>
                                <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vw, 15px)' }}>→ 취소</span>
                                <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vw, 15px)' }}>
                                  {record.cancelledAt}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-[#1E2124] shrink-0" style={{ fontSize: 'min(2vw, 22px)' }}>
                          {fmtAmount(record.amount)}
                        </span>
                        {isPending ? (
                          // Pending: '결제 확인하기'(KIS ST 조회 → 자동 /complete) + '폐기'(DELETE) 두 버튼
                          <div className="flex items-center shrink-0" style={{ gap: 'min(0.6vw,8px)' }}>
                            <button
                              onClick={() => handleVerifyPayment(record)}
                              disabled={isThisDiscarding || verifyLoading}
                              className="px-[min(1.6vw,18px)] py-[min(1.2vw,14px)] rounded-[12px] bg-[#F2F4F6] active:scale-[0.97] transition-transform disabled:opacity-50"
                            >
                              <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.6vw, 18px)' }}>
                                결제 확인하기
                              </span>
                            </button>
                            <button
                              onClick={() => setDiscardTarget(record)}
                              disabled={isThisDiscarding || discardingId !== null}
                              className={`px-[min(1.6vw,18px)] py-[min(1.2vw,14px)] rounded-[12px] active:scale-[0.97] transition-transform ${
                                discardingId !== null ? 'bg-[#E6E8EA]' : 'bg-[#1E2124]'
                              }`}
                            >
                              <span
                                className={`font-bold ${discardingId !== null ? 'text-[#86898C]' : 'text-white'}`}
                                style={{ fontSize: 'min(1.6vw, 18px)' }}
                              >
                                {isThisDiscarding ? '폐기 중…' : '폐기'}
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center shrink-0" style={{ gap: 'min(0.6vw,8px)' }}>
                            <button
                              onClick={() => handleReprint(record)}
                              disabled={reprintingId !== null}
                              className="px-[min(1.6vw,18px)] py-[min(1.2vw,14px)] rounded-[12px] bg-[#F2F4F6] active:scale-[0.97] transition-transform disabled:opacity-50"
                            >
                              <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.6vw, 18px)' }}>
                                {reprintingId === record.paymentId ? '재발급 중…' : '영수증 재발급'}
                              </span>
                            </button>
                            {!isCancelled && (
                              <button
                                onClick={() => setConfirmTarget(record)}
                                disabled={isThisCanceling || cancelingId !== null}
                                className={`px-[min(1.8vw,20px)] py-[min(1.2vw,14px)] rounded-[12px] active:scale-[0.97] transition-transform ${
                                  cancelingId !== null ? 'bg-[#E6E8EA]' : 'bg-[#1E2124]'
                                }`}
                              >
                                <span
                                  className={`font-bold ${cancelingId !== null ? 'text-[#86898C]' : 'text-white'}`}
                                  style={{ fontSize: 'min(1.6vw, 18px)' }}
                                >
                                  {isThisCanceling ? '취소 중…' : '취소'}
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* 페이지네이션 — page 파라미터 사용 시(BE가 totalPage 내려줌) 1보다 클 때만 노출 */}
            {totalPage > 1 && (
              <div className="shrink-0 flex items-center justify-center" style={{ gap: 'min(1.6vw,18px)', padding: 'min(1vw,12px) 0 min(1.6vw,18px)' }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || loading}
                  className="rounded-[12px] bg-[#F2F4F6] active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ padding: 'min(1vw,12px) min(1.8vw,20px)' }}
                >
                  <span className="text-[#1E2124] font-medium" style={{ fontSize: 'min(1.6vw, 18px)' }}>이전</span>
                </button>
                <span className="text-[#1E2124] font-medium" style={{ fontSize: 'min(1.8vw, 20px)' }}>
                  {currentPage} / {totalPage}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPage, p + 1))}
                  disabled={currentPage >= totalPage || loading}
                  className="rounded-[12px] bg-[#F2F4F6] active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ padding: 'min(1vw,12px) min(1.8vw,20px)' }}
                >
                  <span className="text-[#1E2124] font-medium" style={{ fontSize: 'min(1.6vw, 18px)' }}>다음</span>
                </button>
              </div>
            )}
          </>
        )}

        {toast && (
          <div className="absolute left-1/2 -translate-x-1/2 px-[min(2.4vw,26px)] py-[min(1.2vw,14px)] rounded-[12px] bg-black/85" style={{ bottom: 'min(2vw,22px)' }}>
            <span className="text-white font-medium" style={{ fontSize: 'min(1.6vw, 18px)' }}>{toast}</span>
          </div>
        )}
      </div>

      {/* 취소 확인 다이얼로그 — '취소' 버튼 누르자마자 KIS 단말로 보내지 않고 한 번 확인 */}
      {confirmTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-[5%] animate-[fadeIn_180ms_ease-out]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmTarget(null)} />
          <div
            className="relative bg-white rounded-[24px] w-full max-w-[560px] flex flex-col animate-[scaleIn_180ms_ease-out]"
            style={{ padding: 'min(3.4vw,36px) min(3.4vw,36px) min(2.6vw,28px)' }}
          >
            <p className="text-black font-bold text-center" style={{ fontSize: 'min(2.4vw, 26px)' }}>
              결제를 취소할까요?
            </p>
            <p className="text-[#6D7882] text-center mt-[min(1vw,12px)]" style={{ fontSize: 'min(1.7vw, 18px)' }}>
              취소 후에는 되돌릴 수 없어요.
            </p>
            <div className="mt-[min(1.4vw,16px)] bg-[#F9F9FB] rounded-[16px] flex items-center justify-between px-[min(2.4vw,26px)] py-[min(1.6vw,18px)]">
              <span className="text-[#1E2124] font-medium truncate" style={{ fontSize: 'min(1.7vw, 18px)' }}>
                {confirmTarget.productName ?? ''}
              </span>
              <span className="text-black font-bold shrink-0 ml-[min(1vw,12px)]" style={{ fontSize: 'min(1.9vw, 20px)' }}>
                {fmtAmount(confirmTarget.amount)}
              </span>
            </div>
            <div className="mt-[min(2vw,22px)] flex" style={{ gap: 'min(1vw,12px)' }}>
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 rounded-[14px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
                style={{ height: 'min(6.4vw,68px)' }}
              >
                <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.9vw, 20px)' }}>아니요</span>
              </button>
              <button
                onClick={() => {
                  const target = confirmTarget;
                  setConfirmTarget(null);
                  handleCancel(target);
                }}
                className="flex-1 rounded-[14px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
                style={{ height: 'min(6.4vw,68px)' }}
              >
                <span className="text-white font-bold" style={{ fontSize: 'min(1.9vw, 20px)' }}>네, 취소할게요</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 카드 단말 취소 진행 중 — KIS 단말 화면을 방해하지 않도록 가벼운 배경 + 스피너만 */}
      {cancelingId && (
        <div className="fixed inset-0 z-[68] flex items-center justify-center bg-black/40 animate-[fadeIn_180ms_ease-out]">
          <div className="bg-white rounded-[20px] flex flex-col items-center" style={{ padding: 'min(3vw,32px) min(4vw,44px)' }}>
            <div className="w-10 h-10 border-4 border-black/15 border-t-black rounded-full animate-spin" />
            <p className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2vw, 22px)' }}>
              취소 처리 중이에요
            </p>
            <p className="text-[#6D7882] mt-[min(0.6vw,8px)] text-center" style={{ fontSize: 'min(1.6vw, 17px)' }}>
              단말의 안내에 따라 카드를 다시 대주세요
            </p>
          </div>
        </div>
      )}

      {/* 취소 결과 — 단일 친화 다이얼로그 (성공/실패) */}
      {cancelResult && (
        <div className="fixed inset-0 z-[72] flex items-center justify-center px-[5%] animate-[fadeIn_180ms_ease-out]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCancelResult(null)} />
          <div
            className="relative bg-white rounded-[24px] w-full max-w-[520px] flex flex-col items-center animate-[scaleIn_180ms_ease-out]"
            style={{ padding: 'min(3.4vw,36px) min(3.4vw,36px) min(2.6vw,28px)' }}
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 'min(7vw,72px)',
                height: 'min(7vw,72px)',
                background: cancelResult.kind === 'success' ? '#E5F4F0' : '#FFE9E9',
              }}
            >
              {cancelResult.kind === 'success' ? (
                <svg viewBox="0 0 24 24" fill="none" style={{ width: '50%', height: '50%' }}>
                  <path d="M5 12.5L10 17.5L19.5 7" stroke="#0FA37F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" style={{ width: '50%', height: '50%' }}>
                  <path d="M12 3L22 21H2L12 3Z" stroke="#E55B5B" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M12 10V14M12 17V18" stroke="#E55B5B" strokeWidth="2.4" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <p className="text-black font-bold text-center mt-[min(1.6vw,18px)]" style={{ fontSize: 'min(2.4vw, 26px)' }}>
              {cancelResult.kind === 'success' ? '결제가 취소되었어요' : '취소를 처리하지 못했어요'}
            </p>
            {cancelResult.kind === 'fail' && cancelResult.message && (
              <p className="text-[#1E2124] text-center mt-[min(1vw,12px)] whitespace-pre-line" style={{ fontSize: 'min(1.8vw, 20px)' }}>
                {cancelResult.message}
              </p>
            )}
            <p className="text-[#6D7882] text-center mt-[min(0.8vw,10px)]" style={{ fontSize: 'min(1.7vw, 18px)' }}>
              {cancelResult.kind === 'success' ? '취소 영수증이 출력되었어요' : '잠시 후 다시 시도해주세요'}
            </p>
            <button
              onClick={() => setCancelResult(null)}
              className="mt-[min(2vw,22px)] w-full rounded-[14px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
              style={{ height: 'min(6.4vw,68px)' }}
            >
              <span className="text-white font-bold" style={{ fontSize: 'min(1.9vw, 20px)' }}>확인</span>
            </button>
          </div>
        </div>
      )}

      {/* Pending 폐기 확인 다이얼로그 */}
      {discardTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-[5%] animate-[fadeIn_180ms_ease-out]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDiscardTarget(null)} />
          <div
            className="relative bg-white rounded-[24px] w-full max-w-[560px] flex flex-col animate-[scaleIn_180ms_ease-out]"
            style={{ padding: 'min(3.4vw,36px) min(3.4vw,36px) min(2.6vw,28px)' }}
          >
            <p className="text-black font-bold text-center" style={{ fontSize: 'min(2.4vw, 26px)' }}>
              결제 대기 건을 폐기할까요?
            </p>
            <p className="text-[#6D7882] text-center mt-[min(1vw,12px)]" style={{ fontSize: 'min(1.7vw, 18px)' }}>
              단말에 매입이 안 된 결제 대기 항목을 정리해요.{'\n'}매입이 실제로 됐다면 먼저 ‘결제 확인하기’로 완료 처리하세요.
            </p>
            <div className="mt-[min(1.4vw,16px)] bg-[#F9F9FB] rounded-[16px] flex items-center justify-between px-[min(2.4vw,26px)] py-[min(1.6vw,18px)]">
              <span className="text-[#1E2124] font-medium truncate" style={{ fontSize: 'min(1.7vw, 18px)' }}>
                {discardTarget.productName ?? ''}
              </span>
              <span className="text-black font-bold shrink-0 ml-[min(1vw,12px)]" style={{ fontSize: 'min(1.9vw, 20px)' }}>
                {fmtAmount(discardTarget.amount)}
              </span>
            </div>
            <div className="mt-[min(2vw,22px)] flex" style={{ gap: 'min(1vw,12px)' }}>
              <button
                onClick={() => setDiscardTarget(null)}
                className="flex-1 rounded-[14px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
                style={{ height: 'min(6.4vw,68px)' }}
              >
                <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.9vw, 20px)' }}>아니요</span>
              </button>
              <button
                onClick={() => handleDiscard(discardTarget)}
                disabled={discardingId !== null}
                className="flex-1 rounded-[14px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform disabled:opacity-60"
                style={{ height: 'min(6.4vw,68px)' }}
              >
                <span className="text-white font-bold" style={{ fontSize: 'min(1.9vw, 20px)' }}>네, 폐기할게요</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 확인하기(KIS ST 조회) — 진행/결과 다이얼로그.
          0000 = 자동 /complete 처리 후 'completed' 노출, ST?? = 폐기 안내, 그 외 = 시스템 에러 */}
      {verifyTarget && (
        <div className="fixed inset-0 z-[72] flex items-center justify-center px-[5%] animate-[fadeIn_180ms_ease-out]">
          <div className="absolute inset-0 bg-black/60" onClick={() => { if (!verifyLoading) { setVerifyTarget(null); setVerifyOutcome(null); } }} />
          <div
            className="relative bg-white rounded-[24px] w-full max-w-[560px] flex flex-col animate-[scaleIn_180ms_ease-out]"
            style={{ padding: 'min(3.4vw,36px) min(3.4vw,36px) min(2.6vw,28px)' }}
          >
            {verifyLoading && (
              <>
                <p className="text-black font-bold text-center" style={{ fontSize: 'min(2.4vw, 26px)' }}>
                  단말에서 결제 내역을 확인 중이에요
                </p>
                <div className="flex items-center justify-center" style={{ marginTop: 'min(2vw,22px)', minHeight: 'min(8vw,80px)' }}>
                  <div className="w-10 h-10 border-4 border-black/15 border-t-black rounded-full animate-spin" />
                </div>
              </>
            )}

            {!verifyLoading && verifyOutcome?.kind === 'completed' && (
              <>
                <div className="self-center rounded-full bg-[#E5F4F0] flex items-center justify-center" style={{ width: 'min(7vw,72px)', height: 'min(7vw,72px)' }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '50%', height: '50%' }}>
                    <path d="M5 12.5L10 17.5L19.5 7" stroke="#0FA37F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-black font-bold text-center mt-[min(1.6vw,18px)]" style={{ fontSize: 'min(2.4vw, 26px)' }}>
                  결제 완료로 처리했어요
                </p>
                <p className="text-[#6D7882] text-center mt-[min(0.8vw,10px)]" style={{ fontSize: 'min(1.7vw, 18px)' }}>
                  단말 매입이 확인되어 결제가 완료 상태로 전환됐어요
                </p>
                <button
                  onClick={() => { setVerifyTarget(null); setVerifyOutcome(null); }}
                  className="mt-[min(2vw,22px)] w-full rounded-[14px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
                  style={{ height: 'min(6.4vw,68px)' }}
                >
                  <span className="text-white font-bold" style={{ fontSize: 'min(1.9vw, 20px)' }}>확인</span>
                </button>
              </>
            )}

            {!verifyLoading && verifyOutcome?.kind === 'no-record' && (
              <>
                <div className="self-center rounded-full bg-[#FFE9E9] flex items-center justify-center" style={{ width: 'min(7vw,72px)', height: 'min(7vw,72px)' }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '50%', height: '50%' }}>
                    <path d="M12 3L22 21H2L12 3Z" stroke="#E55B5B" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M12 10V14M12 17V18" stroke="#E55B5B" strokeWidth="2.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-black font-bold text-center mt-[min(1.6vw,18px)]" style={{ fontSize: 'min(2.4vw, 26px)' }}>
                  단말에 결제 내역이 없어요
                </p>
                <p className="text-[#6D7882] text-center mt-[min(0.8vw,10px)] whitespace-pre-line" style={{ fontSize: 'min(1.7vw, 18px)' }}>
                  {verifyOutcome.replyCode === 'ST97' ? '결제 시도가 카드사에서 거절됐어요' :
                   verifyOutcome.replyCode === 'ST98' ? '결제 키 정보가 잘못됐어요' :
                   '이 결제로 단말에 매입된 거래가 없어요'}
                  {'\n'}안전하게 폐기 처리하세요.
                </p>
                <div className="mt-[min(2vw,22px)] flex" style={{ gap: 'min(1vw,12px)' }}>
                  <button
                    onClick={() => { setVerifyTarget(null); setVerifyOutcome(null); }}
                    className="flex-1 rounded-[14px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
                    style={{ height: 'min(6.4vw,68px)' }}
                  >
                    <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.9vw, 20px)' }}>닫기</span>
                  </button>
                  <button
                    onClick={() => {
                      const target = verifyTarget;
                      setVerifyTarget(null);
                      setVerifyOutcome(null);
                      setDiscardTarget(target);
                    }}
                    className="flex-1 rounded-[14px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
                    style={{ height: 'min(6.4vw,68px)' }}
                  >
                    <span className="text-white font-bold" style={{ fontSize: 'min(1.9vw, 20px)' }}>폐기하기</span>
                  </button>
                </div>
              </>
            )}

            {!verifyLoading && verifyOutcome?.kind === 'system-error' && (
              <>
                <div className="self-center rounded-full bg-[#FFE9E9] flex items-center justify-center" style={{ width: 'min(7vw,72px)', height: 'min(7vw,72px)' }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '50%', height: '50%' }}>
                    <path d="M12 3L22 21H2L12 3Z" stroke="#E55B5B" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M12 10V14M12 17V18" stroke="#E55B5B" strokeWidth="2.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-black font-bold text-center mt-[min(1.6vw,18px)]" style={{ fontSize: 'min(2.4vw, 26px)' }}>
                  단말 조회에 실패했어요
                </p>
                {verifyOutcome.message && (
                  <p className="text-[#1E2124] text-center mt-[min(1vw,12px)] whitespace-pre-line" style={{ fontSize: 'min(1.8vw, 20px)' }}>
                    {verifyOutcome.message}
                  </p>
                )}
                <p className="text-[#6D7882] text-center mt-[min(0.8vw,10px)]" style={{ fontSize: 'min(1.7vw, 18px)' }}>
                  잠시 후 다시 시도해주세요
                </p>
                <button
                  onClick={() => { setVerifyTarget(null); setVerifyOutcome(null); }}
                  className="mt-[min(2vw,22px)] w-full rounded-[14px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
                  style={{ height: 'min(6.4vw,68px)' }}
                >
                  <span className="text-white font-bold" style={{ fontSize: 'min(1.9vw, 20px)' }}>확인</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

