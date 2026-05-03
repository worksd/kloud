'use client';

import React, { useEffect, useRef, useState } from 'react';
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { listKioskPaymentsAction, cancelKioskPaymentAction, getKiosksAction, saveSelectedKioskIdAction } from "@/app/kiosk/kiosk.actions";
import { KioskPaymentRecord } from "@/app/endpoint/kiosk.endpoint";
import { KioskResponse } from "@/app/endpoint/kiosk.endpoint";
import { buildCancellationReceipt, ReceiptStudio } from "@/app/kiosk/kiosk.receipt";
import { sendReceiptToPrinter } from "@/app/kiosk/kiosk.native";

const ADMIN_PIN = '0000';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'] as const;

type KioskAdminModalProps = {
  kioskId: number;
  kioskName?: string;
  studio: ReceiptStudio;
  onClose: () => void;
};

type Stage = 'pin' | 'list' | 'switch-kiosk';

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
    transaction: { kioskName },
    items: [{ name: record.productName ?? '', price: record.amount }],
    card: isCardPayment(record) ? {
      authNo: cancelMeta?.authNo ?? record.authNo ?? undefined,
      authDate: cancelMeta?.authDate ?? record.authDate ?? undefined,
    } : undefined,
  });
  sendReceiptToPrinter(lines);
};

export const KioskAdminModal = ({ kioskId, kioskName, studio, onClose }: KioskAdminModalProps) => {
  const [stage, setStage] = useState<Stage>('pin');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [payments, setPayments] = useState<KioskPaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [kiosks, setKiosks] = useState<KioskResponse[]>([]);
  const [loadingKiosks, setLoadingKiosks] = useState(false);
  const [switchingKioskId, setSwitchingKioskId] = useState<number | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // 취소 확인 다이얼로그 — 사용자가 '취소' 버튼을 눌렀을 때 즉시 KIS로 가지 않고 한 번 확인받음
  const [confirmTarget, setConfirmTarget] = useState<KioskPaymentRecord | null>(null);
  // 취소 결과 다이얼로그 — 단일 친화적 메시지로 표시
  const [cancelResult, setCancelResult] = useState<{ kind: 'success' | 'fail'; message?: string } | null>(null);

  // PIN 입력 처리
  const press = (k: string) => {
    if (k === '⌫') return setPin((p) => p.slice(0, -1));
    if (k === '') return;
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      if (next === ADMIN_PIN) {
        setPinError(null);
        setStage('list');
      } else {
        setPinError('비밀번호가 일치하지 않습니다');
        setTimeout(() => { setPin(''); setPinError(null); }, 800);
      }
    }
  };

  // 키오스크 목록 fetch — switch-kiosk 단계 진입 시
  useEffect(() => {
    if (stage !== 'switch-kiosk') return;
    setLoadingKiosks(true);
    getKiosksAction()
      .then((res) => {
        if (isGuinnessErrorCase(res)) {
          setToast(res.message ?? '키오스크 목록을 불러오지 못했습니다');
          return;
        }
        if ('kiosks' in res) setKiosks(res.kiosks);
      })
      .catch(() => setToast('키오스크 목록을 불러오지 못했습니다'))
      .finally(() => setLoadingKiosks(false));
  }, [stage]);

  const handleSwitchKiosk = async (k: KioskResponse) => {
    if (k.status !== 'Active') return;
    if (k.id === kioskId) {
      setStage('list');
      return;
    }
    setSwitchingKioskId(k.id);
    try {
      await saveSelectedKioskIdAction(k.id);
      // 쿠키 갱신 후 페이지 리로드 — KioskBootstrap이 새 kioskId로 다시 부트스트랩
      window.location.reload();
    } catch {
      setToast('키오스크 변경에 실패했습니다');
      setSwitchingKioskId(null);
    }
  };

  // 결제 목록 fetch
  useEffect(() => {
    if (stage !== 'list' || !kioskId) return;
    setLoading(true);
    listKioskPaymentsAction(kioskId)
      .then((res) => {
        if (isGuinnessErrorCase(res)) {
          setToast(res.message ?? '목록을 불러오지 못했습니다');
          return;
        }
        if ('paymentRecords' in res) setPayments(res.paymentRecords);
      })
      .catch(() => setToast('목록을 불러오지 못했습니다'))
      .finally(() => setLoading(false));
  }, [stage, kioskId]);

  // 콜백/refs — 네이티브 단일 onKisPaymentResult 핸들러에서 outTranCode='D2' 분기로 취소 응답 처리
  const cancelingIdRef = useRef<string | null>(null);
  useEffect(() => { cancelingIdRef.current = cancelingId; }, [cancelingId]);
  const paymentsRef = useRef(payments);
  useEffect(() => { paymentsRef.current = payments; }, [payments]);
  const cancelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    type KisResponse = {
      outTranCode?: string;
      success?: boolean;
      canceled?: boolean;
      outAuthNo?: string;
      outAuthDate?: string;
      outReplyMsg1?: string;
    };
    type Win = Window & { onKisPaymentResult?: (r: KisResponse) => void };
    // KioskForm의 D1 결제 핸들러를 보존하고, D2 응답만 가로채서 처리. D2 외엔 그대로 위임.
    const previousHandler = (window as Win).onKisPaymentResult;

    (window as Win).onKisPaymentResult = (response) => {
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
        setCancelResult({ kind: 'fail' });
        return;
      }
      // 단말 취소 성공 → 서버에 취소 기록 + 취소 전표 인쇄. authNo/authDate는 신규 취소 거래의 값
      const target = paymentsRef.current.find((p) => p.paymentId === targetId);
      cancelKioskPaymentAction(targetId, kioskId)
        .then((res) => {
          if (isGuinnessErrorCase(res)) {
            setCancelResult({ kind: 'fail' });
            return;
          }
          setPayments((prev) => prev.map((p) => p.paymentId === targetId ? { ...p, status: 'Cancelled' } : p));
          if (target) {
            printCancellationReceipt(target, studio, kioskName, {
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
  }, [kioskId, studio, kioskName]);

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
      // '취소 처리 중' 다이얼로그가 먼저 보이고 난 뒤 단말 호출 — 사용자가 안내를 인지할 시간 확보
      setTimeout(() => {
        window.KloudEvent?.requestKisPayment?.(JSON.stringify({
          inTranCode: 'D2',
          inAuthNo: record.authNo ?? '',
          inAuthDate: record.authDate ?? '',
          inVanKey: record.vanKey ?? '',
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
    cancelKioskPaymentAction(record.paymentId, kioskId)
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center animate-[fadeIn_200ms_ease-out]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-[92.6%] max-w-[1000px] bg-white rounded-[28px] flex flex-col overflow-hidden animate-[fadeIn_200ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
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
              {[0, 1, 2, 3].map((i) => (
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
        ) : stage === 'list' ? (
          <>
            <div className="flex items-center justify-between" style={{ padding: 'min(3.4vw,36px) min(4vw,44px) min(1.4vw,16px)' }}>
              <p className="text-black font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>결제 내역</p>
              <div className="flex items-center" style={{ gap: 'min(0.8vw,10px)' }}>
                <button
                  onClick={() => setStage('switch-kiosk')}
                  className="px-[min(1.6vw,18px)] py-[min(1vw,12px)] rounded-[12px] bg-[#F2F4F6] active:scale-[0.97] transition-transform"
                >
                  <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.8vw, 20px)' }}>키오스크 변경</span>
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
                    const isThisCanceling = cancelingId === record.paymentId;
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
                        <button
                          onClick={() => setConfirmTarget(record)}
                          disabled={isCancelled || isThisCanceling || cancelingId !== null}
                          className={`shrink-0 px-[min(1.8vw,20px)] py-[min(1.2vw,14px)] rounded-[12px] active:scale-[0.97] transition-transform ${
                            isCancelled || cancelingId !== null ? 'bg-[#E6E8EA]' : 'bg-[#1E2124]'
                          }`}
                        >
                          <span
                            className={`font-bold ${isCancelled || cancelingId !== null ? 'text-[#86898C]' : 'text-white'}`}
                            style={{ fontSize: 'min(1.6vw, 18px)' }}
                          >
                            {isThisCanceling ? '취소 중…' : '취소'}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* switch-kiosk 단계 */}
            <div className="flex items-center justify-between" style={{ padding: 'min(3.4vw,36px) min(4vw,44px) min(1.4vw,16px)' }}>
              <p className="text-black font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>키오스크 변경</p>
              <button
                onClick={() => setStage('list')}
                className="px-[min(1.6vw,18px)] py-[min(1vw,12px)] rounded-[12px] bg-[#F2F4F6] active:scale-[0.97] transition-transform"
              >
                <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.8vw, 20px)' }}>이전</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ padding: 'min(0.8vw,10px) min(3vw,32px) min(2vw,22px)' }}>
              {loadingKiosks ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                </div>
              ) : kiosks.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <span className="text-[#6D7882]" style={{ fontSize: 'min(2vw, 22px)' }}>등록된 키오스크가 없습니다</span>
                </div>
              ) : (
                <div className="flex flex-col" style={{ gap: 'min(1vw, 12px)' }}>
                  {kiosks.map((k) => {
                    const isCurrent = k.id === kioskId;
                    const isInactive = k.status !== 'Active';
                    const isSwitchingThis = switchingKioskId === k.id;
                    return (
                      <button
                        key={k.id}
                        onClick={() => handleSwitchKiosk(k)}
                        disabled={isInactive || switchingKioskId !== null}
                        className={`flex items-center justify-between rounded-[16px] px-[min(2.4vw,26px)] py-[min(2vw,22px)] active:scale-[0.99] transition-all ${
                          isCurrent ? 'bg-[#1E2124]' : isInactive ? 'bg-[#F2F4F6] opacity-60 cursor-not-allowed' : 'bg-[#F9F9FB]'
                        }`}
                        style={{ gap: 'min(1.6vw,18px)' }}
                      >
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <span className={`font-bold truncate ${isCurrent ? 'text-white' : 'text-[#1E2124]'}`} style={{ fontSize: 'min(2vw, 22px)' }}>
                            {k.name}
                          </span>
                          {isInactive && (
                            <span className="text-[#86898C] mt-[min(0.4vw,6px)]" style={{ fontSize: 'min(1.4vw, 16px)' }}>비활성</span>
                          )}
                        </div>
                        {isCurrent && !isSwitchingThis && (
                          <span className="shrink-0 px-[min(1vw,12px)] py-[min(0.4vw,5px)] rounded-full bg-white/15" style={{ fontSize: 'min(1.3vw, 14px)' }}>
                            <span className="text-white font-bold">현재</span>
                          </span>
                        )}
                        {isSwitchingThis && (
                          <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vw, 16px)' }}>변경 중…</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
    </div>
  );
};
