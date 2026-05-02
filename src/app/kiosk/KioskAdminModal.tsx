'use client';

import React, { useEffect, useState } from 'react';
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { listKioskPaymentsAction, cancelKioskPaymentAction } from "@/app/kiosk/kiosk.actions";
import { KioskPaymentRecord } from "@/app/endpoint/kiosk.endpoint";
import { buildCancellationReceipt } from "@/app/kiosk/kiosk.receipt";
import { sendReceiptToPrinter } from "@/app/kiosk/kiosk.native";

const ADMIN_PIN = '0000';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'] as const;

type KioskAdminModalProps = {
  kioskId: number;
  studioName: string;
  onClose: () => void;
};

type Stage = 'pin' | 'list';

const fmtAmount = (n: number) => `${new Intl.NumberFormat('ko-KR').format(n)}원`;

const isCardPayment = (record: KioskPaymentRecord): boolean =>
  Boolean(record.authNo || record.vanKey || record.cardNumber)
  || record.methodType?.toLowerCase().includes('card') === true
  || record.methodType?.toLowerCase().includes('credit') === true;

const printCancellationReceipt = (record: KioskPaymentRecord, studioName: string, cancelMeta?: { authNo?: string; authDate?: string }) => {
  const lines = buildCancellationReceipt({
    studio: { name: studioName },
    items: [{ name: record.productName, price: record.amount }],
    card: isCardPayment(record) ? {
      cardNo: record.cardNumber,
      issuerName: record.cardBrand,
      authNo: cancelMeta?.authNo ?? record.authNo,
      authDate: cancelMeta?.authDate ?? record.authDate,
      merchantNo: undefined,
    } : undefined,
  });
  sendReceiptToPrinter(lines);
};

export const KioskAdminModal = ({ kioskId, studioName, onClose }: KioskAdminModalProps) => {
  const [stage, setStage] = useState<Stage>('pin');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [payments, setPayments] = useState<KioskPaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
        if ('payments' in res) setPayments(res.payments);
      })
      .catch(() => setToast('목록을 불러오지 못했습니다'))
      .finally(() => setLoading(false));
  }, [stage, kioskId]);

  // 단말 취소 응답 콜백 — KIS에서 cancel 결과 받아 서버 취소로 이어감
  useEffect(() => {
    type Result = { success?: boolean; canceled?: boolean; error?: string };
    type Win = Window & { onKisCancelResult?: (r: Result) => void };

    (window as Win).onKisCancelResult = (result) => {
      const targetId = cancelingId;
      if (!targetId) return;
      if (result?.canceled) {
        setCancelingId(null);
        return;
      }
      if (!result?.success) {
        setToast(`단말 취소 실패: ${result?.error ?? '알 수 없는 오류'}`);
        setCancelingId(null);
        return;
      }
      // 단말 취소 성공 → 서버에 취소 기록 + 취소 전표 인쇄
      const target = payments.find((p) => p.paymentId === targetId);
      cancelKioskPaymentAction(targetId, kioskId)
        .then((res) => {
          if (isGuinnessErrorCase(res)) {
            setToast(res.message ?? '서버 취소 실패');
            return;
          }
          setPayments((prev) => prev.map((p) => p.paymentId === targetId ? { ...p, status: 'Cancelled' } : p));
          if (target) {
            const meta = result as { outAuthNo?: string; outAuthDate?: string };
            printCancellationReceipt(target, studioName, { authNo: meta.outAuthNo, authDate: meta.outAuthDate });
          }
          setToast('취소 완료');
        })
        .catch(() => setToast('서버 취소 요청 실패'))
        .finally(() => setCancelingId(null));
    };
    return () => { delete (window as Win).onKisCancelResult; };
  }, [cancelingId, kioskId]);

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
      // 카드: 단말로 취소 트랜잭션 송출 → onKisCancelResult에서 서버 취소
      window.KloudEvent?.requestKisCancel?.(JSON.stringify({
        inTranCode: 'D2',
        inAuthNo: record.authNo ?? '',
        inAuthDate: record.authDate ?? '',
        inVanKey: record.vanKey ?? '',
        inTotAmt: `${record.totalAmount ?? record.amount ?? 0}`,
      }));
      return;
    }

    // 현금/패스 등: 단말 취소 없이 바로 서버 취소 + 취소 전표 인쇄
    cancelKioskPaymentAction(record.paymentId, kioskId)
      .then((res) => {
        if (isGuinnessErrorCase(res)) {
          setToast(res.message ?? '서버 취소 실패');
          return;
        }
        setPayments((prev) => prev.map((p) => p.paymentId === record.paymentId ? { ...p, status: 'Cancelled' } : p));
        printCancellationReceipt(record, studioName);
        setToast('취소 완료');
      })
      .catch(() => setToast('서버 취소 요청 실패'))
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
        ) : (
          <>
            <div className="flex items-center justify-between" style={{ padding: 'min(3.4vw,36px) min(4vw,44px) min(1.4vw,16px)' }}>
              <p className="text-black font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>결제 내역</p>
              <button
                onClick={onClose}
                className="px-[min(1.6vw,18px)] py-[min(1vw,12px)] rounded-[12px] bg-[#F2F4F6] active:scale-[0.97] transition-transform"
              >
                <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.8vw, 20px)' }}>닫기</span>
              </button>
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
                    return (
                      <div
                        key={record.paymentId}
                        className={`rounded-[16px] flex items-center px-[min(2.4vw,26px)] py-[min(2vw,22px)] ${
                          isCancelled ? 'bg-[#F9F9FB] opacity-60' : 'bg-[#F9F9FB]'
                        }`}
                        style={{ gap: 'min(1.6vw,18px)' }}
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center" style={{ gap: 'min(0.8vw,10px)' }}>
                            <span className="text-black font-bold truncate" style={{ fontSize: 'min(2vw, 22px)' }}>
                              {record.productName}
                            </span>
                            <span
                              className={`shrink-0 px-[min(1vw,12px)] py-[min(0.3vw,4px)] rounded-full font-bold ${
                                isCancelled ? 'bg-[#E6E8EA] text-[#86898C]' : 'bg-[#E5F4F0] text-[#0FA37F]'
                              }`}
                              style={{ fontSize: 'min(1.3vw, 14px)' }}
                            >
                              {isCancelled ? '취소됨' : '완료'}
                            </span>
                          </div>
                          <div className="flex items-center mt-[min(0.4vw,6px)]" style={{ gap: 'min(1vw,12px)' }}>
                            <span className="text-[#6D7882]" style={{ fontSize: 'min(1.5vw, 17px)' }}>
                              {record.methodType ?? ''}
                              {record.cardNumber ? ` · ${record.cardNumber}` : ''}
                            </span>
                            {record.createdAt && (
                              <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vw, 16px)' }}>{record.createdAt}</span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-[#1E2124] shrink-0" style={{ fontSize: 'min(2vw, 22px)' }}>
                          {fmtAmount(record.amount)}
                        </span>
                        <button
                          onClick={() => handleCancel(record)}
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
        )}

        {toast && (
          <div className="absolute left-1/2 -translate-x-1/2 px-[min(2.4vw,26px)] py-[min(1.2vw,14px)] rounded-[12px] bg-black/85" style={{ bottom: 'min(2vw,22px)' }}>
            <span className="text-white font-medium" style={{ fontSize: 'min(1.6vw, 18px)' }}>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
