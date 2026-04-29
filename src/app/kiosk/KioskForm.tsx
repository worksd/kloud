'use client'

import React, {useState, useEffect, useCallback} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {KioskCardPaymentDialog} from "@/app/kiosk/KioskCardPaymentDialog";
import {KioskHomeForm} from "@/app/kiosk/KioskHomeForm";
import {KioskLessonListForm} from "@/app/kiosk/KioskLessonListForm";
import {KioskLessonDetailModal} from "@/app/kiosk/KioskLessonDetailModal";
import {KioskPhoneInputForm} from "@/app/kiosk/KioskPhoneInputForm";
import {KioskMemberConfirmModal} from "@/app/kiosk/KioskMemberConfirmModal";
import {KioskPaymentMethodForm} from "@/app/kiosk/KioskPaymentMethodForm";
import {KioskPassSelectModal} from "@/app/kiosk/KioskPassSelectModal";
import {KioskAttendanceForm} from "@/app/kiosk/KioskAttendanceForm";
import {Locale} from "@/shared/StringResource";
import {searchUserAction, registerKioskUserAction} from "@/app/kiosk/kiosk.actions";
import {KioskNewUserDialog} from "@/app/kiosk/KioskNewUserDialog";
import {generateRandomNickname} from "@/app/kiosk/random.nickname";
import {isGuinnessErrorCase} from "@/app/guinnessErrorCase";
import {GetPassPlanResponse} from "@/app/endpoint/pass.endpoint";
import {formatFeatureDescription, formatRuleDescription} from "@/utils/pass.description";

type MockLesson = {
  id: number;
  title: string;
  time: string;
  thumbnailUrl: string;
  price: number;
};

type SearchedUser = {
  id: number;
  name?: string;
  nickName?: string;
  phone?: string;
  profileImageUrl?: string;
  accessToken?: string;
};

type KioskScreen = 'home' | 'lesson-list' | 'lesson-detail' | 'phone' | 'searching' | 'member-confirm' | 'payment-method' | 'pass-select' | 'attendance';

const VALID_SCREENS: KioskScreen[] = ['home', 'lesson-list', 'lesson-detail', 'phone', 'searching', 'member-confirm', 'payment-method', 'pass-select', 'attendance'];

export const KioskForm = ({studioId, studioName, studioProfileImageUrl, kioskImageUrl, passPlans}: {studioId: number; studioName: string; studioProfileImageUrl?: string; kioskImageUrl?: string; passPlans: GetPassPlanResponse[]}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = (() => {
    const s = searchParams.get('step');
    return s && (VALID_SCREENS as string[]).includes(s) ? (s as KioskScreen) : 'home';
  })();
  const [currentScreen, setCurrentScreen] = useState<KioskScreen>(initialStep);

  // currentScreen 변경 시 URL ?step=... 동기화
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (currentScreen === 'home') params.delete('step');
    else params.set('step', currentScreen);
    const qs = params.toString();
    const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    if (window.location.pathname + window.location.search !== nextUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [currentScreen, router]);
  const [selectedLesson, setSelectedLesson] = useState<MockLesson | null>(null);
  const [selectedPassPlan, setSelectedPassPlan] = useState<GetPassPlanResponse | null>(null);
  const [phone, setPhone] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [locale, setLocale] = useState<Locale>('ko');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<{ status: 'success' | 'fail'; data: Record<string, unknown> } | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newUserDialog, setNewUserDialog] = useState<{ phone: string; countryCode: string; suggestedName: string } | null>(null);

  // 홈 진입 시 손님 세션 상태만 정리 (운영자 토큰은 유지)
  const goHome = useCallback(async () => {
    setCurrentScreen('home');
    setSelectedLesson(null);
    setSelectedPassPlan(null);
    setPhone('');
    setSearchedUsers([]);
    setSelectedUser(null);
  }, []);

  // URL ?step= 으로 직접 진입했지만 필요한 state가 없으면 안전한 단계로 폴백
  useEffect(() => {
    const hasItem = !!selectedLesson || !!selectedPassPlan;
    const hasUser = !!selectedUser;
    if (currentScreen === 'lesson-detail' && !selectedLesson) {
      setCurrentScreen('lesson-list');
      return;
    }
    if ((currentScreen === 'phone' || currentScreen === 'searching' || currentScreen === 'member-confirm')
      && !hasItem) {
      setCurrentScreen('lesson-list');
      return;
    }
    if (currentScreen === 'member-confirm' && !hasUser) {
      setCurrentScreen('phone');
      return;
    }
    if ((currentScreen === 'payment-method' || currentScreen === 'pass-select')
      && (!hasItem || !hasUser)) {
      setCurrentScreen(hasItem ? 'phone' : 'lesson-list');
    }
  }, [currentScreen, selectedLesson, selectedPassPlan, selectedUser]);

  // KIS 결제 응답 콜백을 마운트 시 한 번만 등록
  useEffect(() => {
    type KisResult = {
      success?: boolean;
      canceled?: boolean;
      outTranCode?: string;
      outReplyCode?: string;
      outReplyMsg1?: string;
    };
    type KisWindow = Window & { onKisPaymentResult?: (result: KisResult) => void };

    (window as KisWindow).onKisPaymentResult = (result) => {
      console.log('KIS 응답:', result);
      const data = (result ?? {}) as Record<string, unknown>;

      setIsPaying(false);
      if (result?.canceled) return;
      // TODO: 성공 시 백엔드에 거래정보 저장 (outAuthNo / outVankey / outCustomerUuid 등)
      setPaymentResult({ status: result?.success ? 'success' : 'fail', data });
    };

    return () => {
      delete (window as KisWindow).onKisPaymentResult;
    };
  }, []);

  // 시리얼 프린터 응답 콜백을 마운트 시 한 번만 등록
  useEffect(() => {
    type SerialPrintResult = {
      success?: boolean;
      canceled?: boolean;
      error?: string;
      resultCode?: string | number;
    };
    type SerialWindow = Window & { onSerialPrintResult?: (result: SerialPrintResult) => void };

    (window as SerialWindow).onSerialPrintResult = (result) => {
      console.log('Print result:', result);
      if (result?.success) {
        setToastMessage('영수증 출력 완료');
        return;
      }
      if (result?.canceled) return;
      const msg = result?.error ?? (result?.resultCode != null ? String(result.resultCode) : '프린트에 실패했습니다.');
      setToastMessage(`프린트 실패: ${msg}`);
    };

    return () => {
      delete (window as SerialWindow).onSerialPrintResult;
    };
  }, []);

  // 토스트 자동 dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // 결제 성공 시 자동 영수증 인쇄 + 5초 후 자동 홈 이동
  useEffect(() => {
    if (paymentResult?.status !== 'success') return;
    handlePrintReceipt();
    const timer = setTimeout(() => {
      setPaymentResult(null);
      goHome();
    }, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentResult, goHome]);

  // 전화번호 입력 → /users/search?query=phone 으로 검색 (운영자 토큰 사용)
  const handlePhoneNext = async (phoneNumber: string, countryCode: string = '82') => {
    setPhone(phoneNumber);
    setCurrentScreen('searching');
    setErrorMessage(null);

    try {
      const res = await searchUserAction(phoneNumber);
      if (isGuinnessErrorCase(res)) {
        setErrorMessage(res.message ?? '검색에 실패했습니다.');
        setCurrentScreen('phone');
        return;
      }
      if (!res.users || res.users.length === 0) {
        // 유저 없음 → 신규 가입 다이얼로그
        setNewUserDialog({ phone: phoneNumber, countryCode, suggestedName: generateRandomNickname() });
        setCurrentScreen('phone');
        return;
      }
      // 첫 번째 매칭 유저 사용
      const u = res.users[0];
      setSelectedUser({
        id: u.id,
        name: u.name,
        nickName: u.nickName,
      });
      setCurrentScreen('member-confirm');
    } catch {
      setErrorMessage('요청에 실패했습니다.\n다시 시도해주세요.');
      setCurrentScreen('phone');
    }
  };

  // 신규 가입 확인 → 등록 후 그 결과로 진행
  const handleConfirmNewUser = async () => {
    if (!newUserDialog) return;
    const { phone: p, countryCode: cc, suggestedName } = newUserDialog;
    setNewUserDialog(null);
    setCurrentScreen('searching');
    try {
      const reg = await registerKioskUserAction(p, cc, suggestedName);
      if (isGuinnessErrorCase(reg)) {
        setErrorMessage('가입에 실패했습니다.\n다시 시도해주세요.');
        setCurrentScreen('phone');
        return;
      }
      // registerKioskUserAction 응답(updated user)을 그대로 사용
      setSelectedUser({
        id: (reg as { id: number }).id,
        name: (reg as { name?: string }).name ?? suggestedName,
        nickName: (reg as { nickName?: string }).nickName,
      });
      setCurrentScreen('member-confirm');
    } catch {
      setErrorMessage('요청에 실패했습니다.\n다시 시도해주세요.');
      setCurrentScreen('phone');
    }
  };

  // 유저 확인 → 결제 수단 선택으로 이동 (운영자 토큰 유지, 손님 정보는 selectedUser 상태로만 들고 감)
  const handleConfirmUser = async () => {
    if (!selectedUser) return;
    setCurrentScreen('payment-method');
  };

  // 결제 대상(수업/패스권 공통) — 둘 중 선택된 것을 통일된 형태로 반환
  const paymentItem = selectedLesson
    ? {
        title: selectedLesson.title,
        price: selectedLesson.price,
        subtitle: selectedLesson.time,
        thumbnailUrl: selectedLesson.thumbnailUrl,
        benefits: [] as string[],
      }
    : selectedPassPlan
      ? {
          title: selectedPassPlan.name,
          price: selectedPassPlan.price ?? 0,
          subtitle: selectedPassPlan.expireDateStamp,
          thumbnailUrl: selectedPassPlan.imageUrl ?? undefined,
          benefits: [
            ...(selectedPassPlan.rules ?? []).map((r) =>
              r.target && r.benefit
                ? formatRuleDescription({ target: r.target, benefit: r.benefit, excludes: r.excludes }, locale, selectedPassPlan.name)
                : (r.description ?? '')
            ),
            ...(selectedPassPlan.features ?? []).map((f) =>
              formatFeatureDescription(f.key, locale, f.value) || f.description || f.key
            ),
          ].filter(Boolean),
        }
      : null;

  // 영수증 인쇄: RS-232 시리얼 프린터
  const handlePrintReceipt = useCallback(() => {
    if (!paymentItem) return;
    const data = paymentResult?.data ?? {};
    const authNo = typeof data.outAuthNo === 'string' ? data.outAuthNo : '';
    const cardNo = typeof data.outCardNo === 'string' ? data.outCardNo : '';
    const authDate = typeof data.outAuthDate === 'string' ? data.outAuthDate : '';

    const lines: Array<Record<string, unknown>> = [
      { align: 'C', bold: true, text: studioName },
      { blank: 1 },
      { align: 'L', text: '------------------------------' },
      { align: 'L', text: `상품: ${paymentItem.title}` },
      { align: 'L', text: `금액: ${paymentItem.price.toLocaleString('ko-KR')}원` },
    ];
    if (authNo) lines.push({ align: 'L', text: `승인: ${authNo}` });
    if (cardNo) lines.push({ align: 'L', text: `카드: ${cardNo}` });
    if (authDate) lines.push({ align: 'L', text: `일시: ${authDate}` });
    lines.push({ align: 'L', text: '------------------------------' });
    lines.push({ align: 'C', text: '감사합니다' });
    lines.push({ blank: 3 });

    window.KloudEvent?.requestSerialPrint?.(JSON.stringify({ lines }));
  }, [paymentItem, paymentResult, studioName]);

  // 카드 결제: KIS 단말기 호출 (응답은 마운트 시 등록한 onKisPaymentResult가 처리)
  const handleCardPayment = useCallback(() => {
    if (!paymentItem || isPaying) return;
    setIsPaying(true);
    setPaymentResult(null);

    window.KloudEvent?.requestKisPayment?.(JSON.stringify({
      inTestMode: 'Y',
      inTranCode: 'D1',
      inTotAmt: `${paymentItem.price}`,
      inInstallment: '00',
    }));
  }, [paymentItem, isPaying]);

  return (
    <div className="w-full h-screen overflow-hidden">
      {currentScreen === 'home' && (
        <KioskHomeForm
          studioName={studioName}
          kioskImageUrl={kioskImageUrl}
          locale={locale}
          onSelectPayment={() => setCurrentScreen('lesson-list')}
          onSelectVisit={() => setCurrentScreen('attendance')}
          onChangeLocale={setLocale}
        />
      )}

      {currentScreen === 'lesson-list' && (
        <KioskLessonListForm
          studioId={studioId}
          passPlans={passPlans}
          locale={locale}
          onSelectLesson={(lesson) => { setSelectedLesson(lesson); setSelectedPassPlan(null); setCurrentScreen('lesson-detail'); }}
          onSelectPassPlan={(plan) => { setSelectedPassPlan(plan); setSelectedLesson(null); setCurrentScreen('phone'); }}
          onBack={goHome}
          onChangeLocale={setLocale}
        />
      )}

      {currentScreen === 'lesson-detail' && selectedLesson && (
        <>
          <KioskLessonListForm
            studioId={studioId}
            passPlans={passPlans}
            locale={locale}
            onSelectLesson={() => {}}
            onSelectPassPlan={() => {}}
            onBack={goHome}
            onChangeLocale={setLocale}
          />
          <KioskLessonDetailModal
            lesson={selectedLesson}
            locale={locale}
            onClose={() => setCurrentScreen('lesson-list')}
            onPayment={() => setCurrentScreen('phone')}
          />
        </>
      )}

      {(currentScreen === 'phone' || currentScreen === 'searching') && (
        <KioskPhoneInputForm
          locale={locale}
          onBack={() => setCurrentScreen('lesson-list')}
          onNext={handlePhoneNext}
          onHome={goHome}
          onChangeLocale={setLocale}
          loading={currentScreen === 'searching'}
          errorMessage={errorMessage}
          onDismissError={() => setErrorMessage(null)}
        />
      )}

      {currentScreen === 'member-confirm' && selectedUser && (
        <>
          <KioskPhoneInputForm
            locale={locale}
            onBack={() => setCurrentScreen('lesson-list')}
            onNext={() => {}}
            onHome={goHome}
            onChangeLocale={setLocale}
          />
          <KioskMemberConfirmModal
            phone={phone}
            userName={selectedUser.nickName ?? selectedUser.name ?? ''}
            profileImageUrl={selectedUser.profileImageUrl}
            locale={locale}
            onBack={() => setCurrentScreen('phone')}
            onConfirm={handleConfirmUser}
          />
        </>
      )}

      {currentScreen === 'payment-method' && paymentItem && (
        <KioskPaymentMethodForm
          lessonTitle={paymentItem.title}
          price={paymentItem.price}
          locale={locale}
          onBack={() => setCurrentScreen('phone')}
          onSelectPass={() => setCurrentScreen('pass-select')}
          onSelectCard={handleCardPayment}
          onHome={goHome}
          onChangeLocale={setLocale}
        />
      )}

      {isPaying && (
        <KioskCardPaymentDialog onCancel={() => setIsPaying(false)} />
      )}

      {paymentResult?.status === 'success' && (
        <div className="fixed inset-0 z-30 bg-white flex flex-col">
          {/* 상단 바 placeholder (back/lang/home은 굳이 X) */}
          <div className="flex-1 flex flex-col items-center justify-start px-[5.6%] pt-[min(20vw,200px)]">
            {/* 체크 원형 */}
            <div className="rounded-full bg-[#3CC0AF] flex items-center justify-center" style={{ width: 'min(8vw,84px)', height: 'min(8vw,84px)' }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: '50%', height: '50%' }}>
                <path d="M5 12.5L10 17.5L19 8" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* 결제 완료 + 안내 */}
            <p className="text-black font-bold text-center mt-[min(2.6vw,28px)]" style={{ fontSize: 'min(3.7vw,40px)' }}>
              결제 완료!
            </p>
            <p className="text-[#6D7882] text-center mt-[min(0.8vw,8px)]" style={{ fontSize: 'min(2vw,22px)' }}>
              출력된 영수증을 받아가세요
            </p>

            {/* 결제 항목 카드 */}
            <div className="w-full max-w-[720px] mt-[min(3.7vw,40px)] bg-white border border-[#E6E8EA] rounded-[16px] px-[min(3vw,32px)] py-[min(2.4vw,26px)] flex items-center justify-between gap-[12px]">
              <span className="text-black font-bold leading-snug line-clamp-2 flex-1" style={{ fontSize: 'min(2.4vw,26px)' }}>
                {paymentItem?.title ?? ''}
              </span>
              <span className="flex items-baseline gap-[6px] shrink-0">
                <span className="text-black font-bold" style={{ fontSize: 'min(2.8vw,30px)' }}>
                  {new Intl.NumberFormat('ko-KR').format(paymentItem?.price ?? 0)}
                </span>
                <span className="text-[#86898C]" style={{ fontSize: 'min(1.8vw,20px)' }}>원</span>
              </span>
            </div>
          </div>

          {/* 하단 안내 + 버튼 */}
          <div className="shrink-0 px-[5.6%] pb-[min(4vw,44px)]">
            <p className="text-[#86898C] text-center mb-[min(1.4vw,16px)]" style={{ fontSize: 'min(1.6vw,18px)' }}>
              5초 뒤에 닫혀요
            </p>
            <div className="flex gap-[min(1.4vw,16px)]">
              {selectedPassPlan && (
                <button
                  onClick={() => { setPaymentResult(null); setSelectedPassPlan(null); setCurrentScreen('lesson-list'); }}
                  className="flex-1 h-[min(7vh,72px)] rounded-[16px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
                >
                  <span className="text-white font-bold" style={{ fontSize: 'min(2.4vw,26px)' }}>수업 신청 하러가기</span>
                </button>
              )}
              <button
                onClick={() => { setPaymentResult(null); goHome(); }}
                className="flex-1 h-[min(7vh,72px)] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
              >
                <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.4vw,26px)' }}>처음으로</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentResult?.status === 'fail' && (
        <div className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center px-[5%]">
          <div className="bg-white rounded-[32px] w-full max-w-[720px] p-[min(3.7vw,40px)] flex flex-col items-center">
            <p className="text-[#1E2124] font-bold text-center" style={{ fontSize: 'min(4vw, 44px)' }}>
              결제 실패
            </p>
            <div className="w-full mt-[min(2.6vw,28px)] bg-[#F9F9FB] rounded-[16px] p-[min(2.2vw,24px)] max-h-[60vh] overflow-auto">
              <pre className="text-[#1E2124] whitespace-pre-wrap break-all font-mono" style={{ fontSize: 'min(2vw, 22px)' }}>
                {Object.entries(paymentResult.data).length === 0
                  ? '(응답 없음)'
                  : Object.entries(paymentResult.data)
                      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
                      .join('\n')}
              </pre>
            </div>
            <button
              onClick={() => setPaymentResult(null)}
              className="mt-[min(3.7vw,40px)] w-full h-[min(11vw,120px)] rounded-[24px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
            >
              <span className="text-white font-bold" style={{ fontSize: 'min(3.7vw, 40px)' }}>확인</span>
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed left-1/2 -translate-x-1/2 z-40 px-[min(3.7vw,40px)] py-[min(2.2vw,24px)] rounded-[16px] bg-black/85" style={{ bottom: 'min(7.4vw, 80px)' }}>
          <span className="text-white font-medium" style={{ fontSize: 'min(2.6vw, 28px)' }}>{toastMessage}</span>
        </div>
      )}

      {newUserDialog && (
        <KioskNewUserDialog
          name={newUserDialog.suggestedName}
          phone={newUserDialog.phone}
          onConfirm={handleConfirmNewUser}
          onCancel={() => setNewUserDialog(null)}
        />
      )}

      {currentScreen === 'pass-select' && selectedLesson && (
        <>
          <KioskPaymentMethodForm
            lessonTitle={selectedLesson.title}
            price={selectedLesson.price}
            locale={locale}
            onBack={() => setCurrentScreen('phone')}
            onSelectPass={() => {}}
            onSelectCard={() => {}}
            onHome={goHome}
            onChangeLocale={setLocale}
          />
          {selectedUser && (
            <KioskPassSelectModal
              userId={selectedUser.id}
              locale={locale}
              onBack={() => setCurrentScreen('payment-method')}
              onSelectPass={(pass) => { /* TODO: 패스 사용 처리 */ goHome(); }}
            />
          )}
        </>
      )}

      {currentScreen === 'attendance' && (
        <KioskAttendanceForm
          studioName={studioName}
          onBack={goHome}
          onComplete={goHome}
          locale={locale}
        />
      )}
    </div>
  );
}
